import prisma from "../../config/db";
import type { ISchedulePayload, ISchedulesData } from "./schedule.interface";

const createSchedule = async (payload: ISchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const schedulesData: ISchedulesData[] = []
  let currentDate = new Date(startDate)
  const lastDate = new Date(endDate)
  // console.log(currentDate, lastDate)
  while (currentDate <= lastDate) {
    let slotStart = new Date(
      `${currentDate.toISOString().split("T")[0]}T${startTime}:00`
    );
    const dayEndTime = new Date(
      `${currentDate.toISOString().split("T")[0]}T${endTime}:00`
    );
    // console.log(slotStart, "d")

    while (slotStart <= dayEndTime) {
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + 30)

      if (slotEnd <= dayEndTime) {
        schedulesData.push({
          startDateTime: new Date(slotStart),
          endDateTime: new Date(slotEnd),
        })
      }
      slotStart = slotEnd
    }
    console.log(schedulesData)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const result = await prisma.schedule.createMany({
    data: schedulesData,
  });

  return {
    totalSlotsCreated: result.count,
  };
}

// const createSchedule = async (payload: ISchedulePayload) => {
//   const { startDate, endDate, startTime, endTime } = payload;

//   const schedulesData: {
//     startDateTime: Date;
//     endDateTime: Date;
//   }[] = [];

//   // date loop
//   let currentDate = new Date(startDate);
//   const lastDate = new Date(endDate);

//   while (currentDate <= lastDate) {
//     console.log("console")
//     let slotStart = new Date(
//       `${currentDate.toISOString().split("T")[0]}T${startTime}:00`
//     );

//     const dayEndTime = new Date(
//       `${currentDate.toISOString().split("T")[0]}T${endTime}:00`
//     );

//     // let slotStart = new Date(dayStartTime);
//     // console.log(dayStartTime, slotStart)

//     // // 30 minute slot loop
//     while (slotStart < dayEndTime) {
//       const slotEnd = new Date(slotStart);
//       console.log(slotEnd)
//       slotEnd.setMinutes(slotEnd.getMinutes() + 30);

//       if (slotEnd <= dayEndTime) {
//         schedulesData.push({
//           startDateTime: new Date(slotStart),
//           endDateTime: new Date(slotEnd),
//         });
//       }
//       console.log(slotEnd)

//       slotStart = slotEnd;
//     }

//     // next day
//     currentDate.setDate(currentDate.getDate() + 1);
//     console.log("Hellow")
//   }
// //   console.log(schedulesData)
// //   const result = await prisma.schedule.createMany({
// //     data: schedulesData,
// //   });

// //   return {
// //     totalSlotsCreated: result.count,
// //   };
// };


export const ScheduleService = {
  createSchedule
}