// src/api/useHttp.js
import axios from "axios";
import { useLoader } from "../context/LoaderContext.js";
import { useToast } from "../context/ToastContext.js";

const BASEPATH = "https://rfq-api.onrender.com/app";

const buildURL = (path) => `${BASEPATH}${path.startsWith("/") ? "" : "/"}${path}`;

export const useHttp = () => {
    const { showLoader, hideLoader } = useLoader();
    const { showToast } = useToast();

    const handleResponse = (response ,method) => {
        const { status, message } = response?.data || {};

        if(method === "get" && status == "success") return response.data;
        
        showToast(message || "Something went wrong", status == "success" ? "success" : "danger");
        return response.data;
    };

    const callAPI = async (method, path, data = {}, config = {}, isLoader = true) => {
        try {
            if (isLoader) showLoader();

            // Get token from localStorage
            const token = localStorage.getItem("authToken");
            const headers = {
                Authorization: token ? `Bearer ${token}` : "",
                ...(config.headers || {}),
            };

            const response = await axios({
                method,
                url: buildURL(path),
                data,
                ...config,
                headers,
            });

            return handleResponse(response , method);

        } catch (err) {
            if (err.response && err.response.data) {
                const message = err.response.data.message || "Something went wrong";
                const status = err.response.data.status || "error";
                showToast(message, status === "success" ? "success" : "danger");
                return err.response.data;
            } else {
                showToast(err.message || "Network error", "danger");
                throw err;
            }
        } finally {
            if (isLoader) hideLoader();
        }
    };

    return {
        getCall: (path, config = {}, isLoader = true) => callAPI("get", path, {}, config, isLoader),
        postCall: (path, data = {}, config = {}, isLoader = true) => callAPI("post", path, data, config, isLoader),
        putCall: (path, data = {}, config = {}, isLoader = true) => callAPI("put", path, data, config, isLoader),
        deleteCall: (path, data = {}, config = {}, isLoader = true) => callAPI("delete", path, data, config, isLoader),
    };
};
