import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import emptyFace from '@/assets/images/common/empty_face.svg';
import SymptomChangePanel from './components/SymptomChangePanel';
import { assessmentSetList, assessmentSetDelete, assessmentSetUpdateOverallInsight, sessionList } from '@/api/apiCaller';
import { useLocation } from 'react-router-dom';
import EditorConfirm from '@/page/clients/components/EditorConfirm';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { editorConfirmState, currentSessionState, supportPanelState } from '@/recoil';
import AiPanelCommon from '@/components/AiPanelCommon';

function PsychologicalTest({ onOpenSurveySendModal, refreshKey, showToastMessage, onSessionMapsUpdate }) {
  const [hasSurveyData, setHasSurveyData] = useState(false); // 심리검사 데이터 유무 (제출 완료 등 실제 데이터 존재)
  const [isAIGenerated, setIsAIGenerated] = useState(false); // AI 종합 의견 생성 여부 (aiOverallInsight 존재 여부)
  // 렌더링 제어 상태
  const [noSet, setNoSet] = useState(false); // 검사세트가 하나도 없는 상태
  const currentSession = useRecoilValue(currentSessionState);
  const [waitingInput, setWaitingInput] = useState(false); // 검사세트는 있으나 제출(submittedTime)이 없는 상태
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [expireTimeText, setExpireTimeText] = useState('');
  const [currentSetSeq, setCurrentSetSeq] = useState(null); // 현재 표시 중인 세트 식별자
  const [currentQuestionType, setCurrentQuestionType] = useState(''); // PRE/PROG/POST
  const [currentSessionNo, setCurrentSessionNo] = useState(null); // PROG인 경우 sessionSeq
  // 현재 화면에 표시 중인 링크의 세트 식별자(대기중 PROG 링크 등). 삭제는 이 값 우선 사용
  const [currentLinkSetSeq, setCurrentLinkSetSeq] = useState(null);
  // 회기 그룹 내 순서 매핑: { [sessionSeq]: order(1~) }
  const [seqToOrder, setSeqToOrder] = useState({});
  const [sessionNoToSeq, setSessionNoToSeq] = useState({});
  const [sessionNosInGroup, setSessionNosInGroup] = useState([]);
  const [aiOverallInsight, setAiOverallInsight] = useState(''); // AI 종합 의견 원문
  const [confirmedInsightText, setConfirmedInsightText] = useState(''); // 서버 저장된 텍스트(통합본)
  const [localRefreshKey, setLocalRefreshKey] = useState(0); // 로컬 재조회 트리거
  const setGlobalEditorConfirm = useSetRecoilState(editorConfirmState);
  const location = useLocation();
  const [showAiSummary, setShowAiSummary] = useState(false);
  const setSupportPanel = useSetRecoilState(supportPanelState);

  // 서버 저장 통합 텍스트 파싱: "\n\n추천 방법\n" 구분자로 분리
  const serverInsightParsed = useMemo(() => {
    if (!confirmedInsightText) return null;
    const DELIM = '\n\n추천 방법\n';
    if (!confirmedInsightText.includes(DELIM)) return null;
    const [answer, feedback] = confirmedInsightText.split(DELIM);
    return { answerText: answer ?? '', feedbackText: feedback ?? '' };
  }, [confirmedInsightText]);

  // AiPanelCommon 열림 상태에 따라 레이아웃 보조 패널 상태 동기화
  useEffect(() => {
    setSupportPanel(showAiSummary);
    return () => {
      // 언마운트 시 보조 패널 닫힘 처리
      setSupportPanel(false);
    };
  }, [showAiSummary, setSupportPanel]);

  // aiOverallInsight 파싱: 문자열/객체 모두 대응
  const aiInsightParsed = useMemo(() => {
    const def = { answerText: '', feedbackText: '' };
    if (!aiOverallInsight) return def;
    let data = aiOverallInsight;
    if (typeof data === 'string') {
      const s = data.trim();
      if (!s) return def;
      try {
        const obj = JSON.parse(s);
        return {
          answerText: obj?.llm_answer ?? '',
          feedbackText: obj?.llm_feedback ?? '',
        };
      } catch {
        // 순수 텍스트로 온 경우 llm_answer로 간주
        return { answerText: s, feedbackText: '' };
      }
    }
    // 객체로 온 경우
    return {
      answerText: data?.llm_answer ?? '',
      feedbackText: data?.llm_feedback ?? '',
    };
  }, [aiOverallInsight]);

  const formatExpire = (s) => {
    if (!s) return '';
    try {
      const d = new Date(s);
      if (isNaN(d.getTime())) return '';
      return format(d, 'yyyy-MM-dd HH:mm');
    } catch {
      return '';
    }
  };


  // 공통 유틸리티 함수들
  const parseTime = (v) => {
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  };

  const getSetSeq = (item) => item?.setSeq ?? item?.assessmentSetSeq ?? item?.id ?? null;

  // 동일 회기 그룹 내에서 가장 최신 항목 선택: submittedTime 최댓값, 없으면 ID 최댓값
  const pickLatestInsightInGroup = (list, groupSeq) => {
    if (!groupSeq) return { aiOverallInsight: '', textOverallInsight: '' };
    const sameGroup = list.filter(it => String(it?.sessiongroupSeq) === String(groupSeq));
    if (sameGroup.length === 0) return { aiOverallInsight: '', textOverallInsight: '' };
    
    const latest = sameGroup.reduce((a, b) => {
      const at = parseTime(a?.submittedTime);
      const bt = parseTime(b?.submittedTime);
      if (at !== bt) return at > bt ? a : b;
      const aId = Number(getSetSeq(a));
      const bId = Number(getSetSeq(b));
      return aId >= bId ? a : b;
    });
    return {
      aiOverallInsight: latest?.aiOverallInsight || '',
      textOverallInsight: latest?.textOverallInsight || '',
    };
  };

  const applyItemToState = (it, meta = {}) => {
    if (!it) {
      setNoSet(true);
      setWaitingInput(false);
      setHasSurveyData(false);
      setExpireTimeText('');
      setGeneratedUrl('');
      setCurrentLinkSetSeq(null);
      setCurrentSetSeq(null);
      setCurrentQuestionType('');
      setCurrentSessionNo(null);
      setIsAIGenerated(false);
      setAiOverallInsight('');
      setConfirmedInsightText('');
      return;
    }
    setNoSet(false);
    setWaitingInput(!!meta.isWaiting);
    setHasSurveyData(!!meta.hasSubmitted);
    setGeneratedUrl(meta.isWaiting && it.assignedUrl ? it.assignedUrl : '');
    setExpireTimeText(meta.isWaiting ? (meta.expireText || '') : '');
    setCurrentSetSeq(getSetSeq(it));
    setCurrentQuestionType(String(it?.questionType || '').toUpperCase());
    setCurrentSessionNo(it?.sessionSeq ?? null);
    setIsAIGenerated(!!it?.aiOverallInsight);
    setAiOverallInsight(it?.aiOverallInsight || '');
    // 서버에서 이미 저장된 통합 텍스트가 있는 경우 보이도록 설정
    setConfirmedInsightText(it?.textOverallInsight || '');
  };

  // 최초 마운트 시: 특정 내담자의 검사세트 전체 목록 조회
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const clientId = query.get('clientId');
    if (!clientId) {
      return;
    }

    // currentSession 로딩 전에는 타 그룹 항목으로 잘못 매칭될 수 있으므로 '반드시' 대기
    const targetGroupSeqEarly = currentSession?.sessiongroupSeq ?? null;
    if (!targetGroupSeqEarly) {
      // 그룹 정보가 없으면 선택 로직 보류 (currentSession 로딩 후 재실행)
      return;
    }

    (async () => {
      try {
        const targetGroupSeq = currentSession?.sessiongroupSeq ?? null;
        // 세션 목록 기반 그룹 내 순서 매핑 구축 (제목 표기용)
        try {
          const sessionsRes = await sessionList(parseInt(clientId, 10));
          const sessions = Array.isArray(sessionsRes?.data) ? sessionsRes.data : sessionsRes?.data?.data || [];
          const sameGroupSessions = sessions.filter(s => String(s?.sessiongroupSeq) === String(targetGroupSeq));
          const sorted = [...sameGroupSessions].sort((a, b) => (a?.sessionNo ?? 0) - (b?.sessionNo ?? 0));
          const _seqToOrder = {};
          const _sessionNoToSeq = {};
          const _sessionNosInGroup = [];
          sorted.forEach((s, idx) => {
            const seq = s?.sessionSeq;
            const no = s?.sessionNo;
            if (seq != null) _seqToOrder[seq] = idx + 1;
            if (no != null && seq != null) _sessionNoToSeq[no] = seq;
            if (no != null) _sessionNosInGroup.push(no);
          });
          setSeqToOrder(_seqToOrder);
          setSessionNoToSeq(_sessionNoToSeq);
          setSessionNosInGroup(_sessionNosInGroup);
          // 부모에 전달 (모달 재사용 목적)
          if (typeof onSessionMapsUpdate === 'function') {
            onSessionMapsUpdate({ seqToOrder: _seqToOrder, sessionNoToSeq: _sessionNoToSeq, sessionNosInGroup: _sessionNosInGroup });
          }
        } catch (e) {
          // 세션 목록 실패는 치명적이지 않으므로 콘솔만
          console.warn('[PsychologicalTest] sessionList 조회 실패 또는 구조 상이', e);
        }

        const res = await assessmentSetList(parseInt(clientId, 10));
        const list = Array.isArray(res?.data) ? res.data : [];

        if (list.length === 0) {
          applyItemToState(null);
          return;
        }

        const groupSeq = targetGroupSeq;
        if (groupSeq == null) {
          applyItemToState(null);
          return;
        }

        const sameGroup = list.filter(it => String(it?.sessiongroupSeq) === String(groupSeq));
        if (sameGroup.length === 0) {
          applyItemToState(null);
          return;
        }

        const submittedItems = sameGroup.filter(it => !!it?.submittedTime);
        const waitingItems = sameGroup.filter(it => Object.prototype.hasOwnProperty.call(it || {}, 'submittedTime') && it.submittedTime === null);

        const latestSubmitted = submittedItems.length > 0
          ? submittedItems.reduce((a, b) => (parseTime(a.submittedTime) >= parseTime(b.submittedTime) ? a : b))
          : null;
        const latestWaiting = waitingItems.length > 0
          ? waitingItems.reduce((a, b) => (parseTime(a.assignedUrlExpireTime) >= parseTime(b.assignedUrlExpireTime) ? a : b))
          : null;

        if (latestSubmitted) {
          // 데이터는 최신 제출 항목으로 표시
          applyItemToState(latestSubmitted, { isWaiting: false, hasSubmitted: true, expireText: '' });
          // 동시에 최신 대기중 링크가 있으면 링크/만료만 세팅
          if (latestWaiting && latestWaiting.assignedUrl) {
            setGeneratedUrl(latestWaiting.assignedUrl);
            setExpireTimeText(formatExpire(latestWaiting.assignedUrlExpireTime));
            // 현재 화면에 보이는 링크의 setSeq는 latestWaiting 기준으로 별도 저장 (삭제시 사용)
            setCurrentLinkSetSeq(getSetSeq(latestWaiting));
            // 대기중 항목이 PROG인 경우, 제목 표시는 PROG 기준으로 덮어써서 렌더링
            if (String(latestWaiting?.questionType || '').toUpperCase() === 'PROG') {
              setCurrentQuestionType('PROG');
              setCurrentSessionNo(latestWaiting?.sessionSeq ?? null);
            }
          } else {
            setGeneratedUrl('');
            setExpireTimeText('');
            setCurrentLinkSetSeq(null);
          }
          // 완료가 있으므로 기다림 화면은 표시하지 않음
          setWaitingInput(false);
          setHasSurveyData(true);
        } else if (latestWaiting) {
          // 완료가 전혀 없고 대기중만 있는 경우
          applyItemToState(latestWaiting, { isWaiting: true, hasSubmitted: false, expireText: formatExpire(latestWaiting.assignedUrlExpireTime) });
          // 이 경우 currentSetSeq 자체가 링크 세트이므로 별도 링크 세트는 비움
          setCurrentLinkSetSeq(null);
        } else {
          applyItemToState(null);
          return;
        }

        // aiOverallInsight/textOverallInsight는 동일 그룹 내 '가장 최신' 항목의 값을 우선 사용
        const latest = pickLatestInsightInGroup(list, groupSeq);
        if (latest) {
          setIsAIGenerated(!!latest.aiOverallInsight);
          setAiOverallInsight(latest.aiOverallInsight || '');
          setConfirmedInsightText(latest.textOverallInsight || '');
        }
      } catch (err) {
        console.error('[PsychologicalTest] assessmentSetList 오류:', err);
        applyItemToState(null);
      }
    })();
  }, [location.search, refreshKey, localRefreshKey, currentSession]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl).then(() => {
      showToastMessage?.('심리 검사지 전송 링크가 복사 되었습니다.');
    });
  };

  const handleRemoveUrl = async () => {
    try {
      // 화면에 표시 중인 링크의 세트 우선, 없으면 현재 세트
      const targetSetSeq = currentLinkSetSeq ?? currentSetSeq;
      if (!targetSetSeq) {
        setGeneratedUrl('');
        setGlobalEditorConfirm(prev => ({
          ...prev,
          open: true,
          title: '알림',
          message: '삭제할 검사 세트가 없습니다.',
          confirmText: '확인',
        }));
        return;
      }

      // 삭제 전 사용자 확인 모달
      setGlobalEditorConfirm(prev => ({
        ...prev,
        open: true,
        title: '삭제 확인',
        message: '검사 세트 링크를 삭제하시겠습니까?',
        confirmText: '삭제',
        cancelText: '취소',
        onConfirm: async () => {
          try {
            await assessmentSetDelete(targetSetSeq);
            setGeneratedUrl('');
            setCurrentLinkSetSeq(null);
            setLocalRefreshKey(k => k + 1); // 삭제 후 목록 재조회
            // 성공 토스트
            showToastMessage?.('검사 세트 링크가 삭제되었습니다.');
          } catch (e) {
            console.error('[PsychologicalTest] assessmentSetDelete 오류:', e);
            showToastMessage?.('삭제 중 오류가 발생했습니다.');
          }
        },
      }));
    } catch (e) {
      console.error('[PsychologicalTest] 삭제 확인 모달 표시 오류:', e);
      setGlobalEditorConfirm(prev => ({
        ...prev,
        open: true,
        title: '오류',
        message: '삭제 확인을 표시하는 중 오류가 발생했습니다.',
        confirmText: '확인',
      }));
    }
  };

  const handleAIGenerate = () => {
    setShowAiSummary(true);
  };

  // 제목: PRE/PROG/POST 맵핑 (PROG는 회기 번호 포함)
  const surveyTitle = useMemo(() => {
    const t = String(currentQuestionType || '').toUpperCase();
    if (t === 'PRE') return '사전 문진 심리 검사지';
    if (t === 'POST') return '사후 문진 심리 검사지';
    if (t === 'PROG') {
      const order = currentSessionNo != null ? seqToOrder[currentSessionNo] : null; // currentSessionNo는 sessionSeq를 담고 있음
      const n = order != null ? `${order}회기 ` : '';
      return `경과 문진, ${n}심리 검사지`;
    }
    return '심리 검사지';
  }, [currentQuestionType, currentSessionNo, seqToOrder]);

  return (
    <div className="inner">
      {/* 빈 상태 분기 */}
      {noSet && (
        <div className="empty-board">
          <img src={emptyFace} alt="empty" />
          <p className="empty-info">아직 생성한 심리 검사지가 없어요.<br />내담자에게 필요한 심리 검사지를 만들어보세요.</p>
          <button className="type05" type="button" onClick={onOpenSurveySendModal}>심리 검사지 생성</button>
        </div>
      )}
      {!noSet && waitingInput && (
        <div className="empty-board">
          <img src={emptyFace} alt="empty" />
          <p className="empty-info">내담자의 심리 검사지 입력을 기다리고 있어요.<br />(링크 만료 : <span className="datetime">{expireTimeText || 'YY-MM-DD HH:MM'}</span>)</p>
          <button className="type05 h44" type="button" onClick={onOpenSurveySendModal}>심리 검사지 생성</button>
          <div className="url-wrap">
            <input className="url-box" name="url-input" type="text" readOnly value={generatedUrl} />
            <button onClick={handleCopyUrl} className="copy-btn" type="button" aria-label="URL "></button>
            <button onClick={handleRemoveUrl} className="remove-btn" type="button" aria-label="URL "></button>
          </div>
        </div>
      )}
      {/* 제출 데이터는 있으나 AI 미생성 */}
      {!noSet && !waitingInput && hasSurveyData && !isAIGenerated && (
        <div className="total-opinion create">
          <div className="tit-wrap">
            <strong>AI 종합 의견</strong>
          </div>
          <div className="create-board">
            <strong>AI가 심리검사 종합 의견을 생성/분석하고 있습니다.</strong>
            <button className="type01 h40" type="button" onClick={handleAIGenerate}>
              <span>AI 생성하기</span>
            </button>
          </div>
        </div>
      )}
      {/* 제출 데이터 존재 + AI 생성 */}
      {!noSet && !waitingInput && hasSurveyData && isAIGenerated && (
        <>
          <div className="total-opinion">
            {/* 신규 생성 링크 없는 경우 / 있는 경우 */}
            {!generatedUrl ? (
              <div className="survey-create">
                <strong>내담자에게 필요한 심리 검사지를 만들어 보세요.</strong>
                <button className="type05 h44" type="button" onClick={onOpenSurveySendModal}>심리 검사지 생성</button>
              </div>
            ) : (
              <div className="survey-create type01">
                <div className="txt-wrap">
                  <strong>{surveyTitle}</strong>
                  <p>만료 <span className="datetime">{expireTimeText}</span></p>
                </div>
                <div className="url-wrap">
                  <input className="url-box" name="url-input" type="text" readOnly value={generatedUrl} />
                  <button onClick={handleCopyUrl} className="copy-btn" type="button" aria-label="URL 복사"></button>
                  <button onClick={handleRemoveUrl} className="remove-btn" type="button" aria-label="URL 삭제"></button>
                </div>
              </div>
            )}
            <div className="tit-wrap">
              <strong>AI 종합 의견</strong>
            </div>
            {!confirmedInsightText && (
              <div className="create-board">
                <strong>AI가 실시된 심리검사 종합 의견을 생성할 준비가 되었습니다.</strong>
                <button className="type01 h40" type="button" onClick={handleAIGenerate}>
                  <span>AI 생성하기</span>
                </button>
              </div>
            )}
            {confirmedInsightText && (
              <div className="txt-box">
                {serverInsightParsed ? (
                  <>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{serverInsightParsed.answerText}</div>
                    <br />
                    <strong>추천 방법</strong>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{serverInsightParsed.feedbackText}</div>
                  </>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{confirmedInsightText}</div>
                )}
              </div>
            )}
          </div>
          <SymptomChangePanel onOpenSurveySendModal={onOpenSurveySendModal} />
        </>
      )}
      {/* AI 종합 의견 생성 패널 UI (로컬 관리) */}
      <AiPanelCommon
        isRecordings={true}
        open={showAiSummary}
        onClose={() => setShowAiSummary(false)}
        onConfirm={async () => {
          const answer = aiInsightParsed.answerText || '';
          const feedback = aiInsightParsed.feedbackText || '';
          const combined = feedback
            ? `${answer}\n\n추천 방법\n${feedback}`
            : `${answer}`;
          try {
            if (currentSetSeq) {
              await assessmentSetUpdateOverallInsight({ setSeq: currentSetSeq, textOverallInsight: combined });
            }
            setConfirmedInsightText(combined);
            showToastMessage?.('AI 종합 의견이 확정되었습니다.');
            setShowAiSummary(false);
          } catch (e) {
            console.error('[PsychologicalTest] overallInsight 저장 실패:', e);
            showToastMessage?.('저장 중 오류가 발생했습니다.');
          }
        }}
        status="complete"
        title="AI 종합 의견 생성"
        description="AI가 심리 검사 종합 의견을 생성합니다."
        infoMessage="AI 종합 의견이 생성 완료되었습니다."
        keyInfo
        keyInfoText="재생성된 내용을 확정하면 원래의 내용은 사라지고<br />다시 복구할 수 없어요."
        renderComplete={() => (
          <>
            <div className="complete-cont">
              {aiInsightParsed.answerText ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{aiInsightParsed.answerText}</div>
              ) : (
                <div>AI 종합 의견이 없습니다.</div>
              )}
              {aiInsightParsed.feedbackText && (
                <>
                  <br />
                  <strong style={{ fontWeight: 'bold', color: '#000' }}>추천 방법</strong>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{aiInsightParsed.feedbackText}</div>
                </>
              )}
            </div>
          </>
        )}
      />
    </div>
  );
}

export default PsychologicalTest;
