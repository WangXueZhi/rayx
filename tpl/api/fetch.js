import axios from 'axios';
import config from 'commons/config';
import qs from "qs";

// 请求超时
const TIMEOUT = 10000;
// 请求队列
let fetchQueue = {};
// 是否开启请求锁。
let fetchLock = false;

// 创建axios实例
const _fetch = axios.create({
    baseURL: config.public.rpcPath.h5,

    // 超时
    timeout: TIMEOUT,

    // 是否跨域携带cookie
    withCredentials: true,

    headers: {}
})

// 请求拦截器
_fetch.interceptors.request.use(function (config) {
    // REST风格接口
    for (let key in config.data) {
        if (key.indexOf("{") == 0) {
            config.url = config.url.replace(key, config.data[key]);
            delete config.data[key];
        }
    }

    config.data = qs.stringify(Object.assign({_stamp: (new Date()).getTime()},config.data));

    // get传参
    if (config.method == "get" && config.data && typeof config.data == "string") {
        config.url += `?${config.data}`
    }

    // 请求锁, 
    let lock = config.fetchLock != undefined && config.fetchLock != null ? config.fetchLock : fetchLock;

    if (lock) {
        // 如果有同个请求在队列中，则取消即将发送的请求
        if (fetchQueue[config.url]) {
            let cancel;
            config.cancelToken = new axios.CancelToken(c => {
                cancel = c;
            })
            cancel("cancel");
        } else {
            // 添加入请求队列
            fetchQueue[config.url] = 1
        }
    }

    // 在发送请求之前做些什么
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加请求返回拦截器
_fetch.interceptors.response.use(function (res) {
    // 是否有请求锁
    let lock = res.config.fetchLock != undefined && res.config.fetchLock != null ? res.config.fetchLock : fetchLock;
    if (lock) {
        // 移除出请求队列
        delete fetchQueue[res.config.url];
    }
    // 处理异常
    const data = res.data
    const code = +data.code
    // 约定code=0即为成功
    if (code === 0) {
        return data;
    } else {
        // 打印错误信息
        console.log(data.message);
        return Promise.reject(data);
    }
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
})


export default _fetch;