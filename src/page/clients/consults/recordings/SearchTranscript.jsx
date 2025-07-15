import React, { useRef, useState, useEffect } from "react";

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SearchTranscript = ({ targetRef, transcript, onSearch, searchKeyword }) => {
  const inputRef = useRef();
  const [keyword, setKeyword] = useState(searchKeyword || '');
  const [matches, setMatches] = useState([]); // [{speakerIdx, lineIdx, start, end}]
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHelper, setShowHelper] = useState(false);
  const [highlighted, setHighlighted] = useState([]); // transcript의 각 줄별 하이라이트 정보

  const performSearch = () => {
    const keywordVal = inputRef.current.value.trim();
    setKeyword(keywordVal);
    let nextIndex = 0;
    if (!keywordVal) {
      setMatches([]);
      setShowHelper(false);
      setHighlighted([]);
      restoreOriginalHtml();
      if (onSearch) onSearch('', [], 0);
      setCurrentIndex(0);
      return;
    }
    setShowHelper(true);
    const newMatches = [];
    const newHighlighted = transcript.map((item, speakerIdx) => {
      const lines = item.content.split('\n');
      return lines.map((line, lineIdx) => {
        if (!keywordVal) return { text: line, highlights: [] };
        const regex = new RegExp(escapeRegExp(keywordVal), 'gi');
        let match;
        let lastIndex = 0;
        let segments = [];
        let highlights = [];
        let matchIdx = 0;
        while ((match = regex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            segments.push({ text: line.slice(lastIndex, match.index), highlight: false });
          }
          segments.push({ text: match[0], highlight: true });
          highlights.push({ start: match.index, end: regex.lastIndex });
          newMatches.push({ speakerIdx, lineIdx, start: match.index, end: regex.lastIndex });
          lastIndex = regex.lastIndex;
          matchIdx++;
        }
        if (lastIndex < line.length) {
          segments.push({ text: line.slice(lastIndex), highlight: false });
        }
        return { text: line, segments, highlights };
      });
    });
    nextIndex = newMatches.length > 0 ? 1 : 0;
    setMatches(newMatches);
    setHighlighted(newHighlighted);
    setCurrentIndex(nextIndex);
    if (onSearch) onSearch(keywordVal, newMatches, nextIndex);
  };

  // 원본 복원
  const restoreOriginalHtml = () => {
    if (!targetRef?.current) return;
    targetRef.current.querySelectorAll('.content').forEach(el => {
      if (el.dataset.originalHtml) {
        el.innerHTML = el.dataset.originalHtml;
      }
    });
  };

  // 인풋 변경
  const handleInput = (e) => {
    if (e.target.value.trim() === '') {
      setKeyword('');
      setMatches([]);
      setCurrentIndex(0);
      setShowHelper(false);
      restoreOriginalHtml();
    }
  };

  // 엔터 키
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  // 검색 버튼
  const handleSearchClick = () => {
    performSearch();
  };

  // 위/아래 이동
  const moveUp = () => {
    if (matches.length === 0) return;
    setCurrentIndex((prev) => {
      let next = prev - 1;
      if (next < 1) next = matches.length;
      return next;
    });
  };

  const moveDown = () => {
    if (matches.length === 0) return;
    setCurrentIndex((prev) => {
      let next = prev + 1;
      if (next > matches.length) next = 1;
      return next;
    });
  };

  // currentIndex가 바뀔 때 상위에 onSearch 전달
  useEffect(() => {
    if (onSearch) onSearch(keyword, matches, currentIndex);
  }, [currentIndex]);

  return (
    <div className="input-wrap search word-move">
      <input
        ref={inputRef}
        type="text"
        name="search-word"
        placeholder="녹음내용 검색할 수 있어요."
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />
      <div className={`move-helper${showHelper ? ' on' : ''}`}>
        <p>
          <span className="current">{currentIndex}</span>/<span className="total">{matches.length}</span>
        </p>
        <div className="btn-wrap">
          <button className="up-btn" type="button" aria-label="위로 이동" onClick={moveUp} disabled={currentIndex === 1}></button>
          <button className="down-btn" type="button" aria-label="아래로 이동" onClick={moveDown} disabled={currentIndex === matches.length}></button>
        </div>
      </div>
      <button className="search-btn" type="button" aria-label="검색" onClick={handleSearchClick}></button>
    </div>
  );
};

export default SearchTranscript;
