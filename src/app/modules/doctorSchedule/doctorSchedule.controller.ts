import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type { JwtPayload } from "jsonwebtoken";
import { ScheduleDoctorService } from "./doctorSchedule.service";
import httpStatus from "http-status-codes"

const createDoctorSchedule = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const user = req.user
    const result = await ScheduleDoctorService.createDoctorSchedule(user as JwtPayload, req.body.scheduleIds)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor Schedule created successfully",
        data: result,
    });
})

const getMySchedule = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const result = await ScheduleDoctorService.getMySchedule(user, req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My Schedule fetched successfully!",
        data: result
    });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const { id } = req.params;
    const result = await ScheduleDoctorService.deleteFromDB(user as JwtPayload, id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My Schedule deleted successfully!",
        data: result
    });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ScheduleDoctorService.getAllFromDB(req.query as Record<string, string>);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Doctor Schedule retrieval successfully',
        data: result.data,
    });
});



export const DoctorScheduleController = {
    createDoctorSchedule,
    getMySchedule,
    deleteFromDB,
    getAllFromDB
}