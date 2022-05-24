export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    EXPERT = 'expert',
}

export interface IUser {
    email: string;
    password: string;
    avatar: string;
    role: UserRole;
    code?: number;
    passwordModified?: Date;
    status: boolean;
}
