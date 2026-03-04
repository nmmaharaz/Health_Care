import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { AppointmentService } from "./appointment.service";
import type { JwtPayload } from "jsonwebtoken";

const createAppointment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AppointmentService.createAppointment(req.user, req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Appointment created successfully",
        data: result,
    });
})

const getAllFromDB = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AppointmentService.getAllFromDB(req.query as Record<string, string>)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Appointment fetched successfully",
        data: result,
    });
})
const getMyAppointment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AppointmentService.getMyAppointment(req.user, req.query)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Appointment fetched successfully",
        data: result,
    });
})


const createAppointmentWithPayLater = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AppointmentService.createAppointmentWithPayLater(req.user as JwtPayload, req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Appointment created successfully with pay later",
        data: result,
    });
})
 
const updateAppointmentStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    const result = await AppointmentService.updateAppointmentStatus(id as string, status, user as JwtPayload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Appointment updated successfully",
        data: result
    })
})


export const AppointmentController = {
    createAppointment,
    getAllFromDB,
    getMyAppointment,
    createAppointmentWithPayLater,
    updateAppointmentStatus
}