import prisma from "../../config/db"
import { envVars } from "../../config/env"
import generateToken from "./generateToken"
import verifyToken from "./verifyToken"

const createNewAccessTokenWithRefreshToken = async (refresh: string) => {
    const verifyRefreshToken = await verifyToken(refresh, envVars.jwt.jwt_refresh_secret)

    console.log(verifyRefreshToken)

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: verifyRefreshToken.userId,
            email: verifyRefreshToken.email
        }
    })

    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    }

    const accessToken = await generateToken(jwtPayload, envVars.jwt.jwt_access_secret, envVars.jwt.jwt_access_expires)
    return {
        accessToken,
        needPasswordChange: user.needPasswordChange
    }
}

export default createNewAccessTokenWithRefreshToken