import axios from 'axios'
import { Functions } from '../util/Functions';

export class ArticleService {
    
    paginate(lazyParams, token) {
        return axios.get(`${process.env.REACT_APP_API}post/paginate`, {
                headers: Functions.axiosJsonTokenHeader(token).headers,
                params: lazyParams,}).then((res) => res.data);
    }

    store(requestBody, langId, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}post/${langId}/store`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    edit(id, langId, token) {
        return axios.get(`${process.env.REACT_APP_SECURE_API}post/${langId}/edit/${id}`, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    update(id, requestBody, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}post/update/${id}`, requestBody, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    remove(id, token) {
        return axios.get(`${process.env.REACT_APP_SECURE_API}post/remove/${id}`,Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }

    upload(requestBody, token) {
        return axios.post(`${process.env.REACT_APP_SECURE_API}post/upload`, requestBody, Functions.axiosMultipartHeaderBoundary(token)).then((res) => res.data);
    }

    publish(id, token) {
        return axios.get(`${process.env.REACT_APP_SECURE_API}post/publish/${id}`, Functions.axiosJsonTokenHeader(token)).then((res) => res.data);
    }
}
