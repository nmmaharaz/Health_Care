import express from 'express';
import { PatientController } from './patient.controller';

const router = express.Router();

router.get(
    '/',
    PatientController.getAllPatient
);

router.get(
    '/:id',
    PatientController.getByIdPatient
);

router.patch(
    '/:id',
    PatientController.updatePatient
);

router.delete(
    '/:id',
    PatientController.deletePatient
);
router.delete(
    '/soft/:id',
    PatientController.patientSoftDelete
);

export const PatientRoutes = router;
