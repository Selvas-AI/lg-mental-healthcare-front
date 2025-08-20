import React, { useState, useMemo, useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { sessionDataState, currentSessionState } from "@/recoil";
import { useLocation, useNavigate } from "react-router-dom";
import { sessionList } from "@/api/apiCaller";
import Transcript from "../transcript/Transcript";
import CounselLog from "../counselLog/CounselLog";
import SessionSelect from "./SessionSelect";
import warningFace from "@/assets/images/common/warning_face.svg";
//상담관리
function CounselManagement({ setShowUploadModal, sessionMngData, sessionData: propSessionData, audioData, onOpenEdit, setShowAiSummary, setSupportPanel }) {
  const [isNoshow, setIsNoshow] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const clientId = query.get('clientId');
  
  const sessionData = useRecoilValue(sessionDataState); // 실제 회기 데이터
  const setSessionData = useSetRecoilState(sessionDataState); // 회기 데이터 설정
  const currentSession = useRecoilValue(currentSessionState); // 현재 선택된 세션
  
  // 새로고침 시 sessionData가 비어있으면 다시 불러오기
  useEffect(() => {
    const fetchSessionData = async () => {
      if (clientId && (!sessionData || sessionData.length === 0)) {
        try {
          const response = await sessionList(parseInt(clientId));
          if (response.code === 200 && Array.isArray(response.data)) {
            setSessionData(response.data);
          }
        } catch (error) {
          console.error('회기 목록 조회 실패:', error);
        }
      }
    };

    fetchSessionData();
  }, [clientId, sessionData, setSessionData]);
  // 현재 선택된 회기의 sessiongroupSeq와 동일한 그룹의 회기들만 필터링하여 sessionOptions 생성
  const sessionOptions = useMemo(() => {
    if (!sessionData || sessionData.length === 0) return [];
    
    // 현재 선택된 회기의 sessiongroupSeq 찾기
    const currentSessionGroupSeq = currentSession?.sessiongroupSeq;
    
    // sessiongroupSeq가 없으면 모든 회기 표시 (기본 동작)
    const filteredSessions = currentSessionGroupSeq 
      ? sessionData.filter(session => session.sessiongroupSeq === currentSessionGroupSeq)
      : sessionData;
    
    return [...filteredSessions] // 배열 복사
      .sort((a, b) => b.sessionNo - a.sessionNo) // sessionNo 역순 정렬 (큰 번호부터)
      .map(session => ({
        session: `${session.sessionNo}회기`,
        sessionSeq: session.sessionSeq,
        sessionNo: session.sessionNo,
        sessionDate: session.sessionDate, // 세션 날짜 추가
        sessiongroupSeq: session.sessiongroupSeq, // 그룹 정보 추가
        selected: currentSession?.sessionSeq === session.sessionSeq // 현재 선택된 세션과 비교
      }));
  }, [sessionData, currentSession]);
  
  function handleSessionSelect(option, idx) {
    // 선택된 회기로 URL 파라미터 변경하여 페이지 이동
    const newQuery = new URLSearchParams(location.search);
    newQuery.set('sessionSeq', option.sessionSeq);
    
    // URL 변경으로 Consults.jsx에서 새로운 데이터 로딩 트리거
    navigate(`${location.pathname}?${newQuery.toString()}`, { replace: true });
  }

  return (
    <>
      <div className="inner">
        <SessionSelect options={sessionOptions} onSelect={handleSessionSelect} onEdit={onOpenEdit} />
        {!isNoshow ? 
        <>
          <Transcript 
            setShowUploadModal={setShowUploadModal} 
            sessionMngData={sessionMngData} 
            sessionData={propSessionData}
            audioData={audioData}
            setShowAiSummary={setShowAiSummary}
            setSupportPanel={setSupportPanel}
          />
          <CounselLog setIsNoshow={setIsNoshow} sessionMngData={sessionMngData} sessionData={propSessionData} />
        </> : 
        <>
          <div className="noshow">
              <img src={warningFace} alt="warning"/>
              <strong>해당 회기는 ‘노쇼' 상태입니다.</strong>
              <p className="explain">노쇼 처리된 회기는 아래 기능이 제한됩니다.</p>
              <ul>
                  <li>1. 녹취록 업로드</li>
                  <li>2. 상담일지 작성</li>
              </ul>
              <p className="explain">녹취록 업로드 또는 상담일지를 작성하려면<br/>‘노쇼 해제'를 선택해 주세요.</p>
              <button className="noshow-release-btn type05" type="button" onClick={() => setIsNoshow(false)}>노쇼 해제</button>
          </div>
        </>}
      </div>
    </>
  );
}

export default CounselManagement;
