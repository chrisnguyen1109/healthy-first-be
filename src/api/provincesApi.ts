import axiosServer from './axiosServer';

interface ProvinceResponse {
    name: string;
    code: number;
}

interface DistrictResponse {
    name: string;
    code: number;
    province_code: number;
}

const baseUrl = 'https://provinces.open-api.vn/api';

export const getProvince = async (code: number): Promise<ProvinceResponse> => {
    const url = `${baseUrl}/p/${code}`;

    return axiosServer.get(url);
};

export const getDistrict = async (code: number): Promise<DistrictResponse> => {
    const url = `${baseUrl}/d/${code}`;

    return axiosServer.get(url);
};
