import axios from 'axios';

const axiosServer = axios.create({
    headers: {
        'content-type': 'application/json',
    },
});

axiosServer.interceptors.request.use(async config => config);

axiosServer.interceptors.response.use(
    response => {
        if (response && response.data) {
            return response.data;
        }

        return response;
    },
    error => {
        throw error;
    }
);

export default axiosServer;
