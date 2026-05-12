import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entities/User";
import { VacationRequest } from "./entities/VacationRequest";

dotenv.config();

const connectionOptions = process.env.DATABASE_URL
  ? { url: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "vacation_management",
  };

export const AppDataSource = new DataSource({
  type: "postgres",
  ...connectionOptions,
  synchronize: true,
  logging: false,
  entities: [User, VacationRequest],
  migrations: [],
  subscribers: [],
});
