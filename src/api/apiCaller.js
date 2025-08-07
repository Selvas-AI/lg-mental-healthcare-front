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

// 내담자 메모 수정
export const clientUpdateMemo = async (memoData) => {
    return await axiosIns.post('/api/client/updateMemo', memoData)
}


//! ===== 상담 세션 관리 =====
// 전체 회기 목록 조회
export const sessionList = async (clientSeq) => {
    return await axiosIns.get('/api/session/list', { 
        params: { clientSeq: clientSeq } 
    })
}

// 현재 진행중인 회기 목록 조회
export const sessionCurrentList = async (clientSeq) => {
    return await axiosIns.get('/api/session/current_list', { 
        params: { clientSeq: clientSeq } 
    })
}

// 특정 회기 상세 조회
export const sessionFind = async (clientSeq, sessionSeq) => {
    return await axiosIns.get('/api/session/find', { 
        params: { 
            clientSeq: clientSeq,
            sessionSeq: sessionSeq 
        } 
    })
}

// 신규 회기 등록
export const sessionCreate = async (sessionData) => {
    return await axiosIns.post('/api/session/create', sessionData)
}
