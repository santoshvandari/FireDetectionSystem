import Base from "./base";

const CameraAPI = {
    getCameras: () => {
        const endpoint = '/cameras/';
        return Base.get(endpoint);
    },

    addCamera: (cameraData) => {
        /* Data Example
            name: "Camera 1",
            camera_ip:"1a2d1f2a",
            location: "Location 1",
        */
        const endpoint = '/cameras/';
        return Base.post(endpoint, cameraData);
    },

    updateCamera: (cameraId, cameraData) => {
        const endpoint = `/camera/${cameraId}/`;
        /* Data Example
            name: "Camera 1",
            camera_ip:"1a2d1f2a",
            location: "Location 1",
       */
        return Base.put(endpoint, cameraData);
    },

    deleteCamera: (cameraId) => {
        const endpoint = `/camera/${cameraId}/`;
        return Base.delete(endpoint);
    }
};
export default CameraAPI;


