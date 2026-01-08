import dotenv from "dotenv"
dotenv.config()

export const envVars = {
    port: process.env.PORT,
    node_env: process.env.NODE_ENV,
    base_url: process.env.DATABASE_URL,
    sald_round: process.env.BCRYPT_SALT_ROUND,
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.API_KEY as string,
    api_secret: process.env.API_SECRET as string,
    gemini_api:process.env.GEMINI_API_KEY as string,
    jwt: {
        jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
        jwt_access_expires: process.env.JWT_ACCESS_EXPIRES as string,
        jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
        jwt_refresh_expires: process.env.JWT_ACCESS_EXPIRES as string,
    },
    stripe_api_secret:process.env.STRIPE_SECRET_KEY as string,
    webhook_secret:process.env.STRIPE_WEBHOOK_SECRET_KEY as string,
    side_url:process.env.BASE_URL as string
}