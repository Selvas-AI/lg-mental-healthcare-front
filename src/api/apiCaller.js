import axiosIns from './index'

//? ===== 회기 관리 API =====
// 전체 회기 목록 조회
export const sessionList = async (clientSeq) => {
    return await axiosIns.get('/api/session/list', { 
        params: { clientSeq } 
    })
}

// 특정 회기 상세 조회
export const sessionFind = async (clientSeq, sessionSeq) => {
    return await axiosIns.get('/api/session/find', { 
        params: { 
            clientSeq,
            sessionSeq 
        } 
    })
}

//! 현재 진행중인 회기 목록 조회 ?????
export const sessionCurrentList = async (clientSeq) => {
    return await axiosIns.get('/api/session/currentList', { clientSeq })
}

// 현재 회기 정보 수정
export const sessionCurrentUpdate = async (params) => {
    return await axiosIns.post('/api/session/update', params)
}

// 현재 진행중인 회기그룹 종결 처리
export const sessionGroupComplete = async (clientSeq) => {
    return await axiosIns.post('/api/session/groupComplete', { clientSeq })
}

// 신규 회기 등록
export const sessionCreate = async (sessionData) => {
    return await axiosIns.post('/api/session/create', sessionData)
}

//? ===== 상담사(내정보) 관리 API =====
// 상담사(내정보) 정보 조회
export const counselorFind = async () => {
    return await axiosIns.get('/api/counselor/find')
}

// 상담사(내정보) 정보 수정
export const counselorUpdate = async (params) => {
    return await axiosIns.post('/api/counselor/update', { params })
}

//? ===== 내담자 검사 (내담자용) 관리 API =====
//! 내담자검사 세트 조회
export const clientExamSet = async (params) => {
    return await axiosIns.get('/api/examination/assessmentSet', { params })
}

//! 내담자검사 세트 결과 임시등록
export const clientExamTempSave = async (params) => {
    return await axiosIns.post('/api/examination/tempSave', { params })
}

//! 내담자검사 세트 결과 등록
export const clientExamSave = async (params) => {
    return await axiosIns.post('/api/examination/save', { params })
}

//? ===== Dislike 관리 API =====
// Dislike 정보 조회
export const dislikeFind = async (sessionSeq) => {
    return await axiosIns.get('/api/dislike/find', { params: { sessionSeq } })
}

// Dislike 선택항목 조회
export const dislikeCodeList = async () => {
    return await axiosIns.get('/api/dislike/codeList')
}

// Dislike 정보 수정
export const dislikeUpdate = async (params) => {
    return await axiosIns.post('/api/dislike/update', params)
}

//! Dislike 정보 삭제 xx
export const dislikeDelete = async (sessionSeq) => {
    return await axiosIns.post('/api/dislike/delete', { params: { sessionSeq } })
}

//? ===== 내담자 관리 API =====
// 내담자 검색
export const clientSearch = async (searchParams) => {
    return await axiosIns.get('/api/client/search', { params: searchParams })
}

// 특정 내담자 정보 조회
export const clientFind = async (params) => {
    return await axiosIns.get('/api/client/find', { params })
}

// 내담자 정보 수정
export const clientUpdate = async (clientData) => {
    return await axiosIns.post('/api/client/update', clientData)
}

// 내담자 메모 수정
export const clientUpdateMemo = async (memoData) => {
    return await axiosIns.post('/api/client/updateMemo', memoData)
}

// 내담자 정보 등록
export const clientCreate = async (clientData) => {
    return await axiosIns.post('/api/client/create', clientData)
}

//? ===== 상담일지 API =====
// 상담일지 관련 조회
export const sessionNoteFind = async (sessionSeq) => {
    return await axiosIns.get('/api/sessionNote/find', {
        params: { sessionSeq }
    })
}

// 상담일지 관련 정보 수정
export const sessionNoteUpdate = async (sessionNoteData) => {
    return await axiosIns.post('/api/sessionNote/update', sessionNoteData)
}

//? ===== 녹취록 관리 API =====
// 녹취록 내용 조회
export const transcriptFind = async (sessionSeq) => {
    return await axiosIns.get('/api/transcript/find', { params: { sessionSeq } })
}

