import prisma from "../../config/db"
import { envVars } from "../../config/env"
import bcrypt from "bcryptjs"
import type { UserCreateInput } from "../../generated/prisma/models"
import type { Patient, Prisma } from "../../generated/prisma/client"
import { userFilterableFields, userSearchableFields } from "./user.constant"

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
    const {
        page,
        limit,
        sortBy,
        sortOder,
        searchTerm,
        ...rest
    } = query;

    // pagination
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    console.log(rest, "rest")

    // whitelist filters
    const filters: Record<string, any> = {};
    userFilterableFields.forEach(field => {
        // console.log(filters, "field")
        if (rest[field]) {
            filters[field] = rest[field];
        }
    });

    // console.log(filters)

    // const andConditions: Prisma.UserWhereInput[] = [];

    // //   // 🔍 Search
    // if (searchTerm) {
    //     andConditions.push({
    //         OR: userSearchableFields.map(field => ({
    //             [field]: {
    //                 contains: searchTerm,
    //                 mode: "insensitive",
    //             },
    //         })),
    //     });
    // }

    // //   // 🎯 Filters
    // if (Object.keys(filters).length > 0) {
    //     andConditions.push({
    //         AND: Object.keys(filters).map(key => (
    //             {
    //                 [key]: {
    //                     equals: filters[key],
    //                 },
    //             })),
    //     });
    // }
    // console.log(andConditions, "andConditions")
    // const whereCondition: Prisma.UserWhereInput =
    //     andConditions.length > 0 ? { AND: andConditions } : {};
    // // console.log(whereCondition, "whereCondition")

    const where=  {AND: {
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
            }}

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

    //   // main query
    //   const data = await prisma.user.findMany({
    //     where: {

    //     },
    //     skip,
    //     take: limitNumber,
    //     orderBy: sortBy
    //       ? {
    //           [sortBy]: sortOder === "desc" ? "desc" : "asc",
    //         }
    //       : {
    //           createdAt: "desc",
    //         },
    //   });

    //   console.log(data, "data")

    // //   // total count
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