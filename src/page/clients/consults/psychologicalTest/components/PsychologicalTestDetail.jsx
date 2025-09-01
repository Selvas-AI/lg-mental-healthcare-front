import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PsychologicalTestDetail = ({ 
    testTitle = "PHQ-9 우울 검사 결과",
    clientInfo = {
        name: "홍길동",
        phone: "010-1234-5678",
        gender: "남",
        birthDate: "1996-04-21(만 27세)"
    },
    sessionInfo = {
        session: "4회기",
        date: "2025.05.02"
    },
    resultSummary = {
        score: "25점",
        severity: "최대입력텍스트",
        severityLevel: "level-high",
        description: "우울감과 관련된 다양한 증상을 심각하게 보고하고 있어요. 이로 인해 일상생활에서 겪는 어려움도 클 것으로 보여요. 현재의 심리적 상태를 자세히 확인하기 위한 추가적인 평가와 치료를 권고 드려요."
    },
    surveyInfo = {
        title: "검사 문항 반응",
        description: "지난 2주간, 다음과 같은 문제를 얼마나 자주 겪었는지 해당되는 곳에 응답하여 주십시오."
    },
    questions = [],
    onBackClick
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    useEffect(() => {
        // 즉시 상단으로 이동 (smooth 애니메이션 무시)
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, []);
    
    const handleBackClick = () => {
        if (onBackClick) {
            onBackClick();
        } else {
            // returnTab 파라미터로 올바른 탭으로 돌아가기
            const clientId = searchParams.get('clientId');
            const returnTab = searchParams.get('returnTab') || 'counsel';
            const scrollY = searchParams.get('scrollY');
            const targetRow = searchParams.get('targetRow');
            
            const backQuery = new URLSearchParams();
            if (clientId) backQuery.set('clientId', clientId);
            backQuery.set('tab', returnTab);
            if (scrollY) backQuery.set('restoreScrollY', scrollY);
            if (targetRow) backQuery.set('targetRow', targetRow);
            navigate(`/clients/consults?${backQuery.toString()}`, { replace: true });
        }
    };
    
    // 기본 질문 데이터 (예시) - 임시 응답값 포함
    const defaultQuestions = [
        {
            id: 1,
            type: "default",
            question: "기분이 가라앉거나 우울하거나 희망이 없다고 느꼈다.",
            selectedValue: 2, // 임시 응답값
            options: [
                { value: 0, label: "전혀 없음" },
                { value: 1, label: "며칠동안" },
                { value: 2, label: "일주일 이상" },
                { value: 3, label: "거의 매일" }
            ]
        },
        {
            id: 2,
            type: "default",
            question: "평소 하던 일에 대한 흥미가 없어지거나 즐거움을 느끼지 못했다.",
            selectedValue: 1, // 임시 응답값
            options: [
                { value: 0, label: "전혀 없음" },
                { value: 1, label: "며칠동안" },
                { value: 2, label: "일주일 이상" },
                { value: 3, label: "거의 매일" }
            ]
        },
        {
            id: 3,
            type: "default",
            question: "잠들기 어렵거나 자주 깬다. 혹은 잠을 너무 많이 잔다.",
            selectedValue: 3, // 임시 응답값
            options: [
                { value: 0, label: "전혀 없음" },
                { value: 1, label: "며칠동안" },
                { value: 2, label: "일주일 이상" },
                { value: 3, label: "거의 매일" }
            ]
        },
        {
            id: 4,
            type: "default",
            question: "피곤하다고 느끼거나 기운이 거의 없다.",
            selectedValue: 2, // 임시 응답값
            options: [
                { value: 0, label: "전혀 없음" },
                { value: 1, label: "며칠동안" },
                { value: 2, label: "일주일 이상" },
                { value: 3, label: "거의 매일" }
            ]
        },
        {
            id: 5,
            type: "default",
            question: "식욕이 줄었다. 혹은 너무 많이 먹는다.",
            selectedValue: 0, // 임시 응답값
            options: [
                { value: 0, label: "전혀 없음" },
                { value: 1, label: "며칠동안" },
                { value: 2, label: "일주일 이상" },
                { value: 3, label: "거의 매일" }
            ]
        },
        {
            id: 6,
            type: "default",
            question: "내 자신이 실패자로 여겨지거나 자신과 가족을 실망시켰다고 느낀다.",
            selectedValue: 1, // 임시 응답값
            options: [
                { value: 0, label: "전혀 없음" },
                { value: 1, label: "며칠동안" },
                { value: 2, label: "일주일 이상" },
                { value: 3, label: "거의 매일" }
            ]
        },
        {
            id: 7,
            type: "default",
            question: "신문을 읽거나 TV를 보는 것과 같은 일상적인 일에 집중하기 어렵다.",
            selectedValue: 2, // 임시 응답값
            options: [
                { value: 0, label: "전혀 없음" },
                { value: 1, label: "며칠동안" },
                { value: 2, label: "일주일 이상" },
                { value: 3, label: "거의 매일" }
            ]
        },
        {
            id: 8,
            type: "default",
            question: "다른 사람들이 눈치 챌 정도로 평소보다 말과 행동이 느리다. 혹은 너무 안절부절 못해서 가만히 앉아 있을 수 없다.",
            selectedValue: 1, // 임시 응답값
            options: [
                { value: 0, label: "전혀 없음" },
                { value: 1, label: "며칠동안" },
                { value: 2, label: "일주일 이상" },
                { value: 3, label: "거의 매일" }
            ]
        },
        {
            id: 9,
            type: "default",
            question: "차라리 죽는 것이 낫겠다고 생각하거나 어떻게든 자해를 하려고 생각한다.",
            selectedValue: 0, // 임시 응답값
            options: [
                { value: 0, label: "전혀 없음" },
                { value: 1, label: "며칠동안" },
                { value: 2, label: "일주일 이상" },
                { value: 3, label: "거의 매일" }
            ]
        },
        {
            id: 10,
            type: "template01",
            question: "최근 2주 동안에 당신의 불면증의 심한 정도를 아래에 표시하십시오.",
            subQuestions: [
                {
                    id: "10a",
                    question: "A. 잠들기 어려움",
                    selectedValue: 2, // 임시 응답값
                    options: [
                        { value: 0, label: "전혀" },
                        { value: 1, label: "약간" },
                        { value: 2, label: "보통" },
                        { value: 3, label: "심한" },
                        { value: 4, label: "매우 심한" }
                    ]
                },
                {
                    id: "10b",
                    question: "B. 수면 유지가 어려움 (자주 깸)",
                    selectedValue: 3, // 임시 응답값
                    options: [
                        { value: 0, label: "전혀" },
                        { value: 1, label: "약간" },
                        { value: 2, label: "보통" },
                        { value: 3, label: "심한" },
                        { value: 4, label: "매우 심한" }
                    ]
                }
            ]
        },
        {
            id: 11,
            type: "template02",
            question: "지난 주 동안 공황발작 또는 제한된 증상 발작을 얼마나 자주 경험하셨습니까?",
            selectedValue: 1, // 임시 응답값
            options: [
                { value: 0, label: "공황이나 제한된 증상 삽화 없음" },
                { value: 1, label: "경도. 완전한 공황 발작은 없고, 제한된 증상 발작은 하루에 1회를 넘지 않음" },
                { value: 2, label: "중증도. 주 1-2회의 완전한 공황 발작, 하루에 제한된 증상 발작을 여러 번 경험" },
                { value: 3, label: "심함. 주 3회 이상의 완전한 공황 발작, 그러나 평균 하루에 1회 이상은 아님" },
                { value: 4, label: "극심함. 하루에도 여러 번 완전한 공황 발작이 일어남. 발작이 없는 날보다 있는 날이 더 많음" }
            ]
        }
    ];

    const questionsToRender = questions.length > 0 ? questions : defaultQuestions;

    const renderDefaultQuestion = (question) => (
        <li key={question.id}>
            <p className="question">{question.id}. {question.question}</p>
            <div className="answer">
                <ul>
                    {question.options.map((option, optionIndex) => (
                        <li key={optionIndex}>
                            <div className="input-wrap radio type01">
                                <input 
                                    id={`answer${String(optionIndex + 1).padStart(2, '0')}_q${String(question.id).padStart(2, '0')}`}
                                    type="radio" 
                                    name={`question${String(question.id).padStart(2, '0')}`}
                                    checked={question.selectedValue === option.value}
                                    readOnly
                                />
                                <label htmlFor={`answer${String(optionIndex + 1).padStart(2, '0')}_q${String(question.id).padStart(2, '0')}`}>
                                    {option.value}
                                </label>
                            </div>
                            <span>{option.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    );

    const renderTemplate01Question = (question) => (
        <li key={question.id} className="template01">
            <p className="question">{question.id}. {question.question}</p>
            <div className="answer-wrap">
                {question.subQuestions.map((subQuestion) => (
                    <div key={subQuestion.id} className="answer">
                        <p className="sub-question">{subQuestion.question}</p>
                        <ul>
                            {subQuestion.options.map((option, optionIndex) => (
                                <li key={optionIndex}>
                                    <div className="input-wrap radio type01">
                                        <input 
                                            id={`answer${String(optionIndex + 1).padStart(2, '0')}_q${subQuestion.id}`}
                                            type="radio" 
                                            name={`question${subQuestion.id}`}
                                            checked={subQuestion.selectedValue === option.value}
                                            readOnly
                                        />
                                        <label htmlFor={`answer${String(optionIndex + 1).padStart(2, '0')}_q${subQuestion.id}`}>
                                            {option.value}
                                        </label>
                                    </div>
                                    <span>{option.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </li>
    );

    const renderTemplate02Question = (question) => (
        <li key={question.id} className="template02">
            <p className="question">{question.id}. {question.question}</p>
            <div className="answer">
                <ul>
                    {question.options.map((option, optionIndex) => (
                        <li key={optionIndex}>
                            <div className="input-wrap radio type01">
                                <input 
                                    id={`answer${String(optionIndex + 1).padStart(2, '0')}_q${String(question.id).padStart(2, '0')}`}
                                    type="radio" 
                                    name={`question${String(question.id).padStart(2, '0')}`}
                                    checked={question.selectedValue === option.value}
                                    readOnly
                                />
                                <label htmlFor={`answer${String(optionIndex + 1).padStart(2, '0')}_q${String(question.id).padStart(2, '0')}`}>
                                    {option.value}
                                </label>
                            </div>
                            <span>{option.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    );

    const renderQuestion = (question) => {
        switch (question.type) {
            case "template01":
                return renderTemplate01Question(question);
            case "template02":
                return renderTemplate02Question(question);
            default:
                return renderDefaultQuestion(question);
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
                <strong>{testTitle}</strong>
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
                        <span>{clientInfo.birthDate}</span>
                    </li>
                </ul>
            </div>
            
            <div className="con-wrap">
                <div className="overview">
                    <div className="top-info">
                        <strong>{sessionInfo.session}</strong>
                        <strong>{sessionInfo.date}</strong>
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
                            {questionsToRender.map(renderQuestion)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PsychologicalTestDetail;
