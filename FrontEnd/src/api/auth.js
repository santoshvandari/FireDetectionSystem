// Authentication method
import Base from './base';

const AuthAPI = {
    login: (username,password) =>{
        const endpoint = '/auth/token/';
        const payload = {
            username,
            password
        };

        console.log("API login payload", payload);
        return Base.post(endpoint, payload, false);
    }
}

export default AuthAPI;