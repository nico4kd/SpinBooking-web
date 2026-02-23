export * from './enums';
export * from './entities';
export * from './dtos';
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
import { PackageType, Role } from './enums';
//# sourceMappingURL=index.d.ts.map