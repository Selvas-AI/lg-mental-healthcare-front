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

  const handleIdChange = (e) => {
    const value = e.target.value;
    setId(value);
    setIdError(value.length > 0 && !validateEmail(value));
  };

  const handlePwChange = (e) => {
    setPw(e.target.value);
    // 입력 중에는 에러 판단하지 않음
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
      navigate('/home');
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
                <input id="idInput" type="text" placeholder="abc@email.com" value={id} onChange={handleIdChange} />
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
                />
                {loginTried && pwError && (
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