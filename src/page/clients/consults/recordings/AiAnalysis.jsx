import React, { useState, useEffect } from 'react'
// import KeywordBox from './../transcript/KeywordBox';
import KeywordBubblePack from './../transcript/KeywordBubblePack';
import FrequencyBox from './../transcript/FrequencyBox';
import StressBox from './../transcript/StressBox';
import CustomTextarea from '@/components/CustomTextarea';

function AiAnalysis({ onAiCreateClick, AiSummaryData, onChangeSummary, onChangeIssue }) {
  const [editSummary, setEditSummary] = useState(false);
  const [editIssue, setEditIssue] = useState(false);
  // 에디터 표시 상태: 한 번 표시되면 내용이 비어도 유지
  const [summaryEditorOpen, setSummaryEditorOpen] = useState(!!AiSummaryData?.summary);
  const [issueEditorOpen, setIssueEditorOpen] = useState(!!AiSummaryData?.issue);
  const keywordData = AiSummaryData?.rawMngData?.parsedKeyword ?? AiSummaryData?.keyword;

  // 외부 데이터로 요약/고민주제가 도착하면 에디터를 표시 상태로 유지
  useEffect(() => {
    // 초기값이 비어있지 않은 경우에만 자동으로 에디터 표시 (빈 문자열은 제외)
    if (AiSummaryData && typeof AiSummaryData.summary === 'string' && AiSummaryData.summary.trim() !== '') {
      setSummaryEditorOpen(true);
    }
  }, [AiSummaryData?.summary]);

  useEffect(() => {
    // 초기값이 비어있지 않은 경우에만 자동으로 에디터 표시 (빈 문자열은 제외)
    if (AiSummaryData && typeof AiSummaryData.issue === 'string' && AiSummaryData.issue.trim() !== '') {
      setIssueEditorOpen(true);
    }
  }, [AiSummaryData?.issue]);

  return (
    <div className="tab-panel ai-analysis on" role="tabpanel">
      <div className="inner">
        <div className="dashboard">
          {/* 상담요약 */}
          <div className="summary txt-box">
            <div className="box-tit">
              <strong>1. 상담요약</strong>
              <div className="btn-wrap">
                {!summaryEditorOpen ? (
                  <a className="edit-btn cursor-pointer" onClick={() => { setEditSummary(true); setSummaryEditorOpen(true); }}>직접 입력</a>
                ) : null}
                <button className="type01 h36" type="button" onClick={() => onAiCreateClick(1)}>
                  <span>AI 생성하기</span>
                </button>
              </div>
            </div>
            {!summaryEditorOpen ? (
              <div className="empty-board">[AI 생성하기]를 선택하면 AI가 생성한 분석 자료를 확인 할 수 있어요.</div>
            ) : (
              <CustomTextarea
                value={AiSummaryData.summary ?? ''}
                placeholder="상담요약을 입력해주세요."
                className="editor-wrap"
                onChange={(e) => onChangeSummary && onChangeSummary(e?.target ? e.target.value : e)}
              />
            )}
          </div>
          {/* 고민주제 */}
          <div className="issue txt-box">
            <div className="box-tit">
              <strong>2. 고민주제</strong>
              <div className="btn-wrap">
                {!issueEditorOpen ? (
                  <a className="edit-btn cursor-pointer" onClick={() => { setEditIssue(true); setIssueEditorOpen(true); }}>직접 입력</a>
                ) : null}
                <button className="type01 h36" type="button" onClick={() => onAiCreateClick(2)}>
                  <span>AI 생성하기</span>
                </button>
              </div>
            </div>
            {!issueEditorOpen ? (
              <div className="empty-board">[AI 생성하기]를 선택하면 AI가 생성한 분석 자료를 확인 할 수 있어요.</div>
            ) : (
              <CustomTextarea
                value={AiSummaryData.issue ?? ''}
                placeholder="상담요약을 입력해주세요."
                className="editor-wrap"
                onChange={(e) => onChangeIssue && onChangeIssue(e?.target ? e.target.value : e)}
              />
            )}
          </div>
          <div className="flex-wrap">
              {/* 키워드 분석 */}
              {(Array.isArray(keywordData) && keywordData.length > 0) ||
                (keywordData && Array.isArray(keywordData.llm_answer) && keywordData.llm_answer.length > 0) ? (
                <KeywordBubblePack
                  data={keywordData}
                />
              ) : (
              <div className="keyword box">
                <div className="box-tit">
                  <strong>3. 키워드 분석</strong>
                  {/* <button className="type01 h36" type="button" onClick={() => onAiCreateClick(3)}>
                    <span>AI 생성하기</span>
                  </button> */}
                </div>
                <div className="empty-board" style={{ height: 270 }}>[AI 생성하기]를 선택하면<br/>AI가 생성한 분석 자료를 확인 할 수 있어요.</div>
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
                  {/* <button className="type01 h36" type="button" onClick={() => onAiCreateClick(4)}>
                    <span>AI 생성하기</span>
                  </button> */}
                </div>
                <div className="empty-board" style={{ height: 270 }}>[AI 생성하기]를 선택하면<br/>AI가 생성한 분석 자료를 확인 할 수 있어요.</div>
              </div>
              )}
              {/* 스트레스 징후 */}
              {Array.isArray(AiSummaryData.stress?.data) && AiSummaryData.stress.data.length > 0 ? (
                <StressBox data={AiSummaryData.stress.data} labels={AiSummaryData.stress.labels} />
              ) : (
              <div className="stress box">
                <div className="box-tit">
                  <strong>5. 스트레스 징후</strong>
                  {/* <button className="type01 h36" type="button" onClick={() => onAiCreateClick(5)}>
                    <span>AI 생성하기</span>
                  </button> */}
                </div>
                <div className="empty-board">스트레스 징후 데이터가 없습니다.</div>
              </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiAnalysis