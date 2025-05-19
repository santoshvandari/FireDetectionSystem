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
    // deleteAlert:(alertId)=>{
    //     const endpoint = `/alerts/${alertId}/`;
    //     return Base.delete(endpoint);
    // },
    // updateAlert:(alertId, alertData)=>{
    //     const endpoint = `/alerts/${alertId}/`;
    //     return Base.put(endpoint, alertData);
    // }
}

export default AlertAPI;