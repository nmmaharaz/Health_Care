// import { Request, Response } from "express";

import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"
import type { JwtPayload } from "jsonwebtoken";
import { MetaService } from "./metadata.service";


const fetchDashboardMetaData = catchAsync(async (req: Request, res: Response, next:NextFunction) => {

    const result = await MetaService.fetchDashboardMetaData(req.user as JwtPayload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Meta data retrival successfully!",
        data: result
    })
});

export const MetaController = {
    fetchDashboardMetaData
}