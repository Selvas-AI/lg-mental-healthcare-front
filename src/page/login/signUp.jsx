import React from 'react';
import { useNavigate } from 'react-router-dom';
import imgLogo from '@/assets/images/logo.svg';
import txtLogo from '@/assets/images/onshim.svg';
import './signup.scss';

function SignUp() {
  const navigate = useNavigate();
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
              <div className="input-wrap id-wrap">
                <label className="necessary" htmlFor="idInput">아이디</label>
                <input id="idInput" type="text" placeholder="abc@email.com" />
                <p className="error-txt">사용하고 계신 이메일을 ID로 사용할 수 있어요.</p>
              </div>
              {/* 비밀번호 입력 오류 시 error 클래스 추가 */}
              <div className="input-wrap pw-wrap">
                <label className="necessary" htmlFor="pwInput">비밀번호</label>
                <input id="pwInput" type="password" placeholder="8자 이상의 비밀번호" />
                <p className="error-txt">8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.</p>
              </div>
              {/* 비밀번호 재입력 오류 시 error 클래스 추가 */}
              <div className="input-wrap chk-wrap">
                <label className="necessary" htmlFor="chkPwInput">비밀번호 확인</label>
                <input id="chkPwInput" type="password" placeholder="8자 이상의 비밀번호" />
                <p className="error-txt">앞서 입력한 비밀번호를 한번 더 입력해 주세요.</p>
              </div>
              <button className="type10" type="button" disabled>가입하기</button>
            </div>
          </div>
        </div>
      </main>
      {/* 비밀번호 입력 조건 안내 모달(팝업) - on 클래스 추가 시 오픈 */}
      <div className="modal pw-info on">
        <div className="inner">
          <div className="modal-hd">
            <strong>비밀번호 입력 조건을 확인해 주세요.</strong>
            <button className="close-btn" type="button" aria-label="닫기"></button>
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
            <button className="type10" type="button">확인</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;