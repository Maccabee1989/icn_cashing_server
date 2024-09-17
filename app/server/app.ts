require("dotenv").config();

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";

import userRouter from "./routes/user.route";
import bankRouter from "./routes/bank.route";
import payModeRouter from "./routes/payMode.route";
import unpaidRouter from "./routes/unpaid.route";
import requestRouter from "./routes/request.route";
import requestDetailRouter from "./routes/requestDetail.route";
import settingRouter from "./routes/setting.route";
import categoryRouter from "./routes/category.route";
import interncreditRouter from "./routes/interncredit.route";
import notificationRouter from "./routes/notification.route";
import summaryRouter from "./routes/summary.route";


export const app = express();

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());


// cors => cross origin resource sharing
// array of allow domain declare in .env
const origin = (process.env.NODE_ORIGIN || "").split(";");
app.use(
  cors({
    origin: origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true,
  })
);

// routes
app.use("/api/v1",
  bankRouter,
  payModeRouter,
  categoryRouter,
  interncreditRouter,
  notificationRouter,
  requestRouter,
  requestDetailRouter,
  settingRouter,
  unpaidRouter,
  userRouter,
  summaryRouter
);

// testing API
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// unknow route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// Capture Error
app.use(ErrorMiddleware);
