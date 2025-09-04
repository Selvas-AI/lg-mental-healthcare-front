import React, { useEffect, useRef, useState } from "react";
import './recordings.scss';
import IconLoading from "@/assets/images/common/loading.svg";

function SectionSummaryPanel({ open, onClose, sectionData = [] }) {
  // 로딩 상태 관리
  const [status, setStatus] = useState('complete');
  const openTimerRef = useRef(null);
  
  // 패널 오픈 시마다 2초 로딩 처리
  useEffect(() => {
    if (open) {
      setStatus('creating');
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      openTimerRef.current = setTimeout(() => {
        setStatus('complete');
        openTimerRef.current = null;
      }, 2000);
    } else {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
      setStatus('complete');
    }
    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
        openTimerRef.current = null;
      }
    };
  }, [open]);
  
  // 시간을 MM:SS 형식으로 변환하는 함수
  const formatTime = (timeStr) => {
    if (!timeStr) return '00:00';
    const time = parseFloat(timeStr);
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 위험 발언 감지 함수
  const isDangerousRemark = (summary) => {
    const dangerousKeywords = ['죽고싶', '자살', '죽음', '살아있는게 의미', '죽어버리고', '사라지고'];
    return dangerousKeywords.some(keyword => summary.includes(keyword));
  };
  
  return (
    <div className={"support-panel section-summary" + (open ? " on" : "")}>
      <div className="inner">
        <div className="panel-tit">
          <div className="tit-wrap">
            <strong>구간요약</strong>
            <button className="close-btn" type="button" aria-label="닫기" onClick={onClose}></button>
          </div>
          <div className="info" style={{ background: "#FCF5FF" }}>
            {status === 'creating' ? (
              <div className="creating" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={IconLoading} alt="로딩" />
                <p style={{ color: "#C53EFF", margin: 0 }}>AI가 생성하고 있습니다.</p>
              </div>
            ) : (
              <p style={{ color: "#C53EFF" }}>상담 녹취록을 바탕으로 AI가 요약한 내용입니다.</p>
            )}
          </div>
        </div>
        <div className="panel-cont">
          {status === 'complete' && (
            <div className="inner">
              {sectionData.length > 0 ? (
                  sectionData.map((section, index) => (
                    <div key={index} className="section-info">
                      <div className="topic-wrap">
                        <span className="topic">{section.대화주제}</span>
                        <div className="time">
                          <span>{formatTime(section.시작시간)}</span> ~ <span>{formatTime(section.종료시간)}</span>
                        </div>
                      </div>
                      <div className="summary">
                        {section.대화요약?.map((summary, summaryIndex) => (
                          <div key={summaryIndex} className="bullet-line">
                            {isDangerousRemark(summary) ? (
                              <strong className="dangerous-remark">{summary}</strong>
                            ) : (
                              summary
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="section-info">
                    <div className="summary">
                      <div className="bullet-line">구간 요약 데이터가 없습니다.</div>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SectionSummaryPanel;
