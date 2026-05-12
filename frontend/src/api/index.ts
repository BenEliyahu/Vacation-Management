import axios from "axios";
import type { CreateVacationPayload, UpdateVacationPayload } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

export const usersApi = {
  getAll: () => api.get("/users"),
  getById: (id: number) => api.get(`/users/${id}`),
  seed: () => api.post("/users/seed"),
};

export const vacationsApi = {
  getAll: (status?: string) =>
    api.get("/vacations", { params: status ? { status } : {} }),

  getByUser: (userId: number) =>
    api.get(`/vacations/user/${userId}`),

  create: (payload: CreateVacationPayload) =>
    api.post("/vacations", payload),

  update: (id: number, payload: UpdateVacationPayload) =>
    api.patch(`/vacations/${id}`, payload),
};

export default api;
