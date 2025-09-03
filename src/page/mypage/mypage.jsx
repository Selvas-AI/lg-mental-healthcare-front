import { useState, useEffect } from 'react';
import { counselorFind, counselorUpdate } from '@/api/apiCaller';
import { logout } from '@/api';
import ToastPop from '@/components/ToastPop';
import Header from '@/layouts/Header';
import { foldState } from '@/recoil';
import { useRecoilValue } from 'recoil';
import EditorConfirm from '@/page/clients/components/EditorConfirm.jsx';
import './mypage.scss';

export default function MyPage() {
  const fold = useRecoilValue(foldState);
  const [scroll, setScroll] = useState(() => typeof window !== "undefined" ? window.scrollY >= 100 : false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  
  // 폼 상태
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  
  // 에러 상태
  const [userNameError, setUserNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [currentPwError, setCurrentPwError] = useState(false);
  const [newPwError, setNewPwError] = useState(false);
  const [confirmPwError, setConfirmPwError] = useState(false);
  
  // UI 상태
  const [isPasswordChangeMode, setIsPasswordChangeMode] = useState(false);
  const [pwInfoOpen, setPwInfoOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 전화번호 형식 체크
  const validatePhone = (value) => {
    return /^01[0-9]-\d{4}-\d{4}$/.test(value);
  };

  // 비밀번호 유효성 검사 (SignUp과 동일)
  const validatePassword = (value) => {
    const lengthValid = value.length >= 8 && value.length <= 16;
    const hasAlpha = /[A-Za-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[~!@#$%^()\*_\-=\{\}\[\];:<>.,?/]/.test(value);
    return lengthValid && hasAlpha && hasNumber && hasSpecial;
  };

  // 상세 비밀번호 유효성 검사 (SignUp과 동일)
  const validatePasswordDetail = (pw, email) => {
    const upper = /[A-Z]/.test(pw);
    const lower = /[a-z]/.test(pw);
    const number = /[0-9]/.test(pw);
    const special = /[~!@#$%^()\*_\-=\{\}\[\];:<>.,?/]/.test(pw);
    const count = [upper, lower, number, special].filter(Boolean).length;
    if (count < 3) return false;
    if (pw.length < 8 || pw.length > 16) return false;
    if (/[^A-Za-z0-9~!@#$%^()\*_\-=\{\}\[\];:<>.,?/]/.test(pw)) return false;
    if (/\s/.test(pw)) return false;
    if (/(\d)\1{2,}|(\w)\2{2,}/.test(pw)) return false;
    const sequential = (str) => {
      for (let i = 0; i < str.length - 2; i++) {
        const a = str.charCodeAt(i), b = str.charCodeAt(i+1), c = str.charCodeAt(i+2);
        if ((b === a+1 && c === b+1) || (b === a-1 && c === b-1)) return true;
      }
      return false;
    };
    if (sequential(pw)) return false;
    if (/(.)\1{1,}/.test(pw)) return false;
    const emailPart = email.split('@')[0];
    if (emailPart && emailPart.length >= 3 && pw.toLowerCase().includes(emailPart.toLowerCase())) return false;
    return true;
  };

  // Toast 표시
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 내정보 조회
  const fetchUserInfo = async () => {
    try {
      setIsLoading(true);
      const response = await counselorFind();
      if (response.code === 200 && response.data) {
        const { email, userName, phoneNumber } = response.data;
        setEmail(email || '');
        setUserName(userName || '');
        setPhoneNumber(phoneNumber || '');
      } else {
        showToastMessage('사용자 정보를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      showToastMessage('사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 핸들러들
  const handleUserNameChange = (e) => {
    const value = e.target.value;
    setUserName(value);
    setUserNameError(value.length > 0 && value.trim().length < 2);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setPhoneError(value.length > 0 && !validatePhone(value));
  };

  const handleCurrentPwChange = (e) => {
    const value = e.target.value;
    setCurrentPw(value);
    setCurrentPwError(false);
  };

  const handleNewPwChange = (e) => {
    const value = e.target.value;
    setNewPw(value);
    setNewPwError(value.length > 0 && !validatePassword(value));
    setConfirmPwError(confirmPw.length > 0 && value !== confirmPw);
  };

  const handleConfirmPwChange = (e) => {
    const value = e.target.value;
    setConfirmPw(value);
    setConfirmPwError(value.length > 0 && value !== newPw);
  };

  // 정보 수정
  const handleUpdate = async () => {
    try {
      // 비밀번호 변경 유효성 검사 (항상 수행)
      if (!currentPw) {
        showToastMessage('현재 비밀번호를 입력해주세요.');
        return;
      }
      if (!validatePasswordDetail(newPw, email)) {
        setPwInfoOpen(true);
        return;
      }
      if (newPw !== confirmPw) {
        showToastMessage('새 비밀번호가 일치하지 않습니다.');
        return;
      }

      // 이름/전화번호는 전송하지 않고 비밀번호만 전송
      const updateData = {
        currentPassword: currentPw,
        newPassword: newPw,
      };

      const response = await counselorUpdate(updateData);
      
      if (response.code === 200) {
        showToastMessage('정보가 성공적으로 수정되었습니다.');
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
      } else {
        showToastMessage(response.message || '정보 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('정보 수정 오류:', error);
      showToastMessage('정보 수정 중 오류가 발생했습니다.');
    }
  };

  // 스크롤 이벤트
  useEffect(() => {
    const handleScroll = () => setScroll(window.scrollY >= 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 컴포넌트 마운트 시 사용자 정보 조회
  useEffect(() => {
    fetchUserInfo();
  }, []);

  if (isLoading) {
    return (
      <>
        <Header title="마이페이지" scroll={scroll} fold={fold} />
        <div className="inner">
          <div className="loading">정보를 불러오는 중...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="마이페이지" scroll={scroll} fold={fold} />
      <div className="inner mypage">
        <div className="move-up">
          <strong className="page-title">마이페이지</strong>
          <div>
            <button className="save-btn type07 black" type="button" onClick={handleUpdate}>
              저장
            </button>
            <button
              className="save-btn type07 black"
              type="button"
              style={{ marginLeft: 8 }}
              onClick={() => setLogoutConfirmOpen(true)}
            >
              로그아웃
            </button>
          </div>
        </div>
        
        <div className="form-section">
          <div className="form-content">
            {/* 이메일 (수정 불가) */}
            <div className="input-wrap">
              <label htmlFor="emailInput">이메일</label>
              <input 
                id="emailInput" 
                type="text" 
                value={email} 
                disabled 
                style={{ backgroundColor: '#f5f5f5', color: '#999' }}
              />
              <p className="info-txt">이메일은 변경할 수 없습니다.</p>
            </div>

            {/* 이름 */}
            {/* <div className={`input-wrap${userNameError ? ' error' : ''}`}>
              <label htmlFor="userNameInput">이름{userNameError ? <span className="text-[#FF0606]"> *</span> : ''}</label>
              <input 
                id="userNameInput" 
                type="text" 
                placeholder="이름을 입력해주세요" 
                value={userName} 
                onChange={handleUserNameChange} 
              />
              <p className="error-txt">
                {userNameError ? '이름을 2글자 이상 입력해주세요.' : ''}
              </p>
            </div> */}

            {/* 전화번호 */}
            {/* <div className={`input-wrap${phoneError ? ' error' : ''}`}>
              <label htmlFor="phoneInput">전화번호{phoneError ? <span className="text-[#FF0606]"> *</span> : ''}</label>
              <input 
                id="phoneInput" 
                type="text" 
                placeholder="010-1234-5678" 
                value={phoneNumber} 
                onChange={handlePhoneChange} 
              />
              <p className="error-txt">
                {phoneError ? '올바른 전화번호 형식으로 입력해주세요. (010-1234-5678)' : ''}
              </p>
            </div> */}

            <div className="password-section">
                <>
                  {/* 현재 비밀번호 */}
                  <div className={`input-wrap${currentPwError ? ' error' : ''}`}>
                    <label htmlFor="currentPwInput">현재 비밀번호{currentPwError ? <span className="text-[#FF0606]"> *</span> : ''}</label>
                    <input 
                      id="currentPwInput" 
                      type="password" 
                      placeholder="현재 비밀번호를 입력해주세요" 
                      value={currentPw} 
                      onChange={handleCurrentPwChange} 
                    />
                  </div>

                  {/* 새 비밀번호 */}
                  <div className={`input-wrap${newPwError ? ' error' : ''}`}>
                    <label htmlFor="newPwInput">새 비밀번호{newPwError ? <span className="text-[#FF0606]"> *</span> : ''}</label>
                    <input 
                      id="newPwInput" 
                      type="password" 
                      placeholder="8자 이상의 새 비밀번호" 
                      value={newPw} 
                      onChange={handleNewPwChange} 
                    />
                    <p className="error-txt">
                      {newPwError ? '8~16자의 영문 대/소문자, 숫자, 특수문자로 구성해야 합니다.' : '8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.'}
                    </p>
                  </div>

                  {/* 새 비밀번호 확인 */}
                  <div className={`input-wrap${confirmPwError ? ' error' : ''}`}>
                    <label htmlFor="confirmPwInput">새 비밀번호 확인{confirmPwError ? <span className="text-[#FF0606]"> *</span> : ''}</label>
                    <input 
                      id="confirmPwInput" 
                      type="password" 
                      placeholder="새 비밀번호를 다시 입력해주세요" 
                      value={confirmPw} 
                      onChange={handleConfirmPwChange} 
                    />
                    <p className="error-txt">
                      {confirmPwError ? '입력한 새 비밀번호와 같지 않습니다.' : ''}
                    </p>
                  </div>
                </>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 입력 조건 안내 모달 */}
      <div className={`modal pw-info${pwInfoOpen ? ' on' : ''}`}>
        <div className="inner">
          <div className="modal-hd">
            <strong>비밀번호 입력 조건을 확인해 주세요.</strong>
            <button className="close-btn" type="button" aria-label="닫기" onClick={() => setPwInfoOpen(false)}></button>
          </div>
          <div className="info-wrap">
            <ul>
              <li>1. 대소문자/숫자/특수문자 중 3가지 이상 조합</li>
              <li>2. 8자 ~ 16자</li>
              <li>3. 입력 가능 특수 문자<br />&emsp; ~ ! @ # $ % ^ ( ) * _ - = {'{}'} [ ] ; : {'<>'} , . ? /</li>
              <li>4. 공백 입력 불가능</li>
              <li>5. 연속된문자, 숫자 사용 불가능</li>
              <li>6. 동일한 문자, 숫자를 반복해서 사용 불가능</li>
              <li>7. 아이디 포함 불가능</li>
            </ul>
            <button className="type10" type="button" onClick={() => setPwInfoOpen(false)}>확인</button>
          </div>
        </div>
      </div>

      {/* 로그아웃 확인 모달 */}
      <EditorConfirm
        open={logoutConfirmOpen}
        title="로그아웃"
        message={'로그아웃 하시겠습니까?'}
        confirmText="확인"
        cancelText="취소"
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          logout();
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
        onClose={() => setLogoutConfirmOpen(false)}
      />

      <ToastPop message={toastMessage} showToast={showToast} />
    </>
  );
}
