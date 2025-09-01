import axios from 'axios'

const axiosIns = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: false,
  responseType: 'json',
})

// 토큰 제거 후 로그인 화면으로 이동
let _redirectingToLogin = false
const clearAuthAndRedirect = () => {
  try {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('isLoggedIn')
    // localStorage.removeItem('refreshToken')
  } catch (e) {
    // noop
  }
  if (_redirectingToLogin) return
  if (window.location.pathname !== '/login') {
    _redirectingToLogin = true
    window.location.replace('/login')
  }
}

axiosIns.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('accessToken')
    // const refreshToken = localStorage.getItem('refreshToken')
    
    // 호출 측에서 Authorization을 명시했다면 그대로 사용하고,
    // 없는 경우에만 공통 토큰을 주입합니다.
    const existingAuth = config.headers?.Authorization || config.headers?.authorization
    if (!existingAuth && accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
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
    const code = error?.response?.data?.code
    if (status === 401 || code === 401 || code === '401') {
      console.warn('HTTP/Body 401 감지 - 토큰 만료 또는 유효하지 않음, 로그인으로 이동합니다.')
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
