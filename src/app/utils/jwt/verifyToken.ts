import jwt, { type JwtPayload } from "jsonwebtoken"

const verifyToken = async(token: string, secret: string)=>{
    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    return decodedToken;
}

export default verifyToken;