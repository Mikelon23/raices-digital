/**
 * Value Object: Money
 * 
 * Representa una cantidad monetaria con su moneda.
 * Los Value Objects son inmutables y se comparan por valor, no por identidad.
 * 
 * Principio aplicado: Inmutabilidad y encapsulamiento.
 */
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) {
      throw new Error("Money amount cannot be negative");
    }
    if (!currency || currency.trim() === "") {
      throw new Error("Currency cannot be empty");
    }
  }

