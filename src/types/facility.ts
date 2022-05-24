export enum BusinessType {
    FOOD_PRODUCTION = 'food_production',
    FOOD_SERVICE = 'food_service',
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
}
