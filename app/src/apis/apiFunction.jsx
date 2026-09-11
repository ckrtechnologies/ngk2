import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { navigateTo } from "../functions/navigationRefFunc"

export const apiFunction = async (api, params = [], data = {}, method = "GET", withAuth = false) => {
    let headers = {
        'Content-Type': 'application/json',
    }
    let response

    // Gracefully handle flexible caller signatures (e.g. apiFunction(url, "GET"))
    if (typeof params === 'string') {
        method = params;
        params = [];
    } else if (!Array.isArray(params)) {
        if (typeof params === 'object') {
            data = params;
        }
        params = [];
    }
    if (typeof method !== 'string') {
        method = 'GET';
    }

    // Generic vehicle catalog queries (Make, Model Series, Engine Trims) must NOT send brand headers
    // because TecDoc vehicle catalog is universal and brand filtering headers strip out makes/series
    const isVehicleCatalogCall =
        Boolean(data?.getManufacturers2) ||
        Boolean(data?.getModelSeries2) ||
        Boolean(data?.getLinkageTargets) ||
        (typeof api === 'string' && (
            api.includes('/tecdoc/manufacturers') ||
            api.includes('/tecdoc/series') ||
            api.includes('/tecdoc/vehicles')
        ));

    if (!isVehicleCatalogCall) {
        headers['x-catalog-brand'] = 'ngk';
        headers['x-brand'] = 'ngk';
    }

    try {
        const token = await AsyncStorage.getItem("token")
        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const url = params.length > 0 ? `${api}/${params.join('/')}` : api

        switch (method.toUpperCase()) {
            case "GET":
                response = await axios.get(url, { headers, params: data, timeout: 20000 });
                break
            case "POST":
                response = await axios.post(url, data, { headers, timeout: 25000 });
                break
            case "PUT":
                response = await axios.put(url, data, { headers, timeout: 25000 });
                break
            case "DELETE":
                response = await axios.delete(url, { headers, timeout: 20000 });
                break
            default:
                return null
        }
    } catch (error) {
        const status = error?.response?.status;
        const rawData = error?.response?.data;
        const isHtml = typeof rawData === 'string' && (rawData.trim().startsWith('<') || rawData.includes('<html') || rawData.includes('<!DOCTYPE'));

        let readableMessage = error?.message || "Network Error";
        if (status === 502) {
            readableMessage = "Backend server is unreachable (502 Bad Gateway). Please verify that the backend is running.";
        } else if (status === 503) {
            readableMessage = "Backend service is temporarily unavailable (503).";
        } else if (status === 504) {
            readableMessage = "Gateway Timeout (504). Server took too long to respond.";
        } else if (status >= 500) {
            readableMessage = `Server error (${status}). Please try again later.`;
        } else if (!error.response) {
            readableMessage = "Unable to connect to server. Please check your internet connection or server availability.";
        } else if (!isHtml && typeof rawData === 'object' && rawData?.message) {
            readableMessage = rawData.message;
        } else if (!isHtml && typeof rawData === 'string' && rawData.length < 200) {
            readableMessage = rawData;
        }

        console.warn(`[API Error] [${status || 'NETWORK'}] ${readableMessage}`);

        if (status === 401) {
            await AsyncStorage.multiRemove(["token", "userId", "user"]);
            let role = await AsyncStorage.getItem("role");
            navigateTo('Login', { role });
        }

        return {
            success: false,
            status: status || 0,
            isServerError: Boolean(status && status >= 500),
            isNetworkError: !error.response,
            isUnreachable: status === 502 || status === 503 || !error.response,
            message: readableMessage,
            error: readableMessage,
            data: (!isHtml && typeof rawData === 'object') ? rawData : null
        };
    }

    if (response) {
        if (response.data?.status === 401) {
            await AsyncStorage.multiRemove(["token", "userId", "user"]);
            let role = await AsyncStorage.getItem("role");
            navigateTo('Login', { role });
            return response.data;
        }
        return response.data
    } else {
        return null
    }
}