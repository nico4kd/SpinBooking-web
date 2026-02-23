// Export all enums
export * from './enums.js';

// Export all entities
export * from './entities.js';

// Export all DTOs
export * from './dtos.js';

// Export config types
export interface PackageConfig {
  type: PackageType;
  name: string;
  tickets: number;
  price: number;
  validityDays: number;
  description: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
  };
}

// Import types for re-export
import { PackageType, Role } from './enums.js';
