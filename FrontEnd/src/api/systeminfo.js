import Base from "./base";

const SystemInfoAPI = {
    getSystemInfo: () => {
        const endpoint = '/systeminfo/';
        return Base.get(endpoint);
    }
};
export default SystemInfoAPI; 