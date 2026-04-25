import { Router, type IRouter } from "express";
import { eq, asc, desc } from "drizzle-orm";
import { db, partnersTable } from "@workspace/db";
import {
  CreatePartnerBody,
  UpdatePartnerBody,
  GetPartnerParams,
  UpdatePartnerParams,
  DeletePartnerParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/partners", async (_req, res): Promise<void> => {
  const partners = await db
    .select()
    .from(partnersTable)
    .orderBy(asc(partnersTable.displayOrder), desc(partnersTable.createdAt));
  res.json(partners);
});

router.get("/partners/:id", async (req, res): Promise<void> => {
  const params = GetPartnerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [partner] = await db
    .select()
    .from(partnersTable)
    .where(eq(partnersTable.id, params.data.id));

  if (!partner) {
    res.status(404).json({ error: "Partner not found" });
    return;
  }

  res.json(partner);
});

router.post("/partners", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreatePartnerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [partner] = await db
    .insert(partnersTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(partner);
});

router.patch("/partners/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdatePartnerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePartnerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [partner] = await db
    .update(partnersTable)
    .set(parsed.data)
    .where(eq(partnersTable.id, params.data.id))
    .returning();

  if (!partner) {
    res.status(404).json({ error: "Partner not found" });
    return;
  }

  res.json(partner);
});

router.delete("/partners/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeletePartnerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [partner] = await db
    .delete(partnersTable)
    .where(eq(partnersTable.id, params.data.id))
    .returning();

  if (!partner) {
    res.status(404).json({ error: "Partner not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
