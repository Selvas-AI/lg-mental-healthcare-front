import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import './recordings.scss';
import RecordingsPlayer from "./RecordingsPlayer";
import SearchTranscript from "./SearchTranscript";
import ToastPop from '@/components/ToastPop';
import SectionSummaryPanel from './SectionSummaryPanel';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { supportPanelState, recordingsTabState } from '@/recoil';
import AiAnalysis from "./AiAnalysis";
import AiTranscriptPanel from "./AiTranscriptPanel";
import { audioDownload, transcriptFind, audioFind, sessionFind, sessionMngFind, sessionMngUpdate } from '@/api/apiCaller';
import { useLocation } from 'react-router-dom';

function Recordings() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sessionSeq = query.get('sessionSeq');
  
  const tabListRef = useRef([]); // 각 탭 li 참조 배열 추가
  const [activeTab, setActiveTab] = useRecoilState(recordingsTabState);
  const tabIndicatorRef = useRef(null);
  const speakWrapRef = useRef();
  const recordingsPlayerRef = useRef(); // RecordingsPlayer 참조
  const [searchKeyword, setSearchKeyword] = useState("");
  const [highlightInfo, setHighlightInfo] = useState(null);
  const [showSectionSummary, setShowSectionSummary] = useState(false);
  const [showAiCreatePanel, setShowAiCreatePanel] = useState(false);
  const [initialAiStep, setInitialAiStep] = useState(1);
  const setSupportPanel = useSetRecoilState(supportPanelState);
  
  // 오디오 URL 상태
  const [audioUrl, setAudioUrl] = useState(null);
  // 녹취 데이터 상태
  const [transcript, setTranscript] = useState([]);
  // 녹음 생성 시간 상태
  const [recordingDate, setRecordingDate] = useState('');
  // 회기 번호 상태 (sessionData에서 가져오기)
  const [sessionNumber, setSessionNumber] = useState('');
  // AI 요약 데이터 상태
  const [aiSummaryData, setAiSummaryData] = useState({
    summary: '',
    issue: '',
    keyword: [],
    frequency: { counselor: { minutes: 0 }, client: { minutes: 0 } },
    stress: { data: [], labels: [] },
    rawMngData: null
  });
  // 구간 요약 데이터 상태
  const [sectionSummaryData, setSectionSummaryData] = useState([]);

  // 페이지 이탈 시 기본 탭으로 초기화하여, 다음 방문 시 기본적으로 '녹취내용' 탭 노출
  useEffect(() => {
    return () => {
      setActiveTab('recordings');
    };
  }, [setActiveTab]);

  // URL 파라미터(tab)로 초기/직접 진입 탭 제어
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'aianalysis') {
      setActiveTab('aianalysis');
    } else if (tab === 'recordings') {
      setActiveTab('recordings');
    }
  }, [location.search, setActiveTab]);
  
  // sessionSeq로 회기 정보 및 상담관리 데이터 가져오기
  const fetchSessionData = async () => {
      if (sessionSeq) {
        const clientId = query.get('clientId');
        if (clientId) {
          try {
            // 회기 정보와 상담관리 데이터 병렬 조회
            const [sessionResponse, sessionMngResponse] = await Promise.all([
              sessionFind(clientId, sessionSeq),
              sessionMngFind(sessionSeq)
            ]);
            
            // 회기 번호 설정
            if (sessionResponse.code === 200 && sessionResponse.data?.sessionNo) {
              setSessionNumber(sessionResponse.data.sessionNo);
            }
            
            // 상담관리 데이터로 AI 요약 데이터 업데이트
            if (sessionMngResponse.code === 200 && sessionMngResponse.data) {
              const mngData = sessionMngResponse.data;
              console.log('상담관리 데이터:', mngData);
              
              // JSON 문자열 파싱
              let keywordData = [];
              let frequencyData = { counselor: { minutes: 0 }, client: { minutes: 0 } };
              let stressData = { data: [], labels: [] };
              
              try {
                if (mngData.keywordAnalysisJson) {
                  keywordData = JSON.parse(mngData.keywordAnalysisJson);
                }
                if (mngData.utteranceFrequencyJson) {
                  frequencyData = JSON.parse(mngData.utteranceFrequencyJson);
                }
                if (mngData.stressIndicatorsJson) {
                  stressData = JSON.parse(mngData.stressIndicatorsJson);
                }
              } catch (parseError) {
                console.error('JSON 파싱 오류:', parseError);
              }
              
              // 원본 데이터(raw) 저장 + AiAnalysis 표시용 텍스트(counselingSummaryText/concernTopicText) 반영
              setAiSummaryData(prev => ({
                ...prev,
                summary: mngData.counselingSummaryText ?? prev.summary ?? '',
                issue: mngData.concernTopicText ?? prev.issue ?? '',
                rawMngData: {
                  ...mngData,
                  parsedKeyword: keywordData,
                  parsedFrequency: frequencyData,
                  parsedStress: stressData
                }
              }));
              // 재조회한 데이터 구조 반환
              return {
                session: sessionResponse?.data ?? null,
                mng: mngData,
                parsed: {
                  keyword: keywordData,
                  frequency: frequencyData,
                  stress: stressData
                }
              };
            }
          } catch (error) {
            console.error('데이터 조회 실패:', error);
          }
        }
      }
  };

  useEffect(() => {
    fetchSessionData();
  }, [sessionSeq]);

  // 컴포넌트 마운트 시 오디오 파일 로드
  useEffect(() => {
    const loadAudioFile = async () => {
      if (sessionSeq) {
        try {
          const response = await audioDownload(sessionSeq);
          
          // response 자체가 Blob인 경우 처리
          if (response instanceof Blob) {
            const audioBlob = new Blob([response], { type: 'audio/mpeg' });
            const audioObjectUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioObjectUrl);
          }
          // 기존 방식 (response.data가 Blob인 경우)
          else if (response?.status === 200 && response.data instanceof Blob) {
            const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
            const audioObjectUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioObjectUrl);
          }
        } catch (error) {
          // 오디오 파일 로드 에러는 사용자 UI에서 필요 시 처리
        }
      }
    };

    loadAudioFile();
    
    // 컴포넌트 언마운트 시 메모리 정리
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [sessionSeq]);
  
  // sessionSeq 변경 시 녹음 정보 로드
  useEffect(() => {
    const loadAudioInfo = async () => {
      if (!sessionSeq) {
        setRecordingDate('');
        return;
      }
      try {
        const res = await audioFind(sessionSeq);
        const data = res?.data ?? res;
        
        if (data?.createdTime) {
          setRecordingDate(formatDateToKorean(data.createdTime));
        } else {
          setRecordingDate('');
        }
      } catch (_) {
        setRecordingDate('');
      }
    };
    loadAudioInfo();
  }, [sessionSeq]);
  
  // sessionSeq 변경 시 녹취 데이터 로드
  useEffect(() => {
    reloadTranscript();
  }, [sessionSeq]);

  // 초를 MM:SS 형태로 변환하는 유틸 함수
  const formatSecondsToTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 날짜를 한국어 형식으로 변환하는 함수
  const formatDateToKorean = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[date.getDay()];
      
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const period = hours < 12 ? '오전' : '오후';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      
      return `${year}.${month}.${day}(${weekday}) ${period} ${displayHours}시${minutes !== '00' ? ` ${minutes}분` : ''}`;
    } catch (error) {
      return '';
    }
  };
  // 수정 모드
  const [editMode, setEditMode] = useState(false);
  // 토스트 메시지 상태
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleSearch = (keyword, highlightInfo, cIndex) => {
    setSearchKeyword(keyword);
    setHighlightInfo(highlightInfo);
    setCurrentIndex(cIndex);
  };
  // 텍스트 수정 핸들러
  const handleChangeTranscript = (idx, newContent) => {
    setTranscript(prev => prev.map((item, i) => i === idx ? { ...item, content: newContent } : item));
  };
  
  // 탭 indicator 이동 효과
  useLayoutEffect(() => {
    const tabIdx = activeTab === "recordings" ? 0 : 1;
    const currentTab = tabListRef.current[tabIdx];
    const indicator = tabIndicatorRef.current;
    if (currentTab && indicator) {
      const tabWidth = currentTab.offsetWidth;
      const tabLeft = currentTab.offsetLeft;
      indicator.style.width = tabWidth + 'px';
      indicator.style.left = tabLeft + 'px';
    }
  }, [activeTab]);

  // 상단 저장 버튼 클릭 시 - RecordingsPlayer의 저장 함수 호출
  const handleSave = async () => {
    if (recordingsPlayerRef.current?.handleSaveTranscript) {
      await recordingsPlayerRef.current.handleSaveTranscript();
    }
  };

  // transcriptText를 transcript 배열로 파싱하는 함수
  const parseTranscriptText = (transcriptText) => {
    if (!transcriptText) return [];
    
    const lines = transcriptText.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      // [시간] 발화자명: 내용 형태를 파싱
      const match = line.match(/^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/);
      if (match) {
        const [, time, name, content] = match;
        const speaker = name.includes('상담사') ? 'counselor' : 'client';
        return {
          speaker,
          name: name.trim(),
          time: time.trim(),
          content: content.trim()
        };
      }
      // 파싱 실패 시 기본값
      return {
        speaker: `spk_${index % 2}`,
        name: `발화자${(index % 2) + 1}`,
        time: '00:00',
        content: line
      };
    });
  };

  // transcript 데이터에서 발화자별 발화 시간을 계산하는 함수
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

    const result = {
      counselor: { minutes: Math.round(counselorSeconds / 60 * 100) / 100 },
      client: { minutes: Math.round(clientSeconds / 60 * 100) / 100 }
    };
    
    return result;
  };

  // MM:SS 형식의 시간을 초로 변환
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

  // 최신 transcript 데이터 다시 로드
  const reloadTranscript = async () => {
    if (!sessionSeq) return;
    try {
      const res = await transcriptFind(sessionSeq);
      const data = res?.data ?? res;
      
      // sectionSummaryText를 aiSummaryData.summary로 대체
      if (data?.sectionSummaryText) {
        setAiSummaryData(prev => ({
          ...prev,
          summary: data.sectionSummaryText
        }));
      }
      
      // sectionSummaryJson을 파싱하여 llm_answer 데이터를 구간 요약 데이터로 설정
      if (data?.sectionSummaryJson) {
        try {
          const sectionSummary = JSON.parse(data.sectionSummaryJson);
          if (sectionSummary?.llm_answer) {
            setSectionSummaryData(sectionSummary.llm_answer);
          }
        } catch (parseError) {
          console.error('sectionSummaryJson 파싱 오류:', parseError);
          setSectionSummaryData([]);
        }
      } else {
        setSectionSummaryData([]);
      }
      
      // 회기 번호 설정 (sessionSeq로부터 추출 또는 API 응답에서 가져오기)
      if (data?.sessionNo) {
        setSessionNumber(data.sessionNo);
      }
      
      // transcriptText가 있으면 파싱해서 사용
      if (data?.transcriptText) {
        const parsedTranscript = parseTranscriptText(data.transcriptText);
        setTranscript(parsedTranscript);
        
        // 발화 시간 계산 및 AI 요약 데이터 업데이트 (기본 frequency만 업데이트)
        const frequencyData = calculateSpeakingTime(parsedTranscript);
        setAiSummaryData(prev => ({
          ...prev,
          frequency: frequencyData
        }));
      }
      // transcriptJson이 있으면 기존 방식으로 파싱 (초기 로드용)
      else if (data?.transcriptJson) {
        try {
          const transcriptData = JSON.parse(data.transcriptJson);
          const audioSegments = transcriptData?.results?.audioSegments || [];
          
          const convertedTranscript = audioSegments.map((segment, index) => ({
            speaker: segment.speaker_label || `spk_${index}`,
            name: segment.speaker_label === 'counselor' ? '상담사' : '내담자',
            time: formatSecondsToTime(parseFloat(segment.start_time || 0)),
            content: segment.transcript || ''
          }));
          
          setTranscript(convertedTranscript);
          
          // transcriptJson에서도 발화 시간 계산 (기본 frequency만 업데이트)
          const frequencyData = calculateSpeakingTime(convertedTranscript);
          setAiSummaryData(prev => ({
            ...prev,
            frequency: frequencyData
          }));
        } catch (parseError) {
          console.error('transcriptJson 파싱 오류:', parseError);
          setTranscript([]);
        }
      } else {
        setTranscript([]);
      }
    } catch (error) {
      console.error('transcript 재로드 오류:', error);
    }
  };

  // RecordingsPlayer에서 API 성공 후 호출되는 콜백
  const handleSaveSuccess = async () => {
    await reloadTranscript(); // 최신 데이터 다시 로드
    setEditMode(false);
    setToastMessage('변경사항이 녹취록에 저장 되었습니다.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 공용 토스트 메시지 표시 헬퍼 (AiTranscriptPanel 등에 전달)
  const showToastMessage = (message) => {
    if (!message) return;
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // AiTranscriptPanel에서 확정하기 시 호출되는 콜백
  // AI 패널의 값은 AI 필드(~Ai)에만 반영하여 Text 필드와 실시간 동기화를 막는다
  const handleAiConfirm = (stepField, stepData) => {
    setAiSummaryData(prev => {
      const next = { ...prev };
      // 보장: rawMngData 객체 존재
      next.rawMngData = { ...(prev.rawMngData || {}) };

      switch (stepField) {
        case 'summary':
          next.rawMngData.counselingSummaryAi = stepData ?? '';
          break;
        case 'issue':
          next.rawMngData.concernTopicAi = stepData ?? '';
          break;
        case 'keyword':
          // 키워드/빈도/스트레스는 AiAnalysis에서도 시각화되므로 상위 표시 상태에 반영
          next.keyword = Array.isArray(stepData) ? stepData : [];
          break;
        case 'frequency':
          next.frequency = stepData || { counselor: { minutes: 0 }, client: { minutes: 0 } };
          break;
        case 'stress':
          next.stress = stepData || { data: [], labels: [] };
          break;
        default:
          break;
      }

      return next;
    });
  };

  // AiAnalysis 편집 입력 반영 핸들러
  const handleChangeSummary = (value) => {
    setAiSummaryData(prev => ({ ...prev, summary: value ?? '' }));
  };
  const handleChangeIssue = (value) => {
    setAiSummaryData(prev => ({ ...prev, issue: value ?? '' }));
  };

  // AI 분석 탭 저장 버튼 핸들러
  const [aiSaveLoading, setAiSaveLoading] = useState(false);
  const handleAiAnalysisSave = async () => {
    if (aiSaveLoading) return;
    try {
      setAiSaveLoading(true);
      // AiAnalysis 입력값은 Text 필드로 저장
      const counselingSummaryText = aiSummaryData.summary || '';
      const concernTopicText = aiSummaryData.issue || '';
      if (!sessionSeq) throw new Error('sessionSeq 없음');
      // 필수값 체크
      if (!counselingSummaryText && !concernTopicText) {
        showToastMessage('저장할 내용이 없습니다.');
        setAiSaveLoading(false);
        return;
      }
      const params = {
        sessionSeq: Number(sessionSeq),
        counselingSummaryText,
        concernTopicText
      };
      const res = await sessionMngUpdate(params);
      if (res?.code === 200) {
        showToastMessage('AI 분석 내용이 저장되었습니다.');
        // 저장 성공 시 상담관리 데이터 재조회
        const refetched = await fetchSessionData();
        console.log('상담관리 데이터 재조회 결과:', refetched);
      } else {
        showToastMessage('저장에 실패했습니다.');
      }
    } catch (e) {
      showToastMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setAiSaveLoading(false);
    }
  };

  return (
    <>
      <div className="inner">
        <div className="move-up">
          <strong className="page-title">{sessionNumber ? `${sessionNumber}회기 녹취록` : '녹취록'}</strong>
          <div className="flex-wrap">
            {/* 녹음내용 검색 컴포넌트 */}
            <SearchTranscript
              targetRef={speakWrapRef}
              transcript={transcript}
              onSearch={handleSearch}
              searchKeyword={searchKeyword}
            />
            {/* 탭별 버튼 분기 */}
            {activeTab === "recordings" && (
              <>
                <button className={`record-edit-btn type07 black ${!editMode ? 'on' : ''}`} type="button" onClick={() => setEditMode(true)}>수정</button>
                <button className={`record-save-btn type07 black ${editMode ? 'on' : ''}`} type="button" onClick={handleSave}>저장</button>
              </>
            )}
            {activeTab === "aianalysis" && (
              <button className="record-save-btn type07 black on" type="button" onClick={handleAiAnalysisSave}>저장</button>
            )}
          </div>
        </div>
        <div className="tab-menu">
          <div className="tab-list-wrap">
            <div>
              <ul className="tab-list" role="tablist" style={{ cursor: 'pointer' }}>
                <li
                  className={activeTab === "recordings" ? 'on' : ''}
                  role="tab"
                  ref={el => tabListRef.current[0] = el}
                >
                  <a onClick={() => setActiveTab("recordings")}>녹취내용</a>
                </li>
                <li
                  className={activeTab === "aianalysis" ? 'on' : ''}
                  role="tab"
                  ref={el => tabListRef.current[1] = el}
                >
                  <a onClick={() => setActiveTab("aianalysis")}>AI 분석</a>
                </li>
              </ul>
              <div className="tab-indicator" ref={tabIndicatorRef}></div>
            </div>
            <div className="info-bar">
              <p className="info">{recordingDate || '날짜 정보 없음'}</p>
              <a className="panel-btn" onClick={() => {
                setShowSectionSummary(true);
                setShowAiCreatePanel(false);
                setSupportPanel(true);
              }} style={{cursor:'pointer'}}>
                구간 요약
              </a>
            </div>
          </div>
          <div className="tab-cont">
            {/* 녹취내용 */}
            {activeTab === "recordings" && (
              <RecordingsPlayer
                ref={recordingsPlayerRef}
                speakWrapRef={speakWrapRef}
                transcript={transcript}
                searchKeyword={searchKeyword}
                highlightInfo={highlightInfo}
                currentIndex={currentIndex}
                editMode={editMode}
                onChangeTranscript={handleChangeTranscript}
                audioUrl={audioUrl}
                sessionSeq={sessionSeq}
                onSave={handleSaveSuccess}
              />
            )}
            {/* AI 분석 */}
            {activeTab === "aianalysis" && (
              <AiAnalysis 
                AiSummaryData={aiSummaryData}
                onChangeSummary={handleChangeSummary}
                onChangeIssue={handleChangeIssue}
                onAiCreateClick={(step) => {
                  if (typeof step === 'number') {
                    setInitialAiStep(step);
                  } else {
                    setInitialAiStep(1);
                  }
                  setShowAiCreatePanel(true);
                  setShowSectionSummary(false);
                  setSupportPanel(true);
                }} />
            )}
          </div>
        </div>
        <SectionSummaryPanel 
          open={showSectionSummary} 
          onClose={() => {
            setShowSectionSummary(false);
            setSupportPanel(false);
          }}
          sectionData={sectionSummaryData}
        />
        <ToastPop message={toastMessage} showToast={showToast} />
      </div>
        <AiTranscriptPanel 
        status="complete"
        AiSummaryData={aiSummaryData}
        sessionSeq={sessionSeq}
        open={showAiCreatePanel} 
        onClose={() => {
          setShowAiCreatePanel(false); 
          setSupportPanel(false);
        }}
        onConfirm={handleAiConfirm}
        showToastMessage={showToastMessage}
        initialStep={initialAiStep}
      />
    </>
  );
}

export default Recordings;
