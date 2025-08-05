import axiosIns from './index'

// 상담자 등록(회원가입)
export const register = async (userData) => {
    return await axiosIns.post('/api/auth/regist', userData)
}

// 로그인
export const login = async (credentials) => {
    return await axiosIns.post('/api/auth/login', credentials)
}

// 로그아웃
// export const logout = async () => {
//     try {
//         const response = await axiosIns.post('/auth/logout')
//         // 로컬 스토리지 토큰 제거
//         localStorage.removeItem('accessToken')
//         localStorage.removeItem('refreshToken')
//         return response
//     } catch (error) {
//         throw error
//     }
// }
