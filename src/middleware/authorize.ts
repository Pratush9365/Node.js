import type { RequestHandler } from "express";
import { canAny } from "../config/permissions.js";
import type { Permission } from "../config/permissions.js";
import { AppError } from "../errors/AppError.js";
import { requireActor } from "./authenticate.js";

/**
 * Role-level gate: lets the request through when the caller holds AT LEAST ONE of the permissions.
 * It says nothing about which records the caller may touch; that is the service's ownership check.
 * Mount after `authenticate`.
 */
export function requirePermission(...permissions: Permission[]): RequestHandler {
    return (req, _res, next) => {
        if (!canAny(requireActor(req), permissions)) throw AppError.forbidden();
        next();
    };
}
