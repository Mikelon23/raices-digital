import { Money } from "../value-objects/money";

/**
 * Entity: Community
 * 
 * Representa una comunidad rural en el sistema.
 * Las entidades tienen identidad única y ciclo de vida propio.
 * 
 * Principio aplicado: Rich Domain Model (modelo de dominio rico).
 */
export interface CommunityProps {
  id: string;
  name: string;
  slug: string;
  region?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

