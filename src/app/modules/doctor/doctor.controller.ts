import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DoctorService } from "./doctor.service";

const getAllDoctor = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DoctorService.getAllDoctor(req.query)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor fetched successfully",
        data: result,
    });
})

const getSingleDoctor = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DoctorService.getSingleDoctor(req.params.id as string)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor retrieval successfully",
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
        message: "Doctor updated successfully",
        data: result,
    });
})

const deleteDoctor = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DoctorService.deleteDoctor(req.params.id as string)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

const softDeleteDoctor = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await DoctorService.softDeleteDoctor(req.params.id as string)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})


export const DoctorController = {
    getAllDoctor,
    getSingleDoctor,
    getAISuggestions,
    updateDoctorProfile,
    deleteDoctor,
    softDeleteDoctor
}