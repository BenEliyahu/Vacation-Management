export enum UserRole {
  REQUESTER = "Requester",
  VALIDATOR = "Validator",
}

export enum RequestStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

export interface VacationRequest {
  id: number;
  userId: number;
  user: User;
  startDate: string;
  endDate: string;
  reason?: string;
  status: RequestStatus;
  comments?: string;
  createdAt: string;
}

export interface CreateVacationPayload {
  userId: number;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateVacationPayload {
  status: "Approved" | "Rejected";
  comments?: string;
}
