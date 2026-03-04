import { Router } from "express";
import checkAuth from "../../utils/jwt/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import validationRequest from "../../middleware/validationRequest";
import { adminValidationSchemas } from "./admin.validation";
import { AdminController } from "./admin.controller";

const router = Router();

router.get(
    '/',
    checkAuth(UserRole.ADMIN),
    AdminController.getAllFromDB
);

router.get(
    '/:id',
    checkAuth(UserRole.ADMIN),
    AdminController.getByIdFromDB
);

router.patch(
    '/:id',
    checkAuth(UserRole.ADMIN),
    validationRequest(adminValidationSchemas.update),
    AdminController.updateIntoDB
);

router.delete(
    '/:id',
    checkAuth(UserRole.ADMIN),
    AdminController.deleteFromDB
);

router.delete(
    '/soft/:id',
    checkAuth(UserRole.ADMIN),
    AdminController.softDeleteFromDB
);

export const AdminRoutes = router;