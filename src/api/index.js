import axios from 'axios'

const axiosIns = axios.create({
  baseURL: '',
  withCredentials: false,
  responseType: 'json',
})

// 토큰 제거 후 로그인 화면으로 이동
const clearAuthAndRedirect = () => {
  try {
    localStorage.removeItem('accessToken')
    // localStorage.removeItem('refreshToken')
  } catch (e) {
    // noop
  }
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

axiosIns.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('accessToken')
    // const refreshToken = localStorage.getItem('refreshToken')
    
    if (accessToken) {
      // 표준 Authorization Bearer
      config.headers['Authorization'] = `Bearer ${accessToken}`
      
      // 기존 Sh-Auth-Token 방식
      // config.headers['Sh-Auth-Token'] = `${accessToken}`
      // config.headers['Sh-Refresh-Token'] = `${refreshToken}`
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
          // RefreshToken 로직 주석처리
          console.warn('401 Unauthorized - 토큰 만료 또는 유효하지 않음')
          clearAuthAndRedirect()
          return Promise.reject(new Error('Unauthorized'))
          
          // try {
          //   const originalRequest = config
          //   const refreshToken = localStorage.getItem('refreshToken')
          //   
          //   // 무한 루프 방지
          //   if (originalRequest._retry) {
          //     throw new Error('Token refresh failed')
          //   }
          //   originalRequest._retry = true
          //   
          //   const res = await axios.get(`${axiosIns.defaults.baseURL}/tokenRefresh`, {
          //     headers: {
          //       'Sh-Refresh-Token': refreshToken
          //     }
          //   })
          //   
          //   if (res.data.code !== 200) throw new Error(res.data.code)
          //   
          //   localStorage.setItem('accessToken', res.data.result.accessToken)
          //   localStorage.setItem('refreshToken', res.data.result.refreshToken)
          //   
          //   return axiosIns(originalRequest)
          // } catch (err) {
          //   console.warn('Token refresh error:', err)
          //   localStorage.removeItem('accessToken')
          //   localStorage.removeItem('refreshToken')
          //   
          //   // 로그인 페이지로 리다이렉트 (필요시 구현)
          //   // window.location.href = '/login'
          //   
          //   return Promise.reject(err)
          // }
          default:
            return response.data
        }
    }
    return response.data
  },
  error => {
    // 서버에서 HTTP 401을 직접 반환한 경우 처리
    const status = error?.response?.status
    if (status === 401) {
      console.warn('HTTP 401 - 토큰 만료 또는 유효하지 않음')
      clearAuthAndRedirect()
      return Promise.reject(error)
    }
    if (error.message === 'Network Error') {
      console.error('네트워크 연결을 확인해주세요.')
      // 토스트 메시지 표시 (필요시 구현)
    }
    return Promise.reject(error)
  },
)

export default axiosIns
