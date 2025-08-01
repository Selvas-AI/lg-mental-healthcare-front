import React from 'react';
import imgLogo from '@/assets/images/logo.svg';
import txtLogo from '@/assets/images/onshim.svg';
import './login.scss';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [id, setId] = React.useState("");
  const [idError, setIdError] = React.useState(false);
  const [pw, setPw] = React.useState("");
  const [pwError, setPwError] = React.useState(false);
  const [loginTried, setLoginTried] = React.useState(false);

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

  const handleIdChange = (e) => {
    const value = e.target.value;
    setId(value);
    // 입력 중에는 에러 상태를 초기화
    if (idError) {
      setIdError(false);
    }
  };

  const handleIdBlur = (e) => {
    const value = e.target.value;
    // 포커스 아웃 시 이메일 형식 검증
    setIdError(value.length > 0 && !validateEmail(value));
  };

  const handlePwChange = (e) => {
    const value = e.target.value;
    setPw(value);
    // 입력 중에는 에러 상태를 초기화
    if (pwError) {
      setPwError(false);
    }
  };

  const handlePwBlur = (e) => {
    const value = e.target.value;
    // 포커스 아웃 시 비밀번호 형식 검증
    setPwError(value.length > 0 && !validatePassword(value));
  };

  const handleLogin = () => {
    setLoginTried(true);
    const isIdValid = id === "joy.h.joe@selvas.com";
    const isPwValid = pw === "1234";
    setPwError(!isPwValid);
    if (isIdValid && isPwValid) {
      // 로그인 성공 시 localStorage에 저장 (임시)
      localStorage.setItem("isLoggedIn", "true");
      //! 로그아웃시에는 아래 적용
      //! localStorage.removeItem("isLoggedIn");
      navigate('/clients');
    }
    // TODO: 로그인 로직 추가
  };

  return (
    <div className="wrapper login">
      <main>
        <div className="inner">
          <h1 className="logo">
            <a href="#" tabIndex={-1}>
              <img className="img-logo" src={imgLogo} alt="Onshim 이미지 로고" />
              <img className="txt-logo" src={txtLogo} alt="Onshim 텍스트 로고" />
            </a>
          </h1>
          <div className="title">
            <strong>상담사님은 상담에만 집중하세요.</strong>
            <p>스케줄관리부터 상담일지 작성까지 온쉼에서 도와드릴게요.</p>
          </div>
          <div className="form-section">
            <div className="form-content">
              {/* 아이디 입력 오류 시 error 클래스 추가 */}
              <div className={`input-wrap id-wrap${idError ? ' error' : ''}`}>
                <label htmlFor="idInput">아이디</label>
                <input id="idInput" type="text" placeholder="abc@email.com" value={id} onChange={handleIdChange} onBlur={handleIdBlur} />
                {idError && (
                  <p className="error-txt">이메일 형식을 확인해주세요.</p>
                )}
              </div>
              {/* 비밀번호 입력 오류 시 error 클래스 추가 */}
              <div className={`input-wrap pw-wrap${pwError ? ' error' : ''}`}>
                <label htmlFor="pwInput">비밀번호</label>
                <input 
                  id="pwInput" 
                  type="password" 
                  placeholder="8자 이상의 비밀번호" 
                  value={pw}
                  onChange={handlePwChange}
                  onBlur={handlePwBlur}
                />
                {pwError && (
                  <p className="error-txt">8~16자의 영문 대/소문자, 숫자, 특수문자로 구성되어 있습니다.</p>
                )}
                {loginTried && !validatePassword(pw) && pw.length > 0 && (
                  <p className="error-txt">비밀번호가 올바르지 않습니다.</p>
                )}
              </div>
              <button 
                className="type10" 
                type="button" 
                onClick={handleLogin}
                disabled={!id || !pw}
              >
                로그인
              </button>
            </div>
            <div className="sign-up">
              <p>아직 온쉼 회원이 아니신가요?</p>
              <a className="sign-up-btn cursor-pointer" onClick={() => navigate('/signUp')}>가입하기</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;