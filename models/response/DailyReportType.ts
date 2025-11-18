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
