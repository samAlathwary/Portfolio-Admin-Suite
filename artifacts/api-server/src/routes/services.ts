import { Router, type IRouter } from "express";
import { eq, asc, desc, and, or, isNull, lte, gte } from "drizzle-orm";
import { db, servicesTable } from "@workspace/db";
import {
  CreateServiceBody,
  UpdateServiceBody,
  GetServiceParams,
  UpdateServiceParams,
  DeleteServiceParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/services", async (req, res): Promise<void> => {
  void req;
  const now = new Date();
  const query = db
    .select()
    .from(servicesTable)
    .where(
      and(
        eq(servicesTable.active, true),
        or(isNull(servicesTable.activeFrom), lte(servicesTable.activeFrom, now)),
        or(isNull(servicesTable.activeUntil), gte(servicesTable.activeUntil, now)),
      ),
    );

  const services = await query.orderBy(
    asc(servicesTable.displayOrder),
    desc(servicesTable.createdAt),
  );
  res.json(services);
});

router.get("/admin/services", requireAdmin, async (_req, res): Promise<void> => {
  const services = await db
    .select()
    .from(servicesTable)
    .orderBy(
      asc(servicesTable.displayOrder),
      desc(servicesTable.createdAt),
    );
  res.json(services);
});

router.get("/services/:id", async (req, res): Promise<void> => {
  const params = GetServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, params.data.id));

  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.json(service);
});

router.get("/admin/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, params.data.id));

  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.json(service);
});

router.post("/admin/services", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db
    .insert(servicesTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(service);
});

router.patch("/admin/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db
    .update(servicesTable)
    .set(parsed.data)
    .where(eq(servicesTable.id, params.data.id))
    .returning();

  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.json(service);
});

router.delete("/admin/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [service] = await db
    .delete(servicesTable)
    .where(eq(servicesTable.id, params.data.id))
    .returning();

  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
