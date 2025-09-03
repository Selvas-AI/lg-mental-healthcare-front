import React, { useEffect, useRef, useState } from "react";
import ToastPop from "@/components/ToastPop";

function ClientRegisterModal({ open, onClose, onSave, mode = "register", initialData = null }) {
  const [openGuardianSelect, setOpenGuardianSelect] = useState([]);
  const [openEmailSelect, setOpenEmailSelect] = useState(false);
  const [selectedEmailDomain, setSelectedEmailDomain] = useState(''); // select-box에서 선택된 도메인
  const emailOptionListRef = useRef(null);
  const [emailListHeight, setEmailListHeight] = useState(0);
  const guardianOptionListRefs = useRef([]);
  const [guardianListHeights, setGuardianListHeights] = useState([]);
  const editorRef = useRef(null);
  const [memo, setMemo] = useState(initialData?.memo || "");
  const maxLength = 500;
  const isOver = memo.length > maxLength;
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const INITIAL_FORM = {
    name: "",
    nickname: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    gender: "",
    phoneNumber: "",
    address: "",
    emailId: "",
    emailDomain: "",
    job: "",
    guardians: [{ guardianRelation: "", guardianName: "", guardianContact: "" }],
    memo: ""
  };
  const [form, setForm] = useState(INITIAL_FORM);
  const birthInputRefs = useRef([]);  
  const dropdownStyle = (open) => ({
    maxHeight: open ? `26rem` : 0,
    overflow: 'auto',
    transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'auto' : 'none',
    display: 'block',
  });

  const handleInput = e => {
    setMemo(e.target.innerText);
  };

  const handleBirthInput = (e, idx) => {
    const id = e.target.id;
    const maxLengthMap = { birthYear: 4, birthMonth: 2, birthDay: 2 };
    let value = e.target.value.replace(/\D/g, "");
    const maxLength = maxLengthMap[id];
    if (value.length > maxLength) value = value.slice(0, maxLength);
    setForm(f => ({ ...f, [id]: value }));
    // 다음 input으로 포커스 이동
    if (value.length === maxLength && idx < 2 && birthInputRefs.current[idx + 1]) {
      birthInputRefs.current[idx + 1].focus();
    }
  };

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    // 필드명 매핑 처리
    if (id === 'clientsAddress') {
      setForm(f => ({ ...f, address: value }));
    } else if (id === 'email') {
      // 이메일 아이디 입력 필드
      setForm(f => ({ ...f, emailId: value }));
    } else if (id === 'emailDomain') {
      // 이메일 도메인 직접 입력 시 select-box 초기화
      setForm(f => ({ ...f, emailDomain: value }));
      setSelectedEmailDomain(''); // select-box 선택 상태 초기화
    } else {
      setForm(f => ({ ...f, [id]: value }));
    }
  };

  useEffect(() => {
    if (open && initialData) {
      // API 응답에서 guardian 필드를 guardians로 매핑
      let guardians = initialData.guardian || initialData.guardians;
      // 빈 배열이거나 스키마 불일치시 기본 1개 생성
      if (!Array.isArray(guardians) || guardians.length === 0 || !guardians.every(g => typeof g === 'object' && g !== null && 'guardianRelation' in g && 'guardianName' in g && 'guardianContact' in g)) {
        guardians = [{ guardianRelation: '', guardianName: '', guardianContact: '' }];
      }
      let birthYear = '', birthMonth = '', birthDay = '';
      // API 응답에서 birthDate는 'YYYYMMDD' 형식
      if (initialData.birthDate) {
        const birthStr = initialData.birthDate.toString();
        if (/^\d{8}$/.test(birthStr)) {
          birthYear = birthStr.slice(0,4);
          birthMonth = birthStr.slice(4,6);
          birthDay = birthStr.slice(6,8);
        }
      }
      let emailId = '', emailDomain = '';
      if (initialData.email && initialData.email.includes('@')) {
        [emailId, emailDomain] = initialData.email.split('@');
        // 미리 정의된 도메인인 경우 selectedEmailDomain 설정
        if (['naver.com', 'gmail.com', 'daum.net'].includes(emailDomain)) {
          setSelectedEmailDomain(emailDomain);
        } else {
          setSelectedEmailDomain(''); // 직접 입력된 도메인인 경우
        }
      } else {
        setSelectedEmailDomain(''); // 이메일이 없는 경우
      }
      let phoneNumber = initialData.contactNumber || initialData.phone || '';
      let memo = initialData.memo || '';
      setForm({
        ...INITIAL_FORM,
        name: initialData.clientName || initialData.name || '',
        nickname: initialData.nickname || '',
        birthYear,
        birthMonth,
        birthDay,
        gender: initialData.gender === 'F' ? 'female' : initialData.gender === 'M' ? 'male' : '',
        phoneNumber,
        address: initialData.address || '',
        emailId,
        emailDomain,
        job: initialData.job || '',
        memo,
        guardians
      });
    } else if (open && !initialData) {
      setForm(INITIAL_FORM);
      setSelectedEmailDomain(''); // 새 등록 시 selectedEmailDomain 초기화
    }
  }, [open, initialData]);

  useEffect(() => {
    function handleClick(e) {
      if (!e.target.closest('.select-box')) {
        setOpenGuardianSelect([]);
        setOpenEmailSelect(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);


  // 메모 초기값 세팅 (editorRef + memo state 동기화)
  useEffect(() => {
    if (open) {
      if (editorRef.current) {
        editorRef.current.innerText = form.memo || '';
      }
      setMemo(form.memo || '');
    }
  }, [open, form.memo]);

  // openGuardianSelect 길이 동기화
  useEffect(() => {
    const guardiansLen = Array.isArray(form.guardians) ? form.guardians.length : 1;
    setOpenGuardianSelect(prev => {
      if (prev.length !== guardiansLen) {
        return Array(guardiansLen).fill(false);
      }
      return prev;
    });
  }, [form.guardians]);

  // 이메일 드롭다운 높이 동기화
  useEffect(() => {
    if (openEmailSelect && emailOptionListRef.current) {
      setEmailListHeight(emailOptionListRef.current.scrollHeight);
    } else {
      setEmailListHeight(0);
    }
  }, [openEmailSelect, form.emailDomain]);

  // 보호자 드롭다운 높이 동기화
  useEffect(() => {
    setGuardianListHeights(
      (Array.isArray(form.guardians) ? form.guardians : [{guardianRelation:'',guardianName:'',guardianContact:''}])
        .map((_, idx) =>
          openGuardianSelect[idx] && guardianOptionListRefs.current[idx]
            ? guardianOptionListRefs.current[idx].scrollHeight
            : 0
        )
    );
  }, [openGuardianSelect, form.guardians]);

  if (!open) return null;

  // 필수 입력값 검증 함수
  const validateRequiredFields = () => {
    const missingFields = [];
    // 이름 검증
    if (!form.name || form.name.trim().length === 0) {
      missingFields.push('이름');
    }
    // 닉네임 검증 (가입 모드에서만 필수)
    if (mode === 'register' && (!form.nickname || form.nickname.trim().length === 0)) {
      missingFields.push('닉네임');
    }
    // 생년월일 검증
    if (!form.birthYear || !form.birthMonth || !form.birthDay) {
      missingFields.push('생년월일');
    }
    // 성별 검증
    if (!form.gender) {
      missingFields.push('성별');
    }
    // 연락처 검증
    if (!form.phoneNumber || form.phoneNumber.trim().length === 0) {
      missingFields.push('연락처');
    }
    return missingFields;
  };

  // 저장 처리 함수
  const handleSave = () => {
    const missingFields = validateRequiredFields();
    if (missingFields.length > 0) {
      const fieldText = missingFields.join(', ');
      setToastMessage(`${fieldText} - 필수입력 값을 확인해 주세요.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      return;
    }
    // 저장 시 editorRef에서 memo 읽기
    const memo = editorRef.current ? editorRef.current.innerText : '';
    const safeForm = {
      ...form,
      memo,
      // 최소 1개 보장하여 전송
      guardians: Array.isArray(form.guardians) && form.guardians.length > 0 && form.guardians.every(g => typeof g === 'object')
        ? form.guardians
        : [{ guardianRelation: '', guardianName: '', guardianContact: '' }]
    };
    onSave(safeForm);
  };

  return (
    <div className="modal client-register on">
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={onClose}></div>
      <div className="inner z-[1000]">
        <div className="modal-hd">
          <strong>{mode === "edit" ? "내담자 정보 수정" : "내담자 등록"}</strong>
          <button className="close-btn" type="button" aria-label="닫기" onClick={onClose}></button>
        </div>
        <div className="form-section">
          <div className="form-content">
            <legend>내담자 필수 정보</legend>
            <div className="con-wrap">
              <ul>
                <li>
                  <label className="necessary" htmlFor="name">이름</label>
                  <div className="input-wrap">
                    <input id="name" value={form.name || ""} onChange={handleFormChange} type="text" minLength={2} maxLength={10} placeholder="내담자 이름" />
                  </div>
                </li>
                <li>
                  <label htmlFor="nickname" className={mode === 'register' ? 'necessary' : undefined}>닉네임</label>
                  <div className="input-wrap">
                    <input id="nickname" value={form.nickname || ""} onChange={handleFormChange} type="text" minLength={2} maxLength={10} placeholder="내담자 닉네임" />
                  </div>
                </li>
                <li>
                  <label className="necessary" htmlFor="birthYear">생년월일</label>
                  <div className="input-wrap birth-inputs">
                    <input
                      id="birthYear"
                      ref={el => birthInputRefs.current[0] = el}
                      value={form.birthYear || ""}
                      onChange={e => handleBirthInput(e, 0)}
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="년도"
                    />
                    <input
                      id="birthMonth"
                      ref={el => birthInputRefs.current[1] = el}
                      value={form.birthMonth || ""}
                      onChange={e => handleBirthInput(e, 1)}
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      placeholder="월"
                    />
                    <input
                      id="birthDay"
                      ref={el => birthInputRefs.current[2] = el}
                      value={form.birthDay || ""}
                      onChange={e => handleBirthInput(e, 2)}
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      placeholder="일"
                    />
                  </div>
                </li>
                <li>
                  <span className="input-tit necessary">성별</span>
                  <div className="input-cont">
                    <div className="input-wrap radio">
                      <input id="male" type="radio" name="gender" value="male" checked={form.gender === "male"} onChange={e => setForm({ ...form, gender: e.target.value })} />
                      <label htmlFor="male">남성</label>
                    </div>
                    <div className="input-wrap radio">
                      <input id="female" type="radio" name="gender" value="female" checked={form.gender === "female"} onChange={e => setForm({ ...form, gender: e.target.value })} />
                      <label htmlFor="female">여성</label>
                    </div>
                  </div>
                </li>
                <li>
                  <label className="necessary" htmlFor="phoneNumber">연락처</label>
                  <div className="input-wrap">
                    <input id="phoneNumber" value={form.phoneNumber || ""} onChange={handleFormChange} type="number" placeholder="- 없이 숫자만 입력" />
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="form-content">
            <legend>추가 정보</legend>
            <div className="con-wrap">
              <ul>
                <li>
                  <label htmlFor="clientsAddress">주소</label>
                  <div className="input-wrap search">
                    <input id="clientsAddress" value={form.address || ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} type="text" placeholder="주소 입력" />
                    {/* <button className="search-btn" type="button" aria-label="검색"></button> */}
                  </div>
                </li>
                <li>
                  <label htmlFor="email">이메일</label>
                  <div className="input-cont email">
                    <div className="input-wrap">
                      <input id="email" value={form.emailId || ""} onChange={handleFormChange} type="text" placeholder="아이디" />
                    </div>
                    <span>@</span>
                    <div className="input-wrap">
                      <input id="emailDomain" value={form.emailDomain || ""} onChange={handleFormChange} type="text" placeholder="직접 입력" />
                    </div>
                    <div className="select-wrap">
                      <div className="select-box">
                        <button 
                          className={`select-item ${openEmailSelect ? ' on' : ''}`} 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenEmailSelect(open => !open);
                          }}
                        >
                          {selectedEmailDomain || '선택'}
                        </button>
                        <ul ref={emailOptionListRef}
                          className={`option-list${openEmailSelect ? ' open' : ''}`}
                          style={dropdownStyle(openEmailSelect)}>
                          {["naver.com","gmail.com","daum.net"].map(opt => (
                            <li key={opt} className={selectedEmailDomain === opt ? 'on' : ''}>
                              <a href="#" onClick={e => {
                                e.preventDefault();
                                setForm(f => ({...f, emailDomain: opt})); // 직접 입력 값도 선택값으로 변경
                                setSelectedEmailDomain(opt); // select-box 선택 상태 설정
                                setOpenEmailSelect(false);
                              }}>{opt}</a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <label htmlFor="job">직업</label>
                  <div className="input-wrap">
                    <input id="job" value={form.job || ""} onChange={handleFormChange} type="text" maxLength={20} placeholder="예) 학생, 주부, 회사원" />
                  </div>
                </li>
                <li>
                  <label>보호자 정보</label>
                  {/* 최소 1개는 항상 보이도록 처리 */}
                  {(Array.isArray(form.guardians) && form.guardians.length > 0 ? form.guardians : [{ guardianRelation: '', guardianName: '', guardianContact: '' }]).map((g, idx) => {
                    const guardian = (g && typeof g === 'object') ? g : { guardianRelation: '', guardianName: '', guardianContact: '' };

                    const indexStr = String(idx + 1).padStart(2, '0');
                    return (
                      <div className="input-cont input-add" key={idx}>
                        <div className="select-wrap">
                          <div className="select-box" style={{zIndex: openGuardianSelect[idx] ? 1000 : 0}}>
                            <button 
                              className={`select-item ${openGuardianSelect[idx] ? ' on' : ''}`} 
                              type="button" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenGuardianSelect(prev => prev.map((v, i) => i === idx ? !v : false));
                              }}
                            >
                              {guardian.guardianRelation || '선택'}
                            </button>
                              <ul 
                                ref={el => guardianOptionListRefs.current[idx] = el}
                                className={`option-list${openGuardianSelect[idx] ? ' open' : ''}`}
                                style={dropdownStyle(openGuardianSelect[idx])}>
                                  {["부","모","조부","조모","형(오빠)","누나(언니)","동생","선생님","사회복지사","담당자","기타"].map(opt => (
                                    <li key={opt} className={guardian.guardianRelation === opt ? 'on' : ''}>
                                      <a href="#" onClick={e => {
                                        e.preventDefault();
                                        setForm(f => {
                                          const arr = [...f.guardians];
                                          arr[idx] = { ...arr[idx], guardianRelation: opt };
                                          return { ...f, guardians: arr };
                                        });
                                        setOpenGuardianSelect(prev => prev.map((v, i) => i === idx ? false : v));
                                      }}>{opt}</a>
                                    </li>
                                  ))}
                                </ul>
                            </div>
                          </div>
                          <div className="input-wrap">
                            <input id={`guardian${indexStr}`} value={guardian.guardianName || ""} onChange={e => setForm(f => {const arr = [...f.guardians]; arr[idx] = { ...arr[idx], guardianName: e.target.value }; return {...f, guardians: arr};})} type="text" placeholder="보호자 이름" />
                          </div>
                          <div className="input-wrap">
                            <input id={`guardianPhone${indexStr}`} value={guardian.guardianContact || ""} onChange={e => setForm(f => {const arr = [...f.guardians]; arr[idx] = { ...arr[idx], guardianContact: e.target.value }; return {...f, guardians: arr};})} type="text" placeholder="연락처 ( - 없이 숫자만 입력 )" />
                          </div>
                          {/* 최소 1명은 남도록, 1명일 때는 삭제버튼 비활성화 */}
                          <button
                            className="remove-btn"
                            type="button"
                            aria-label="행 제거"
                            disabled={form.guardians.length <= 1}
                            aria-disabled={form.guardians.length <= 1}
                            onClick={() => {
                              if (form.guardians.length <= 1) return;
                              setForm(f => {
                                const arr = f.guardians.filter((_,i) => i!==idx);
                                return { ...f, guardians: arr.length > 0 ? arr : [{guardianRelation:'', guardianName:'', guardianContact:''}] };
                              });
                              setOpenGuardianSelect(prev => prev.filter((_,i) => i!==idx));
                            }}
                          ></button>
                        </div>
                      );
                    })}
                    <button className="add-btn" type="button" onClick={() => {
                      setForm(f => {
                        // 배열 및 객체 배열 보장
                        const arr = Array.isArray(f.guardians) && f.guardians.every(g => typeof g === 'object') ? f.guardians : [{guardianRelation: '', guardianName: '', guardianContact: ''}];
                        return { ...f, guardians: [...arr, {guardianRelation: '', guardianName: '', guardianContact: ''}] };
                      });
                      setOpenGuardianSelect(prev => ([...prev, false]));
                    }}><span>보호자 추가</span></button>
                  </li>
                  <li>
                    <span className="input-tit">메모</span>
                    <div className="editor-wrap">
                      <div className="editor"
                          contentEditable
                          data-placeholder="예 : 충동행동이 있으며, 항정신성 약물을 복용 중임"
                          ref={editorRef}
                          suppressContentEditableWarning={true}
                          onInput={handleInput}
                          style={isOver ? { borderColor: 'red' } : {}}
                        />
                      <div className="current-info">
                        <p className="warning" style={isOver ? { opacity: 1 } : { opacity: 0 }}>글자수를 초과했습니다.</p>
                        <p className="count">
                          <span className="chk-byte">{memo.length}</span> / <span className="maximum">{maxLength}</span>
                        </p>
                      </div>
                    </div>
                  </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="btn-wrap">
          <button className="type08" type="button" onClick={onClose}>취소</button>
          <button className="type08 black" type="button" onClick={handleSave}>{mode === "edit" ? "수정" : "저장"}</button>
        </div>
        <ToastPop message={toastMessage} showToast={showToast} />
      </div>
    </div>
  );
}

export default ClientRegisterModal;
