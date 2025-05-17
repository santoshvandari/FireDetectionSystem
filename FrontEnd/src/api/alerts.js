// Authentication method
import Base from './base';

const AlertAPI = {
    getAlerts: () =>{
        const endpoint = '/alerts/';
        console.log("API login payload", payload);
        return Base.get(endpoint);
    },
    postAlert:(alertData)=>{
        const endpoint = '/alert/';
        return Base.post(endpoint, alertData);
    },
    deleteAlert:(alertId)=>{
        const endpoint = `/alert/${alertId}/`;
        return Base.delete(endpoint);
    },
    updateAlert:(alertId, alertData)=>{
        const endpoint = `/alert/${alertId}/`;
        return Base.put(endpoint, alertData);
    }
}

export default AlertAPI;