import type { RequestHandler } from "express";
import { MarkController } from "../module/mark/mark.controller.js";
export declare class MarkRoute {
    private readonly controller;
    readonly router: import("express-serve-static-core").Router;
    constructor(controller: MarkController, authenticate: RequestHandler);
}
//# sourceMappingURL=mark.route.d.ts.map