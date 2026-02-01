import { fa } from "zod/v4/locales";
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
        doctorFilterableFields
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

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: filterData[key]
        }))

        andConditions.push(...filterConditions)
    }

    if (searchTerm) {
        andConditions.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }


    const where: Prisma.DoctorWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const data = await prisma.doctor.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: sortBy
            ? { [sortBy]: sortOrder === "desc" ? "desc" : "asc" }
            : [
                { isDeleted: "asc" },
                { createdAt: "desc" }
            ],
        include: {
            doctorSpecialties: {
                include: {
                    specialities: {
                        select: {
                            title: true
                        }
                    }
                },
                omit: {
                    specialitiesId: true,
                    doctorId: true
                }
            },
            reviews: {
                select: {
                    rating: true
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
            },
            doctorSchedules: true
        },
    });

    return data
}

const updateDoctorProfile = async (id: string, payload: Partial<IDoctorUpdateInput>) => {
    console.log(id, "this is id")
    await prisma.doctor.findUniqueOrThrow({
        where: {
            id
        }
    })
    const { specialties, ...doctorData } = payload

    return await prisma.$transaction(async (tnx) => {

        if (specialties && Array.isArray(specialties) && specialties.length > 0) {
            const doctorOldspecialties = await tnx.doctorSpecialties.findMany({
                where: {
                    doctorId: id
                },
                include: {
                    specialities: true
                }
            })
            const doctorOldspecialtiesTitle = doctorOldspecialties.map((s) => s.specialities.title);

            const deleteSpecialty = doctorOldspecialtiesTitle.filter(
                (specialty) => !specialties.includes(specialty)
            );

            await tnx.doctorSpecialties.deleteMany({
                where: {
                    doctorId: id,
                    specialities: {
                        title: {
                            in: deleteSpecialty
                        }
                    }
                }
            })


            const addspecialty = specialties.filter(
                (specialty) => !doctorOldspecialtiesTitle.includes(specialty)
            );

            const existingSpecialties = await tnx.specialties.findMany({
                where: {
                    title: {
                        in: addspecialty,
                    },
                },
                select: {
                    id: true,
                    title: true
                },
            });

            const existingSpecialtyTitles = existingSpecialties.map((s) => s.title);

            const invalidSpecialties = addspecialty.filter(
                (title) => !existingSpecialtyTitles.includes(title)
            );

            if (invalidSpecialties.length > 0) {
                throw new Error(
                    `Invalid specialty IDs: ${invalidSpecialties.join(", ")}`
                );
            }

            const specialtiesIds = existingSpecialties.map((s) => s.id);

            const doctorSpecialtiesData = specialtiesIds.map((specialtyId) => ({
                doctorId: id,
                specialitiesId: specialtyId,
            }));

            const data = await tnx.doctorSpecialties.createMany({
                data: doctorSpecialtiesData,
            });
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
            data: {
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                email: deleteDoctor.email
            },
            data: {
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