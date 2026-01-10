import type { JwtPayload } from "jsonwebtoken"
import prisma from "../../config/db"
import { AppointmentStatus, PaymentStatus, type Prescription } from "../../../generated/prisma/client"
import { findData } from "../../helpers/findUser"

const createPrescription = async(user: JwtPayload, payload: Prescription)=>{
    // console.log(user, {
    //     payload
    // })
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: payload.appointmentId,
            doctor:{
                email: user.email
            },
            status: AppointmentStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID
        },
        include: {
            doctor: true
        }
    })

    // console.log(appointmentData, "appointmentData")
     return await prisma.prescription.create({
        data: {
            appointmentId: appointmentData.id,
            doctorId: appointmentData.doctorId,
            patientId: appointmentData.patientId,
            instructions: payload.instructions as string,
            followUpDate: payload.followUpDate || null
        },
        include: {
            patient: true
        }
    });
}

const patientPrescription = async (user: JwtPayload, query: Record<string, string>) => {
    const { pageNumber, limitNumber, skip, filters, sortBy, sortOrder } = findData(query, [])
    const result = await prisma.prescription.findMany({
        where: {
            patient: {
                email: user.email
            }
        },
        skip,
        take: limitNumber,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            doctor: true,
            patient: true,
            appointment: true
        }
    })

    const total = await prisma.prescription.count({
        where: {
            patient: {
                email: user.email
            }
        }
    })

    return {
        meta: {
            total,
            pageNumber,
            limitNumber
        },
        data: result
    }

};

export const PrescriptionService = {
    createPrescription,
    patientPrescription
}