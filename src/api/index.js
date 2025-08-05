import axios from 'axios'

const axiosIns = axios.create({
  baseURL: '',
  withCredentials: false,
  responseType: 'json',
})

axiosIns.interceptors.request.use(
  async config => {
    const accessToken = localStorage.getItem('accessToken')
    const refreshToken = localStorage.getItem('refreshToken')
    if (accessToken && refreshToken) {
      config.headers['Sh-Auth-Token'] = `${accessToken}`
      config.headers['Sh-Refresh-Token'] = `${refreshToken}`
    }
    return config
  },
  error => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  },
)

axiosIns.interceptors.response.use(
  async (response) => {
    const { config } = response
    if (response.data) {
      switch (response.data.code) {
        case 401:
          try {
            const originalRequest = config
            const refreshToken = localStorage.getItem('refreshToken')
            
            // 무한 루프 방지
            if (originalRequest._retry) {
              throw new Error('Token refresh failed')
            }
            originalRequest._retry = true
            
            const res = await axios.get(`${axiosIns.defaults.baseURL}/tokenRefresh`, {
              headers: {
                'Sh-Refresh-Token': refreshToken
              }
            })
            
            if (res.data.code !== 200) throw new Error(res.data.code)
            
            localStorage.setItem('accessToken', res.data.result.accessToken)
            localStorage.setItem('refreshToken', res.data.result.refreshToken)
            
            return axiosIns(originalRequest)
          } catch (err) {
            console.warn('Token refresh error:', err)
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            
            // 로그인 페이지로 리다이렉트 (필요시 구현)
            // window.location.href = '/login'
            
            return Promise.reject(err)
          }
          default:
            return response.data
        }
    }
    return response.data
  },
  error => {
    if (error.message === 'Network Error') {
      console.error('네트워크 연결을 확인해주세요.')
      // 토스트 메시지 표시 (필요시 구현)
    }
    return Promise.reject(error)
  },
)

export default axiosIns
