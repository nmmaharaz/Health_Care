import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import stripe from "../../config/stripe.config";
import { PaymentService } from "./payment.service";

// const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     console.log("Hellow baro")
//     const sig = req.headers["stripe-signature"] as string;
//     const webhookSecret = "whsec_7d0054bf3724c26449ccf00547be36dfbba001ae524a95c6e2be932a8f1db8f7"

//     let event;
//     event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//     // console.error("⚠️ Webhook signature verification failed:", err.message);
//     // return res.status(400).send(`Webhook Error: ${err.message}`);
//     const result = await PaymentService.handleStripeWebhookEvent(event);
//     sendResponse(res, {
//         statusCode: 201,
//         success: true,
//         message: "Booking created successfully",
//         data: result,
//     });
// })

// export const PaymentController = {
//     handleStripeWebhookEvent
// }

const handleStripeWebhookEvent = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = "whsec_7d0054bf3724c26449ccf00547be36dfbba001ae524a95c6e2be932a8f1db8f7"

    const result = await PaymentService.handleStripeWebhookEvent(req, res, webhookSecret, sig);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Webhook req send successfully',
        data: result,
    });
});

export const PaymentController = {
    handleStripeWebhookEvent
}