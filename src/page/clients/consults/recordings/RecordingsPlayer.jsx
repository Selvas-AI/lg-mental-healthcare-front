import React, { useRef, useState, useEffect } from "react";
import "./recordings.scss";
import TestAudio from "@/assets/audio/test_audio.mp3";

// 위험키워드 감지
const dangerKeywords = ['자살'];
function isDangerContent(content) {
  return dangerKeywords.some(word => content.includes(word));
}

// time string을 초로 변환하는 유틸
function timeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const [min, sec] = timeStr.split(':').map(Number);
  return min * 60 + sec;
}

function RecordingsPlayer({ speakWrapRef, transcript, searchKeyword, highlightInfo, currentIndex, editMode, onChangeTranscript }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  // 각 발화별 editor ref 배열
  const editorRefs = useRef([]);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  // 클릭한 content idx만 에디터로
  const [editingIdx, setEditingIdx] = useState(null);

  // 현재 재생시간에 해당하는 current 인덱스 계산
  const currentIdx = React.useMemo(() => {
    let idx = -1;
    transcript.forEach((item, i) => {
      if (timeToSeconds(item.time) <= current) idx = i;
    });
    return idx;
  }, [current, transcript]);

  // current 자동 스크롤
  useEffect(() => {
    if (!speakWrapRef?.current) return;
    if (currentIdx < 0) return;
    const container = speakWrapRef.current;
    const target = container.querySelectorAll('.speaker')[currentIdx];
    if (target) {
      const scrollTop = container.scrollTop;
      const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
      container.scrollTo({ top: scrollTop + offset, behavior: 'smooth' });
    }
  }, [currentIdx, speakWrapRef]);

  // 검색 하이라이트 이동 및 active 처리
  useEffect(() => {
    if (!speakWrapRef?.current) return;
    // 모든 하이라이트에서 active 제거
    const allHighlights = speakWrapRef.current.querySelectorAll('.txt-hlight');
    allHighlights.forEach(el => el.classList.remove('active'));
    // 전체 하이라이트 span 중 currentIndex-1 번째에만 active 부여
    if (
      searchKeyword &&
      highlightInfo &&
      highlightInfo.length > 0 &&
      typeof currentIndex === 'number' &&
      currentIndex > 0 &&
      currentIndex <= allHighlights.length
    ) {
      const targetSpan = allHighlights[currentIndex - 1];
      if (targetSpan) {
        targetSpan.classList.add('active');
        targetSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchKeyword, highlightInfo, currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const loaded = () => setDuration(audio.duration);
    audio.addEventListener("loadedmetadata", loaded);
    return () => audio.removeEventListener("loadedmetadata", loaded);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    playing ? audio.play() : audio.pause();
  }, [playing]);

  const handleTimeUpdate = () => {
    if (!dragging) setCurrent(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setCurrent(duration);
    setPlaying(false);
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrent(newTime);
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    handleProgressClick(e);
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    handleProgressClick(e);
  };
  const handleMouseUp = (e) => {
    if (dragging) {
      setDragging(false);
      handleProgressClick(e);
    }
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  });

  const skip = (sec) => {
    const audio = audioRef.current;
    if (!audio) return;
    let newTime = Math.max(0, Math.min(audio.currentTime + sec, duration));
    audio.currentTime = newTime;
    setCurrent(newTime);
  };

  const formatTime = (time) => {
    if (!isFinite(time)) return "00:00";
    const m = String(Math.floor(time / 60)).padStart(2, "0");
    const s = String(Math.floor(time % 60)).padStart(2, "0");
    return `${m}:${s}`;
  };

  // 외부 클릭 시 editingIdx 해제
  useEffect(() => {
    if (!editMode) {
      setEditingIdx(null);
      return;
    }
    const handleClick = (e) => {
      // editor가 아닌 영역 클릭 시
      if (!e.target.closest('.editor')) {
        setEditingIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [editMode]);

  useEffect(() => {
    if (
      editMode &&
      editingIdx !== null &&
      editorRefs.current[editingIdx]
    ) {
      const currentContent = transcript[editingIdx].content;
      editorRefs.current[editingIdx].innerHTML = currentContent.replace(/\n/g, '<br>');
    }
    // editingIdx, editMode가 바뀔 때만 실행 (transcript는 의존성에서 제거)
  }, [editingIdx, editMode]);

  const [isComposing, setIsComposing] = useState(false);

  const handleInput = e => {
    if (!isComposing) {
      let text = e.currentTarget.innerText;
      onChangeTranscript(editingIdx, text);
    }
  };

  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = e => {
    setIsComposing(false);
    let text = e.currentTarget.innerText;
    onChangeTranscript(editingIdx, text);
  };

  return (
    <div className="tab-panel record-content on" role="tabpanel">
      <div className="inner">
        <div className={`record-area ${editMode ? 'edit-mode' : ''}`}>
          <div className="speak-wrap">
            <div className="inner" ref={speakWrapRef}>
              {transcript.map((item, idx) => (
                <div
                  key={idx}
                  className={`speaker ${item.speaker}${idx === currentIdx ? ' current' : ''}${!editMode && isDangerContent(item.content) ? ' stress-highlights' : ''}`}
                >
                  <div className="info">
                    <span className="speaker-id">{item.name}</span>
                    <span className="time">{item.time}</span>
                  </div>
                  <div className={`content ${(!item.content || item.content.trim() === '') ? 'delete' : ''}`}>
                    {editMode && idx === editingIdx ? (
                      <div className="editor-wrap">
                        <div
                          className="editor"
                          contentEditable
                          suppressContentEditableWarning
                          ref={el => editorRefs.current[idx] = el}
                          onInput={handleInput}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd}
                          style={{
                            width: '100%',
                            height: 'auto',
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'break-word',
                            outline: 'none',
                            resize: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #7A8A93',
                            boxSizing: 'border-box',
                            transition: 'box-shadow 0.2s',
                            marginBottom: '0'
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div onClick={() => editMode && setEditingIdx(idx)} style={{ cursor: editMode ? 'pointer' : 'default' }}>
                        {(!item.content || item.content.trim() === '') ? (
                          <p>녹취록 STT 변환된 본문을 모두 삭제하셨습니다.</p>
                          ) : (
                            item.content.split('\n').map((line, lineIdx) => {
                            const isDanger = dangerKeywords.some(word => line.includes(word));
                            if (isDanger) {
                              return <p key={lineIdx} className="dangerous-remark">{line}</p>;
                            }
                            if (searchKeyword && searchKeyword.length > 0 && highlightInfo) {
                              const highlights = highlightInfo.filter(
                                h => h.speakerIdx === idx && h.lineIdx === lineIdx
                              );
                              if (highlights.length === 0) {
                                return <React.Fragment key={lineIdx}>{line}<br /></React.Fragment>;
                              }
                              let result = [];
                              let lastIdx = 0;
                              highlights.forEach((h, hi) => {
                                if (h.start > lastIdx) {
                                  result.push(
                                    <React.Fragment key={hi + '-n'}>{line.slice(lastIdx, h.start)}</React.Fragment>
                                  );
                                }
                                result.push(
                                  <span key={hi + '-h'} className="txt-hlight">{line.slice(h.start, h.end)}</span>
                                );
                                lastIdx = h.end;
                              });
                              if (lastIdx < line.length) {
                                result.push(<React.Fragment key={lastIdx + '-rest'}>{line.slice(lastIdx)}</React.Fragment>);
                              }
                              return <React.Fragment key={lineIdx}>{result}<br /></React.Fragment>;
                            } else {
                              return <React.Fragment key={lineIdx}>{line}<br /></React.Fragment>;
                            }
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="control-wrap">
            <div className="inner">
              <audio
                ref={audioRef}
                src={TestAudio}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={e => setDuration(e.target.duration)}
                preload="metadata"
              />
                <div
                  className="progress-bar"
                  ref={progressRef}
                  onMouseDown={handleMouseDown}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="progress-fill"
                    style={{ width: duration ? `${(current / duration) * 100}%` : '0%' }}
                  ></div>
                </div>
                <div className="player">
                  <div className="time-info">
                    <span id="current-time">{formatTime(current)}</span>
                  </div>
                  <div className="btn-wrap">
                    <button
                      className="skip-backward-btn"
                      type="button"
                      aria-label="5초 뒤로가기"
                      onClick={() => skip(-5)}
                    ></button>
                    {!playing && (
                      <button
                        className="play-btn"
                        type="button"
                        aria-label="재생 버튼"
                        onClick={() => setPlaying(true)}
                        style={{ display: playing ? 'none' : 'block' }}
                      ></button>
                    )}
                    {playing && (
                      <button
                        className="pause-btn"
                        type="button"
                        aria-label="정지 버튼"
                        onClick={() => setPlaying(false)}
                        style={{ display: !playing ? 'none' : 'block' }}
                      ></button>
                    )}
                    <button
                      className="skip-forward-btn"
                      type="button"
                      aria-label="5초 앞으로가기"
                      onClick={() => skip(5)}
                    ></button>
                  </div>
                  <div className="time-info">
                    <span id="total-time">{formatTime(duration)}</span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordingsPlayer;
