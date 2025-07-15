import React from "react";
import './recordings.scss';

function SectionSummaryPanel({ onClose }) {
  return (
    <div className="support-panel section-summary on">
      <div className="inner">
        <div className="panel-tit">
          <div className="tit-wrap">
            <strong>구간요약</strong>
            <button className="close-btn" type="button" aria-label="닫기" onClick={onClose}></button>
          </div>
          <div className="info">
            <p>상담 녹취록을 바탕으로 AI가 요약한 내용입니다.</p>
          </div>
        </div>
        <div className="panel-cont">
          <div className="inner">
            <div className="section-info">
              <div className="topic-wrap">
                <span className="topic">상담 계기</span>
                <div className="time">
                  <span>00:00</span> ~ <span>01:13</span>
                </div>
              </div>
              <div className="summary">
                <div className="bullet-line">아는 언니의 소개로 상담 결심</div>
                <div className="bullet-line">불면증으로 고생</div>
                <div className="bullet-line">낮은 자존감으로 인한 대인관계 어려움</div>
              </div>
            </div>
            <div className="section-info">
              <div className="topic-wrap">
                <span className="topic">엄마와의 불화</span>
                <div className="time">
                  <span>05:01</span> ~ <span>09:11</span>
                </div>
              </div>
              <div className="summary">
                <div className="bullet-line">엄마에게 고민하는 부분을 말했지만 타박 받음.</div>
                <div className="bullet-line">이후 고민에 대해서 아무에게도 얘기하지 않게 됨</div>
              </div>
            </div>
            <div className="section-info">
              <div className="topic-wrap">
                <span className="topic">외로움을 이겨내기 위한 노력</span>
                <div className="time">
                  <span>12:00</span> ~ <span>18:00</span>
                </div>
              </div>
              <div className="summary">
                <div className="bullet-line">스스로 취미를 가지려고 노력함</div>
                <div className="bullet-line">아무도 몰래 정신과를 내원하여 약물 처방을 받음</div>
              </div>
            </div>
            <div className="section-info">
              <div className="topic-wrap">
                <span className="topic">당시 감정 변화</span>
                <div className="time">
                  <span>22:28</span> ~ <span>25:32</span>
                </div>
              </div>
              <div className="summary">
                <div className="bullet-line">
                  <strong className="dangerous-remark">‘죽고 싶을 만큼 외롭고 힘들었어요. 이럴 거면 살아 있는게 의미 있나 싶었어요.’ (위험발언 22:28)</strong>
                </div>
                <div className="bullet-line">자살을 고민할 정도로 힘든 시간을 보냄</div>
                <div className="bullet-line">남겨질 소중한 가족들과 친구들이 생각나서 괴로움을 느낌</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionSummaryPanel;
