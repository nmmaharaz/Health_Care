import { Router } from "express";
import { AuthController } from "./auth.controller";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router()

router.post("/login", AuthController.Login)

router.post(
    '/refresh-token',
    AuthController.refreshToken
)

router.patch(
    '/change-password',
    checkAuth(...Object.values(UserRole)),
    AuthController.changePassword
);

router.post(
    '/forgot-password',
    AuthController.forgotPassword
);


export const AuthRoute = router