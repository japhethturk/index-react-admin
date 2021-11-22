import axios from 'axios'
import {Functions} from '../util/Functions';

export class CategoryService {
    allTable(langId) {
        return axios.get(`${process.env.REACT_APP_API}category/all/table/${langId}`).then((res) => res.data);
    }

    allTree(langId) {
        return axios.get(`${process.env.REACT_APP_API}category/all/tree/${langId}`).then((res) => res.data);
    }

    store(requestBody, langId, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}category/${langId}/store`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    edit(id, langId, token) {
        return axios.get(`${process.env.REACT_APP_SECURE_API}category/${langId}/edit/${id}`, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    update(id, requestBody, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}category/update/${id}`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    remove(id, langId, token) {
        return axios.get(`${process.env.REACT_APP_SECURE_API}category/${langId}/remove/${id}`, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }
}
