import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ScheduleService } from "./schedule.service";

const createSchedule = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const result = await ScheduleService.createSchedule(req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

const getAllSchedule = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const result = await ScheduleService.getAllSchedule(req.params)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

export const ScheduleController = {
    createSchedule,
    getAllSchedule
}

