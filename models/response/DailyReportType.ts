export type DailyReport = {
  id: String;
  date: String;
  dayCost: Number;
  peakCost: Number;
  nightCost: Number;
  dayKwh: Number;
  peakKwh: Number;
  nightKwh: Number;
  totalCost: Number;
  totalKwh: Number;
  isSpike: Boolean;
};

export const dailyReportMapper = (entity: any): DailyReport => {
  return {
    id: entity.id,
    date: entity.date,
    dayCost: entity.dayCost,
    peakCost: entity.peakCost,
    nightCost: entity.nightCost,
    peakKwh: entity.peakKwh,
    nightKwh: entity.nightKwh,
    dayKwh: entity.dayKwh,
    totalCost: entity.totalCost,
    totalKwh: entity.totalKwh,
    isSpike: entity.isSpike,
  };
};
