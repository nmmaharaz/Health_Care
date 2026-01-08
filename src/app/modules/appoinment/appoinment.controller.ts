import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { AppointmentService } from "./appoinment.service";

const createAppoinment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AppointmentService.createAppointment(req.user, req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

export const AppoinmentController = {
    createAppoinment
}