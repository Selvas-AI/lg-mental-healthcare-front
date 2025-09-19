import React, { useEffect, useState } from "react";
import { buildStressChartBuckets } from '@/hooks/stressChart';
import emptyFace from "@/assets/images/common/empty_face.svg";

// import KeywordBox from "./KeywordBox";
import KeywordBubblePack from "./KeywordBubblePack";
import FrequencyBox from "./FrequencyBox";
import StressBox from "./StressBox";
import { useNavigate, useLocation } from "react-router-dom";
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { recordingsTabState, editorConfirmState, audioUploadState } from '@/recoil';
import TranscriptBox from "./TranscriptBox";
import { transcriptFind } from '@/api/apiCaller';
// 삭제 동작은 부모(Consults)에서 처리

function Transcript({ setShowUploadModal, sessionMngData, sessionData, audioData, setShowAiSummary, setSupportPanel, onRequestAudioDelete, showToastMessage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [audioFileExists, setAudioFileExists] = useState(false);
  const setRecordingsActiveTab = useSetRecoilState(recordingsTabState);
  const setGlobalEditorConfirm = useSetRecoilState(editorConfirmState);
  const audioUpload = useRecoilValue(audioUploadState);
  const [localFrequency, setLocalFrequency] = useState({ counselor: { minutes: 0 }, client: { minutes: 0 } });
  
  // sessionMngData에서 실제 데이터 추출
  const hasData = sessionMngData && Object.keys(sessionMngData).length > 0;
  
  // sessionData에서 TODO 상태 확인
  const isTranscriptCreated = sessionData?.todoTranscriptCreation === true;
  const isAiAnalysisChecked = sessionData?.todoAiAnalysisCheck === true;
  
  // audioData props를 통해 오디오 파일 존재 여부 확인
  useEffect(() => {
    if (isTranscriptCreated && audioData) {
      setAudioFileExists(true);
    } else {
      setAudioFileExists(false);
    }
  }, [audioData, isTranscriptCreated]);

  // 쿼리에서 sessionSeq 추출
  const getSessionSeqFromQuery = () => {
    const qs = new URLSearchParams(location.search);
    return qs.get('sessionSeq');
  };

  // 현재 세션의 업로드 상태 확인
  const isSessionUploading = () => {
    const sessionSeq = getSessionSeqFromQuery();
    if (!sessionSeq) return false;
    
    const sessionUploadState = audioUpload[sessionSeq];
    return sessionUploadState && 
            (sessionUploadState.status === 'uploading' || sessionUploadState.status === 'processing');
  };

  // 녹취록 업로드 버튼 클릭 핸들러
  const handleUploadClick = () => {
    if (isSessionUploading()) {
      setGlobalEditorConfirm({
        open: true,
        title: '업로드 진행 중',
        message: '파일을 업로드하고 있습니다. 잠시만 기다려주세요.<br/>(시간이 오래 걸리면 새로고침을 해주세요.)',
        confirmText: '확인',
      });
      return;
    }
    setShowUploadModal(true);
  };

  // Transcript 데이터에서 발화자별 발화 시간을 계산하는 함수들 (Recordings.jsx와 동일 로직)
  const timeToSeconds = (timeStr) => {
    if (!timeStr || timeStr === '00:00') return 0;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 0;
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    return minutes * 60 + seconds;
  };
  const estimateSpeechDuration = (text) => {
    if (!text) return 2;
    const charCount = text.length;
    const estimatedSeconds = Math.max(2, charCount / 3.5);
    return Math.min(estimatedSeconds, 30);
  };
  const formatSecondsToTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const parseTranscriptText = (transcriptText) => {
    if (!transcriptText) return [];
    const lines = transcriptText.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const match = line.match(/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/);
      if (match) {
        const [, time, name, content] = match;
        const speaker = name.includes('상담사') ? 'counselor' : 'client';
        return { speaker, name: name.trim(), time: time.trim(), content: content.trim() };
      }
      return { speaker: `spk_${index % 2}`, name: `발화자${(index % 2) + 1}`, time: '00:00', content: line };
    });
  };
  const calculateSpeakingTime = (transcriptData) => {
    if (!Array.isArray(transcriptData) || transcriptData.length === 0) {
      return { counselor: { minutes: 0 }, client: { minutes: 0 } };
    }
    let counselorSeconds = 0;
    let clientSeconds = 0;
    for (let i = 0; i < transcriptData.length; i++) {
      const current = transcriptData[i];
      const next = transcriptData[i + 1];
      const currentTime = timeToSeconds(current.time);
      const nextTime = next ? timeToSeconds(next.time) : currentTime + estimateSpeechDuration(current.content);
      const duration = Math.max(0, nextTime - currentTime);
      if (current.speaker === 'counselor' || current.name.includes('상담사')) {
        counselorSeconds += duration;
      } else {
        clientSeconds += duration;
      }
    }
    return {
      counselor: { minutes: Math.round(counselorSeconds / 60 * 100) / 100 },
      client: { minutes: Math.round(clientSeconds / 60 * 100) / 100 }
    };
  };

  // 로컬 발화빈도 계산: sessionSeq 변경 시 transcript 조회 후 계산
  useEffect(() => {
    const sessionSeq = getSessionSeqFromQuery();
    if (!sessionSeq) {
      setLocalFrequency({ counselor: { minutes: 0 }, client: { minutes: 0 } });
      return;
    }
    const loadAndCompute = async () => {
      try {
        const res = await transcriptFind(sessionSeq);
        const data = res?.data ?? res;
        if (data?.transcriptText) {
          const parsed = parseTranscriptText(data.transcriptText);
          const freq = calculateSpeakingTime(parsed);
          setLocalFrequency(freq);
        } else if (data?.transcriptJson) {
          try {
            const transcriptData = JSON.parse(data.transcriptJson);
            const audioSegments = transcriptData?.results?.audioSegments || [];
            const converted = audioSegments.map((segment, index) => ({
              speaker: segment.speaker_label || `spk_${index}`,
              name: segment.speaker_label === 'counselor' ? '상담사' : '내담자',
              time: formatSecondsToTime(parseFloat(segment.start_time || 0)),
              content: segment.transcript || ''
            }));
            const freq = calculateSpeakingTime(converted);
            setLocalFrequency(freq);
          } catch (_) {
            setLocalFrequency({ counselor: { minutes: 0 }, client: { minutes: 0 } });
          }
        } else {
          setLocalFrequency({ counselor: { minutes: 0 }, client: { minutes: 0 } });
        }
      } catch (_) {
        setLocalFrequency({ counselor: { minutes: 0 }, client: { minutes: 0 } });
      }
    };
    loadAndCompute();
  }, [location.search]);
  
  // JSON 파싱 함수 (문자열/객체 모두 안전 처리, 후행 콤마 제거)
  const parseJsonSafely = (input) => {
    try {
      if (input == null) return null;
      if (typeof input === 'object') return input; // 이미 객체/배열인 경우 그대로 반환
      if (typeof input !== 'string') return null;
      const trimmed = input.trim();
      if (!trimmed) return null;
      // 후행 콤마 제거: {"a":1,} 또는 [1,2,]
      const normalized = trimmed.replace(/,(\s*[}\]])/g, '$1');
      return JSON.parse(normalized);
    } catch (error) {
      // console.warn('JSON 파싱 실패(무시):', error);
      return null;
    }
  };

  // 스트레스 지표 JSON(stressDetail)을 3분(180s) 버킷 평균으로 변환 (공용 유틸 사용)
  const buildStressChart = (raw) => buildStressChartBuckets(raw, 180, { forwardFill: true, labelRange: true });

  // AiTranscriptPanel의 extractTextParts 로직과 동일: 요약 JSON에서 텍스트만 추출
  const extractTextParts = (value) => {
    if (!value) return { answer: '', feedback: '' };
    if (typeof value === 'string') {
      try {
        const obj = JSON.parse(value);
        if (typeof obj === 'object' && obj.llm_answer) {
          return { answer: obj.llm_answer || '', feedback: '' }; // llm_feedback은 추후 사용 예정
        }
        return { answer: value, feedback: '' };
      } catch {
        return { answer: value, feedback: '' };
      }
    }
    if (typeof value === 'object') {
      const answer = value.llm_answer || '';
      // llm_feedback은 추후 사용 예정
      // const feedback = value.llm_feedback || '';
      if (answer) return { answer, feedback: '' };
    }
    return { answer: '', feedback: '' };
  };

  // sessionMngFind의 일부 필드 존재 여부를 boolean 상태로 관리
  const [dataPresence, setDataPresence] = useState({
    hasCounselingSummaryAi: false,
    hasConcernTopicAi: false,
    hasKeywordAnalysis: false,
    hasStressIndicators: false,
  });

  useEffect(() => {
    const keywordParsed = parseJsonSafely(sessionMngData?.keywordAnalysisJson);
    const stressParsed = parseJsonSafely(sessionMngData?.stressIndicatorsJson);

    const hasKeyword = (() => {
      if (!keywordParsed) return false;
      if (Array.isArray(keywordParsed)) return keywordParsed.length > 0;
      if (Array.isArray(keywordParsed?.llm_answer)) return keywordParsed.llm_answer.length > 0;
      return true; // 객체가 비어있지 않으면 true로 간주
    })();

    const hasStress = (() => {
      if (!stressParsed) return false;
      if (Array.isArray(stressParsed?.stressDetail)) return stressParsed.stressDetail.length > 0;
      return false;
    })();

    setDataPresence({
      hasCounselingSummaryAi: !!sessionMngData?.counselingSummaryAi,
      hasConcernTopicAi:       !!sessionMngData?.concernTopicAi,
      hasKeywordAnalysis:      hasKeyword,
      hasStressIndicators:     hasStress,
    });
  }, [sessionMngData]);

  // 완료 판단: 현재는 3개 모두 필요 (stressIndicatorsJson 제외)
  const hasAllAiData = (
    dataPresence.hasCounselingSummaryAi &&
    dataPresence.hasConcernTopicAi &&
    dataPresence.hasKeywordAnalysis
    // && dataPresence.hasStressIndicators // TODO: 추후 활성화 예정
  );

  const getTranscriptData = () => {
    if (!hasData) return null;
    
    const keywordData = parseJsonSafely(sessionMngData.keywordAnalysisJson);
    // 서버 저장값은 사용하지 않고, 프론트 계산값 사용
    const frequencyData = localFrequency;
    const stressData = buildStressChart(sessionMngData.stressIndicatorsJson);
    
    return {
      // AI 생성 상담요약 또는 수동 입력 상담요약
      summary: sessionMngData.counselingSummaryText || sessionMngData.counselingSummaryAi || '',
      // AI 생성 고민주제 또는 수동 입력 고민주제를 배열로 변환
      issues: sessionMngData.concernTopicText ? 
        sessionMngData.concernTopicText.split('\n').filter(item => item.trim()) : 
        (sessionMngData.concernTopicAi ? 
          sessionMngData.concernTopicAi.split('\n').filter(item => item.trim()) : []),
      // 키워드 분석 데이터
      keyword: keywordData || [],
      // 발화빈도 데이터: 로컬 계산값
      frequency: frequencyData || { counselor: { minutes: 0 }, client: { minutes: 0 } },
      // 스트레스 징후 데이터
      stress: stressData || { data: [], labels: [] }
    };
  };
  
  const transcriptData = getTranscriptData();

  const handleNavigateAudio = () => {
    // AI 생성/분석 진행 중이면 이동 차단 후 전역 모달 안내
    if (audioFileExists && !hasAllAiData) {
      setGlobalEditorConfirm({
        open: true,
        title: '안내',
        message: 'AI가 녹취록을 생성/분석하고 있습니다.<br />생성이 완료되면 상세 화면에서 결과를 확인할 수 있어요.',
        confirmText: '확인',
      });
      return;
    }
    // 현재 URL의 쿼리 파라미터를 유지하면서 이동
    navigate(`/clients/recordings${location.search}`);
  };

  const handleAIGenerate = () => {
    // AI 생성/분석 진행 중이면 이동 차단 후 전역 모달 안내
    if (audioFileExists && !hasAllAiData) {
      setGlobalEditorConfirm({
        open: true,
        title: '안내',
        message: 'AI가 녹취록을 생성/분석하고 있습니다.<br />생성이 완료되면 상세 화면에서 결과를 확인할 수 있어요.',
        confirmText: '확인',
      });
      return;
    }
    // Recordings 페이지의 탭을 AI 분석으로 전환 후 해당 페이지로 이동
    setRecordingsActiveTab('aianalysis');
    const qs = new URLSearchParams(location.search);
    qs.set('tab', 'aianalysis');
    navigate(`/clients/recordings?${qs.toString()}`);
  };

  const handleUpload = () => {
    if (setShowUploadModal) setShowUploadModal(true);
  };

  const handleDelete = () => {
    if (typeof onRequestAudioDelete === 'function') {
      onRequestAudioDelete();
    } else {
      showToastMessage && showToastMessage('삭제 확인 모달을 표시할 수 없습니다.');
    }
  };

  return (
    <div className="transcript">
      <div className="tit-wrap">
        <strong>녹취록</strong>
        <div className="btn-wrap">
          {!audioFileExists ? (
            <button className="upload-btn type03 h40" type="button" onClick={handleUploadClick}>
              녹취록 업로드
            </button>
          ) : (
            <a className="file-delete-btn cursor-pointer" onClick={handleDelete}>녹취파일 삭제</a>
          )}
          {!audioFileExists && (
            <button
              className="type05"
              type="button"
              onClick={() => {
                if (isSessionUploading()) {
                  setGlobalEditorConfirm({
                    open: true,
                    title: '업로드 진행 중',
                    message: '파일을 업로드하고 있습니다. 잠시만 기다리세요.<br/>(시간이 오래 걸리면 새로고침을 해주세요.)',
                    confirmText: '확인',
                  });
                } else {
                  setGlobalEditorConfirm({
                    open: true,
                    title: '안내',
                    message: '업로드 된 녹취록이 없습니다. 녹취록을 먼저 업로드 해주세요.',
                    confirmText: '확인',
                  });
                }
              }}
            >
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
          {isSessionUploading() ? (
            <>
              <p className="empty-tit">녹취록을 업로드하고 있습니다.</p>
              <p className="empty-info">
                서버에서 파일을 처리하고 있습니다. 잠시만 기다려주세요.
              </p>
              <p className="empty-info">
                (시간이 오래 걸리면 새로고침을 해주세요.)
              </p>
            </>
          ) : (
            <>
              <p className="empty-tit">업로드된 녹취록이 없습니다.</p>
              <p className="empty-info">
                [녹취록 업로드]를 선택하여 PC에 있는 녹취록을 업로드 할 수 있어요.
              </p>
            </>
          )}
        </div>
      )}
      {audioFileExists && !hasAllAiData && (
        <div className="transcript-board">
          <div className="create-board">
            <strong>AI가 녹취록을 생성/분석하고 있습니다.</strong>
            <ul>
              <li>1. 상담 요약</li>
              <li>2. 고민주제</li>
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
      {audioFileExists && hasAllAiData && !isAiAnalysisChecked && (
        <div className="transcript-board">
          <div className="create-board">
            <strong>AI가 녹취록 생성을 완료 하였습니다.</strong>
            <ul>
              <li>1. 상담 요약</li>
              <li>2. 고민주제</li>
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
      {audioFileExists && isAiAnalysisChecked && (
        <div className="transcript-board">
          <div className="dashboard">
            {/* 상담 요약 */}
            <TranscriptBox
              className={`summary${!hasData ? ' before-create' : ''}`}
              title="1. 상담 요약"
              editable={true}
              onEdit={handleAIGenerate}
              toggleable={true}
              onAIGenerate={handleAIGenerate}
            >
              {transcriptData && (() => {
                const { answer, feedback } = extractTextParts(transcriptData.summary);
                return (
                  <>
                    <div className="save-txt" style={{ whiteSpace: 'pre-wrap' }}>{answer}
                      {feedback ? (
                        <div className="ai-feedback">{feedback}</div>
                      ) : null}
                    </div>
                  </>
                );
              })()}
            </TranscriptBox>
            {/* 고민주제 */}
            <TranscriptBox
              className={`issue${!hasData ? ' before-create' : ''}`}
              title="2. 고민주제"
              editable={true}
              onEdit={handleAIGenerate}
              toggleable={true}
              onAIGenerate={handleAIGenerate}
            >
              {transcriptData && (() => {
                // Ai JSON 또는 수동 텍스트 모두 지원
                const source = sessionMngData?.concernTopicText || sessionMngData?.concernTopicAi || '';
                const { answer, feedback } = extractTextParts(source || (transcriptData.issues || []).join('\n'));
                const lines = (answer || '').split('\n').filter((l) => l.trim());
                return (
                  <>
                    <div className="save-txt">
                      {lines.map((issue, idx) => (
                        <div className="" key={idx}>
                          {issue}
                          {feedback ? (
                            <div className="ai-feedback" style={{ marginTop: 8, color: '#666', whiteSpace: 'pre-wrap' }}>{feedback}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </TranscriptBox>
            {/* 키워드 분석 */}
            <KeywordBubblePack
              data={transcriptData?.keyword}
            />
            {/* 발화빈도 */}
            
            <FrequencyBox
              data={transcriptData?.frequency}
              onAIGenerate={handleAIGenerate}
            />
            {/* 스트레스 징후 */}
            <StressBox
              data={transcriptData?.stress?.data}
              labels={transcriptData?.stress?.labels}
              peakSec={transcriptData?.stress?.peakSec}
              onAIGenerate={handleAIGenerate}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Transcript;
