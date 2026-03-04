import { UserStatus, type Admin, type Prisma } from "../../../generated/prisma/client";
import prisma from "../../config/db";
import { findData } from "../../helpers/findUser";
import { adminFilterableFields, adminSearchAbleFields } from "./admin.constant";

const getAllFromDB = async (query: Record<string, string>) => {
    const { pageNumber, limitNumber, searchTerm, skip, filters, sortBy, sortOrder } = findData(query, adminFilterableFields)

    const andConditions: Prisma.AdminWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: adminSearchAbleFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }
            }))
        })
    };

    if (Object.keys(filters).length > 0) {
        andConditions.push({
            AND: Object.keys(filters).map(key => ({
                [key]: {
                    equals: (filters as any)[key]
                }
            }))
        })
    };

    andConditions.push({
        isDeleted: false
    })

    const whereConditions: Prisma.AdminWhereInput = { AND: andConditions }

    const data = await prisma.admin.findMany({
        where: whereConditions,
        skip,
        take: limitNumber,
         orderBy: sortBy
            ? {
                [sortBy]: sortOrder === "desc" ? "desc" : "asc",
            }
            : {
                createdAt: "desc",
            },
    });

    const total = await prisma.admin.count({
        where: whereConditions
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

const getByIdFromDB = async (id: string): Promise<Admin | null> => {
    const result = await prisma.admin.findUnique({
        where: {
            id,
            isDeleted: false
        }
    })

    return result;
};

const updateIntoDB = async (id: string, data: Partial<Admin>): Promise<Admin> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });

    const result = await prisma.admin.update({
        where: {
            id
        },
        data
    });

    return result;
};

const deleteFromDB = async (id: string): Promise<Admin | null> => {

    await prisma.admin.findUniqueOrThrow({
        where: {
            id
        }
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const adminDeletedData = await transactionClient.admin.delete({
            where: {
                id
            }
        });

        await transactionClient.user.delete({
            where: {
                email: adminDeletedData.email
            }
        });

        return adminDeletedData;
    });

    return result;
}


const softDeleteFromDB = async (id: string): Promise<Admin | null> => {
    await prisma.admin.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });

    const result = await prisma.$transaction(async (transactionClient) => {
        const adminDeletedData = await transactionClient.admin.update({
            where: {
                id
            },
            data: {
                isDeleted: true
            }
        });

        await transactionClient.user.update({
            where: {
                email: adminDeletedData.email
            },
            data: {
                status: UserStatus.DELETED
            }
        });

        return adminDeletedData;
    });

    return result;
}


export const AdminService = {
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
    softDeleteFromDB
}