import request from "supertest";
import { app } from "../index";
import { AppDataSource } from "../data-source";
import { VacationRequest, RequestStatus } from "../entities/VacationRequest";
import { User, UserRole } from "../entities/User";

// ── helpers ──────────────────────────────────────────────────────────────────

const mockUser: User = Object.assign(new User(), {
  id: 1,
  name: "Alice Martin",
  role: UserRole.REQUESTER,
});

const mockRequest: VacationRequest = Object.assign(new VacationRequest(), {
  id: 1,
  userId: 1,
  user: mockUser,
  startDate: "2025-07-01",
  endDate: "2025-07-05",
  reason: "Summer holiday",
  status: RequestStatus.PENDING,
  comments: null,
  createdAt: new Date(),
});

// ── mock TypeORM ──────────────────────────────────────────────────────────────

jest.mock("../data-source", () => ({
  AppDataSource: {
    initialize: jest.fn().mockResolvedValue(true),
    getRepository: jest.fn(),
  },
}));

const mockVacationRepo = {
  createQueryBuilder: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockUserRepo = {
  findOne: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
    if (entity === VacationRequest || entity.name === "VacationRequest") return mockVacationRepo;
    if (entity === User || entity.name === "User") return mockUserRepo;
  });
});

// ── GET /api/vacations ────────────────────────────────────────────────────────

describe("GET /api/vacations", () => {
  it("returns all vacation requests", async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockRequest]),
    };
    mockVacationRepo.createQueryBuilder.mockReturnValue(qb);

    const res = await request(app).get("/api/vacations");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe(1);
  });

  it("rejects invalid status filter", async () => {
    const res = await request(app).get("/api/vacations?status=Invalid");
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

// ── GET /api/vacations/user/:userId ──────────────────────────────────────────

describe("GET /api/vacations/user/:userId", () => {
  it("returns requests for a given user", async () => {
    mockVacationRepo.find.mockResolvedValue([mockRequest]);

    const res = await request(app).get("/api/vacations/user/1");
    expect(res.status).toBe(200);
    expect(res.body[0].userId).toBe(1);
  });

  it("rejects a non-numeric userId", async () => {
    const res = await request(app).get("/api/vacations/user/abc");
    expect(res.status).toBe(400);
  });
});

// ── POST /api/vacations ───────────────────────────────────────────────────────

describe("POST /api/vacations", () => {
  const payload = {
    userId: 1,
    startDate: "2025-08-01",
    endDate: "2025-08-05",
    reason: "Beach trip",
  };

  it("creates a vacation request", async () => {
    mockUserRepo.findOne.mockResolvedValue(mockUser);
    mockVacationRepo.findOne.mockResolvedValueOnce(null);       // no overlap
    mockVacationRepo.findOne.mockResolvedValueOnce(mockRequest); // full request after save
    mockVacationRepo.create.mockReturnValue(mockRequest);
    mockVacationRepo.save.mockResolvedValue(mockRequest);

    const res = await request(app).post("/api/vacations").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(1);
  });

  it("returns 409 when dates overlap an existing request", async () => {
    mockUserRepo.findOne.mockResolvedValue(mockUser);
    mockVacationRepo.findOne.mockResolvedValueOnce(mockRequest); // overlap found

    const res = await request(app).post("/api/vacations").send(payload);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/overlap/i);
  });

  it("rejects when endDate is before startDate", async () => {
    const res = await request(app)
      .post("/api/vacations")
      .send({ ...payload, startDate: "2025-08-10", endDate: "2025-08-01" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/endDate/i);
  });

  it("returns 404 when user does not exist", async () => {
    mockUserRepo.findOne.mockResolvedValue(null);

    const res = await request(app).post("/api/vacations").send(payload);
    expect(res.status).toBe(404);
  });

  it("requires startDate", async () => {
    const { startDate: _s, ...noStart } = payload;
    const res = await request(app).post("/api/vacations").send(noStart);
    expect(res.status).toBe(400);
  });
});

// ── PATCH /api/vacations/:id ─────────────────────────────────────────────────

describe("PATCH /api/vacations/:id", () => {
  it("approves a pending request", async () => {
    const updated = { ...mockRequest, status: RequestStatus.APPROVED };
    mockVacationRepo.findOne.mockResolvedValue(mockRequest);
    mockVacationRepo.save.mockResolvedValue(updated);

    const res = await request(app)
      .patch("/api/vacations/1")
      .send({ status: "Approved" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Approved");
  });

  it("rejects without comments when status is Rejected", async () => {
    const res = await request(app)
      .patch("/api/vacations/1")
      .send({ status: "Rejected" });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toMatch(/comments/i);
  });

  it("rejects an already-approved request", async () => {
    const approved = { ...mockRequest, status: RequestStatus.APPROVED };
    mockVacationRepo.findOne.mockResolvedValue(approved);

    const res = await request(app)
      .patch("/api/vacations/1")
      .send({ status: "Rejected", comments: "Too late" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/pending/i);
  });

  it("returns 404 for unknown id", async () => {
    mockVacationRepo.findOne.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/vacations/999")
      .send({ status: "Approved" });
    expect(res.status).toBe(404);
  });
});
