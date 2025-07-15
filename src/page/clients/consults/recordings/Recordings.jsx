import React, { useState, useRef, useLayoutEffect } from "react";
import './recordings.scss';
import RecordingsPlayer from "./RecordingsPlayer";
import SearchTranscript from "./SearchTranscript";
import ToastPop from '@/components/ToastPop';
import SectionSummaryPanel from './SectionSummaryPanel';
import { useSetRecoilState, useRecoilState } from 'recoil';
import { supportPanelState, recordingsTabState } from '@/recoil';
import AiAnalysis from "./AiAnalysis";

// 화자별 녹취 더미데이터
const transcriptDummyInit = [
  {
    speaker: 'speaker01',
    name: '발화자1',
    time: '00:01',
    content: '안녕하세요 어떤 이유로 상담을 하게 되셨나요?'
  },
  {
    speaker: 'speaker02',
    name: '발화자2',
    time: '00:08',
    content: '아는 언니가 여기에 다녔었는데 저한테 받아볼 생각이 없냐고 해서요. 제가 요즘 이유 없이 불안하고 잠에 드는 것이 힘들어요.\n자존감이 낮아서 가족이나 친구들에게 털어 놓는 것이 많이 어렵고요.\n최근엔 잠까지 못자게 되면서 하루종일 에너지도 없고 아침에 일어나는게 일단 너무 힘들어요.'
  },
  {
    speaker: 'speaker01',
    name: '발화자1',
    time: '05:01',
    content: '그동안 정말 고민도 많고 힘드셨을 것 같아요.\n가족이나 친구들한테 쉽게 고민을 털어놓기 어렵다고 하셨는데 혹시 고민을 털어 놨을 때 부정적인 피드백을 받으신 적이 있으실까요?'
  },
  {
    speaker: 'speaker02',
    name: '발화자2',
    time: '09:11',
    content: '엄마한테 이런 고민을 이야기한 적이 있었는데요. 원래 사는 것이 힘든 거다. 내가 더 힘들다.\n너는 뭐가 그렇게 힘드냐고 타박을 받은 적이 있어요.\n그래서 그 이후로 이런 이야기는 안하게 되고요. 친구들한테도 이야기하기 어려워졌어요.\n괜히 이런 이야기하면 약한 사람 같고 친구들한테 우울한 이야기를 하는게 미안하기도 하고요.\n자살은 어떤걸까? 라는 생각이 들었던 것 같아요.'
  },
  {
    speaker: 'speaker01',
    name: '발화자1',
    time: '18:29',
    content: '그런 일들이 있으셨군요.\n힘든 이야기를 꺼낸 건데 엄마한테 그런 이야기를 들으면 속상하고 더이상 이야기하고 싶지 않은 기분이 들었을 것 같아요.\n그때 심정이 어떠셨을까요?'
  },
];

function Recordings() {
  const tabListRef = useRef([]); // 각 탭 li 참조 배열 추가
  const [activeTab, setActiveTab] = useRecoilState(recordingsTabState);
  const tabIndicatorRef = useRef(null);
  const speakWrapRef = useRef();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [highlightInfo, setHighlightInfo] = useState(null);
  const [showSectionSummary, setShowSectionSummary] = useState(false);
  const setSupportPanel = useSetRecoilState(supportPanelState);
  
  // 수정 가능한 transcript 상태
  const [transcriptDummy, setTranscriptDummy] = useState(transcriptDummyInit);
  // 수정 모드
  const [editMode, setEditMode] = useState(false);
  // 토스트 메시지 상태
  const [showToast, setShowToast] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleSearch = (keyword, highlightInfo, cIndex) => {
    setSearchKeyword(keyword);
    setHighlightInfo(highlightInfo);
    setCurrentIndex(cIndex);
  };
  // 텍스트 수정 핸들러
  const handleChangeTranscript = (idx, newContent) => {
    setTranscriptDummy(prev => prev.map((item, i) => i === idx ? { ...item, content: newContent } : item));
  };
  
  // 탭 indicator 이동 효과
  useLayoutEffect(() => {
    const tabIdx = activeTab === "recordings" ? 0 : 1;
    const currentTab = tabListRef.current[tabIdx];
    const indicator = tabIndicatorRef.current;
    if (currentTab && indicator) {
      const tabWidth = currentTab.offsetWidth;
      const tabLeft = currentTab.offsetLeft;
      indicator.style.width = tabWidth + 'px';
      indicator.style.left = tabLeft + 'px';
    }
  }, [activeTab]);

  // 저장 버튼 클릭 시
  const handleSave = () => {
    setEditMode(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="inner">
      <div className="move-up">
        <strong className="page-title">3회기 녹취록</strong>
        <div className="flex-wrap">
            {/* 녹음내용 검색 컴포넌트 */}
            <SearchTranscript
              targetRef={speakWrapRef}
              transcript={transcriptDummy}
              onSearch={handleSearch}
              searchKeyword={searchKeyword}
            />
            {/* 수정/저장 버튼 토글 */}
            <button className={`record-edit-btn type07 black ${!editMode ? 'on' : ''}`} type="button" onClick={() => setEditMode(true)}>수정</button>
            <button className={`record-save-btn type07 black ${editMode ? 'on' : ''}`} type="button" onClick={handleSave}>저장</button>
        </div>
      </div>
      <div className="tab-menu">
        <div className="tab-list-wrap">
          <div>
              <ul className="tab-list" role="tablist" style={{ cursor: 'pointer' }}>
                  <li
                    className={activeTab === "recordings" ? 'on' : ''}
                    role="tab"
                    ref={el => tabListRef.current[0] = el}
                  >
                      <a onClick={() => setActiveTab("recordings")}>녹취내용</a>
                  </li>
                  <li
                    className={activeTab === "aianalysis" ? 'on' : ''}
                    role="tab"
                    ref={el => tabListRef.current[1] = el}
                  >
                      <a onClick={() => setActiveTab("aianalysis")}>AI 분석</a>
                  </li>
              </ul>
              <div className="tab-indicator" ref={tabIndicatorRef}></div>
          </div>
          <div className="info-bar">
              <p className="info">2024.09.28(토) 오후 2시</p>
              <a className="panel-btn" onClick={() => {
                setShowSectionSummary(true);
                setSupportPanel(true);
              }} style={{cursor:'pointer'}}>
                구간 요약
              </a>
          </div>
        </div>
        <div className="tab-cont">
          {/* 녹취내용 */}
          {activeTab === "recordings" && (
            <RecordingsPlayer
              speakWrapRef={speakWrapRef}
              transcript={transcriptDummy}
              searchKeyword={searchKeyword}
              highlightInfo={highlightInfo}
              currentIndex={currentIndex}
              editMode={editMode}
              onChangeTranscript={handleChangeTranscript}
            />
          )}
          {/* AI 분석 */}
          {activeTab === "aianalysis" && (
            <AiAnalysis />
          )}
        </div>
      </div>
      {showSectionSummary && (
        <SectionSummaryPanel onClose={() => {
          setShowSectionSummary(false);
          setSupportPanel(false);
        }} />
      )}
      <ToastPop message="변경사항이 녹취록에 저장 되었습니다." showToast={showToast} />
    </div>
  );
}

export default Recordings;
