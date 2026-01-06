import type { JwtPayload } from "jsonwebtoken";
import type { Prisma } from "../../../generated/prisma/client";
import prisma from "../../config/db";
import { findData } from "../../helpers/findUser";
import { scheduleFields } from "./schedule.constant";
import type { ISchedulePayload, ISchedulesData } from "./schedule.interface";

const createSchedule = async (payload: ISchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const schedulesData: ISchedulesData[] = []
  let currentDate = new Date(startDate)
  const lastDate = new Date(endDate)
  // console.log(currentDate, lastDate)
  while (currentDate <= lastDate) {
    let slotStart = new Date(
      `${currentDate.toISOString().split("T")[0]}T${startTime}:00`
    );
    const dayEndTime = new Date(
      `${currentDate.toISOString().split("T")[0]}T${endTime}:00`
    );
    // console.log(slotStart, "d")

    while (slotStart <= dayEndTime) {
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + 30)

      if (slotEnd <= dayEndTime) {
        schedulesData.push({
          startDateTime: new Date(slotStart),
          endDateTime: new Date(slotEnd),
        })
      }
      slotStart = slotEnd
    }
    console.log(schedulesData)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const result = await prisma.schedule.createMany({
    data: schedulesData,
  });

  return {
    totalSlotsCreated: result.count,
  };
}

const getAllSchedule = async(user: JwtPayload, query: Record<string, any>)=>{
  const {pageNumber, limitNumber, skip, sortBy, sortOrder, rest} = findData(query, scheduleFields, scheduleFields)
  const andConditions: Prisma.ScheduleWhereInput[] = [];

    if (rest.startDateTime && rest.endDateTime) {
        andConditions.push({
            AND: [
                {
                    startDateTime: {
                        gte: rest.startDateTime
                    }
                },
                {
                    endDateTime: {
                        lte: rest.endDateTime
                    }
                }
            ]
        })
    }

    console.log("Hellow")
    const whereConditions: Prisma.ScheduleWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}


    const doctorSchedules = await prisma.doctorSchedules.findMany({
        where: {
            doctor:{email: user.email} 
            
        },
        select: {
            scheduleId: true
        }
    });

    console.log

    const doctorScheduleIds = doctorSchedules.map(schedule => schedule.scheduleId);

    const result = await prisma.schedule.findMany({
        where: {
            ...whereConditions,
            id: {
                notIn: doctorScheduleIds
            }
        },
        skip,
        take: limitNumber,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.schedule.count({
        where: {
            ...whereConditions,
            id: {
                notIn: doctorScheduleIds
            }
        }
    });

    return {
        meta: {
            total
        },
        data: result
    };
}

const deleteSchedule = async(id: string)=>{
    const result = await prisma.schedule.delete({
        where: {
          id 
        }
    })
}

export const ScheduleService = {
  createSchedule,
  getAllSchedule,
  deleteSchedule
}