// 녹취록 내용 수정
export const transcriptUpdate = async (transcriptData) => {
    return await axiosIns.post('/api/transcript/update', transcriptData)
}

//? ===== 타임라인 정보 조회 API =====
// 타임라인 정보 목록 조회
export const timelineList = async (clientSeq) => {
    return await axiosIns.get('/api/timeline/list', { params: { clientSeq } })
}

//? ===== 사용자 인증 API =====
// 상담자 등록(회원가입)
export const authRegister = async (userData) => {
    return await axiosIns.post('/api/auth/regist', userData)
}

// 로그인
export const authLogin = async (credentials) => {
    return await axiosIns.post('/api/auth/login', credentials)
}

//? ===== 녹음파일 관리 API =====
//! 녹음파일 목록 조회 ?????
export const audioListAll = async () => {
    return await axiosIns.get('/api/audio/listAll')
}

// 녹음파일 메타정보 조회
export const audioFind = async (sessionSeq) => {
    return await axiosIns.get('/api/audio/find', { params: { sessionSeq } })
}

// 녹음파일 다운로드
export const audioDownload = async (sessionSeq) => {
    return await axiosIns.get('/api/audio/download', { 
        params: { sessionSeq },
        responseType: 'blob'
    })
}

// 녹음파일 등록
export const audioUpload = async (audioData) => {
    return await axiosIns.post('/api/audio/upload', audioData)
}

// 녹음파일 삭제
export const audioDelete = async (sessionSeq) => {
    return await axiosIns.post('/api/audio/delete', { sessionSeq })
}

//? ===== 상담관리 API =====
// 상담관리 조회
export const sessionMngFind = async (sessionSeq) => {
    return await axiosIns.get('/api/sessionMng/find', {
        params: { sessionSeq }
    })
}
// 상담관리 수정
export const sessionMngUpdate = async (sessionMngData) => {
    return await axiosIns.post('/api/sessionMng/update', sessionMngData)
}

//? ===== 내담자 검사 관리 API =====
//! 내담자 검사세트 결과 조회
export const assessmentSetResult = async (setSeq) => {
    return await axiosIns.get('/api/assessmentSet/result', { params: { setSeq } })
}

// 특정 내담자 검사세트 전체 조회
export const assessmentSetList = async (clientSeq) => {
    return await axiosIns.get('/api/assessmentSet/list', { params: { clientSeq } })
}

//! 내담자 검사세트 리스트 조회(목록정보 포함)
export const assessmentSetListWithItem = async (setSeqList) => {
    return await axiosIns.get('/api/assessmentSet/listWithItem', { params: { setSeqList } })
}

//! 내담자 검사세트 조회(목록정보 포함)
export const assessmentSetFind = async (setSeq) => {
    return await axiosIns.get('/api/assessmentSet/find', { params: { setSeq } })
}

//! 현재 진행중인 회기 그룹의 내담 검사세트 조회
export const assessmentSetCurrentList = async (clientSeq) => {
    return await axiosIns.get('/api/assessmentSet/currentList', { params: { clientSeq } })
}

//! 내담자검사 세트 링크 주소 수정
export const assessmentSetUpdateUrl = async (params) => {
    return await axiosIns.post('/api/assessmentSet/updateUrl', params)
}

//! 내담자검사 세트 종합의견 수정
export const assessmentSetUpdateOverallInsight = async (params) => {
    return await axiosIns.post('/api/assessmentSet/updateOverallInsight', params)
}

//! AI 종합의견 dislike 의견 수정
export const assessmentSetUpdateOverallInsightDislike = async (params) => {
    return await axiosIns.post('/api/assessmentSet/updateOverallInsightDislike', params)
}

// 내담자검사 세트 삭제
export const assessmentSetDelete = async (setSeq) => {
    return await axiosIns.post('/api/assessmentSet/delete', { setSeq })
}

// 내담자 검사 세트 등록
export const assessmentSetCreate = async (params) => {
    return await axiosIns.post('/api/assessmentSet/create', params)
}

//? ===== 문진표 관리 API =====
// 문진표 목록 조회
export const assessmentList = async () => {
    return await axiosIns.get('/api/assessment/list')
}