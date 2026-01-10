import type { JwtPayload } from "jsonwebtoken"
import type { Review } from "../../../generated/prisma/client"
import prisma from "../../config/db"

const createReview = async (user: JwtPayload, payload: Review) =>{
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where:{
            id: payload.appointmentId,
            patient:{
                email: user.email
            }
        }
    })

    return await prisma.$transaction(async(tnx)=>{
          const result = await tnx.review.create({
            data: {
                appointmentId: appointmentData.id,
                doctorId: appointmentData.doctorId,
                patientId: appointmentData.patientId,
                rating: payload.rating,
                comment: payload.comment
            }
        });

         const avgRating = await tnx.review.aggregate({
            _avg: {
                rating: true
            },
            where: {
                doctorId: appointmentData.doctorId
            }
        })

         await tnx.doctor.update({
            where: {
                id: appointmentData.doctorId
            },
            data: {
                averageRating: avgRating._avg.rating as number
            }
        })
        return result

    })
}

export const ReviewService = {
    createReview
}