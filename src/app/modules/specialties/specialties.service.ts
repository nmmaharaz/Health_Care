import type { Specialties } from "../../../generated/prisma/client"
import prisma from "../../config/db"

const createSpecialties = async (payload: Specialties) => {
    return await prisma.specialties.create({
        data: payload
    })
}

const getAllSpecialties = async () => {
    return await prisma.specialties.findMany()
}

const deleteSpecialties = async (id: string) => {
    return await prisma.specialties.delete({
        where:{
            id
        }
    })
}

export const SpecialtiesService = {
    createSpecialties,
    getAllSpecialties,
    deleteSpecialties
}