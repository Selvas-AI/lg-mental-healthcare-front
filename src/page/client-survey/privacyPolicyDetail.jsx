import React from 'react'

function PrivacyPolicyDetail({ onBack }) {
  return (
    <div className="inner">
      <div className="hd-wrap">
        <button className="back-btn" type="button" aria-label="뒤로가기" onClick={onBack}></button>
      </div>
      <div className="tit-wrap">
        <strong>개인정보 수집·이용에 대한 동의</strong>
      </div>
      <div className="con-wrap type01">
        <div className="item">
          <div className="con-info">
            <p className="top-info">
              온쉼은 내담자의 개인정보보호를 중요시하며, 「개인정보보호법」 제 15조 및 제 22조에 따라 아래와 같이 동의를 얻고자 합니다.<br />
              당사는 심리검사 및 상담 서비스 제공을 위해 필요한 최소한의 개인정보만을 수집하며, 동의 거부 시 검사 및 상담 서비스 이용에 제한이 있을 수 있습니다.
            </p>
            <div className="detail-info">
              <ul>
                <li>
                  <span>수집항목</span>
                  <p>이름, 성별, 휴대폰 번호, 생년월일</p>
                </li>
                <li>
                  <span>수집 목적</span>
                  <ul>
                    <li>심리검사 진행 및 내담자 식별</li>
                    <li>검사 결과 전달 및 상담 안내</li>
                    <li>서비스 운영 및 고객 관리</li>
                  </ul>
                </li>
                <li>
                  <span>보유 및 이용 기간</span>
                  <p>개인정보는 수집일로부터 1년간 보관 후 지체 없이 파기됩니다.<br />단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보존될 수 있습니다.</p>
                </li>
                <li>
                  <span>동의 거부 권리 및 불이익</span>
                  <p>귀하는 개인정보 수집·이용에 대해 동의를 거부할 수 있습니다.<br />단, 동의 거부 시 심리검사 및 상담 서비스 이용에 제한이 있을 수 있습니다.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyDetail
