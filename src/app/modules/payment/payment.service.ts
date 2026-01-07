import Stripe from "stripe";
import prisma from "../../config/db";
import { PaymentStatus } from "../../../generated/prisma/enums";
import stripe from "../../config/stripe.config";
import type { Request, Response } from "express";

const handleStripeWebhookEvent = async (req:Request, res:Response, webhookSecret, sig) => {
     let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as any;

            const appointmentId = session.metadata?.appointmentId;
            const paymentId = session.metadata?.paymentId;
            console.log(session, "sess")
            await prisma.appointment.update({
                where: {
                    id: appointmentId
                },
                data: {
                    paymentStatus: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID
                }
            })

            await prisma.payment.update({
                where: {
                    id: paymentId
                },
                data: {
                    status: session.payment_status === "paid" ? PaymentStatus.PAID : PaymentStatus.UNPAID,
                    paymentGatewayData: session
                }
            })

            break;
        }

        default:
            console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
};

export const PaymentService = {
    handleStripeWebhookEvent
}