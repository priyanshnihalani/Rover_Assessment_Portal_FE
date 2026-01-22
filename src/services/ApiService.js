import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
});

export const ApiService = {
    async get(path, config = {}) {
        const res = await api.get(path, config);
        return res.data;
    },

    async post(path, data = {}, config = {}) {
        return api.post(path, data, config).then((res) => res.data);
    },

    async put(path, data = {}, config = {}) {
        return api.put(path, data, config).then((res) => res.data);
    },

    async delete(path, config = {}) {
        return api.delete(path, config).then((res) => res.data);
    },

    async postBlob(path, data = {}) {
        return api.post(path, data, {
            responseType: "blob",
        });
    },
};
