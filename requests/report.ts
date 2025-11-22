import { fetchWithTimeout } from "@/service/serviceUtils";

export const getMonthlyReport = async (
  user: { uuid: any },
  month: number,
  year: number,
  server: string
) => {
  return await fetchWithTimeout(`http://${server}:8080/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
                    {
                      getMonthlyReport(
                        userId: "${user?.uuid}"
                        month: ${month + 1}
                        year: ${year}
                      ) {
                        id
                        month
                        totalKwh
                        totalCost
                        averageCost
                        numberOfDays
                        predictedTotalCost
                        totalDayCost
                        totalPeakCost
                        totalNightCost
                        totalDayKwh
                        totalPeakKwh
                        totalNightKwh
                        ascFee
                        psoFee
                        createdAt
                      }
                    }
            `,
    }),
  });
};

export const getDailyReport = async (
  user: { uuid: any },
  month: number,
  year: number,
  server: string
) => {
  return await fetchWithTimeout(`http://${server}:8080/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
                    {
                      getDailyReports(
                        userId: "${user?.uuid}"
                        month: ${month + 1}
                        year: ${year}
                      ) {
                          date
                          dayCost
                          dayKwh
                          id
                          isSpike
                          nightCost
                          nightKwh
                          peakCost
                          peakKwh
                          totalCost
                          totalKwh
                        }
                    }
            `,
    }),
  });
};
