import React, { useState, useRef, useLayoutEffect } from "react";
import { useRecoilValue } from "recoil";
import { maskingState } from "@/recoil";

function ClientProfile() {
  const masked = useRecoilValue(maskingState);
  const [showInfo, setShowInfo] = useState(false);
  const infoWrapRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const [paddingTop, setPaddingTop] = useState('0');

  useLayoutEffect(() => {
    if (showInfo && infoWrapRef.current) {
      setMaxHeight(infoWrapRef.current.scrollHeight + 32 + 'px'); // 2rem = 32px
      setPaddingTop('2rem');
    } else {
      setMaxHeight('0px');
      setPaddingTop('0');
    }
  }, [showInfo]);

function maskName(name) {
  if (name.length <= 1) return '*';
  if (name.length === 2) return name[0] + '*';
  const mid = Math.floor(name.length / 2);
  return name.slice(0, mid) + '*' + name.slice(mid + 1);
}
function maskValue(label, value) {
  switch (label) {
    case '연락처':
      return value.replace(/(\d{3})-(\d{4})-(\d{4})/, (_, a, b, c) => `${a}-****-${c}`);
    case '성별':
    case '직업':
      return '*'.repeat(value.length);
    case '생년월일':
      return value.replace(/\d{4}\.\d{2}\.\d{2}/, '19**.**.**').replace(/\(.*?\)/, '(만 **세)');
    case '주소': {
      const parts = value.trim().split(/\s+/);
      if (parts.length === 0) return '****';
      const first = parts[0];
      const restMasked = parts.slice(1).map(w => '*'.repeat(w.length)).join(' ');
      return `${first} ${restMasked}`;
    }
    case '이메일':
      return value.replace(/^[^@]+/, '*******');
    case '보호자':
      return value
        .replace(/([가-힣]+)\s*\((.*?)\)/g, '** ($2)')
        .replace(/(\d{3})-(\d{4})-(\d{4})/g, '$1-****-$3');
    default:
      return '*'.repeat(value.length);
  }
}

const profileData = {
  name: '김마음',
  danger: true,
  contact: '010-1234-1234',
  address: '서울특별시 강남구 압구정로 151-2 108동 504호',
  birth: '2005.04.22 (만 18세)',
  email: 'Kimmau @gmail.com',
  gender: '남자',
  job: '대학생',
  guardians: '김매순 (모) 010-1234-1234, 김복남 (부) 010-1234-1234 한마음 (사회복지사) 010-1234-1234',
  memo: '본 환자는 최근 몇 개월 간 지속적인 우울감, 무기력, 수면장애 및 식욕 저하를 호소하며 내원하였습니다. 내원하였습니다 내원하였습니다 내원하였습니다 내원하였습니다 내원하였습니다 내원하였습니다',
};


  const name = masked ? maskName(profileData.name) : profileData.name;
  const contact = masked ? maskValue('연락처', profileData.contact) : profileData.contact;
  const address = masked ? maskValue('주소', profileData.address) : profileData.address;
  const birth = masked ? maskValue('생년월일', profileData.birth) : profileData.birth;
  const email = masked ? maskValue('이메일', profileData.email) : profileData.email;
  const gender = masked ? maskValue('성별', profileData.gender) : profileData.gender;
  const job = masked ? maskValue('직업', profileData.job) : profileData.job;
  const guardians = masked ? maskValue('보호자', profileData.guardians) : profileData.guardians;
  const memo = masked ? profileData.memo.replace(/[^\s]/g, '*') : profileData.memo;

  return (
    <div className="client-profile">
      <div className="name-wrap">
        <div className="left">
          <strong>{name}</strong>
          {profileData.danger && <span className="tag danger">위험</span>}
          <a className="edit-btn" href="#">정보수정</a>
        </div>
        <button
          className={`toggle-btn${showInfo ? ' on' : ''}`}
          type="button"
          aria-label="펼치기/접기"
          onClick={() => setShowInfo(v => !v)}
        ></button>
      </div>
      <div
        className="info-wrap"
        ref={infoWrapRef}
        style={{
          maxHeight: maxHeight,
          overflow: 'hidden',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), padding-top 0.35s cubic-bezier(0.4,0,0.2,1)',
          paddingTop: paddingTop,
        }}
      >
        <table>
            <caption>내담자 프로필</caption>
            <colgroup>
              <col style={{ width: "50px" }} />
              <col style={{ width: "calc((100% - 100px) / 2)" }} />
              <col style={{ width: "50px" }} />
              <col style={{ width: "calc((100% - 100px) / 2)" }} />
            </colgroup>
            <tbody>
              <tr>
                <th>연락처</th>
                <td>{contact}</td>
                <th>주소</th>
                <td>{address}</td>
              </tr>
              <tr>
                <th>생년월일</th>
                <td>{birth}</td>
                <th>이메일</th>
                <td>{email}</td>
              </tr>
              <tr>
                <th>성별</th>
                <td>{gender}</td>
                <th rowSpan={2}>보호자</th>
                <td rowSpan={2}>{guardians}</td>
              </tr>
              <tr>
                <th>직업</th>
                <td>{job}</td>
              </tr>
              <tr>
                <th>메모</th>
                <td colSpan={3}>
                  <div className="memo-wrap">
                    <p className="memo">{memo}</p>
                    <a className="edit-btn" href="#">수정</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
    </div>
  );
}

export default ClientProfile;
