import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken"

const generateToken = (jwtPayload: JwtPayload, secret: string, expires: string)=>{
    return jwt.sign(jwtPayload, secret, {
            expiresIn: expires,
            algorithm: "HS256"
        } as SignOptions)
}

export default generateToken