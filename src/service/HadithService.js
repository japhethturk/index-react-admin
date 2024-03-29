import axios from 'axios'
import {Functions} from '../util/Functions';

export class HadithService {

    allIndex(langId) {
        return axios.get(`${process.env.REACT_APP_API}index/all/table/${langId}`).then((res) => res.data);
    }

    storeIndex(requestBody, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}index/store`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    updateIndex(id, requestBody, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}index/update/${id}`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    removeIndex(id, langId, token) {
        return axios.get(`${process.env.REACT_APP_SECURE_API}index/${langId}/remove/${id}`, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    store(requestBody, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}hadith/store`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    paginate(lazyParams, token) {
        return axios.get(`${process.env.REACT_APP_API}hadith/paginate`, {
            headers: Functions.axiosJsonTokenHeader(token).headers,
            params: lazyParams,
        }).then((res) => res.data);
    }
}
