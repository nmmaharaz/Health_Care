import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse.js";
import { UserService } from "./user.service.js";
import { cloudinaryUpload } from "../../config/cloudinary.config";
import type { JwtPayload } from "jsonwebtoken";

const createPatient = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    req.body.patient.profilePhoto = (req.file as Express.Multer.File).path
    const result = await UserService.createPatient(req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Patient created successfully",
        data: result,
    });
})

const createDoctor = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    req.body.doctor.profilePhoto = (req.file as Express.Multer.File).path
    console.log("Request body in createDoctor:", req.body);
    const result = await UserService.createDoctor(req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor created successfully",
        data: result,
    });
})
const createAdmin = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
    req.body.admin.profilePhoto = (req.file as Express.Multer.File).path
    const result = await UserService.createAdmin(req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Admin created successfully",
        data: result,
    });
})

const getAllUser = catchAsync(async(req: Request & {user?: JwtPayload}, res: Response, next: NextFunction)=>{
    const result = await UserService.getAllUser(req.query)
    sendResponse(res, {                                              
        statusCode: 201,
        success: true,
        message: "User retrive successfully",
        data: result,
    });
})

const changeProfileStatus = catchAsync(async(req: Request & {user?: JwtPayload}, res: Response, next: NextFunction)=>{
    const result = await UserService.changeProfileStatus(req.params.id as string, req.body)
    sendResponse(res, {                                              
        statusCode: 201,
        success: true,
        message: "Users profile status changed!",
        data: result,
    });
})

export const UserController = {
    createPatient,
    createDoctor,
    createAdmin,
    getAllUser,
    changeProfileStatus
} 