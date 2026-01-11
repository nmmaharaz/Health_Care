import prisma from "../../config/db"
import AppError from "../../errorHelper/AppError"
import { UserStatus } from "../../../generated/prisma/enums"
import type { ILogin } from "./auth.validation"
import httpStatus from "http-status-codes"
import { type JwtPayload } from "jsonwebtoken"
import createUserToken from "../../utils/jwt/createUserToken"
import createNewAccessTokenWithRefreshToken from "../../utils/jwt/createNewAccessTokenWithRefreshToken"
import bcrypt from "bcryptjs"
import { envVars } from "../../config/env"

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

    const { password, ...rest } = userExist
    return {
        token,
        user: rest
    }
}

const refreshToken = async (refreshToken: string) => {
    const data = await createNewAccessTokenWithRefreshToken(refreshToken)
    return {
        accessToken: data.accessToken,
        needPasswordChange: data.needPasswordChange
    }
}

const changePassword = async (user: JwtPayload, payload: {
    oldPassword: string,
    newPassword: string
}) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE
        }
    })

    const isCorrectPassword = await bcrypt.compare(payload.oldPassword, userData.password)

    if (!isCorrectPassword) {
        throw new Error("Password incorrect!")
    }

    const hashedPassword: string = await bcrypt.hash(payload.newPassword, Number(envVars.sald_round));

    await prisma.user.update({
        where: {
            email: userData.email
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false
        }
    })

    return {
        message: "Password changed successfully!"
    }
}


export const AuthService = {
    Login,
    refreshToken,
    changePassword
}