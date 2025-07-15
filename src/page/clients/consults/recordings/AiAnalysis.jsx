import React, { useRef, useState } from 'react'
import KeywordBox from './../transcript/KeywordBox';
import FrequencyBox from './../transcript/FrequencyBox';
import StressBox from './../transcript/StressBox';
import CustomTextarea from '@/components/CustomTextarea';

function AiAnalysis() {
  const AiSummaryData = {
    // summary: "최근 몇 개월간 불면과 무기력함이 지속되며, 일상생활에 집중하기 어렵다고 호소함. 대인관계에서도 쉽게 예민해지고 감정 조절이 힘들어져 사회생활에 지장을 받고 있음. 우울감이 잦고, 스스로에 대한 부정적인 생각이 반복된다고 함. 최근 몇 개월간 불면과 무기력함이 지속되며, 일상생활에 집중하기 어렵다고 호소함. 대인관계에서도 쉽게 예민해지고 감정 조절이 힘들어져 사회생활에 지장을 받고 있음. 우울감이 잦고, 스스로에 대한 부정적인 생각이 반복된다고 함. 최근 몇 개월간 불면과 무기력함이 지속되며, 일상생활에 집중하기 어렵다고 호소함. 대인관계에서도 쉽게 예민해지고 감정 조절이 힘들어져 사회생활에 지장을 받고 있음. 우울감이 잦고, 스스로에 대한 매우 부정적인 생각이 반복된다고 함. 최근 몇 개월간 불면과 무기력함이 지속되며, 일상생활에 집중하기 어렵고 회사업무 시 고충으로 다가온다고함. 가장 불편한 부분이 이런점이라고 꼽으며 개선 가능 여부를 물어봄. 일상생활에 집중하기 어렵다고 호소함",
    // issue: ["원인을 알 수 없는 불안감 호소", "간헐적 불면증", "낮은 자존감으로 인한 대인관계 어려움", "자신에 대한 부정적인 생각", "고충", "개선 가능 여부"],
    // keyword: [
    //   { text: '힘들어', freq: 18, x: 240, y: 70 },
    //   { text: '트라우마', freq: 16, x: 370, y: 70 },
    //   { text: '죽고싶은', freq: 12, x: 155, y: 100 },
    //   { text: '괴롭힘', freq: 12, x: 100, y: 50 },
    //   { text: '우울감', freq: 11, x: 50, y: 100 },
    //   { text: '잘했다', freq: 10, x: 35, y: 35 },
    //   { text: '엄마', freq: 9, x: 165, y: 35 },
    //   { text: '후회', freq: 8, x: 308, y: 110 },
    //   { text: '사랑', freq: 8, x: 310, y: 25 }
    // ],
    // frequency: {
    //   counselor: { minutes: 12},
    //   client: { minutes: 45}
    // },
    // stress: {
    //   data: [1.5, 3.2, 2.8, 1.5, 4.5, 3, 1.5],
    //   labels: ["00:00", "15:00", "17:12", "22:00", "25:12", "30:00", "55:12"]
    // }
  };

  return (
    <div className="tab-panel ai-analysis on" role="tabpanel">
      <div className="inner">
        <div className="dashboard">
          {/* 상담요약 */}
          <div className="summary txt-box">
            <div className="box-tit">
              <strong>1. 상담요약</strong>
              <div className="btn-wrap">
                <button className="type01 h36" type="button">
                  <span>AI 생성하기</span>
                </button>
              </div>
            </div>
            {!AiSummaryData.summary ? (
              <div className="empty-board">[AI 생성하기]를 선택하면 AI가 생성한 분석 자료를 확인 할 수 있어요.</div>
            ) : (
              <CustomTextarea
                value={AiSummaryData.summary}
                placeholder="상담요약을 입력해주세요."
                className="editor-wrap"
              />
            )}
          </div>
          {/* 고민주제 */}
          <div className="issue txt-box">
            <div className="box-tit">
              <strong>2. 고민주제</strong>
              <div className="btn-wrap">
                <button className="type01 h36" type="button">
                  <span>AI 생성하기</span>
                </button>
              </div>
            </div>
            {!AiSummaryData.issue ? (
              <div className="empty-board">[AI 생성하기]를 선택하면 AI가 생성한 분석 자료를 확인 할 수 있어요.</div>
            ) : (
              <CustomTextarea
                value={AiSummaryData.issue}
                placeholder="상담요약을 입력해주세요."
                className="editor-wrap"
              />
            )}
          </div>
          <div className="flex-wrap">
              {/* 키워드 분석 */}
              {Array.isArray(AiSummaryData.keyword?.data) && AiSummaryData.keyword.data.length > 0 ? (
                <KeywordBox
                  data={AiSummaryData.keyword}
                />
              ) : (
              <div className="keyword box">
                <div className="box-tit">
                  <strong>3. 키워드 분석</strong>
                  <button className="type01 h36" type="button">
                    <span>AI 생성하기</span>
                  </button>
                </div>
                <div className="empty-board">[AI 생성하기]를 선택하면<br/>AI가 생성한 분석 자료를 확인 할 수 있어요.</div>
              </div>
              )}
              {/* 발화빈도 */}
              {Array.isArray(AiSummaryData.frequency?.data) && AiSummaryData.frequency.data.length > 0 ? (
                <FrequencyBox
                  data={AiSummaryData.frequency}
                />
              ) : (
              <div className="frequency box">
                <div className="box-tit">
                  <strong>4. 발화빈도</strong>
                  <button className="type01 h36" type="button">
                    <span>AI 생성하기</span>
                  </button>
                </div>
                <div className="empty-board">[AI 생성하기]를 선택하면<br/>AI가 생성한 분석 자료를 확인 할 수 있어요.</div>
              </div>
              )}
              {/* 스트레스 징후 */}
              {Array.isArray(AiSummaryData.stress?.data) && AiSummaryData.stress.data.length > 0 ? (
                <StressBox data={AiSummaryData.stress.data} labels={AiSummaryData.stress.labels} />
              ) : (
              <div className="stress box">
                <div className="box-tit">
                  <strong>5. 스트레스 징후</strong>
                  <button className="type01 h36" type="button">
                    <span>AI 생성하기</span>
                  </button>
                </div>
                <div className="empty-board">[AI 생성하기]를 선택하면<br/>AI가 생성한 분석 자료를 확인 할 수 있어요.</div>
              </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiAnalysis