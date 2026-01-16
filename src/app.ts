import express, { type Application, type Request, type Response } from "express"
import cors from "cors"
import { globalError } from "./app/middleware/globalErrorHandlers.js"
import { envVars } from "./app/config/env.js"
import { router } from "./app/routes/route.js"
import cookieParser from "cookie-parser"
import { PaymentController } from "./app/modules/payment/payment.controller.js"
import { AppointmentService } from "./app/modules/appoinment/appointment.service.js"
import cron from "node-cron"

export const app: Application = express();

app.post(
  "/webhook",
  express.raw({ type: "application/json" }), 
  PaymentController.handleStripeWebhookEvent
);

/**
 * 🔥 Apply json middleware ONLY AFTER webhook
 */
// app.use((req, res, next) => {
//   if (req.originalUrl === "/webhook") {
//     return next();
//   }
//   express.json()(req, res, next);
// });

app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use("/api/v1", router)

cron.schedule('* * * * *', () => {
    try {
        AppointmentService.cancelUnpaidAppointments();
    } catch (err) {
        console.error(err);
    }
});

app.get("/", (req: Request, res: Response) => {
  res.send(`🚀 Server is running on port ${envVars.port}🥰🥰`);
});

app.use(globalError)
