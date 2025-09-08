import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assessmentSetList, assessmentSetResult, sessionFind, sessionList, clientFind } from '@/api/apiCaller';

function SessionAssessmentsDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]); // 각 검사지 카드 데이터 배열
  const [headerInfo, setHeaderInfo] = useState({
    clientName: '',
    phone: '',
    gender: '',
    birthDate: '',
    age: null,
    sessionLabel: '',
    sessionDate: ''
  });

  const formatDateDot = (s) => {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${dd}`;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    try {
      const title = headerInfo.sessionLabel
        ? `${headerInfo.sessionLabel} 검사 결과`
        : '세션 통합 검사 결과';
      window.dispatchEvent(new CustomEvent('page-title', { detail: { title } }));
    } catch {}
  }, [headerInfo.sessionLabel]);

  // 이 화면에서만 strong의 ::before 숨김 처리용 스타일 주입
  useEffect(() => {
    const styleId = 'session-assessments-no-before-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `.no-before::before { display: none !important; }`;
      document.head.appendChild(style);
    }
  }, []);

  const formatBirth = (yyyymmdd) => {
    if (!yyyymmdd || yyyymmdd.length !== 8) return '';
    return `${yyyymmdd.slice(0,4)}.${yyyymmdd.slice(4,6)}.${yyyymmdd.slice(6,8)}`;
  };

  const calcAge = (yyyymmdd) => {
    if (!yyyymmdd || yyyymmdd.length !== 8) return null;
    const y = Number(yyyymmdd.slice(0,4));
    const m = Number(yyyymmdd.slice(4,6));
    const d = Number(yyyymmdd.slice(6,8));
    if (!y || !m || !d) return null;
    const today = new Date();
    let age = today.getFullYear() - y;
    const mm = today.getMonth() + 1;
    const dd = today.getDate();
    if (mm < m || (mm === m && dd < d)) age -= 1;
    return age >= 0 ? age : null;
  };

  const genderToKorean = (g) => {
    const s = String(g || '').toUpperCase();
    if (s === 'M') return '남';
    if (s === 'F') return '여';
    return s || '';
  };

  const severityClass = (level) => {
    const map = {
      0: 'level-low',
      1: 'level-mid',
      2: 'level-high'
    };
    if (typeof level === 'string') return level; // 이미 class 문자열이면 그대로 사용
    return map[level] || '';
  };

  const inferQuestionType = (question, info) => {
    const a = info || {};
    if (a?.basicFlag === true) return 'default';
    if (a?.basicFlag === false) {
      const hasSubItemPattern = /[A-Z]\.\s/.test(question?.questionText || '');
      if (hasSubItemPattern) return 'type01';
      return 'type02';
    }
    return 'default';
  };

  const renderDefaultQuestion = (question, index, ns = '') => (
    <li key={`${ns}${question.questionSeq}`}>
      <p className="question">{index + 1}. {question.questionText}</p>
      <div className="answer">
        <ul>
          {question.questionitems.map((item, itemIndex) => (
            <li key={item.questionItemSeq || itemIndex}>
              <div className="input-wrap radio type01" style={{ cursor: 'default' }}>
                <input
                  id={`answer${ns}${itemIndex + 1}_q${question.questionSeq}`}
                  type="radio"
                  name={`question${ns}${question.questionSeq}`}
                  checked={Number(question.selectedScore) === Number(item.itemScore)}
                  readOnly
                />
                <label htmlFor={`answer${ns}${itemIndex + 1}_q${question.questionSeq}`} style={{ cursor: 'default' }}>{item.itemScore}</label>
              </div>
              <span>{item.itemText}</span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );

  const renderType01Question = (question, index, ns = '') => {
    const match = (question.questionText || '').match(/^(.+?)\s+([A-Z])\.\s(.+)$/);
    if (match) {
      const [, mainTitle, subItemLabel, subItemText] = match;
      return (
        <li key={`${ns}${question.questionSeq}`} className="template01">
          {subItemLabel === 'A' && (
            <p className="question">{index + 1}. {mainTitle}</p>
          )}
          <div className="answer-wrap">
            <div className="answer">
              <p className="sub-question">{subItemLabel}. {subItemText}</p>
              <ul>
                {question.questionitems.map((item, itemIndex) => (
                  <li key={item.questionItemSeq || itemIndex}>
                    <div className="input-wrap radio type01" style={{ cursor: 'default' }}>
                      <input
                        id={`answer${ns}${itemIndex + 1}_q${question.questionSeq}`}
                        type="radio"
                        name={`question${ns}${question.questionSeq}`}
                        checked={Number(question.selectedScore) === Number(item.itemScore)}
                        readOnly
                      />
                      <label htmlFor={`answer${ns}${itemIndex + 1}_q${question.questionSeq}`} style={{ cursor: 'default' }}>{item.itemScore}</label>
                    </div>
                    <span>{item.itemText}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </li>
      );
    }
    return renderDefaultQuestion(question, index, ns);
  };

  const renderType02Question = (question, index, ns = '') => (
    <li key={`${ns}${question.questionSeq}`} className="template02">
      <p className="question">{index + 1}. {question.questionText}</p>
      <div className="answer">
        <ul>
          {question.questionitems.map((item, itemIndex) => (
            <li key={item.questionItemSeq || itemIndex}>
              <div className="input-wrap radio type01" style={{ cursor: 'default' }}>
                <input
                  id={`answer${ns}${itemIndex + 1}_q${question.questionSeq}`}
                  type="radio"
                  name={`question${ns}${question.questionSeq}`}
                  checked={Number(question.selectedScore) === Number(item.itemScore)}
                  readOnly
                />
                <label htmlFor={`answer${ns}${itemIndex + 1}_q${question.questionSeq}`} style={{ cursor: 'default' }}>{item.itemScore}</label>
              </div>
              <span>{item.itemText}</span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );

  const renderQuestion = (question, index, ns = '', info) => {
    const type = inferQuestionType(question, info);
    switch (type) {
      case 'type01':
        return renderType01Question(question, index, ns);
      case 'type02':
        return renderType02Question(question, index, ns);
      case 'default':
      default:
        return renderDefaultQuestion(question, index, ns);
    }
  };

  const handleBack = () => {
    const clientId = searchParams.get('clientId');
    const returnTab = searchParams.get('returnTab') || 'document';
    const scrollY = searchParams.get('scrollY');
    const backQuery = new URLSearchParams();
    if (clientId) backQuery.set('clientId', clientId);
    backQuery.set('tab', returnTab);
    if (scrollY) backQuery.set('restoreScrollY', scrollY);
    navigate(`/clients/consults?${backQuery.toString()}`, { replace: true });
  };

  useEffect(() => {
    const clientId = searchParams.get('clientId');
    const sessionSeqParam = searchParams.get('sessionSeq');
    if (!clientId || !sessionSeqParam) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const clientSeqNum = parseInt(clientId, 10);
        const sessionSeqNum = parseInt(sessionSeqParam, 10);

        // 1) 클라이언트 기본 정보
        try {
          const cf = await clientFind({ clientSeq: clientSeqNum });
          const c = cf?.data || cf || {};
          const age = calcAge(c?.birthDate);
          setHeaderInfo(prev => ({
            ...prev,
            clientName: c?.clientName || '',
            phone: c?.contactNumber || '',
            gender: genderToKorean(c?.gender),
            birthDate: formatBirth(c?.birthDate),
            age
          }));
        } catch {}

        // 2) 세션 라벨/일자
        try {
          const sf = await sessionFind(clientSeqNum, sessionSeqNum);
          const s = sf?.data || {};
          const qt = String(s?.questionType || '').toUpperCase();
          let sessionLabel = '';
          if (qt === 'PRE') sessionLabel = '사전 문진';
          else if (qt === 'POST') sessionLabel = '사후 문진';
          else if (Number.isFinite(Number(s?.sessionNo))) sessionLabel = `${s.sessionNo}회기`;
          const sessionDate = formatDateDot(s?.sessionDate || s?.createdTime);
          setHeaderInfo(prev => ({ ...prev, sessionLabel, sessionDate }));
        } catch {}

        // 3) 검사세트 목록 중 해당 세션의 제출 완료 세트만 필터링
        const as = await assessmentSetList(clientSeqNum);
        const allSets = Array.isArray(as?.data) ? as.data : [];
        const setsForSession = allSets.filter(it => String(it?.sessionSeq) === String(sessionSeqNum) && !!it?.submittedTime);
        if (setsForSession.length === 0) {
          setCards([]);
          return;
        }

        // 4) 각 세트 상세 결과 조회 후 카드로 변환
        const detailed = await Promise.all(
          setsForSession.map(async (s) => {
            try {
              const res = await assessmentSetResult(s?.setSeq ?? s?.assessmentSetSeq ?? s?.id);
              const payload = res?.data ?? {};
              const itemList = Array.isArray(payload?.itemList)
                ? payload.itemList
                : (Array.isArray(payload?.data?.itemList) ? payload.data.itemList : []);
              // 카드 헤더용 텍스트
              const title = s?.title || itemList?.[0]?.assessmentInfo?.assessmentName || '검사 결과';
              return { ...s, itemList, cardTitle: title };
            } catch {
              return { ...s, itemList: [], cardTitle: '검사 결과' };
            }
          })
        );

        // 5) 렌더용 카드 데이터 구성
        const cardsData = detailed.map(set => {
          // 각 세트에서 대표 아이템(첫 번째)로 요약 구성, 모든 아이템을 질문표로 렌더
          const first = set.itemList?.[0];
          const score = first?.totalScore != null ? `${first.totalScore}점` : '';
          const severity = first?.severityTitle || '';
          const sevClass = severityClass(first?.severityLevel);
          const summaryDesc = first?.summaryTitle || '';
          const questions = [];
          (set.itemList || []).forEach((it) => {
            const qList = Array.isArray(it?.questionList)
              ? it.questionList
              : (Array.isArray(it?.assessmentInfo?.questions) ? it.assessmentInfo.questions : []);
            const mapped = qList.map((q, idx) => {
              const questionSeq = q?.questionSeq ?? q?.id ?? (idx + 1);
              const questionText = q?.questionText || q?.question || q?.title || '';
              const items = Array.isArray(q?.questionitems)
                ? q.questionitems
                : (Array.isArray(q?.options) ? q.options.map(op => ({ questionItemSeq: op.id ?? op.seq, itemScore: op.score ?? op.value, itemText: op.label ?? op.text }))
                    : (Array.isArray(q?.answerList) ? q.answerList.map(op => ({ questionItemSeq: op.id ?? op.seq, itemScore: op.score ?? op.value, itemText: op.label ?? op.text })) : []));
              // 선택값 추론
              let selectedScore = q?.selectedScore ?? q?.score ?? null;
              if (selectedScore == null && q?.answerQuestionitemSeq != null) {
                const m = items.find(it => String(it.questionItemSeq) === String(q.answerQuestionitemSeq));
                if (m && m.itemScore != null) selectedScore = m.itemScore;
              }
              if (selectedScore == null) {
                const answerItemSeq = q?.answerItemSeq ?? q?.selectedItemSeq;
                if (answerItemSeq != null) {
                  const m = items.find(it => String(it.questionItemSeq) === String(answerItemSeq));
                  if (m && m.itemScore != null) selectedScore = m.itemScore;
                }
              }
              if (selectedScore == null) {
                const chosen = items.find(it => it?.selected === true || it?.isSelected === true || it?.checked === true);
                if (chosen && chosen.itemScore != null) selectedScore = chosen.itemScore;
              }
              return { questionSeq, questionText, questionitems: items, selectedScore };
            });
            questions.push({
              assessmentName: String(it?.assessmentInfo?.assessmentName || ''),
              associatedDisorder: it?.assessmentInfo?.associatedDisorder || '',
              clientNotice: it?.assessmentInfo?.clientNotice || '',
              questionList: mapped
            });
          });
          return {
            key: set.setSeq,
            title: set.cardTitle,
            score,
            severity,
            severityClass: sevClass,
            summaryDesc,
            submittedTime: set.submittedTime,
            questions
          };
        });

        setCards(cardsData);
      } catch (e) {
        console.error('[SessionAssessmentsDetail] 로딩 실패:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  return (
    <div className="inner">
      <div className="title-wrap">
        <button 
            className="back-btn" 
            type="button" 
            aria-label="뒤로가기"
            onClick={handleBack}
        ></button>
        <strong>{headerInfo.sessionLabel} 검사 결과 ({headerInfo.sessionDate})</strong>
      </div>

      <div className="info-bar">
        <strong>{headerInfo.clientName}</strong>
        <ul>
          <li>
            <span>연락처</span>
            <span>{headerInfo.phone}</span>
          </li>
          <li>
            <span>성별</span>
            <span>{headerInfo.gender}</span>
          </li>
          <li>
            <span>생년월일</span>
            <span>{headerInfo.birthDate}{headerInfo.age != null ? ` (만 ${headerInfo.age}세)` : ''}</span>
          </li>
        </ul>
      </div>

      <div className="con-wrap">
        {loading && (
          <div className="con-wrap empty"><p className="empty-info">불러오는 중...</p></div>
        )}
        {!loading && cards.length === 0 && (
          <div className="con-wrap empty"><p className="empty-info">표시할 검사 결과가 없습니다.</p></div>
        )}

        {!loading && cards.length > 0 && (
          <div className="con-wrap">
            {cards.map(card => (
              <div key={card.key} className="overview">
                {card.questions.map((qset, idx) => (
                  <div key={`${card.key}-${idx}`} className="survey-list" style={{paddingBottom: '4em', marginBottom: '4em', borderBottom: '1px solid #d4d4d4'}}>
                    <div className="top-info" style={{marginBottom: '1.6rem'}}>
                      <strong>{qset.assessmentName}</strong>
                      <strong>{qset.associatedDisorder}</strong>
                    </div>
                    <div className="tb-wrap" style={{marginBottom: '8rem'}}>
                      <table>
                        <caption>결과요약</caption>
                        <colgroup>
                        <col style={{ width: '120px' }} />
                        <col style={{ width: '120px' }} />
                        <col style={{ width: 'calc(100% - 240px)' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th>점수</th>
                          <th>심각도</th>
                          <th>결과요약</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{card.score}</td>
                          <td className={card.severityClass}>{card.severity}</td>
                          <td>{card.summaryDesc}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* list-wrap 바로 위 위치: 제목 + 설명 (PsychologicalTestDetail과 동일한 형태) */}
                  <div className="top-info" style={{display: 'block'}}>
                    <strong className="no-before">검사 문항 반응</strong>
                    <p>{qset.clientNotice || '지난 2주간, 다음과 같은 문제를 얼마나 자주 겪었는지 해당되는 곳에 응답하여 주십시오.'}</p>
                  </div>
                  <div className="list-wrap">
                    <ul>
                      {qset.questionList && qset.questionList.length > 0 ? (
                        qset.questionList.map((q, i) => renderQuestion(q, i, `${card.key}_${idx}_`))
                      ) : (
                          <li>표시할 문항이 없습니다.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionAssessmentsDetail;
