import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DoctorService } from "./doctor.service";

const getAllDoctor = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DoctorService.getAllDoctor(req.query)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

const getAISuggestions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DoctorService.getAISuggestions(req.body.symptoms as string)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

const updateDoctorProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DoctorService.updateDoctorProfile(req.params.id as string, req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})


export const DoctorController = {
    getAllDoctor,
    getAISuggestions,
    updateDoctorProfile
}