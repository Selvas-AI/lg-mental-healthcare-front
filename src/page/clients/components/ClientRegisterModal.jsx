import React, { useEffect, useRef, useState } from "react";

function ClientRegisterModal({ open, onClose, onSave, mode = "register", initialData = null }) {
  const [openGuardianSelect, setOpenGuardianSelect] = useState([]);
  const [openEmailSelect, setOpenEmailSelect] = useState(false);
  const emailOptionListRef = useRef(null);
  const [emailListHeight, setEmailListHeight] = useState(0);
  const guardianOptionListRefs = useRef([]);
  const [guardianListHeights, setGuardianListHeights] = useState([]);
  const editorRef = useRef(null);
  const [memo, setMemo] = useState(initialData?.memo || "");
  const maxLength = 500;
  const isOver = memo.length > maxLength;
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
    guardians: [{ relation: "", name: "", phone: "" }],
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
    // address는 clientsAddress로 id가 들어오므로 예외 처리
    if (id === 'clientsAddress') {
      setForm(f => ({ ...f, address: value }));
    } else {
      setForm(f => ({ ...f, [id]: value }));
    }
  };

  useEffect(() => {
    if (open && initialData) {
      let guardians = initialData.guardians;
      if (!Array.isArray(guardians) || !guardians.every(g => typeof g === 'object' && g !== null && 'relation' in g && 'name' in g && 'phone' in g)) {
        guardians = [{ relation: '', name: '', phone: '' }];
      }
      let birthYear = '', birthMonth = '', birthDay = '';
      if (initialData.birth) {
        const birthStr = initialData.birth.split(' ')[0];
        const birthParts = birthStr.split('.');
        if (birthParts.length === 3) {
          birthYear = birthParts[0];
          birthMonth = birthParts[1];
          birthDay = birthParts[2];
        } else if (/^\d{8}$/.test(birthStr.replace(/\D/g, ''))) {
          birthYear = birthStr.slice(0,4);
          birthMonth = birthStr.slice(4,6);
          birthDay = birthStr.slice(6,8);
        }
      }
      let emailId = '', emailDomain = '';
      if (initialData.email && initialData.email.includes('@')) {
        [emailId, emailDomain] = initialData.email.split('@');
      }
      let phoneNumber = initialData.phone || initialData.contact || '';
      let memo = initialData.memo || '';
      setForm({
        ...INITIAL_FORM,
        ...initialData,
        birthYear,
        birthMonth,
        birthDay,
        emailId,
        emailDomain,
        phoneNumber,
        memo,
        guardians
      });
    } else if (open && !initialData) {
      setForm(INITIAL_FORM);
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
        (Array.isArray(form.guardians) ? form.guardians : [{relation:'',name:'',phone:''}])
          .map((_, idx) =>
            openGuardianSelect[idx] && guardianOptionListRefs.current[idx]
              ? guardianOptionListRefs.current[idx].scrollHeight
              : 0
          )
      );
    }, [openGuardianSelect, form.guardians]);

  if (!open) return null;

  // TODO: 핸들러 및 기타 세부 구현

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
                  <label htmlFor="nickname">닉네임</label>
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
                    <input id="clientsAddress" value={form.address || ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} type="text" placeholder="주소 검색" />
                    <button className="search-btn" type="button" aria-label="검색"></button>
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
                        <button className={`select-item ${openEmailSelect ? ' on' : ''}`} type="button" onClick={() => setOpenEmailSelect(open => !open)}>
                          {form.emailDomain || '선택'}
                        </button>
                        <ul ref={emailOptionListRef}
                          className={`option-list${openEmailSelect ? ' open' : ''}`}
                          style={dropdownStyle(openEmailSelect)}>
                          {["naver.com","gmail.com","daum.net"].map(opt => (
                            <li key={opt} className={form.emailDomain === opt ? 'on' : ''}>
                              <a href="#" onClick={e => {
                                e.preventDefault();
                                setForm(f => ({...f, emailDomain: opt}));
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
                  <label htmlFor="guardian">보호자 정보</label>
                  {/* 혹시라도 배열이 아니거나 객체가 아닌 값이 들어올 경우 방어적 처리 */}
                  {(Array.isArray(form.guardians) ? form.guardians : []).map((g, idx) => {
                    const guardian = (g && typeof g === 'object') ? g : { relation: '', name: '', phone: '' };

                    const indexStr = String(idx + 1).padStart(2, '0');
                    return (
                      <div className="input-cont input-add" key={idx}>
                        <div className="select-wrap">
                          <div className="select-box" style={{zIndex: openGuardianSelect[idx] ? 1000 : 0}}>
                            <button className={`select-item ${openGuardianSelect[idx] ? ' on' : ''}`} type="button" onClick={() => setOpenGuardianSelect(prev => prev.map((v, i) => i === idx ? !v : false))}>
                                {guardian.relation || '선택'}
                              </button>
                              <ul 
                                ref={el => guardianOptionListRefs.current[idx] = el}
                                className={`option-list${openGuardianSelect[idx] ? ' open' : ''}`}
                                style={dropdownStyle(openGuardianSelect[idx])}>
                                  {["부","모","조부","조모","형(오빠)","누나(언니)","동생","선생님","사회복지사","담당자","기타"].map(opt => (
                                    <li key={opt} className={guardian.relation === opt ? 'on' : ''}>
                                      <a href="#" onClick={e => {
                                        e.preventDefault();
                                        setForm(f => {
                                          const arr = [...f.guardians];
                                          arr[idx] = { ...arr[idx], relation: opt };
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
                            <input id={`guardian${indexStr}`} value={guardian.name || ""} onChange={e => setForm(f => {const arr = [...f.guardians]; arr[idx] = { ...arr[idx], name: e.target.value }; return {...f, guardians: arr};})} type="text" placeholder="보호자 이름" />
                          </div>
                          <div className="input-wrap">
                            <input id={`guardianPhone${indexStr}`} value={guardian.phone || ""} onChange={e => setForm(f => {const arr = [...f.guardians]; arr[idx] = { ...arr[idx], phone: e.target.value }; return {...f, guardians: arr};})} type="text" placeholder="연락처 ( - 없이 숫자만 입력 )" />
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
                                return { ...f, guardians: arr.length > 0 ? arr : [{relation:'', name:'', phone:''}] };
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
                        const arr = Array.isArray(f.guardians) && f.guardians.every(g => typeof g === 'object') ? f.guardians : [{relation: '', name: '', phone: ''}];
                        return { ...f, guardians: [...arr, {relation: '', name: '', phone: ''}] };
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
          <button className="type08 black" type="button" onClick={() => {
            // 저장 시 editorRef에서 memo 읽기
            const memo = editorRef.current ? editorRef.current.innerText : '';
            const safeForm = {
              ...form,
              memo,
              guardians: Array.isArray(form.guardians) && form.guardians.every(g => typeof g === 'object')
                ? form.guardians
                : [{ relation: '', name: '', phone: '' }]
            };
            onSave(safeForm);
          }}>{mode === "edit" ? "수정" : "저장"}</button>
        </div>
      </div>
    </div>
  );
}

export default ClientRegisterModal;
