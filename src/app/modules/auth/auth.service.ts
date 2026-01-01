import prisma from "../../config/db"
import AppError from "../../errorHelper/AppError"
import { UserStatus } from "../../../generated/prisma/enums"
import type { ILogin } from "./auth.validation"
import httpStatus from "http-status-codes"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import setAuthCookie from "../../utils/jwt/setAuthCookie"
import createUserToken from "../../utils/jwt/createUserToken"

const Login = async (payload: ILogin) => {
    const userExist = await prisma.user.findFirstOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    })

    const isCorrectPassword = await bcrypt.compare(payload.password, userExist.password)

    if (!isCorrectPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password is incorrect")
    }

   const token = createUserToken(userExist)

    const {password, ...rest} = userExist
    return {
        token,
        user: rest
    }
}

export const AuthService = {
    Login
}