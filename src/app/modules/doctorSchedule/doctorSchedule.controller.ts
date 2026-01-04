import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type { JwtPayload } from "jsonwebtoken";
import { ScheduleDoctorService } from "./doctorSchedule.service";

const createDoctorSchedule = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const user = req.user
    const result = await ScheduleDoctorService.createDoctorSchedule(user as JwtPayload, req.body.scheduleIds)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})


export const DoctorScheduleController = {
    createDoctorSchedule
}