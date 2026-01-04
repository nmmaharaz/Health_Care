import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SpecialtiesService } from "./specialties.service";
import httpStatus from "http-status-codes"

const createSpecialties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
     req.body.icon = (req.file as Express.Multer.File).path
    console.log(req.body)
    const result = await  SpecialtiesService.createSpecialties(req.body)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: result,
    });
})

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialtiesService.getAllSpecialties();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialties data fetched successfully',
        data: result,
    });
});

const deleteSpecialties = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SpecialtiesService.deleteSpecialties(id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Specialty deleted successfully',
        data: result,
    });
});

export const SpecialtiesController = {
    createSpecialties,
    getAllSpecialties,
    deleteSpecialties
}