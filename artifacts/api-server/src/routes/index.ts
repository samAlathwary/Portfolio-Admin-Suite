import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import partnersRouter from "./partners";
import servicesRouter from "./services";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(dashboardRouter);
router.use(partnersRouter);
router.use(servicesRouter);

export default router;
