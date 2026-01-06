import type { JwtPayload } from "jsonwebtoken";
import prisma from "../../config/db";
import { v4 as uuid } from "uuid";
import stripe from "../../config/stripe.config";
import { envVars } from "../../config/env";

const createAppoinment = async (user: JwtPayload, payload: { doctorId: string, scheduleId: string }) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId
        }
    })

    const isBookOrNot = await prisma.doctorSchedules.findUniqueOrThrow({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId
            }
        }
    })

    console.log(isBookOrNot, "isBook")

    const videoCallingId = uuid()
    const transactionId = uuid()

    const result = await prisma.$transaction(async (tnx) => {
        const appoinmentData = await tnx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            }
        })

        await tnx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId
                }
            },
            data: {
                isBooked: true
            }
        })

        const paymentData = await tnx.payment.create({
            data: {
                appointmentId: appoinmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

           const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: `Appointment with ${doctorData.name}`,
                        },
                        unit_amount: doctorData.appointmentFee * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                appointmentId: appoinmentData.id,
                paymentId: paymentData.id
            },
            success_url: `${envVars.client_side_url}/success`,
            cancel_url: `${envVars.client_side_url}/home`,
        });
        // return { paymentUrl: session.url };
        console.log(session, "session")
    })

    return result

}

export const AppoinmentService = {
    createAppoinment
}