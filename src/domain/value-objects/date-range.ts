/**
 * Value Object: DateRange
 * 
 * Representa un rango de fechas con validación de consistencia.
 */
export class DateRange {
  private constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {
    if (startDate > endDate) {
      throw new Error("Start date must be before end date");
    }
  }

  static create(startDate: Date, endDate: Date): DateRange {
    return new DateRange(startDate, endDate);
  }

