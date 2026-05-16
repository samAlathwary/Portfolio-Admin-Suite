import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const defaultAllowedOrigins = [
  "https://b513c813.easyway-admin.pages.dev",
  "https://portfolio-admin-suite.up.railway.app",
  "https://portfolio-admin-suite-production.up.railway.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const allowedOrigins = new Set(
  [
    ...defaultAllowedOrigins,
    ...(process.env.CORS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ],
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.use("/api", router);

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
    },
    "Unhandled request error",
  );

  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
