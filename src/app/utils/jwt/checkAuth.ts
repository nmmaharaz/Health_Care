import type { NextFunction, Request, Response } from "express";
import AppError from "../../errorHelper/AppError";
import verifyToken from "./verifyToken";
import { envVars } from "../../config/env";
import prisma from "../../config/db";
import type { JwtPayload } from "jsonwebtoken";

const checkAuth = (...authRoles: string[]) => async (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
    try {
        console.log("Auth Middleware Invoked", authRoles)

        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            throw new AppError(403, 'No token provided')
        }

        const verifiedToken = await verifyToken(accessToken, envVars.jwt.jwt_access_secret);

        if (!verifiedToken) {
            throw new AppError(401, 'Invalid Token')
        }

        const user = await prisma.user.findUnique({
            where: {
                id: verifiedToken.userId
            }
        })

        if (!user) {
            throw new AppError(404, 'User cannot authenticated')
        }

        if (authRoles.length && !authRoles.includes(user.role) || user.status !== "ACTIVE") {
            throw new AppError(403, 'You are not authorized to access this route')
        }

        req.user = verifiedToken as JwtPayload;

        next();

    } catch (error) {
        next(error)
    }
}

export default checkAuth;