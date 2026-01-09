import { v4 as uuidv4 } from 'uuid';
import { stripe } from '../../config/stripe.config';
import prisma from '../../config/db';
import type { JwtPayload } from 'jsonwebtoken';
import { findData } from '../../helpers/findUser';
import { AppointmentStatus, UserRole, type Prisma } from '../../../generated/prisma/client';
import AppError from '../../errorHelper/AppError';
import httpStatus from "http-status-codes"

const createAppointment = async (user: JwtPayload, payload: { doctorId: string, scheduleId: string }) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    });

    const isBookedOrNot = await prisma.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked: false
        }
    })

    const videoCallingId = uuidv4();

    const result = await prisma.$transaction(async (tnx) => {
        const appointmentData = await tnx.appointment.create({
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

        const transactionId = uuidv4();

        const paymentData = await tnx.payment.create({
            data: {
                appointmentId: appointmentData.id,
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
                appointmentId: appointmentData.id,
                paymentId: paymentData.id
            },
            success_url: `https://www.programming-hero.com/`,
            cancel_url: `https://next.programming-hero.com/`,
        });

        return { paymentUrl: session.url };
    })


    return result;
};


const getMyAppointment = async (user: JwtPayload, query: Record<string, any>) => {
    const { pageNumber, limitNumber, skip, filters, sortBy, sortOrder, } = findData(query, ["status", "paymentStatus"])

    const andConditions: Prisma.AppointmentWhereInput[] = [];

    if (user.role === UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user.email
            }
        })
    }
    else if (user.role === UserRole.DOCTOR) {
        andConditions.push({
            doctor: {
                email: user.email
            }
        })
    }

    if (Object.keys(filters).length > 0) {
        const filterConditions = Object.keys(filters).map(key => ({
            [key]: {
                equals: (filters as any)[key]
            }
        }))
        console.log(...filterConditions, "filterConditions")
        andConditions.push(...filterConditions)
    }
    const whereConditions: Prisma.AppointmentWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};
    console.log(whereConditions, "Hellow")

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limitNumber,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: user.role === UserRole.DOCTOR ?
            { patient: true } : { doctor: true }
    });

    const total = await prisma.appointment.count({
        where: whereConditions
    });

    return {
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
        },
        data: result
    }
}

// task get all data from db (appointment data) - admin

const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, user: JwtPayload) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId
        },
        include: {
            doctor: true
        }
    });

    if (user.role === UserRole.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email))
            throw new AppError(httpStatus.BAD_REQUEST, "This is not your appointment")
    }

    return await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            status
        }
    })

}

export const AppointmentService = {
    createAppointment,
    getMyAppointment,
    updateAppointmentStatus
};