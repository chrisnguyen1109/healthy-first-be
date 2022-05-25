export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    EXPERT = 'expert',
}

export interface IUser {
    fullName: string;
    email: string;
    password: string;
    avatar: string;
    role: UserRole;
    provinceCode?: number;
    districtCode?: number;
    passwordModified?: Date;
    status: boolean;
}
