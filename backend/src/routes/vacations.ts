import { Router, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { VacationRequest, RequestStatus } from "../entities/VacationRequest";
import { User } from "../entities/User";

const router = Router();

// GET /api/vacations?status=Pending|Approved|Rejected  (validator view)
router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(Object.values(RequestStatus))
      .withMessage("status must be Pending, Approved or Rejected"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const qb = AppDataSource.getRepository(VacationRequest)
        .createQueryBuilder("vr")
        .leftJoinAndSelect("vr.user", "user")
        .orderBy("vr.createdAt", "DESC");

      if (req.query.status) {
        qb.where("vr.status = :status", { status: req.query.status });
      }

      res.json(await qb.getMany());
    } catch {
      res.status(500).json({ error: "Failed to fetch vacation requests" });
    }
  }
);

// GET /api/vacations/user/:userId  (requester view)
router.get(
  "/user/:userId",
  [param("userId").isInt({ min: 1 }).withMessage("userId must be a positive integer")],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const requests = await AppDataSource.getRepository(VacationRequest).find({
        where: { userId: parseInt(req.params.userId, 10) },
        relations: ["user"],
        order: { createdAt: "DESC" },
      });
      res.json(requests);
    } catch {
      res.status(500).json({ error: "Failed to fetch vacation requests" });
    }
  }
);

// POST /api/vacations  — submit a new request
router.post(
  "/",
  [
    body("userId").isInt({ min: 1 }).withMessage("Valid userId is required"),
    body("startDate").isDate({ format: "YYYY-MM-DD" }).withMessage("startDate must be YYYY-MM-DD"),
    body("endDate").isDate({ format: "YYYY-MM-DD" }).withMessage("endDate must be YYYY-MM-DD"),
    body("reason").optional({ nullable: true }).isString().trim().isLength({ max: 500 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { userId, startDate, endDate, reason } = req.body;

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: "endDate must be on or after startDate" });
    }

    try {
      const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });
      if (!user) return res.status(404).json({ error: "User not found" });

      const repo = AppDataSource.getRepository(VacationRequest);

      // Overlap detection: block if an active (non-rejected) request already covers these dates
      const overlap = await repo.findOne({
        where: {
          userId,
          status: Not(RequestStatus.REJECTED),
          startDate: LessThanOrEqual(endDate),
          endDate: MoreThanOrEqual(startDate),
        },
      });
      if (overlap) {
        return res.status(409).json({
          error: `You already have a ${overlap.status.toLowerCase()} request that overlaps with these dates (${overlap.startDate} – ${overlap.endDate}).`,
        });
      }

      const saved = await repo.save(repo.create({ userId, startDate, endDate, reason }));

      const full = await repo.findOne({ where: { id: saved.id }, relations: ["user"] });
      res.status(201).json(full);
    } catch {
      res.status(500).json({ error: "Failed to create vacation request" });
    }
  }
);

// PATCH /api/vacations/:id  — approve or reject
router.patch(
  "/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("status")
      .isIn(["Approved", "Rejected"])
      .withMessage("status must be Approved or Rejected"),
    body("comments")
      .if(body("status").equals("Rejected"))
      .notEmpty()
      .withMessage("comments are required when rejecting a request")
      .isLength({ max: 1000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const repo = AppDataSource.getRepository(VacationRequest);
      const request = await repo.findOne({
        where: { id: parseInt(req.params.id, 10) },
        relations: ["user"],
      });

      if (!request) return res.status(404).json({ error: "Vacation request not found" });

      if (request.status !== RequestStatus.PENDING) {
        return res.status(400).json({ error: "Only Pending requests can be updated" });
      }

      request.status = req.body.status as RequestStatus;
      if (req.body.comments) request.comments = req.body.comments;

      res.json(await repo.save(request));
    } catch {
      res.status(500).json({ error: "Failed to update vacation request" });
    }
  }
);

export default router;
