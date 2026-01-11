import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import setAuthCookie from "../../utils/jwt/setAuthCookie";

const Login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await AuthService.Login(req.body)
    setAuthCookie(res, result.token)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User loggedin successfully",
        data: result,
    });
})

const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.cookies
    const {accessToken, needPasswordChange} = await AuthService.refreshToken(refreshToken)
    setAuthCookie(res, {accessToken})
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: {
            accessToken,
            needPasswordChange
        },
    });
})

export const AuthController = {
    Login,
    refreshToken
}