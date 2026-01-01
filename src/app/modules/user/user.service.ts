import prisma from "../../config/db"
import { envVars } from "../../config/env"
import bcrypt from "bcryptjs"
import type { UserCreateInput } from "../../../generated/prisma/models"
import type { Patient, Prisma } from "../../../generated/prisma/client"
import { userFilterableFields, userSearchableFields } from "./user.constant"
import { findData } from "../../helpers/findUser"

const createPatient = async (payload: {
    password: string,
    patient: Patient
}) => {
    payload.password = await bcrypt.hash(payload.password, Number(envVars.sald_round))

    const result = await prisma.$transaction(async (tx) => {
        await tx.user.create({
            data: {
                email: payload.patient.email,
                password: payload.password
            } as UserCreateInput
        })

        return await tx.patient.create({
            data: payload.patient
        })
    })
    return result

}
// const getAllUser = async(query: Record<string, any>)=>{
//     const {page: pageNumber, limit: totalLimit, sortBy, sortOder, filter: filterData, searchTerm: search} = query
//     const page = pageNumber || 1
//     const limit = totalLimit || 10
//     const searchTerm = search || ""

//     const result = await prisma.user.findMany({
//         where: {
//             OR: userFilterableFields.map(field =>({
//                 [field]: filterData
//             }))
//         }
//     })
//     console.log(result)
//     return result

// }
export const getAllUser = async (query: Record<string, any>) => {
    const { pageNumber, limitNumber, skip, searchTerm, filters, sortBy, sortOder, } = findData(query, userFilterableFields, userSearchableFields)


    const where = {
        AND: {
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
            AND: Object.keys(filters).map(key => (
                {
                    [key]: filters[key],
                })),
        }
    }

    const data = await prisma.user.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: sortBy
            ? {
                [sortBy]: sortOder === "desc" ? "desc" : "asc",
            }
            : {
                createdAt: "desc",
            },
    });

    const total = await prisma.user.count({
        where
    });

    return {
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
        },
        data,
    };
};


export const UserService = {
    createPatient,
    getAllUser
}