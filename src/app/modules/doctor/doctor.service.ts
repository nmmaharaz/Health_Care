import { UserStatus, type Prisma } from "../../../generated/prisma/client";
import { suggestDoctor } from "../../config/ai.config";
import prisma from "../../config/db";
import AppError from "../../errorHelper/AppError";
import { findData } from "../../helpers/findUser";
import { doctorFilterableFields, doctorSearchableFields } from "./doctor.constant";
import type { IDoctorUpdateInput } from "./doctor.interface";
import httpStatus from "http-status-codes"

const getAllDoctor = async (query: Record<string, any>) => {
    const { pageNumber, limitNumber, skip, searchTerm, filters, sortBy, sortOrder } = findData(
        query,
        doctorFilterableFields,
        doctorSearchableFields
    );

    const { specialties, ...filterData } = filters;
    const andConditions: Prisma.DoctorWhereInput[] = [];

    if (specialties && specialties.length > 0) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialities: {
                        title: {
                            contains: specialties,
                            mode: "insensitive"
                        }
                    }
                }
            }
        });
    }

    const where: Prisma.DoctorWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const data = await prisma.doctor.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: sortBy
            ? { [sortBy]: sortOrder === "desc" ? "desc" : "asc" }
            : { createdAt: "desc" },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        },
    });

    const total = await prisma.doctor.count({ where });

    return {
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
        },
        data,
    };
}

const getSingleDoctor = async (id: string) => {

    const data = await prisma.doctor.findMany({
        where: {
            id
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        },
    });

    return  data
}

const updateDoctorProfile = async (id: string, payload: Partial<IDoctorUpdateInput>) => {
    await prisma.doctor.findUniqueOrThrow({
        where: {
            id
        }
    })
    console.log("doctorInfo")
    const { specialties, ...doctorData } = payload
    return await prisma.$transaction(async (tnx) => {
        if (specialties && specialties.length > 0) {
            const deleteSpecialtyIds = specialties.filter((specialty) => specialty.isDeleted)
            for (const specialty of deleteSpecialtyIds) {
                await tnx.doctorSpecialties.deleteMany({
                    where: {
                        doctorId: id,
                        specialitiesId: specialty.specialtyId
                    }
                })
            }

            const createSpecialtyIds = specialties.filter((specialty) => !specialty.isDeleted)

            for (const specialty of createSpecialtyIds) {
                await tnx.doctorSpecialties.create({
                    data: {
                        doctorId: id,
                        specialitiesId: specialty.specialtyId
                    }
                })
            }
        }

        return await tnx.doctor.update({
            where: {
                id
            },
            data: doctorData,
            include: {
                doctorSpecialties: {
                    include: {
                        specialities: true
                    }
                }
            }
        })
    })
}

const getAISuggestions = async (payload: string) => {
    if (!(payload)) {
        throw new AppError(httpStatus.BAD_REQUEST, "symptoms is required!")
    };
    const doctors = await prisma.doctor.findMany({
        where: { isDeleted: false },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        }
    });

    return await suggestDoctor(doctors, payload)
}

const deleteDoctor = async (id: string) => {
       return await prisma.$transaction(async (transactionClient) => {
        const deleteDoctor = await transactionClient.doctor.delete({
            where: {
                id,
            },
        });

        await transactionClient.user.delete({
            where: {
                email: deleteDoctor.email,
            },
        });

        return deleteDoctor;
    });
}

const softDeleteDoctor = async (id: string) => {
       return await prisma.$transaction(async (transactionClient) => {
        const deleteDoctor = await transactionClient.doctor.update({
            where: {
                id,
            },
            data:{
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                email: deleteDoctor.email
            },
            data:{
                status: UserStatus.DELETED
            }
        });

        return deleteDoctor;
    });
}

export const DoctorService = {
    getAllDoctor,
    getSingleDoctor,
    getAISuggestions,
    updateDoctorProfile,
    deleteDoctor,
    softDeleteDoctor
}