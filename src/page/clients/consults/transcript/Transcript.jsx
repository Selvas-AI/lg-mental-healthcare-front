import React, { useEffect, useState } from "react";
import emptyFace from "@/assets/images/common/empty_face.svg";

import KeywordBox from "./KeywordBox";
import FrequencyBox from "./FrequencyBox";
import StressBox from "./StressBox";
import { useNavigate, useLocation } from "react-router-dom";
import TranscriptBox from "./TranscriptBox";
import { audioFind } from "@/api/apiCaller";

function Transcript({ setShowUploadModal, sessionMngData, sessionData, setShowAiSummary, setSupportPanel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sessionSeq = query.get('sessionSeq');
  const [audioFileExists, setAudioFileExists] = useState(false);
  
  // sessionMngData에서 실제 데이터 추출
  const hasData = sessionMngData && Object.keys(sessionMngData).length > 0;
  const isAIGenerated = hasData && (
    sessionMngData.counselingSummaryAi || 
    sessionMngData.concernTopicAi || 
    sessionMngData.keywordAnalysisJson || 
    sessionMngData.utteranceFrequencyJson || 
    sessionMngData.stressIndicatorsJson
  );
  
  // sessionData에서 TODO 상태 확인
  const isTranscriptCreated = sessionData?.todoTranscriptCreation === true;
  const isAiAnalysisDone = sessionData?.todoAiAnalysisDone === true;
  const isAiAnalysisChecked = sessionData?.todoAiAnalysisCheck === true;
  
  // 녹음파일 조회 API 호출
  useEffect(() => {
    const fetchAudioData = async () => {
      try {
        const findResponse = await audioFind(sessionSeq);
        if (findResponse.code === 200 && findResponse.data && isTranscriptCreated) {
          setAudioFileExists(true);
        }
      } catch (error) {
        if (error.response?.status === 400) {
          setAudioFileExists(false);
        }
      }
    };

    if (isTranscriptCreated) {
      fetchAudioData();
    }
  }, [sessionSeq, isTranscriptCreated]);
  
  // JSON 파싱 함수
  const parseJsonSafely = (jsonString) => {
    try {
      return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      return null;
    }
  };

  const getTranscriptData = () => {
    if (!hasData) return null;
    
    const keywordData = parseJsonSafely(sessionMngData.keywordAnalysisJson);
    const frequencyData = parseJsonSafely(sessionMngData.utteranceFrequencyJson);
    const stressData = parseJsonSafely(sessionMngData.stressIndicatorsJson);
    
    return {
      // AI 생성 상담요약 또는 수동 입력 상담요약
      summary: sessionMngData.counselingSummaryAi || sessionMngData.counselingSummaryText || '',
      // AI 생성 고민주제 또는 수동 입력 고민주제를 배열로 변환
      issues: sessionMngData.concernTopicAi ? 
        sessionMngData.concernTopicAi.split('\n').filter(item => item.trim()) : 
        (sessionMngData.concernTopicText ? 
          sessionMngData.concernTopicText.split('\n').filter(item => item.trim()) : []),
      // 키워드 분석 데이터
      keyword: keywordData || [],
      // 발화빈도 데이터
      frequency: frequencyData || { counselor: { minutes: 0 }, client: { minutes: 0 } },
      // 스트레스 징후 데이터
      stress: stressData || { data: [], labels: [] }
    };
  };
  
  const transcriptData = getTranscriptData();

  const handleNavigateAudio = () => {
    // 현재 URL의 쿼리 파라미터를 유지하면서 이동
    navigate(`/clients/recordings${location.search}`);
  };

  const handleAIGenerate = () => {
    if (setShowAiSummary && setSupportPanel) {
      setShowAiSummary(true);
      setSupportPanel(true);
    }
  };

  const handleUpload = () => {
    if (setShowUploadModal) setShowUploadModal(true);
  };

  const handleDelete = () => {
    // TODO: 녹취파일 삭제 로직
  };

  return (
    <div className="transcript">
      <div className="tit-wrap">
        <strong>녹취록</strong>
        <div className="btn-wrap">
          {!audioFileExists ? (
            <button className="upload-btn type03 h40" type="button" onClick={handleUpload}>
              녹취록 업로드
            </button>
          ) : (
            <a className="file-delete-btn cursor-pointer" onClick={handleDelete}>녹취파일 삭제</a>
          )}
          {!audioFileExists && (
            <button className="type05" type="button" onClick={() => alert('업로드 된 녹취록이 없습니다. 녹취록을 먼저 업로드 해주세요.')}>
              녹취록 상세
            </button>
          )}
          {audioFileExists && (
            <button className="type05" type="button" onClick={handleNavigateAudio}>
              녹취록 상세
            </button>
          )}
        </div>
      </div>
      {!audioFileExists && (
        <div className="empty-board">
          <img src={emptyFace} alt="empty" />
          <p className="empty-tit">업로드된 녹취록이 없습니다.</p>
          <p className="empty-info">
            [녹취록 업로드]를 선택하여 PC에 있는 녹취록을 업로드 할 수 있어요.
          </p>
        </div>
      )}
      {audioFileExists && !isAiAnalysisDone && (
        <div className="transcript-board">
          <div className="create-board">
            <strong>AI가 녹취록을 생성/분석하고 있습니다.</strong>
            <ul>
              <li>1. 주호소 문제</li>
              <li>2. 상담 내용</li>
              <li>3. 키워드 분석</li>
              <li>4. 발화빈도</li>
              <li>5. 스트레스 징후</li>
            </ul>
            <button className="type01 h40" type="button" onClick={handleAIGenerate}>
              <span>AI 생성하기</span>
            </button>
          </div>
        </div>
      )}
      {isAiAnalysisDone && !isAiAnalysisChecked && (
        <div className="transcript-board">
          <div className="create-board">
            <strong>AI가 녹취록 생성을 완료 하였습니다.</strong>
            <ul>
              <li>1. 주호소 문제</li>
              <li>2. 상담 내용</li>
              <li>3. 키워드 분석</li>
              <li>4. 발화빈도</li>
              <li>5. 스트레스 징후</li>
            </ul>
            <button className="type01 h40" type="button" onClick={handleAIGenerate}>
              <span>AI 생성하기</span>
            </button>
          </div>
        </div>
      )}
      {isAiAnalysisChecked && (
        <div className="transcript-board">
          <div className="dashboard">
            {/* 주호소 문제 */}
            <TranscriptBox
              className={`summary${!hasData ? ' before-create' : ''}`}
              title="1. 주호소 문제"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
              onAIGenerate={handleAIGenerate}
            >
              {transcriptData && (
                <div className="save-txt">{transcriptData.summary}</div>
              )}
            </TranscriptBox>
            {/* 상담 내용 */}
            <TranscriptBox
              className={`issue${!hasData ? ' before-create' : ''}`}
              title="2. 상담 내용"
              editable={true}
              onEdit={() => {}}
              toggleable={true}
              onAIGenerate={handleAIGenerate}
            >
              {transcriptData && (
                <div className="save-txt">
                  {transcriptData.issues?.map((issue, idx) => (
                    <div className="bullet-line" key={idx}>{issue}</div>
                  ))}
                </div>
              )}
            </TranscriptBox>
            {/* 키워드 분석 */}
            <KeywordBox
              data={transcriptData?.keyword}
              onAIGenerate={handleAIGenerate}
            />
            {/* 발화빈도 */}
            <FrequencyBox
              data={transcriptData?.frequency}
            />
            {/* 스트레스 징후 */}
            <StressBox
              data={transcriptData?.stress?.data}
              labels={transcriptData?.stress?.labels}
              onAIGenerate={handleAIGenerate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Transcript;
