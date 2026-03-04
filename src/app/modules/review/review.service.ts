import type { JwtPayload } from "jsonwebtoken"
import type { Prisma, Review } from "../../../generated/prisma/client"
import prisma from "../../config/db"
import { findData } from "../../helpers/findUser"
import { reviewFilterableFields } from "./review.constant"

const createReview = async (user: JwtPayload, payload: Review) =>{
    console.log(payload, "user from review service")
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

const getAllFromDB = async (query:Record<string, string>) => {
    const { pageNumber, limitNumber, skip, filters, sortBy, sortOrder, } = findData(query, reviewFilterableFields)
    const { patientEmail, doctorEmail } = filters;
    
    // const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const andConditions = [];

    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail
            }
        })
    }

    if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail
            }
        })
    }

    const whereConditions: Prisma.ReviewWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.review.findMany({
        where: whereConditions,
        skip,
        take: limitNumber,
        orderBy:
            sortBy && sortOrder
                ? { [sortBy]: sortOrder }
                : {
                    createdAt: 'desc',
                },
        include: {
            doctor: true,
            patient: true,
            appointment: true,
        },
    });
    const total = await prisma.review.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page: pageNumber,
            limit: limitNumber,
        },
        data: result,
    };
};

export const ReviewService = {
    createReview,
    getAllFromDB
}