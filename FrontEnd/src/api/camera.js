import Base from "./base";

const CameraAPI = {
    getCameras: () => {
        const endpoint = '/cameras/';
        return Base.get(endpoint);
    },

    createCamera: (cameraData) => {
        const endpoint = '/cameras/';
        return Base.post(endpoint, cameraData);
    },

    updateCamera: (cameraId, cameraData) => {
        const endpoint = `/cameras/${cameraId}/`;
        return Base.put(endpoint, cameraData);
    },

    deleteCamera: (cameraId) => {
        const endpoint = `/cameras/${cameraId}/`;
        return Base.delete(endpoint);
    }
};
export default CameraAPI;


