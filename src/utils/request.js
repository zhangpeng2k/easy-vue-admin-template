import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests （跨域请求时发送cookies）
  timeout: 5000 // request timeout （默认响应超时时间）
})

// request interceptor （请求拦截器）
service.interceptors.request.use(
  config => {
    // do something before request is sent （在请求发送前做些什么）

    if (store.getters.token) {
      // let each request carry token （让每个请求携带令牌）
      // ['X-Token'] is a custom headers key （ ['X-Token'] 是自定义的header key ，请根据实际情况修改）
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error （在响应出现error时做些什么）
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor （响应拦截器）
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   * 如果你需要在返回的data中得到接口的headers，status等信息，请原封不动将response返回 return response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   * 通过自定义的的 response HTTP Status Code 来确定请求状态
   * tip: 在这个模板中默认的mock接口返回的数据中，code:20000 表示接口状态正确正常
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error. (如果代码不是20000 则判断为错误)
    if (res.code !== 20000) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      // 翻译： 50008:非法令牌；50012:其他客户端登录；50014:令牌过期；
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login （让用户重新登录）
        // 推荐在这里清除登录状态，给用户对应的提示并跳转至登录页
        MessageBox.confirm('您已注销，您可以取消以停留在此页，或重新登录', '提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
