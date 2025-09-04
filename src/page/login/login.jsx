import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authLogin } from '@/api/apiCaller';
import imgLogo from '@/assets/images/logo.svg';
import txtLogo from '@/assets/images/onshim.svg';
import './login.scss';
import ToastPop from '@/components/ToastPop';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [id, setId] = useState("test@mail.com");
  const [idError, setIdError] = useState(false);
  const [pw, setPw] = useState("selvas1!");
  const [pwError, setPwError] = useState(false);
  const [loginError, setLoginError] = useState(false);
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

  // 비밀번호 입력에서 Enter 키로 로그인 실행
  const handlePwKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    setLoginError(false);  // 로그인 시작 시 에러 상태 초기화
    
    // 기본 유효성 검사
    if (!validateEmail(id)) {
      setIdError(true);
      return;
    }
    
    if (!validatePassword(pw)) {
      setPwError(true);
      return;
    }

    try {
      const credentials = {
        email: id,
        password: pw
      };

      const response = await authLogin(credentials);
      
      if (response.code === 200) {
        // 로그인 성공
        const token = response.data.token;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/clients');
      } else {
        setLoginError(true);
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      
      // 인증 실패 또는 네트워크 에러
      if (error.response?.status === 301) {
        setLoginError(true);
      } else {
        setLoginError(true);
      }
    }
  };

  // 회원가입 성공 후 라우터 state로 전달된 토스트 메시지 표시
  useEffect(() => {
    const state = location.state;
    if (state?.signupSuccess) {
      setToastMessage(state.toastMessage || '회원가입이 완료되었습니다.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      // 한 번 표시 후 state 제거
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

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
                  onKeyDown={handlePwKeyDown}
                />
                {pwError && (
                  <p className="error-txt">8~16자의 영문 대/소문자, 숫자, 특수문자로 구성되어 있습니다.</p>
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
              {/* 로그인 에러 메시지 */}
              {loginError && (
                <div className="text-center text-red-500 !text-[14px] !mt-2">
                  아이디 또는 비밀번호를 확인해주세요.
                </div>
              )}
            </div>
            <div className="sign-up">
              <p>아직 온쉼 회원이 아니신가요?</p>
              <a className="sign-up-btn cursor-pointer" onClick={() => navigate('/signUp')}>가입하기</a>
            </div>
          </div>
        </div>
      </main>
      <ToastPop message={toastMessage} showToast={showToast} />
    </div>
  );
}

export default Login;