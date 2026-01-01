export interface ISchedulePayload {
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
}

export interface ISchedulesData {
    startDateTime: Date;
    endDateTime: Date;
}
