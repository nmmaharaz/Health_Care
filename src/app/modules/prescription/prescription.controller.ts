import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PrescriptionService } from "./prescription.service";

const createPrescription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await PrescriptionService.createPrescription(req.user, req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

const patientPrescription = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await PrescriptionService.patientPrescription(req.user, req.query as Record<string, string>)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

export const PrescriptionController = {
    createPrescription,
    patientPrescription
}