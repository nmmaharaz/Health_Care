import prisma from "../../config/db"
import { envVars } from "../../config/env"
import bcrypt from "bcryptjs"
import type { UserCreateInput } from "../../../generated/prisma/models"
import type { Admin, Doctor, Patient, Prisma, UserStatus } from "../../../generated/prisma/client"
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

const createDoctor = async (payload: {
    password: string,
    doctor: Doctor & {specialties:string}
}) => {
    const { specialties, ...doctorData } = payload.doctor;
    // console.log("Creating doctor with payload:", payload)
    payload.password = await bcrypt.hash(payload.password, Number(envVars.sald_round))
    const result = await prisma.$transaction(async (tx) => {
        await tx.user.create({
            data: {
                email: payload.doctor.email,
                password: payload.password,
                role: "DOCTOR"
            } as UserCreateInput
        })

        const createdDoctorData = await tx.doctor.create({
            data: payload.doctor
        })
         if (specialties && Array.isArray(specialties) && specialties.length > 0) {
            const existingSpecialties = await tx.specialties.findMany({
                where: {
                    id: {
                        in: specialties,
                    },
                },
                select: {
                    id: true,
                },
            });

            const existingSpecialtyIds = existingSpecialties.map((s) => s.id);
            const invalidSpecialties = specialties.filter(
                (id) => !existingSpecialtyIds.includes(id)
            );

            if (invalidSpecialties.length > 0) {
                throw new Error(
                    `Invalid specialty IDs: ${invalidSpecialties.join(", ")}`
                );
            }

            // Create doctor specialties relations
            const doctorSpecialtiesData = specialties.map((specialtyId) => ({
                doctorId: createdDoctorData.id,
                specialitiesId: specialtyId,
            }));

            await tx.doctorSpecialties.createMany({
                data: doctorSpecialtiesData,
            });
        }

        // Step 4: Return doctor with specialties
        const doctorWithSpecialties = await tx.doctor.findUnique({
            where: {
                id: createdDoctorData.id,
            },
            include: {
                doctorSpecialties: {
                    include: {
                        specialities: true,
                    },
                },
            },
        });
        return doctorWithSpecialties!
    })
    return result
}


const createAdmin = async (payload: {
    password: string,
    admin: Admin
}) => {
    payload.password = await bcrypt.hash(payload.password, Number(envVars.sald_round))

    const result = await prisma.$transaction(async (tx) => {
        await tx.user.create({
            data: {
                email: payload.admin.email,
                password: payload.password,
                role: "ADMIN"
            } as UserCreateInput
        })

        return await tx.admin.create({
            data: payload.admin
        })
    })
    return result

}
// const getAllUser = async(query: Record<string, any>)=>{
//     const {page: pageNumber, limit: totalLimit, sortBy, sortOrder, filter: filterData, searchTerm: search} = query
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
    const { pageNumber, limitNumber, skip, searchTerm, filters, sortBy, sortOrder } = findData(query, userFilterableFields)

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
        include:{
            doctor: true
        },
        take: limitNumber,
        orderBy: sortBy
            ? {
                [sortBy]: sortOrder === "desc" ? "desc" : "asc",
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

const changeProfileStatus = async(id: string, userStatus: UserStatus)=>{
    await prisma.user.findUniqueOrThrow({
        where: {
            id
        }
    })

    return await prisma.user.update({
        where:{
            id
        },
        data: userStatus
    })
}


export const UserService = {
    createPatient,
    createDoctor,
    createAdmin,
    getAllUser, 
    changeProfileStatus
}