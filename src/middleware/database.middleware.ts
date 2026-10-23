import type { Request, Response, NextFunction } from "express";
import pool from "./db.js";

export class DatabaseMiddleware {
public static readonly attach = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  res.locals.db = pool;
  next();
};
}
