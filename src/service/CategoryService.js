import axios from 'axios'
import { Functions } from '../util/Functions';

export class CategoryService {
    allTable() {
        return axios.get(`${process.env.REACT_APP_API}category/all/table`).then((res) => res.data);
    }

    allTree() {
        return axios.get(`${process.env.REACT_APP_API}category/all/tree`).then((res) => res.data);
    }

    store(requestBody, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}category/store`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    edit(id, token) {
        return axios.get(`${process.env.REACT_APP_SECURE_API}category/edit/${id}`, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    update(id, requestBody, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}category/update/${id}`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    remove(id, token) {
        return axios.get(`${process.env.REACT_APP_SECURE_API}category/remove/${id}`, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }
}
