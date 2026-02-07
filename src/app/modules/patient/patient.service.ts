import { fi } from "zod/v4/locales"
import type { Prisma } from "../../../generated/prisma/client"
import { findData } from "../../helpers/findUser"
import { patientFilterableFields, patientSearchableFields } from "./patient.constant"
import prisma from "../../config/db"

const getAllPatient = async (query: Record<string, any>) => {
    const { limitNumber, pageNumber, skip, sortBy, sortOrder, filters, searchTerm } = findData(query,
        patientFilterableFields
    )

    const andConditions: Prisma.PatientWhereInput[] = []

    if (Object.keys(filters).length > 0) {
        const filterConditions = Object.keys(filters).map((key) => ({
            [key]: filters[key]
        }))
        andConditions.push(...filterConditions)
    }

    if (searchTerm) {
        andConditions.push({
            OR: patientSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const data = await prisma.patient.findMany({
        where,
        include: {
            user: true,
            appointments: true,
            medicalReports: true,
            patientHealthData: true
        },
        skip,
        take: limitNumber,
        orderBy: sortBy
            ? { [sortBy]: sortOrder === "desc" ? "desc" : "asc" }
            : [
                { isDeleted: "asc" },
                { createdAt: "desc" }
            ],
    })

    const total = await prisma.patient.count({ where })
    return {
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
        },
        data,
    };
}

const getByIdPatient = async (id: string) => {
    const result = await prisma.patient.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            medicalReports: true,
            patientHealthData: true,
        },
    });
    return result;
}

const updatePatient = async (id: string, payload: Record<string, any>) => {
    const { patientHealthData, medicalReport, ...patientData } = payload;
    console.log(patientHealthData, "this is health data")
    console.log(medicalReport, "this is medical report")
    console.log(patientData, "this is patient data")

    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            id,
            isDeleted: false
        }
    });
    console.log(patientInfo, "this is patient info")

    await prisma.$transaction(async (tnx) => {
        //update patient data
      const data =   await tnx.patient.update({
            where: {
                id
            },
            data: patientData,
            include: {
                patientHealthData: true,
                medicalReports: true
            }
        });
        console.log(data, "this is updated patient data")
        // create or update patient health data
        // if (patientHealthData) {
        //     await tnx.patientHealthData.upsert({
        //         where: {
        //             patientId: patientInfo.id
        //         },
        //         update: patientHealthData,
        //         create: { ...patientHealthData, patientId: patientInfo.id }
        //     });
        // };

        // if (medicalReport) {
        //     await tnx.medicalReport.create({
        //         data: { ...medicalReport, patientId: patientInfo.id }
        //     })
        // }
    })


    const responseData = await prisma.patient.findUnique({
        where: {
            id: patientInfo.id
        },
        include: {
            patientHealthData: true,
            medicalReports: true
        }
    })
    return responseData;
}

const deletePatient = async (id: string) => {
    return await prisma.$transaction(async (tnx) => {
        await tnx.medicalReport.deleteMany({
            where: { patientId: id }
        })
        await tnx.patientHealthData.delete({
            where: { patientId: id }
        })
        const patient = await tnx.patient.delete({
            where: { id }
        })
        await tnx.user.delete({
            where: { email: patient.email }
        })
        return patient
    })
}

const patientSoftDelete = async (id: string) => {
    return await prisma.$transaction(async (tnx) => {
        const patient = await tnx.patient.update({
            where: { id },
            data: { isDeleted: true }
        })
        await tnx.user.update({
            where: { email: patient.email },
            data: {
                status: "DELETED"
            }
        })
        return patient
    })
}

export const PatientService = {
    getAllPatient,
    getByIdPatient,
    updatePatient,
    deletePatient,
    patientSoftDelete
}