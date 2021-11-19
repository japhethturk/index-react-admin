import axios from 'axios'
import { Functions } from '../util/Functions';

export class HadithService {

    allIndex(langId) {
        return axios.get(`${process.env.REACT_APP_API}index/all/table/${langId}`).then((res) => res.data);
    }

    storeIndex(requestBody, langId, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}index/${langId}/store`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    updateIndex(id, requestBody, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}index/update/${id}`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    removeIndex(id, token) {
        return axios.get(`${process.env.REACT_APP_SECURE_API}index/remove/${id}`, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

}
