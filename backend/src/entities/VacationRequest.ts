import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum RequestStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

@Entity("vacation_requests")
export class VacationRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "user_id" })
  userId!: number;

  @ManyToOne(() => User, (user) => user.vacationRequests, { eager: false })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "date", name: "start_date" })
  startDate!: string;

  @Column({ type: "date", name: "end_date" })
  endDate!: string;

  @Column({ type: "text", nullable: true })
  reason!: string | null;

  @Column({ type: "enum", enum: RequestStatus, default: RequestStatus.PENDING })
  status!: RequestStatus;

  @Column({ type: "text", nullable: true })
  comments!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
