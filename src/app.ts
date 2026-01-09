import express, { type Application, type Request, type Response } from "express"
import cors from "cors"
import { globalError } from "./app/middleware/globalErrorHandlers.js"
import { envVars } from "./app/config/env.js"
import { router } from "./app/routes/route.js"
import cookieParser from "cookie-parser"
import { PaymentController } from "./app/modules/payment/payment.controller.js"

export const app: Application = express();

// ১. সবার আগে ওয়েব হুক রাউট (কারণ এতে raw body দরকার)
app.post(
  "/webhook",
  express.raw({ type: "application/json" }), // এটি বডিকে raw রাখে যা constructEvent এর জন্য দরকার
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



app.get("/", (req: Request, res: Response) => {
  res.send(`🚀 Server is running on port ${envVars.port}🥰🥰`);
});

app.use(globalError)



// import express, { type Application, type Request, type Response } from "express";
// import cors from "cors";
// import { globalError } from "./app/middleware/globalErrorHandlers.js";
// import { envVars } from "./app/config/env.js";
// import { router } from "./app/routes/route.js";
// import cookieParser from "cookie-parser";
// import { PaymentController } from "./app/modules/payment/payment.controller.js";

// export const app: Application = express();

// // ১. সবার আগে Webhook (অবশ্যই express.raw ব্যবহার করতে হবে)
// app.post(
//   "/webhook",
//   express.raw({ type: "application/json" }), 
//   PaymentController.handleStripeWebhookEvent
// );

// // ২. সাধারণ মিডলওয়্যার (CORS এবং Cookie)
// app.use(cors());
// app.use(cookieParser());

// // ৩. JSON মিডলওয়্যার (শুধুমাত্র /webhook বাদে অন্য সব রাউটের জন্য)
// app.use((req, res, next) => {
//   if (req.originalUrl === "/webhook") {
//     return next();
//   }
//   express.json()(req, res, next);
// });

// // ৪. এপিআই রাউটস
// app.use("/api/v1", router);

// app.get("/", (req: Request, res: Response) => {
//   res.send(`🚀 Server is running on port ${envVars.port}🥰🥰`);
// });

// app.use(globalError);