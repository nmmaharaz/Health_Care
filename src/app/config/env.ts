import dotenv from "dotenv"
dotenv.config()

export const envVars = {
    port: process.env.PORT,
    node_env: process.env.NODE_ENV as string,
    base_url: process.env.DATABASE_URL as string,
    sald_round: process.env.BCRYPT_SALT_ROUND,
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.API_KEY as string,
    api_secret: process.env.API_SECRET as string,
    gemini_api: process.env.GEMINI_API_KEY as string,
    jwt: {
        jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
        jwt_access_expires: process.env.JWT_ACCESS_EXPIRES as string,
        jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
        jwt_refresh_expires: process.env.JWT_ACCESS_EXPIRES as string,
        jwt_reset_pass_secret: process.env.RESET_PASS_SECRET as string,
        jwt_reset_pass_expires: process.env.RESET_PASS_EXPIRES as string
    },
    stripe_api_secret: process.env.STRIPE_SECRET_KEY as string,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET_KEY as string,
    side_url: process.env.BASE_URL as string,
    frontend_url: process.env.FRONTEND_URL as string,
    smtp: {
        smtp_host: process.env.SMTP_HOST as string,
        smtp_port: process.env.SMTP_PORT as string,
        smtp_user: process.env.SMTP_USER as string,
        smtp_from: process.env.SMTP_FROM as string,
        smtp_pass: process.env.SMTP_PASS as string
    }
}