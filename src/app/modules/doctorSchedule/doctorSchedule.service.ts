import type { JwtPayload } from "jsonwebtoken";
import prisma from "../../config/db";
import { findData } from "../../helpers/findUser";
import { scheduleFilterableFields } from "./doctorSchedule.constant";
import type { Prisma } from "../../../generated/prisma/client";
import AppError from "../../errorHelper/AppError";
import httpStatus from "http-status-codes";

const createDoctorSchedule = async (user: JwtPayload, scheduleIds: string[]) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    const doctorScheduleData = scheduleIds.map(scheduleId => ({
        doctorId: doctorData.id,
        scheduleId
    }))

    return await prisma.doctorSchedules.createMany({
        data: doctorScheduleData
    });
}


const getMySchedule = async (user: JwtPayload, query: Record<string, string>) => {
    const { limitNumber, pageNumber, skip, sortBy, sortOrder, filters, searchTerm } = findData(query, scheduleFilterableFields)
    const { startDate, endDate, ...filterData } = filters
    
    const andConditions = [];

    if (startDate && endDate) {
        andConditions.push({
            AND: [
                {
                    schedule: {
                        startDateTime: {
                            gte: startDate
                        }
                    }
                },
                {
                    schedule: {
                        endDateTime: {
                            lte: endDate
                        }
                    }
                }
            ]
        })
    };


    if (Object.keys(filterData).length > 0) {

        if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'true') {
            filterData.isBooked = true
        }
        else if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'false') {
            filterData.isBooked = false
        }

        andConditions.push({
            AND: Object.keys(filterData).map(key => {
                return {
                    [key]: {
                        equals: (filterData as any)[key],
                    },
                };
            }),
        });
    }

    const whereConditions: Prisma.DoctorSchedulesWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};


    const result = await prisma.doctorSchedules.findMany({
        where: whereConditions,
        skip,
        take: limitNumber,
        orderBy:
            sortBy && sortOrder
                ? { [sortBy]: sortOrder }
                : {

                }
    });
    const total = await prisma.doctorSchedules.count({
        where: whereConditions
    });

    return {
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
        },
        data: result,
    };
};

const deleteFromDB = async (user: JwtPayload, scheduleId: string) => {

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const isBookedSchedule = await prisma.doctorSchedules.findFirst({
        where: {
            doctorId: doctorData.id,
            scheduleId: scheduleId,
            isBooked: true
        }
    });

    if (isBookedSchedule) {
        throw new AppError(httpStatus.BAD_REQUEST, "You can not delete the schedule because of the schedule is already booked!")
    }

    const result = await prisma.doctorSchedules.delete({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: scheduleId
            }
        }
    })
    return result;

}

const getAllFromDB = async (query: Record<string, string>) => {
    const { limitNumber, pageNumber, skip, sortBy, sortOrder, filters, searchTerm } = findData(query, scheduleFilterableFields)
    const { startDate, endDate, ...filterData } = filters
    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            doctor: {
                name: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            },
        });
    }

    if (Object.keys(filterData).length > 0) {
        if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'true') {
            filterData.isBooked = true;
        } else if (typeof filterData.isBooked === 'string' && filterData.isBooked === 'false') {
            filterData.isBooked = false;
        }
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        });
    }

    const whereConditions: any =
        andConditions.length > 0 ? { AND: andConditions } : {};
    const result = await prisma.doctorSchedules.findMany({
        include: {
            doctor: true,
            schedule: true,
        },
        where: whereConditions,
        skip,
        take: limitNumber,
        orderBy:
            sortBy && sortOrder
                ? { [sortBy]: sortOrder }
                : {},
    });
    const total = await prisma.doctorSchedules.count({
        where: whereConditions,
    });

    return {
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
        },
        data: result,
    };
};


export const ScheduleDoctorService = {
    createDoctorSchedule,
    getMySchedule,
    deleteFromDB,
    getAllFromDB,
}