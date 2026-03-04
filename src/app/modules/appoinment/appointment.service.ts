import { v4 as uuidv4 } from 'uuid';
import { stripe } from '../../config/stripe.config';
import prisma from '../../config/db';
import type { JwtPayload } from 'jsonwebtoken';
import { findData } from '../../helpers/findUser';
import { AppointmentStatus, PaymentStatus, UserRole, type Prisma } from '../../../generated/prisma/client';
import AppError from '../../errorHelper/AppError';
import httpStatus from "http-status-codes"
import { appointmentFilterableFields } from './appoinment.constant';

const createAppointment = async (user: JwtPayload, payload: { doctorId: string, scheduleId: string }) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    });

    const doctorData = await prisma.doctor.findUniqueOrThrow({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    });

    const isBookedOrNot = await prisma.doctorSchedules.findFirstOrThrow({
        where: {
            doctorId: payload.doctorId,
            scheduleId: payload.scheduleId,
            isBooked: false
        }
    })

    const videoCallingId = uuidv4();

    const result = await prisma.$transaction(async (tnx) => {
        const appointmentData = await tnx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            }
        })

        await tnx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId
                }
            },
            data: {
                isBooked: true
            }
        })

        const transactionId = uuidv4();

        const paymentData = await tnx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: `Appointment with ${doctorData.name}`,
                        },
                        unit_amount: doctorData.appointmentFee * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                appointmentId: appointmentData.id,
                paymentId: paymentData.id
            },
            success_url: `https://www.programming-hero.com/`,
            cancel_url: `https://next.programming-hero.com/`,
        });

        return { paymentUrl: session.url };
    })


    return result;
};

const getMyAppointment = async (user: JwtPayload, query: Record<string, any>) => {
    const { pageNumber, limitNumber, skip, filters, sortBy, sortOrder, } = findData(query, ["status", "paymentStatus"])

    const andConditions: Prisma.AppointmentWhereInput[] = [];

    if (user.role === UserRole.PATIENT) {
        andConditions.push({
            patient: {
                email: user.email
            }
        })
    }
    else if (user.role === UserRole.DOCTOR) {
        andConditions.push({
            doctor: {
                email: user.email
            }
        })
    }

    if (Object.keys(filters).length > 0) {
        const filterConditions = Object.keys(filters).map(key => ({
            [key]: {
                equals: (filters as any)[key]
            }
        }))
        console.log(...filterConditions, "filterConditions")
        andConditions.push(...filterConditions)
    }
    const whereConditions: Prisma.AppointmentWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};
    console.log(whereConditions, "Hellow")

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limitNumber,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: user.role === UserRole.DOCTOR ?
            { patient: true } : { doctor: true }
    });

    const total = await prisma.appointment.count({
        where: whereConditions
    });

    return {
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
        },
        data: result
    }
}


const getAllFromDB = async (query: Record<string, string>) => {
    // const { limit, page, skip } = paginationHelper.calculatePagination(options);
    // const { patientEmail, doctorEmail, ...filterData } = filters;
    const { pageNumber, limitNumber, skip, filters, sortBy, sortOrder, } = findData(query, appointmentFilterableFields)

    const {patientEmail, doctorEmail, ...filterData} = filters

    const andConditions: Prisma.AppointmentWhereInput[] = [];

    if (patientEmail) {
        andConditions.push({
            patient: {
                email: patientEmail
            }
        })
    }
    else if (doctorEmail) {
        andConditions.push({
            doctor: {
                email: doctorEmail
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => {
                return {
                    [key]: {
                        equals: (filterData as any)[key]
                    }
                };
            })
        });
    }

    // console.dir(andConditions, { depth: Infinity })
    const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limitNumber,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            doctor: {
                include: {
                    doctorSpecialties: {
                        include: {
                            specialities: true
                        }
                    }
                }
            },
            patient: true,
            schedule: true,
            prescription: true,
            review: true,
            payment: true
        }
    });
    const total = await prisma.appointment.count({
        where: whereConditions
    });

    return {
        meta: {
            page: pageNumber,
            limit: limitNumber,
            total,
        },
        data: result
    }
};

const createAppointmentWithPayLater = async (user: JwtPayload, payload: any) => {
    // console.log(user?.email, "Hellow")
    const patientData = await prisma.patient.findUnique({
        where: {
            email: user?.email
        }
    });

    if (!patientData) {
        throw new AppError(httpStatus.BAD_REQUEST, "Patient not found")
    }

    const doctorData = await prisma.doctor.findUnique({
        where: {
            id: payload.doctorId,
            isDeleted: false
        }
    });

    if (!doctorData) {
        throw new AppError(httpStatus.BAD_REQUEST, "Doctor not found")
    }

    const doctorScheduleData = await prisma.doctorSchedules.findUnique({
        where: {
            doctorId_scheduleId: {
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId
            },
            isBooked: false
        }
    });
    if (!doctorScheduleData) {
        throw new AppError(httpStatus.BAD_REQUEST, "This schedule is already booked")
    }

    const videoCallingId = uuidv4();

    const result = await prisma.$transaction(async (tnx) => {
        const appointmentData = await tnx.appointment.create({
            data: {
                patientId: patientData.id,
                doctorId: doctorData.id,
                scheduleId: payload.scheduleId,
                videoCallingId
            },
            include: {
                patient: true,
                doctor: true,
                schedule: true
            }
        })

        await tnx.doctorSchedules.update({
            where: {
                doctorId_scheduleId: {
                    doctorId: doctorData.id,
                    scheduleId: payload.scheduleId
                }
            },
            data: {
                isBooked: true
            }
        })

        const transactionId = uuidv4();

        await tnx.payment.create({
            data: {
                appointmentId: appointmentData.id,
                amount: doctorData.appointmentFee,
                transactionId
            }
        })

        return appointmentData;
    })

    return result;
};

const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus, user: JwtPayload) => {
    const appointmentData = await prisma.appointment.findUniqueOrThrow({
        where: {
            id: appointmentId
        },
        include: {
            doctor: true
        }
    });

    if (user.role === UserRole.DOCTOR) {
        if (!(user.email === appointmentData.doctor.email))
            throw new AppError(httpStatus.BAD_REQUEST, "This is not your appointment")
    }

    return await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            status
        }
    })
}

const cancelUnpaidAppointments = async () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

    const unPaidAppointments = await prisma.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinAgo
            },
            paymentStatus: PaymentStatus.UNPAID
        }
    })

    const appointmentIdsToCancel = unPaidAppointments.map(appointment => appointment.id);

    await prisma.$transaction(async (tnx) => {
        await tnx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentIdsToCancel
                }
            }
        })

        await tnx.appointment.deleteMany({
            where: {
                id: {
                    in: appointmentIdsToCancel
                }
            }
        })

        for (const unPaidAppointment of unPaidAppointments) {
            await tnx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unPaidAppointment.doctorId,
                        scheduleId: unPaidAppointment.scheduleId
                    }
                },
                data: {
                    isBooked: false
                }
            })
        }
    })
}


export const AppointmentService = {
    createAppointment,
    getAllFromDB,
    getMyAppointment,
    createAppointmentWithPayLater,
    updateAppointmentStatus,
    cancelUnpaidAppointments
};