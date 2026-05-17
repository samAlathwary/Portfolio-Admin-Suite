import { Router, type IRouter } from "express";
import { requireAuth, getAdminContext, type AuthedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/auth/me", requireAuth, async (req: AuthedRequest, res): Promise<void> => {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const { userEmail, isAdmin } = await getAdminContext(userId);

    res.json({
      userId,
      email: userEmail,
      isAdmin,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ADMIN_EMAILS is not configured") {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Failed to load user from Clerk" });
  }
});

export default router;
