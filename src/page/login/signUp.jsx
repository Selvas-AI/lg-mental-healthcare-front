import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authRegister } from '@/api/apiCaller';
import imgLogo from '@/assets/images/logo.svg';
import txtLogo from '@/assets/images/onshim.svg';
import './signup.scss';
import ToastPop from '@/components/ToastPop';

function SignUp() {
  const handleClosePwInfo = () => setPwInfoOpen(false);
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [idError, setIdError] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [chkPw, setChkPw] = useState("");
  const [chkError, setChkError] = useState(false);
  const [pwInfoOpen, setPwInfoOpen] = useState(false);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 이메일 형식 체크
  const validateEmail = (value) => {
    return /^[\w-.]+@[\w-]+\.[\w-.]+$/.test(value);
  };

  // 비밀번호: 8~16자, 영문 대/소문자, 숫자, 특수문자 포함 여부만 체크 (input 실시간)
  const validatePassword = (value) => {
    const lengthValid = value.length >= 8 && value.length <= 16;
    const hasAlpha = /[A-Za-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[~!@#$%^()\*_\-=\{\}\[\];:<>.,?/]/.test(value);
    return lengthValid && hasAlpha && hasNumber && hasSpecial;
  };

  // 가입 버튼 클릭 시 상세 조건 모두 체크
  const validatePasswordDetail = (pw, id) => {
    // 1. 대소문자/숫자/특수문자 중 3가지 이상 조합
    const upper = /[A-Z]/.test(pw);
    const lower = /[a-z]/.test(pw);
    const number = /[0-9]/.test(pw);
    const special = /[~!@#$%^()\*_\-=\{\}\[\];:<>.,?/]/.test(pw);
    const count = [upper, lower, number, special].filter(Boolean).length;
    if (count < 3) return false;
    // 2. 8자~16자
    if (pw.length < 8 || pw.length > 16) return false;
    // 3. 입력 가능 특수문자만 허용
    if (/[^A-Za-z0-9~!@#$%^()\*_\-=\{\}\[\];:<>.,?/]/.test(pw)) return false;
    // 4. 공백 불가
    if (/\s/.test(pw)) return false;
    // 5. 연속된 문자/숫자 불가(3자리 이상)
    if (/(\d)\1{2,}|(\w)\2{2,}/.test(pw)) return false; // 동일문자 3회 이상
    const sequential = (str) => {
      for (let i = 0; i < str.length - 2; i++) {
        const a = str.charCodeAt(i), b = str.charCodeAt(i+1), c = str.charCodeAt(i+2);
        if ((b === a+1 && c === b+1) || (b === a-1 && c === b-1)) return true;
      }
      return false;
    };
    if (sequential(pw)) return false;
    // 6. 동일 문자/숫자 반복 불가(2회 이상)
    if (/(.)\1{1,}/.test(pw)) return false;
    // 7. 아이디에 쓰인 문자 포함 불가(아이디에서 @ 앞부분만 체크)
    const idPart = id.split('@')[0];
    if (idPart && idPart.length >= 3 && pw.toLowerCase().includes(idPart.toLowerCase())) return false;
    return true;
  };


  const handleIdChange = (e) => {
    const value = e.target.value;
    setId(value);
    setIdError(value.length > 0 && !validateEmail(value));
    setDuplicateEmailError(false); // 이메일 변경 시 중복 에러 초기화
  };

  const handlePwChange = (e) => {
    const value = e.target.value;
    setPw(value);
    setPwError(value.length > 0 && !validatePassword(value));
    setChkError(chkPw.length > 0 && value !== chkPw);
  };

  const handleChkPwChange = (e) => {
    const value = e.target.value;
    setChkPw(value);
    setChkError(value.length > 0 && value !== pw);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validatePasswordDetail(pw, id)) {
      setPwInfoOpen(true);
      return;
    }

    setDuplicateEmailError(false);

    try {
      const userData = {
        email: id,
        password: pw,
        // userName: '',
        // phoneNumber: ''
      };

      const response = await authRegister(userData);
      
      if (response.code === 200) {
        // 회원가입 성공: 로그인 페이지로 이동하며 토스트 메시지 전달
        navigate('/login', {
          state: {
            signupSuccess: true,
            toastMessage: '회원가입이 완료되었습니다.'
          }
        });
        return;
      } else if (response.code === 302) {
        // 중복 이메일 에러
        setDuplicateEmailError(true);
        setToastMessage('이미 사용 중인 이메일입니다.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } else {
        // 기타 에러
        setToastMessage(response.message || '회원가입에 실패했습니다.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      
      // 네트워크 에러 등 예외 상황
      setToastMessage('회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <div className="wrapper signup">
      <main>
        <div className="inner">
          <h1 className="logo">
            <a href="#">
              <img className="img-logo" src={imgLogo} alt="Onshim 이미지 로고" />
              <img className="txt-logo" src={txtLogo} alt="Onshim 텍스트 로고" />
            </a>
          </h1>
          <div className="btn-wrap">
            <button className="back-btn" type="button" aria-label="뒤로가기" onClick={() => navigate('/login')}></button>
          </div>
          <div className="form-section">
            <div className="tit-wrap">
              <strong>회원가입</strong>
              <p>상담사님, 온쉼과 함께하는 소중한 첫 걸음을 환영해요.</p>
            </div>
            <div className="form-content">
              {/* 아이디 입력 오류 시 error 클래스 추가 */}
              <div className={`input-wrap id-wrap${(idError || duplicateEmailError) ? ' error' : ''}`}>
                <label className="necessary" htmlFor="idInput">아이디{(idError || duplicateEmailError) ? <span className="text-[#FF0606]"> *</span> : ''}</label>
                <input id="idInput" type="text" placeholder="abc@email.com" value={id} onChange={handleIdChange} />
                <p className="error-txt">
                  {duplicateEmailError ? '이미 사용 중인 이메일입니다.' : 
                    idError ? '이메일 형식으로 입력해 주세요.' : 
                    '사용하고 계신 이메일을 ID로 사용할 수 있어요.'}
                </p>
              </div>
              {/* 비밀번호 입력 오류 시 error 클래스 추가 */}
              <div className={`input-wrap pw-wrap${pwError ? ' error' : ''}`}>
                <label className="necessary" htmlFor="pwInput">비밀번호{pwError ? <span className="text-[#FF0606]"> *</span> : ''}</label>
                <input id="pwInput" type="password" placeholder="8자 이상의 비밀번호" value={pw} onChange={handlePwChange} />
                <p className="error-txt">{pwError ? '8~16자의 영문 대/소문자, 숫자, 특수문자로 구성해야 합니다.' : '8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.'}</p>
              </div>
              {/* 비밀번호 재입력 오류 시 error 클래스 추가 */}
              <div className={`input-wrap chk-wrap${chkError ? ' error' : ''}`}>
                <label className="necessary" htmlFor="chkPwInput">비밀번호 확인{chkError ? <span className="text-[#FF0606]"> *</span> : ''}</label>
                <input id="chkPwInput" type="password" placeholder="8자 이상의 비밀번호" value={chkPw} onChange={handleChkPwChange} />
                <p className="error-txt">{chkError ? '입력한 비밀번호와 같지 않습니다.' : '앞서 입력한 비밀번호를 한번 더 입력해 주세요.'}</p>
              </div>
              <button 
                className="type10" 
                type="button" 
                disabled={!id || !pw || !chkPw || idError || pwError || chkError || duplicateEmailError} 
                onClick={handleSignUp}
              >
                가입하기
              </button>
            </div>
          </div>
          <ToastPop message={toastMessage} showToast={showToast} />
        </div>
      </main>
      {/* 비밀번호 입력 조건 안내 모달(팝업) - on 클래스 추가 시 오픈 */}
      <div className={`modal pw-info${pwInfoOpen ? ' on' : ''}`}>
        <div className="inner">
          <div className="modal-hd">
            <strong>비밀번호 입력 조건을 확인해 주세요.</strong>
            <button className="close-btn" type="button" aria-label="닫기" onClick={handleClosePwInfo}></button>
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
            <button className="type10" type="button" onClick={handleClosePwInfo}>확인</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;