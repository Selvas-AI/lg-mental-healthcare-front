import axiosIns from './index'

//! ===== 인증 관련 API =====
// 상담자 등록(회원가입)
export const authRegister = async (userData) => {
    return await axiosIns.post('/api/auth/regist', userData)
}

// 로그인
export const authLogin = async (credentials) => {
    return await axiosIns.post('/api/auth/login', credentials)
}

// 로그아웃
// export const authLogout = async () => {
//     const response = await axiosIns.post('/api/auth/logout')
//     // 로컬 스토리지 토큰 제거
//     localStorage.removeItem('accessToken')
//     localStorage.removeItem('refreshToken')
//     return response
// }

//! ===== 내담자 관리 API =====
// 내담자 검색
export const clientSearch = async (searchParams) => {
    return await axiosIns.get('/api/client/search', { params: searchParams })
}

// 내담자 정보 등록
export const clientCreate = async (clientData) => {
    return await axiosIns.post('/api/client/create', clientData)
}

// 내담자 정보 수정
export const clientUpdate = async (clientData) => {
    return await axiosIns.post('/api/client/update', clientData)
}

// 특정 내담자 정보 조회
export const clientFind = async (params) => {
    return await axiosIns.get('/api/client/find', { params })
}


//! ===== 상담 세션 관리 =====
