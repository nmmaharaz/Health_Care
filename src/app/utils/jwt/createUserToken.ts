import { envVars } from "../../config/env";
import type { User } from "../../../generated/prisma/client";
import generateToken from "./generateToken";

const createUserToken = (user: User) => {
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    }

    const accessToken = generateToken(jwtPayload, envVars.jwt.jwt_access_secret, envVars.jwt.jwt_access_expires)
    const refreshToken = generateToken(jwtPayload, envVars.jwt.jwt_refresh_secret, envVars.jwt.jwt_refresh_expires)

    return {
        accessToken,
        refreshToken
    }
}

export default createUserToken