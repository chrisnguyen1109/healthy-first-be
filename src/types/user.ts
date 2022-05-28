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
    provinceName?: string;
    districtCode?: number;
    districtName?: string;
    passwordModified?: Date;
    status: boolean;
}
