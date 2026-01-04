import type { JwtPayload } from "jsonwebtoken";
import prisma from "../../config/db";

const createDoctorSchedule = async(user: JwtPayload, scheduleIds: string[])=>{
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

export const ScheduleDoctorService = {
    createDoctorSchedule
}