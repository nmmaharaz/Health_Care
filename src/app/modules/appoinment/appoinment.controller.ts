import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { AppoinmentService } from "./appoinment.service";
import { catchAsync } from "../../utils/catchAsync";

const createAppoinment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AppoinmentService.createAppoinment(req.user, req.body)
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