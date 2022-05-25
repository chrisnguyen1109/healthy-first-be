import { IFacility } from './facility';
import { IUser } from './user';

export enum CertificateStatus {
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
    user: string | IUser;
    startDate?: Date;
    endDate?: Date;
    isTakeBack: boolean;
    status: CertificateStatus;
    inspectedFoods?: InspectedFoods[];
}
