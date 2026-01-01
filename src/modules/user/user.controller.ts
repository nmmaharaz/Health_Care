import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse.js";
import { UserService } from "./user.service.js";
import { cloudinaryUpload } from "../../config/cloudinary.config";

const createPatient = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    req.body.patient.profilePhoto = (req.file as Express.Multer.File).path
    const result = await UserService.createPatient(req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

const getAllUser = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    const result = await UserService.getAllUser(req.query)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

export const UserController = {
    createPatient,
    getAllUser
} 