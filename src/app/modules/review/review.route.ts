import express from 'express'
import checkAuth from '../../utils/jwt/checkAuth';
import { UserRole } from '../../../generated/prisma/enums';
import { ReviewController } from './review.controller';

const router = express.Router();

router.get("/", checkAuth(...Object.keys(UserRole)), ReviewController.getAllFromDB);

router.post(
    '/',
    checkAuth(UserRole.PATIENT),
    ReviewController.createReview
);


export const ReviewRoute = router;