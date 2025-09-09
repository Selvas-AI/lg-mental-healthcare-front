import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { assessmentSetList, assessmentSetResult, sessionList, sessionFind, clientFind } from '@/api/apiCaller';

const PsychologicalTestDetail = ({ 
    testTitle: initTitle = "PHQ-9 우울 검사 결과",
    clientInfo: initClientInfo = {
        name: "",
        phone: "",
        gender: "",
        birthDate: ""
    },
    sessionInfo: initSessionInfo = {
        session: "",
        date: ""
    },
    resultSummary: initResultSummary = {
        score: "",
        severity: "",
        severityLevel: "",
        description: ""
    },
    surveyInfo: initSurveyInfo = {
        title: "검사 문항 반응",
        description: "지난 2주간, 다음과 같은 문제를 얼마나 자주 겪었는지 해당되는 곳에 응답하여 주십시오."
    },
    questions: initQuestions = [],
    onBackClick
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [hasRealData, setHasRealData] = useState(false);

    const [title, setTitle] = useState(initTitle);
    const [clientInfo, setClientInfo] = useState(initClientInfo);
    const [sessionInfo, setSessionInfo] = useState(initSessionInfo);
    const [resultSummary, setResultSummary] = useState(initResultSummary);
    const [surveyInfo, setSurveyInfo] = useState(initSurveyInfo);
    const [questions, setQuestions] = useState(initQuestions);
    const [assessmentInfo, setAssessmentInfo] = useState(null);
    const [clientAge, setClientAge] = useState(null);

    const severityClass = (level) => {
        const map = {
            0: 'level-low',
            1: 'level-mid',
            2: 'level-high'
        };
        if (typeof level === 'string') return level; // 이미 class 문자열이면 그대로 사용
        return map[level] || '';
    };

    const formatDateDot = (s) => {
        if (!s) return '';
        const d = new Date(s);
        if (isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}.${m}.${dd}`;
    };

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

    useEffect(() => {
        // 즉시 상단으로 이동 (smooth 애니메이션 무시)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);
    
    const handleBackClick = () => {
        if (onBackClick) {
            onBackClick();
        } else {
            // 브라우저 뒤로가기와 동일하게 동작 (히스토리로 복귀)
            navigate(-1);
        }
    };

    useEffect(() => {
        const clientId = searchParams.get('clientId');
        const sessionSeqParam = searchParams.get('sessionSeq');
        const sessionNoParam = searchParams.get('sessionNo');
        const sessiongroupSeqParam = searchParams.get('sessiongroupSeq');
        const assessmentName = searchParams.get('assessmentName');
        if (!clientId || !assessmentName) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                // 1) 클라이언트 정보
                try {
                    const cf = await clientFind({ clientSeq: parseInt(clientId, 10) });
                    const c = cf?.data || cf || {};
                    setClientInfo({
                        name: c?.clientName || '',
                        phone: c?.contactNumber || '',
                        gender: genderToKorean(c?.gender),
                        birthDate: formatBirth(c?.birthDate)
                    });
                    const age = calcAge(c?.birthDate);
                    setClientAge(age);
                } catch {}

                // 2) 세션 매핑 (sessionSeq 결정 및 회기/날짜 텍스트 구성)
                let targetSessionSeq = sessionSeqParam ? parseInt(sessionSeqParam, 10) : null;
                let sessionLabel = '';
                let sessionDateText = '';

                try {
                    if (!targetSessionSeq) {
                        const sl = await sessionList(parseInt(clientId, 10));
                        const sessions = Array.isArray(sl?.data) ? sl.data : sl?.data?.data || [];
                        const sameGroup = sessiongroupSeqParam
                          ? sessions.filter(s => String(s?.sessiongroupSeq) === String(sessiongroupSeqParam))
                          : sessions;
                        const targetNo = sessionNoParam ? parseInt(sessionNoParam, 10) : null;
                        const foundByNo = targetNo != null ? sameGroup.find(s => Number(s?.sessionNo) === targetNo) : null;
                        if (foundByNo?.sessionSeq) targetSessionSeq = foundByNo.sessionSeq;
                    }
                    if (targetSessionSeq) {
                        const sf = await sessionFind(parseInt(clientId, 10), parseInt(targetSessionSeq, 10));
                        const s = sf?.data || {};
                        const qt = String(s?.questionType || '').toUpperCase();
                        if (qt === 'PRE') sessionLabel = '사전 문진';
                        else if (qt === 'POST') sessionLabel = '사후 문진';
                        else if (Number.isFinite(Number(s?.sessionNo))) sessionLabel = `${s.sessionNo}회기`;
                        sessionDateText = formatDateDot(s?.sessionDate || s?.createdTime);
                    }
                    setSessionInfo({ session: sessionLabel, date: sessionDateText });
                } catch {}

                // 3) 검사세트 목록 -> 동일 그룹 내 최신 제출 항목들 조회
                const as = await assessmentSetList(parseInt(clientId, 10));
                const sets = Array.isArray(as?.data) ? as.data : [];
                const groupFiltered = sessiongroupSeqParam
                    ? sets.filter(it => String(it?.sessiongroupSeq) === String(sessiongroupSeqParam))
                    : sets;
                const submitted = groupFiltered.filter(it => !!it?.submittedTime);
                if (submitted.length === 0) {
                    setLoading(false);
                    return;
                }

                // 4) 상세 결과 병렬 조회 후, 목표 assessmentName의 item 찾기
                const withItems = await Promise.all(
                    submitted.map(async (s) => {
                        try {
                            const res = await assessmentSetResult(s?.setSeq ?? s?.assessmentSetSeq ?? s?.id);
                            const payload = res?.data ?? {};
                            const itemList = Array.isArray(payload?.itemList)
                                ? payload.itemList
                                : (Array.isArray(payload?.data?.itemList) ? payload.data.itemList : []);
                            const qType = payload?.questionType || payload?.data?.questionType || s?.questionType;
                            return { ...s, itemList, questionType: qType };
                        } catch {
                            return { ...s, itemList: [] };
                        }
                    })
                );

                // 우선순위: sessionSeq가 지정되어 있으면 그 세트에서 찾고, 없으면 최신 제출 순으로 탐색
                const sortedByTime = [...withItems].sort((a, b) => new Date(b.submittedTime) - new Date(a.submittedTime));
                let candidateSets = targetSessionSeq
                    ? sortedByTime.filter(s => String(s?.sessionSeq) === String(targetSessionSeq))
                    : sortedByTime;
                // sessionSeq가 없으면 URL의 questionType을 우선 반영 (POST 상세 진입 시 POST를 우선 선택)
                if (!targetSessionSeq) {
                    const qtParam = String(searchParams.get('questionType') || '').toUpperCase();
                    if (qtParam === 'PRE' || qtParam === 'POST' || qtParam === 'PROG') {
                        const filtered = candidateSets.filter(s => String(s?.questionType || '').toUpperCase() === qtParam);
                        if (filtered.length > 0) {
                            candidateSets = filtered;
                        }
                    } else {
                        // 파라미터가 없으면 기존 PRE 우선, 없으면 POST 우선
                        const pre = candidateSets.filter(s => String(s?.questionType || '').toUpperCase() === 'PRE');
                        const post = candidateSets.filter(s => String(s?.questionType || '').toUpperCase() === 'POST');
                        if (pre.length > 0) candidateSets = pre;
                        else if (post.length > 0) candidateSets = post;
                    }
                }

                let targetItem = null;
                let targetSet = null;
                for (const s of candidateSets) {
                    const it = (s.itemList || []).find(x => String(x?.assessmentInfo?.assessmentName || '') === String(assessmentName));
                    if (it) { targetItem = it; targetSet = s; break; }
                }
                if (!targetItem) {
                    setLoading(false);
                    return;
                }

                // 4-1) 사전/사후 문진 등 회기/날짜 보정 (sessionSeq가 없어 sessionFind를 못한 경우)
                setSessionInfo(prev => {
                    let session = prev.session;
                    let date = prev.date;
                    if (!session) {
                        const qt = String(targetSet?.questionType || '').toUpperCase();
                        if (qt === 'PRE') session = '사전 문진';
                        else if (qt === 'POST') session = '사후 문진';
                    }
                    if (!date) {
                        date = formatDateDot(targetSet?.submittedTime || targetSet?.assignedTime);
                    }
                    return { session, date };
                });

                // 5) 헤더 타이틀/요약 세팅 및 설명
                const disorderRaw = targetItem?.assessmentInfo?.associatedDisorder || '';
                setTitle(`${assessmentName}${disorderRaw ? ` ${disorderRaw}` : ''} 검사 결과`);
                const sevLevel = targetItem?.severityLevel;
                setResultSummary({
                    score: (targetItem?.totalScore != null ? `${targetItem.totalScore}점` : ''),
                    severity: targetItem?.severityTitle || '',
                    severityLevel: severityClass(sevLevel),
                    description: targetItem?.summaryTitle || ''
                });
                const notice = targetItem?.assessmentInfo?.clientNotice || '';
                setAssessmentInfo(targetItem?.assessmentInfo || null);
                setSurveyInfo(prev => ({ ...prev, description: notice }));

                // 6) 질문 매핑 (questionitems 기반, SurveyForm 참고)
                const mappedQuestions = [];
                const qList = Array.isArray(targetItem?.questionList)
                    ? targetItem.questionList
                    : (Array.isArray(targetItem?.assessmentInfo?.questions) ? targetItem.assessmentInfo.questions : []);
                qList.forEach((q, idx) => {
                    const questionSeq = q?.questionSeq ?? q?.id ?? (idx + 1);
                    const questionText = q?.questionText || q?.question || q?.title || '';
                    const items = Array.isArray(q?.questionitems)
                        ? q.questionitems
                        : (Array.isArray(q?.options) ? q.options.map(op => ({ questionItemSeq: op.id ?? op.seq, itemScore: op.score ?? op.value, itemText: op.label ?? op.text }))
                            : (Array.isArray(q?.answerList) ? q.answerList.map(op => ({ questionItemSeq: op.id ?? op.seq, itemScore: op.score ?? op.value, itemText: op.label ?? op.text })) : []));
                    // 선택값 보강: selectedScore -> answerItemSeq 매칭 -> item.selected/checked 플래그
                    let selectedScore = q?.selectedScore ?? q?.score ?? null;
                    // API 스키마: answerQuestionitemSeq(선택된 항목의 questionItemSeq)
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
                    mappedQuestions.push({ questionSeq, questionText, questionitems: items, selectedScore });
                });
                setQuestions(mappedQuestions);
                setHasRealData(true);
            } catch (e) {
                console.error('[PsychologicalTestDetail] 데이터 로딩 실패:', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [searchParams]);

    // 헤더 동적 제목 반영: 타이틀 변경 시 상위 레이아웃으로 브로드캐스트
    useEffect(() => {
        try {
            if (title) {
                window.dispatchEvent(new CustomEvent('page-title', { detail: { title } }));
            }
        } catch {}
    }, [title]);

    // 질문유형 추론 (SurveyForm과 100% 동일하게)
    const inferQuestionType = (question, info) => {
        const a = info || assessmentInfo || {};
        if (a?.basicFlag === true) return 'default';
        if (a?.basicFlag === false) {
            const hasSubItemPattern = /[A-Z]\.\s/.test(question?.questionText || '');
            if (hasSubItemPattern) return 'type01';
            return 'type02';
        }
        return 'default';
    };

    // 렌더러: questionitems 기반, readOnly
    const renderDefaultQuestion = (question, index) => (
        <li key={question.questionSeq}>
            <p className="question">{index + 1}. {question.questionText}</p>
            <div className="answer">
                <ul>
                    {question.questionitems.map((item, itemIndex) => (
                        <li key={item.questionItemSeq || itemIndex}>
                            <div className="input-wrap radio type01" style={{ cursor: 'default' }}>
                                <input
                                    id={`answer${itemIndex + 1}_q${question.questionSeq}`}
                                    type="radio"
                                    name={`question${question.questionSeq}`}
                                    checked={Number(question.selectedScore) === Number(item.itemScore)}
                                    readOnly
                                    
                                />
                                <label htmlFor={`answer${itemIndex + 1}_q${question.questionSeq}`} style={{ cursor: 'default' }}>{item.itemScore}</label>
                            </div>
                            <span>{item.itemText}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    );

    const renderType01Question = (question, index) => {
        // SurveyForm과 동일한 정규식: 주제 + 공백 + 서브라벨(A-Z). + 공백 + 서브텍스트
        const match = (question.questionText || '').match(/^(.+?)\s+([A-Z])\.\s(.+)$/);
        if (match) {
            const [, mainTitle, subItemLabel, subItemText] = match;
            return (
                <li key={question.questionSeq} className="template01">
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
                                                id={`answer${itemIndex + 1}_q${question.questionSeq}`}
                                                type="radio"
                                                name={`question${question.questionSeq}`}
                                                checked={Number(question.selectedScore) === Number(item.itemScore)}
                                                readOnly
                                            />
                                            <label htmlFor={`answer${itemIndex + 1}_q${question.questionSeq}`} style={{ cursor: 'default' }}>{item.itemScore}</label>
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
        return renderDefaultQuestion(question, index);
    };

    const renderType02Question = (question, index) => (
        <li key={question.questionSeq} className="template02">
            <p className="question">{index + 1}. {question.questionText}</p>
            <div className="answer">
                <ul>
                    {question.questionitems.map((item, itemIndex) => (
                        <li key={item.questionItemSeq || itemIndex}>
                            <div className="input-wrap radio type01" style={{ cursor: 'default' }}>
                                <input
                                    id={`answer${itemIndex + 1}_q${question.questionSeq}`}
                                    type="radio"
                                    name={`question${question.questionSeq}`}
                                    checked={Number(question.selectedScore) === Number(item.itemScore)}
                                    readOnly
                                />
                                <label htmlFor={`answer${itemIndex + 1}_q${question.questionSeq}`} style={{ cursor: 'default' }}>{item.itemScore}</label>
                            </div>
                            <span>{item.itemText}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    );

    const renderQuestion = (question, index) => {
        const type = inferQuestionType(question, assessmentInfo);
        switch (type) {
            case 'type01':
                return renderType01Question(question, index);
            case 'type02':
                return renderType02Question(question, index);
            case 'default':
            default:
                return renderDefaultQuestion(question, index);
        }
    };

    return (
        <div className="inner">
            <div className="title-wrap">
                <button 
                    className="back-btn" 
                    type="button" 
                    aria-label="뒤로가기"
                    onClick={handleBackClick}
                ></button>
                <strong>{title}</strong>
            </div>
            
            <div className="info-bar">
                <strong>{clientInfo.name}</strong>
                <ul>
                    <li>
                        <span>연락처</span>
                        <span>{clientInfo.phone}</span>
                    </li>
                    <li>
                        <span>성별</span>
                        <span>{clientInfo.gender}</span>
                    </li>
                    <li>
                        <span>생년월일</span>
                        <span>{clientInfo.birthDate}{clientAge != null ? `(만 ${clientAge}세)` : ''}</span>
                    </li>
                </ul>
            </div>
            
            <div className="con-wrap">
                <div className="overview">
                    <div className="top-info">
                        {sessionInfo.session && !sessionInfo.session.includes('사전문진') && !sessionInfo.session.includes('사후문진') && (
                            <strong>{sessionInfo.session}</strong>
                        )}
                        <strong>
                            {sessionInfo.date}
                            {sessionInfo.session === '사전문진' ? ' (사전 문진)' : sessionInfo.session === '사후문진' ? ' (사후 문진)' : ''}
                        </strong>
                    </div>
                    <div className="tb-wrap">
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
                                    <td>{resultSummary.score}</td>
                                    <td className={resultSummary.severityLevel}>{resultSummary.severity}</td>
                                    <td>{resultSummary.description}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="survey-list">
                    <div className="top-info">
                        <strong>{surveyInfo.title}</strong>
                        <p>{surveyInfo.description}</p>
                    </div>
                    <div className="list-wrap">
                        <ul>
                            {questions && questions.length > 0 ? (
                                questions.map((q, i) => renderQuestion(q, i))
                            ) : (
                                <li style={{ padding: '24px', color: '#888' }}>표시할 문항이 없습니다.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PsychologicalTestDetail;
