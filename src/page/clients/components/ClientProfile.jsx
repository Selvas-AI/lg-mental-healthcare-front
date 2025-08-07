import React, { useState, useRef, useLayoutEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { maskingState, clientsState } from "@/recoil";
import { clientUpdate } from "@/api/apiCaller";
import ClientRegisterModal from "./ClientRegisterModal";
import ToastPop from "@/components/ToastPop";

function ClientProfile({ profileData, onEdit }) {
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

  
  const setClients = useSetRecoilState(clientsState);

  const onSave = async (clientData) => {
    try {
      if (editClient) {
        // 내담자 정보 수정 - 변경된 필드만 전송
        const updateData = { clientSeq: editClient.clientSeq };
        
        // 변경된 필드만 포함
        if (clientData.name !== editClient.clientName) {
          updateData.clientName = clientData.name;
        }
        if ((clientData.nickname || '') !== (editClient.nickname || '')) {
          updateData.nickname = clientData.nickname || '';
        }
        
        const newBirthDate = `${clientData.birthYear}${clientData.birthMonth.padStart(2, '0')}${clientData.birthDay.padStart(2, '0')}`;
        if (newBirthDate !== editClient.birthDate) {
          updateData.birthDate = newBirthDate;
        }
        
        const newGender = clientData.gender === 'female' ? 'F' : clientData.gender === 'male' ? 'M' : clientData.gender;
        if (newGender !== editClient.gender) {
          updateData.gender = newGender;
        }
        
        if (clientData.phoneNumber !== editClient.contactNumber) {
          updateData.contactNumber = clientData.phoneNumber;
        }
        if ((clientData.address || '') !== (editClient.address || '')) {
          updateData.address = clientData.address || '';
        }
        
        const newEmail = clientData.emailId && clientData.emailDomain ? `${clientData.emailId}@${clientData.emailDomain}` : '';
        if (newEmail !== (editClient.email || '')) {
          updateData.email = newEmail;
        }
        
        if ((clientData.job || '') !== (editClient.job || '')) {
          updateData.job = clientData.job || '';
        }
        if ((clientData.memo || '') !== (editClient.memo || '')) {
          updateData.memo = clientData.memo || '';
        }
        
        // 보호자 정보 변경 확인 (의미있는 데이터만 비교)
        const hasValidGuardianData = (guardians) => {
          if (!Array.isArray(guardians) || guardians.length === 0) return false;
          return guardians.some(g => g.relation || g.name || g.phone);
        };
        
        const currentHasGuardians = hasValidGuardianData(editClient.guardian);
        const newHasGuardians = hasValidGuardianData(clientData.guardians);
        
        // 의미있는 보호자 데이터가 변경된 경우만 전송
        if (currentHasGuardians !== newHasGuardians || 
            (newHasGuardians && JSON.stringify(editClient.guardian || []) !== JSON.stringify(clientData.guardians || []))) {
          updateData.guardian = newHasGuardians ? clientData.guardians : null;
        }
        
        console.log('전송할 수정 데이터 (변경된 필드만):', updateData);
        
        const response = await clientUpdate(updateData);
        if (response.success) {
          // Recoil 상태 업데이트
          setClients(prevClients => 
            prevClients.map(client => 
              client.clientSeq === editClient.clientSeq 
                ? { ...client, ...updateData }
                : client
            )
          );
          ToastPop({ type: 'success', message: '내담자 정보가 수정되었습니다.' });
        } else {
          ToastPop({ type: 'error', message: response.message || '내담자 정보 수정에 실패했습니다.' });
        }
      }
      setRegisterOpen(false);
      setEditClient(null);
    } catch (error) {
      console.error('내담자 정보 수정 중 오류:', error);
      ToastPop({ type: 'error', message: '처리 중 오류가 발생했습니다.' });
    }
  };

function maskName(name) {
  if (name.length <= 1) return '*';
  if (name.length === 2) return name[0] + '*';
  const mid = Math.floor(name.length / 2);
  return name.slice(0, mid) + '*' + name.slice(mid + 1);
}
function maskValue(label, value) {
  if (value == null) return '**'
  switch (label) {
    case '연락처': {
      // null 안전 처리
      if (!value) return '***-****-****';
      // 하이픈이 있든 없든 모두 처리
      const digits = value.replace(/\D/g, ''); // 숫자만 추출
      if (digits.length === 11) {
        return `${digits.slice(0,3)}-****-${digits.slice(7,11)}`;
      }
      // fallback: 기존 값에 하이픈만 마스킹
      return value.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3');
    }
    case '성별':
    case '직업':
      return '*'.repeat(value.length);
    case '생년월일':
      if (!value) return '19**.**.**';
      return value.replace(/\d{4}\.\d{2}\.\d{2}/, '19**.**.**').replace(/\(.*?\)/, '(만 **세)');
    case '주소': {
      if (!value) return '****';
      const parts = value.trim().split(/\s+/);
      if (parts.length === 0) return '****';
      const first = parts[0];
      const restMasked = parts.slice(1).map(w => '*'.repeat(w.length)).join(' ');
      return `${first} ${restMasked}`;
    }
    case '이메일':
      if (!value) return '*******@****.***';
      return value.replace(/^[^@]+/, '*******');
    case '보호자':
      if (!value) return '** (****)';
      return value
        .replace(/([\uac00-\ud7a3]+)\s*\((.*?)\)/g, '** ($2)')
        .replace(/(\d{3})-(\d{4})-(\d{4})/g, '$1-****-$3');
    default:
      return '*'.repeat(value.length);
  }
}

  if (!profileData) return null;

  const name = masked ? maskName(profileData.clientName) : profileData.clientName;
  const phone = masked ? maskValue('연락처', profileData.contactNumber) : profileData.contactNumber;
  const address = masked ? maskValue('주소', profileData.address) : profileData.address;
  function getKoreanAge(birthStr) {
  // 'YYYYMMDD' 형식에서 만 나이 계산
  if (!birthStr || birthStr.length !== 8) return '';
  const y = birthStr.slice(0, 4);
  const m = birthStr.slice(4, 6);
  const d = birthStr.slice(6, 8);
  const birthDate = new Date(`${y}-${m}-${d}`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const mDiff = today.getMonth() - birthDate.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
// birthDate를 YYYY.MM.DD 형식으로 변환하여 표시
function formatBirthDate(birthDate) {
  if (!birthDate || birthDate.length !== 8) return '';
  const y = birthDate.slice(0, 4);
  const m = birthDate.slice(4, 6);
  const d = birthDate.slice(6, 8);
  return `${y}.${m}.${d}`;
}

const birth = masked
  ? maskValue('생년월일', formatBirthDate(profileData.birthDate)) + ' (만 **세)'
  : formatBirthDate(profileData.birthDate) + (profileData.birthDate ? ` (만 ${getKoreanAge(profileData.birthDate)}세)` : '');
const age = masked ? maskValue('나이', profileData.age) : profileData.age;
  const email = masked ? maskValue('이메일', profileData.email) : profileData.email;
  function getKoreanGender(gender) {
  if (!gender) return '';
  // API 응답에서 F/M 형식으로 오는 경우 처리
  if (gender === 'F' || gender === 'female' || gender === '여' || gender === '여자') return '여자';
  if (gender === 'M' || gender === 'male' || gender === '남' || gender === '남자') return '남자';
  return gender;
}
const gender = masked ? '**' : getKoreanGender(profileData.gender);
  const job = masked ? maskValue('직업', profileData.job) : profileData.job;
  function formatPhoneNumber(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7,11)}`;
  }
  return phone;
}

const guardians = Array.isArray(profileData.guardians) ? profileData.guardians.map(g => {
  if (masked) {
    // 이름, 전화번호 마스킹 + 하이픈 포맷
    const maskedName = g.name ? '*'.repeat(g.name.length) : '';
    let maskedPhone = g.phone ? g.phone.replace(/\D/g, '') : '';
    if (maskedPhone.length === 11) {
      maskedPhone = `${maskedPhone.slice(0,3)}-****-${maskedPhone.slice(7,11)}`;
    } else if (g.phone) {
      maskedPhone = g.phone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3');
    }
    return `${maskedName} (${g.relation}) ${maskedPhone}`;
  } else {
    return `${g.name} (${g.relation}) ${formatPhoneNumber(g.phone)}`;
  }
}) : [];


// 전화번호 하이픈 추가
function formatPhoneNumber(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7,11)}`;
  }
  return phone; // fallback
}

  const memo = masked ? (profileData.memo ? profileData.memo.replace(/[^\s]/g, '*') : '') : (profileData.memo || '');

  const handleEdit = () => {
    // 부모 컴포넌트에서 onEdit prop이 제공된 경우 부모가 처리하도록 함
    if (onEdit) {
      onEdit(profileData);
    } else {
      // 부모 컴포넌트에서 onEdit이 없는 경우 자체적으로 처리
      setEditClient(profileData);
      setRegisterOpen(true);
    }
  }

  const handleEditMemo = () => {
    console.log('메모수정');
  };

  return (
    <>
      <div className="client-profile">
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
            display: 'block',
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
                  <td>{formatPhoneNumber(phone)}</td>
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
