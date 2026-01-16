import express from 'express';
import { UserRole } from '../../../generated/prisma/enums';
import { MetaController } from './metadata.controller';
import checkAuth from '../../utils/jwt/checkAuth';

const router = express.Router();

router.get(
    '/',
    checkAuth(UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
    MetaController.fetchDashboardMetaData
)


export const MetaRoute = router;