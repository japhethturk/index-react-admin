import axios from 'axios'
import {Functions} from '../util/Functions';

export class AuthService {

    login(requestBody) {
        return axios.post(`${process.env.REACT_APP_API}authorize/admin`, requestBody, Functions.axiosJsonHeader()).then(res => res.data);
    }

    logOut(token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}authorize/logout`, {}, Functions.axiosJsonTokenHeader(token)).then(res => res.data);
    }

    checkToken(token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}authorize/checkToken`, {}, Functions.axiosJsonTokenHeader(token)).then(res => res.data);
    }

}
