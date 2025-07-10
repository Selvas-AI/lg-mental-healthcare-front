import React, { useState, useRef, useLayoutEffect } from "react";
import { useRecoilValue } from "recoil";
import { maskingState } from "@/recoil";
import ClientRegisterModal from "./ClientRegisterModal";

function ClientProfile({ profileData, onEdit, isEmpty }) {
  const masked = useRecoilValue(maskingState);
  const [showInfo, setShowInfo] = useState(false);
  const infoWrapRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState('0px');
  const [paddingTop, setPaddingTop] = useState('0');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);

  useLayoutEffect(() => {
    if (showInfo && infoWrapRef.current) {
      setMaxHeight(infoWrapRef.current.scrollHeight + 32 + 'px'); // 2rem = 32px
      setPaddingTop('2rem');
    } else {
      setMaxHeight('0px');
      setPaddingTop('0');
    }
  }, [showInfo]);

  
  const onSave = (clientData) => {
    if (editClient) {
      // TODO: 수정 로직 구현
    } else {
      // TODO: 등록 로직 구현
    }
    setRegisterOpen(false);
  };

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

  if (!profileData) return null;

  const name = masked ? maskName(profileData.name) : profileData.name;
  const phone = masked ? maskValue('연락처', profileData.phone) : profileData.phone;
  const address = masked ? maskValue('주소', profileData.address) : profileData.address;
  const birth = masked ? maskValue('생년월일', profileData.birth) : profileData.birth;
  const age = masked ? maskValue('나이', profileData.age) : profileData.age;
  const email = masked ? maskValue('이메일', profileData.email) : profileData.email;
  const gender = masked ? maskValue('성별', profileData.gender) : profileData.gender;
  const job = masked ? maskValue('직업', profileData.job) : profileData.job;
  const guardians = Array.isArray(profileData.guardians) ? profileData.guardians.map(g => {
  if (masked) {
    // 이름, 전화번호 마스킹
    const maskedName = g.name ? '*'.repeat(g.name.length) : '';
    const maskedPhone = g.phone ? g.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1-****-$2') : '';
    return `${g.relation} (${maskedName}, ${maskedPhone})`;
  } else {
    return `${g.name} (${g.relation}) ${g.phone}`;
  }
}) : [];

  const memo = masked ? profileData.memo.replace(/[^\s]/g, '*') : profileData.memo;

  const handleEdit = () => {
    onEdit && onEdit(profileData);
  }

  const handleEditMemo = () => {
    console.log('메모수정');
  };

  return (
    <>
      <div className="client-profile" style={{ marginBottom: isEmpty ? '2rem' : '' }}>
        <div className="name-wrap">
          <div className="left">
            <strong>{name}</strong>
            {profileData.danger === "critical" && <span className="tag critical">고위험</span>}
            {profileData.danger === "danger" && <span className="tag danger">위험</span>}
            {profileData.danger === "caution" && <span className="tag caution">주의</span>}
            {profileData.danger === "safe" && <span className="tag safe">양호</span>}
            <a className="edit-btn cursor-pointer" onClick={handleEdit}>정보수정</a>
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
                  <td>{phone}</td>
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
                  <td rowSpan={2}>
                    {guardians.length === 0 ? '없음' : guardians.map((g, idx) => (
                      <span key={idx}>{g}{idx < guardians.length - 1 ? ', ' : ''}</span>
                    ))}
                  </td>
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
                      <a className="edit-btn cursor-pointer" onClick={handleEditMemo}>수정</a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
      <ClientRegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSave={onSave}
        mode={editClient ? "edit" : "register"}
        initialData={editClient}
      />
    </>
  );
}

export default ClientProfile;
