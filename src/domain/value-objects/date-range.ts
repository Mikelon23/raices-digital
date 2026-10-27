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

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && other.startDate <= this.endDate;
  }

  getDurationInDays(): number {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}