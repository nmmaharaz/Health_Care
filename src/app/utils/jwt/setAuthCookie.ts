import type { Response } from "express"

interface ITokenInfo {
    accessToken?: string,
    refreshToken?: string
}


const setAuthCookie = (res: Response, tokenInfo: ITokenInfo)=>{
    if(tokenInfo.accessToken){
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
    }
    if(tokenInfo.refreshToken){
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        })
    }
}

export default setAuthCookie