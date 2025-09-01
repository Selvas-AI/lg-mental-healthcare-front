import React, { useEffect, useState } from 'react';
import emptyFace from '@/assets/images/common/empty_face.svg';
import SymptomChangePanel from './components/SymptomChangePanel';
import { assessmentSetList, assessmentList, assessmentSetDelete } from '@/api/apiCaller';
import { useLocation } from 'react-router-dom';
import EditorConfirm from '@/page/clients/components/EditorConfirm';
import { useSetRecoilState } from 'recoil';
import { editorConfirmState } from '@/recoil';

function PsychologicalTest({ onOpenSurveySendModal, setShowAiSummary, setSupportPanel, refreshKey, showToastMessage }) {
  const [hasSurveyData, setHasSurveyData] = useState(false); // 심리검사 데이터 유무 (제출 완료 등 실제 데이터 존재)
  const [isAIGenerated] = useState(true); // AI 종합 의견 생성 여부
  // 렌더링 제어 상태
  const [noSet, setNoSet] = useState(false); // 검사세트가 하나도 없는 상태
  const [waitingInput, setWaitingInput] = useState(false); // 검사세트는 있으나 제출(submittedTime)이 없는 상태
  const [generatedUrl, setGeneratedUrl] = useState('http://localhost:5173/client-survey');
  const [expireTimeText, setExpireTimeText] = useState('');
  const [currentSetSeq, setCurrentSetSeq] = useState(null); // 현재 표시 중인 세트 식별자
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('확인');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [localRefreshKey, setLocalRefreshKey] = useState(0); // 로컬 재조회 트리거
  const setGlobalEditorConfirm = useSetRecoilState(editorConfirmState);
  const location = useLocation();

  // 최초 마운트 시: 검사 목록 조회
  useEffect(() => {
    (async () => {
      try {
        const res = await assessmentList();
        // console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);
  // 최초 마운트 시: 특정 내담자의 검사세트 전체 목록 조회
  useEffect(() => {

    const query = new URLSearchParams(location.search);
    const clientId = query.get('clientId');
    const sessionSeq = query.get('sessionSeq');
    if (!clientId) {
      return;
    }

    (async () => {
      try {
        const res = await assessmentSetList(parseInt(clientId, 10));
        // 다양한 응답 형태에 대응 (루트 배열, data, data.data)
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : [];

        // 리스트 자체가 비었으면 '없음'
        if (list.length === 0) {
          setNoSet(true);
          setWaitingInput(false);
          setHasSurveyData(false);
          setExpireTimeText('');
          return;
        }

        // submittedTime 필드 존재 여부 판단
        const hasSubmittedField = list.some(item => Object.prototype.hasOwnProperty.call(item || {}, 'submittedTime'));

        // 어떤 항목에도 submittedTime 필드가 없으면 '없음'으로 간주
        if (!hasSubmittedField) {
          setNoSet(true);
          setWaitingInput(false);
          setHasSurveyData(false);
          setExpireTimeText('');
          return;
        }

        // 최소 1개 이상의 세트 존재하고, submittedTime 필드는 존재함
        setNoSet(false);

        // 간단한 포맷터: 'YYYY-MM-DD HH:MM:SS' 또는 유사 문자열을 'YYYY-MM-DD HH:MM'로 절단
        const formatExpire = (s) => {
          if (!s || typeof s !== 'string') return '';
          const t = s.replace('T', ' ').trim();
          return t.slice(0, 16);
        };

        // URL의 sessionSeq와 매칭되는 항목 우선 사용
        const match = sessionSeq
          ? list.find(item => String(item?.sessionSeq) === String(sessionSeq))
          : null;

        if (match && Object.prototype.hasOwnProperty.call(match, 'submittedTime')) {
          const isWaiting = match.submittedTime === null;
          const hasSubmitted = !!match.submittedTime; // 값이 존재(문자열/시간)하면 true
          setWaitingInput(isWaiting);
          setHasSurveyData(hasSubmitted);

          if (isWaiting && match?.assignedUrl) {
            setGeneratedUrl(match.assignedUrl);
          }
          // 만료시각 매핑
          if (isWaiting && match?.assignedUrlExpireTime) {
            setExpireTimeText(formatExpire(match.assignedUrlExpireTime));
          } else {
            setExpireTimeText('');
          }
          // 세트 식별자 저장
          setCurrentSetSeq(match?.setSeq ?? match?.assessmentSetSeq ?? match?.id ?? null);
        } else {
          // 특례: 데이터가 1개이고 PRE인 경우 그 항목을 사용
          if (list.length === 1 && String(list[0]?.questionType).toUpperCase() === 'PRE') {
            const it = list[0] || {};
            const isWaiting = Object.prototype.hasOwnProperty.call(it, 'submittedTime') && it.submittedTime === null;
            const hasSubmitted = !!it.submittedTime;
            setWaitingInput(isWaiting);
            setHasSurveyData(hasSubmitted);
            if (isWaiting && it.assignedUrl) setGeneratedUrl(it.assignedUrl);
            if (isWaiting && it.assignedUrlExpireTime) setExpireTimeText(formatExpire(it.assignedUrlExpireTime)); else setExpireTimeText('');
            setCurrentSetSeq(it?.setSeq ?? it?.assessmentSetSeq ?? it?.id ?? null);
          } else {
            // 폴백: 전체 집계로 상태 결정 (대기 항목 우선)
            const waitingItem = list.find(item => Object.prototype.hasOwnProperty.call(item || {}, 'submittedTime') && item.submittedTime === null);
            const hasWaiting = !!waitingItem;
            setWaitingInput(hasWaiting);

            const hasSubmitted = list.some(item => Object.prototype.hasOwnProperty.call(item || {}, 'submittedTime') && !!item.submittedTime);
            setHasSurveyData(hasSubmitted);

            if (hasWaiting && waitingItem?.assignedUrl) {
              setGeneratedUrl(waitingItem.assignedUrl);
            }
            if (hasWaiting && waitingItem?.assignedUrlExpireTime) {
              setExpireTimeText(formatExpire(waitingItem.assignedUrlExpireTime));
            } else {
              setExpireTimeText('');
            }
            setCurrentSetSeq(waitingItem ? (waitingItem?.setSeq ?? waitingItem?.assessmentSetSeq ?? waitingItem?.id ?? null) : null);
          }
        }
      } catch (err) {
        console.error('[PsychologicalTest] assessmentSetList 오류:', err);
        // 오류 시 보수적으로 빈 상태 처리
        setNoSet(true);
        setWaitingInput(false);
        setHasSurveyData(false);
        setExpireTimeText('');
        setCurrentSetSeq(null);
      }
    })();
  }, [location.search, refreshKey, localRefreshKey]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl).then(() => {
      if (typeof showToastMessage === 'function') {
        showToastMessage('심리 검사지 전송 링크가 복사 되었습니다.');
      }
    });
  };

  const handleRemoveUrl = async () => {
    try {
      if (!currentSetSeq) {
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
            await assessmentSetDelete(currentSetSeq);
            setGeneratedUrl('');
            setLocalRefreshKey(k => k + 1); // 삭제 후 목록 재조회
            // 성공 토스트
            if (typeof showToastMessage === 'function') {
              showToastMessage('검사 세트 링크가 삭제되었습니다.');
            }
          } catch (e) {
            console.error('[PsychologicalTest] assessmentSetDelete 오류:', e);
            if (typeof showToastMessage === 'function') {
              showToastMessage('삭제 중 오류가 발생했습니다.');
            }
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
    if (setShowAiSummary && setSupportPanel) {
      setShowAiSummary(true);
      setSupportPanel(true);
    }
  };

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
            <strong>AI가 실시된 심리검사 종합 의견을 생성할 준비가 되었습니다.</strong>
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
                  <strong>경과 문진, 1회기 심리 검사지</strong>
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
              <button className="type01 h40" type="button" onClick={handleAIGenerate}>
                <span>AI 생성하기</span>
              </button>
            </div>
            <div className="txt-box">
              <div>지난 1,2 회기 보다 우울 점수가 올라 상담사의 주의 깊은 관심이 필요합니다. 7회기 문항 [Q. 죽음에 대해 생각해 보신 적이 있습니까?] 에서 5점을 선택했기 때문에 ‘자살’과 관련된 적극적인 개입이 필요합니다.</div>
              <br />
              <strong>추천방법</strong>
              <div className="bullet-line">증상이 심화되지 않도록 마음 챙김 훈련이 필요</div>
              <div className="bullet-line">작은 목표를 정하여 성취하는 것이 중요(예를 들어 하루에 10분 산책, 간단한 집안일 완수 등)</div>
              <div className="bullet-line">규칙적인 생활습관을 권장하며, 수면,식사, 운동과 관련된 구체적인 습관을 가지기</div>
            </div>
          </div>
          <SymptomChangePanel onOpenSurveySendModal={onOpenSurveySendModal} />
        </>
      )}
      <EditorConfirm
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="확인"
        onConfirm={() => setConfirmOpen(false)}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default PsychologicalTest;
