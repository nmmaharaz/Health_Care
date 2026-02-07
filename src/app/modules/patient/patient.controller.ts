import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes"
import { sendResponse } from "../../utils/sendResponse";
import { PatientService } from "./patient.service";

const getAllPatient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await PatientService.getAllPatient(req.query);

  sendResponse(res, {        
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient retrieval successfully',
    data: result,
  });
});

const getByIdPatient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const { id } = req.params;
  const result = await PatientService.getByIdPatient(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient retrieval successfully',
    data: result,
  });
});

const updatePatient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const result = await PatientService.updatePatient(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient updated successfully',
    data: result,
  });
});

const deletePatient = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const result = await PatientService.deletePatient(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient deleted successfully',
    data: result,
  });
});


const patientSoftDelete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const result = await PatientService.patientSoftDelete(id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient soft deleted successfully',
    data: result,
  });
});

export const PatientController = {
    getAllPatient,
    getByIdPatient,
    updatePatient,
    deletePatient,
    patientSoftDelete
};
