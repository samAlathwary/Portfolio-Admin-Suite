import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/healthz/db", async (_req, res): Promise<void> => {
  try {
    await db.execute(sql`select 1`);
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown database error",
    });
  }
});

export default router;
