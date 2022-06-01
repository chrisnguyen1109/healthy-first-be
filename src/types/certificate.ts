import { IFacility } from './facility';

export enum CertificateStatus {
    INITIAL = 0,
    TESTING = 1,
    SAMPLE = 2,
    ASSESSING = 3,
    COMPLETED = 4,
    FAILURE = 5,
}

export enum InspectStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILURE = 'failure',
}

export interface InspectedFoods {
    name: string;
    organization: string;
    status: InspectStatus;
    notes?: string;
    resultDate?: Date;
}

export interface ICertificate {
    facility: string | IFacility;
    facilityName: string;
    provinceCode: number;
    districtCode: number;
    startDate?: Date;
    endDate?: Date;
    isRevoked: boolean;
    status: CertificateStatus;
    inspectedFoods?: InspectedFoods[];
}
