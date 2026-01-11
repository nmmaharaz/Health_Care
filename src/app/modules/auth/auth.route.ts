import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router()

router.post("/login", AuthController.Login)

router.post(
    '/refresh-token',
    AuthController.refreshToken
)


export const AuthRoute = router