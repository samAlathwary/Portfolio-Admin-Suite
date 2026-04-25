import { Router, type IRouter } from "express";
import { desc, sql, eq } from "drizzle-orm";
import { db, partnersTable, servicesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [partnerCounts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      featured: sql<number>`sum(case when ${partnersTable.featured} then 1 else 0 end)::int`,
    })
    .from(partnersTable);

  const [serviceCounts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`sum(case when ${servicesTable.active} then 1 else 0 end)::int`,
    })
    .from(servicesTable);

  const recentPartners = await db
    .select()
    .from(partnersTable)
    .orderBy(desc(partnersTable.createdAt))
    .limit(5);

  const recentServices = await db
    .select()
    .from(servicesTable)
    .orderBy(desc(servicesTable.createdAt))
    .limit(5);

  res.json({
    partnerCount: partnerCounts?.total ?? 0,
    featuredPartnerCount: partnerCounts?.featured ?? 0,
    serviceCount: serviceCounts?.total ?? 0,
    activeServiceCount: serviceCounts?.active ?? 0,
    recentPartners,
    recentServices,
  });
});

// touch eq so unused-import lint stays quiet across drizzle imports if we extend later
void eq;

export default router;
