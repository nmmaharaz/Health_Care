
import type { NextFunction, Request, Response } from "express";
// import { catchAsync } from "../../utils/catchAsync";
import { stripe } from "../../config/stripe.config";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import { envVars } from "../../config/env";


const handleStripeWebhookEvent = async (req: Request, res: Response, next: NextFunction) => {
try{
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = envVars.webhook_secret
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
    const result = await PaymentService.handleStripeWebhookEvent(event);
    
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Webhook req send successfully',
      data: result,
    });
  }catch(error){
    console.log(error)
  }
};

export const PaymentController = {
    handleStripeWebhookEvent
}