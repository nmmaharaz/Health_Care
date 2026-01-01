import type { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env.js";
import AppError from "../errorHelper/AppError.js";

export const globalError = async (err: any, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500
    const stack = envVars.node_env === "development" ? err.stack : null
    let message = "Something went wrong"

    if(err instanceof AppError){
        statusCode = err.statusCode
        message = err.message
    }

    if(err instanceof Error){
        statusCode = 501
        message = err.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack,
        err: envVars.node_env === "development" ? err : null 
    })
}