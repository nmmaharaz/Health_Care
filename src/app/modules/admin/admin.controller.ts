import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"
import { AdminService } from "./admin.service";

const getAllFromDB = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AdminService.getAllFromDB(req.params)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data fetched!",
        data: result
    })
})

const getByIdFromDB = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await AdminService.getByIdFromDB(id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data fetched by id!",
        data: result
    });
})


const updateIntoDB = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await AdminService.updateIntoDB(id as string, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data updated!",
        data: result
    })
})

const deleteFromDB = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await AdminService.deleteFromDB(id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data deleted!",
        data: result
    })
})


const softDeleteFromDB = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await AdminService.softDeleteFromDB(id as string);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin data deleted!",
        data: result
    })
});

export const AdminController = {
    getAllFromDB,
    getByIdFromDB,
    updateIntoDB,
    deleteFromDB,
    softDeleteFromDB
}