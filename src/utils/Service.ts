import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import store from '@/store'

const service = axios.create({
    // 配置
    baseURL: import.meta.env.VITE_APP_API_BASE,
    withCredentials: true
})

service.interceptors.request.use((config: AxiosRequestConfig) => {
    let token = store.state.token
    let headers = config.headers
    if (!headers) {
        config.headers = {}
        headers = config.headers
    }
    if (token) {
        headers.Authorization = 'Bearer ' + token
    }

    return config
}, (error) => {
    Promise.reject(error)
})

let exclude_urls=['/ocr-tasks/auto-pdf-ocr']
service.interceptors.response.use((response: AxiosResponse) => {
    let data = response?.data
    if(!data) window.$message.error('请求错误，无响应')
    if(data instanceof Blob) return response
    let resp_headers = response.headers
    let index = resp_headers['content-type']?.indexOf('stream') || -1

    if(index >= 0) {
        return response
    }
    let code = data['return_code']
    if(code === 'invalid_token' || code === 'token_expire') {
        //跳转登录
        store.dispatch('logout', false)
        return false
    }

    if(code !== 'success' ) {
        let {config: {headers}} = response

        let skip_resp = headers && headers['__skip_resp']

        if(!skip_resp) {
            if(window.$message) {
                window.$message.error(data['return_msg'] || "请求失败")
            }
        }

        return data
    }
    return data?.data || true;
}, error => {
    window.$message.error(error['message'])
})

export default service