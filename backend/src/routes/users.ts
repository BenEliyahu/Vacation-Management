import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";

const router = Router();

// GET /api/users/:id — get a single user
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid user id" });
  try {
    const user = await AppDataSource.getRepository(User).findOne({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET /api/users — list all users
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await AppDataSource.getRepository(User).find({
      order: { name: "ASC" },
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/users/seed — insert demo users (idempotent)
router.post("/seed", async (_req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(User);
    if ((await repo.count()) > 0) {
      return res.json({ message: "Seed data already exists" });
    }
    const users = repo.create([
      { name: "Alice Martin", role: UserRole.REQUESTER },
      { name: "Bob Johnson", role: UserRole.REQUESTER },
      { name: "Carol White", role: UserRole.REQUESTER },
      { name: "David Manager", role: UserRole.VALIDATOR },
    ]);
    await repo.save(users);
    res.status(201).json({ message: "Seed data created", users });
  } catch {
    res.status(500).json({ error: "Failed to seed users" });
  }
});

export default router;
