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
import generateToken from "../../utils/jwt/generateToken"
import { sendEmail } from "../../utils/sendEmail"
import verifyToken from "../../utils/jwt/verifyToken"

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

const forgotPassword = async (email: string) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email,
            status: UserStatus.ACTIVE
        },
        include:{
            admin: {
                select: {
                    name: true
                }
            },
            doctor: {
                select: {
                    name: true
                }
            },
            patient: {
                select: {
                    name: true
                }
            }
        }
    })


    const jwtPayload = {
        userId: userData.id,
        email: userData.email,
        role: userData.role
    }

    const resetPassToken = generateToken(jwtPayload, envVars.jwt.jwt_reset_pass_secret, envVars.jwt.jwt_reset_pass_expires)

    const resetLink = `${envVars.frontend_url}/reset-password?userId=${userData.id}&token=${resetPassToken}`
    sendEmail({
        to: userData.email,
        subject: "Password Reset Request",
        templateName: "forgetPassword",
        templateData: {
            // name: userData.name,
            resetLink
        }
    })
}

const getMe = async (user: any) => {
    // const accessToken = user.accessToken;
    // const user: JwtPayload = verifyToken(accessToken, envVars.jwt.jwt_access_secret as string)

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE
        },
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            admin: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                }
            },
            doctor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    registrationNumber: true,
                    experience: true,
                    gender: true,
                    appointmentFee: true,
                    qualification: true,
                    currentWorkingPlace: true,
                    designation: true,
                    averageRating: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                    doctorSpecialties: {
                        include: {
                            specialities: true
                        }
                    }
                }
            },
            patient: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePhoto: true,
                    contactNumber: true,
                    address: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                    patientHealthData: true,
                }
            }
        }
    });
    console.log(userData, "Userdata")

    return userData;
}


export const AuthService = {
    getMe,
    Login,
    refreshToken,
    changePassword,
    forgotPassword
}