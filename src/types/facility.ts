import { ICertificate } from './certificate';

export enum BusinessType {
    FOOD_PRODUCTION = 'food_production',
    FOOD_SERVICE = 'food_service',
}

export enum FacilityCertificate {
    NO_CERTIFICATE = 'no_certificate',
    PENDING = 'pending',
    CERTIFIED = 'certified',
    REVOKED = 'revoked',
    EXPIRED = 'expired',
}

export interface IFacility {
    name: string;
    address: string;
    owner: string;
    provinceCode: number;
    provinceName: string;
    districtCode: number;
    districtName: string;
    wardCode: number;
    wardName: string;
    phoneNumber: string;
    businessType: BusinessType;
    description?: string;
    facilityCertificate: FacilityCertificate;
    certificate?: string | ICertificate;
}
