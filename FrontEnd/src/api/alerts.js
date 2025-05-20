// Authentication method
import Base from './base';

const AlertAPI = {
    getAlerts: () =>{
        const endpoint = '/alerts/';
        return Base.get(endpoint);
    },
    postAlert:(alertData)=>{
        const endpoint = '/alerts/';
        return Base.post(endpoint, alertData);
    },
    getActiveAlerts:()=>{
        const endpoint = `/alerts/active/`;
        return Base.get(endpoint);
    },
    updateAlert:(alertId, status)=>{
        const endpoint = `/alerts/`;
        const payload={
            id: alertId,
            status: status
        }
        console.log("Payload", payload);
        return Base.put(endpoint, payload);
    }
}

export default AlertAPI;