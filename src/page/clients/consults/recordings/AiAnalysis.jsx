import React, { useRef, useState } from 'react'
import KeywordBox from './../transcript/KeywordBox';
import FrequencyBox from './../transcript/FrequencyBox';
import StressBox from './../transcript/StressBox';
import CustomTextarea from '@/components/CustomTextarea';

function AiAnalysis({ onAiCreateClick, AiSummaryData }) {

  return (
    <div className="tab-panel ai-analysis on" role="tabpanel">
      <div className="inner">
        <div className="dashboard">
          {/* 상담요약 */}
          <div className="summary txt-box">
            <div className="box-tit">
              <strong>1. 상담요약</strong>
              <div className="btn-wrap">
                {!AiSummaryData.summary ? <a className="edit-btn" >직접 입력</a> : null}
                <button className="type01 h36" type="button" onClick={onAiCreateClick}>
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
                {!AiSummaryData.issue ? <a className="edit-btn" >직접 입력</a> : null}
                <button className="type01 h36" type="button" onClick={onAiCreateClick}>
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
              {Array.isArray(AiSummaryData.keyword) && AiSummaryData.keyword.length > 0 ? (
                <KeywordBox
                  data={AiSummaryData.keyword}
                />
              ) : (
              <div className="keyword box">
                <div className="box-tit">
                  <strong>3. 키워드 분석</strong>
                  <button className="type01 h36" type="button" onClick={onAiCreateClick}>
                    <span>AI 생성하기</span>
                  </button>
                </div>
                <div className="empty-board">[AI 생성하기]를 선택하면<br/>AI가 생성한 분석 자료를 확인 할 수 있어요.</div>
              </div>
              )}
              {/* 발화빈도 */}
              {AiSummaryData.frequency && Object.keys(AiSummaryData.frequency).length > 0 ? (
                <FrequencyBox
                  data={AiSummaryData.frequency}
                />
              ) : (
              <div className="frequency box">
                <div className="box-tit">
                  <strong>4. 발화빈도</strong>
                  <button className="type01 h36" type="button" onClick={onAiCreateClick}>
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
                  <button className="type01 h36" type="button" onClick={onAiCreateClick}>
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