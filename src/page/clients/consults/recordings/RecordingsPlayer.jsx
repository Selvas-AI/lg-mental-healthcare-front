import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { transcriptUpdate } from '@/api/apiCaller';
import "./recordings.scss";

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

const RecordingsPlayer = forwardRef(({ speakWrapRef, transcript, searchKeyword, highlightInfo, currentIndex, editMode, onChangeTranscript, audioUrl, sessionSeq, onSave }, ref) => {
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
  // 오디오 로드 상태
  const [audioLoaded, setAudioLoaded] = useState(false);

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
    const loaded = () => {
      setDuration(audio.duration);
      setAudioLoaded(true);
    };
    const loadStart = () => {
      setAudioLoaded(false);
    };
    const error = (e) => {
      setAudioLoaded(false);
    };
    
    audio.addEventListener("loadedmetadata", loaded);
    audio.addEventListener("loadstart", loadStart);
    audio.addEventListener("error", error);
    
    return () => {
      audio.removeEventListener("loadedmetadata", loaded);
      audio.removeEventListener("loadstart", loadStart);
      audio.removeEventListener("error", error);
    };
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioLoaded) return;
    
    if (playing) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [playing, audioLoaded]);

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

  // 편집 모드 진입 시 재생을 즉시 일시정지
  useEffect(() => {
    if (editMode) {
      setPlaying(false);
    }
  }, [editMode]);

  const [isComposing, setIsComposing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // transcript 데이터를 transcriptText 형식으로 변환
  const convertTranscriptToText = (transcriptData) => {
    return transcriptData.map(item => {
      const speakerName = item.name || '발화자';
      const time = item.time || '00:00';
      const content = item.content || '';
      return `[${time}] ${speakerName}: ${content}`;
    }).join('\n');
  };

  // 녹취록 저장 함수
  const handleSaveTranscript = async () => {
    if (!sessionSeq) {
      console.error('sessionSeq가 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const transcriptText = convertTranscriptToText(transcript);
      const payload = {
        sessionSeq: parseInt(sessionSeq, 10),
        transcriptText: transcriptText,
        //sectionSummaryText: '' //! 추후 작업
      };

      const response = await transcriptUpdate(payload);
      
      if (response?.code === 200) {
        // 저장 성공 시 부모 컴포넌트의 onSave 콜백 호출
        if (onSave) {
          onSave();
        }
      } else {
        console.error('녹취록 저장 실패:', response?.message);
        alert('녹취록 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('녹취록 저장 중 오류:', error);
      alert('녹취록 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // ref를 통해 외부에서 handleSaveTranscript 호출 가능하도록 설정
  useImperativeHandle(ref, () => ({
    handleSaveTranscript
  }));

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
                  className={`speaker ${item.speaker === 'counselor' ? 'speaker01' : 'speaker02'}${idx === currentIdx ? ' current' : ''}${!editMode && isDangerContent(item.content) ? ' stress-highlights' : ''}`}
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
                            minHeight: '42px', // 최소 높이 설정 (한 줄 높이)
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
                            marginBottom: '0',
                            lineHeight: '1.5' // 라인 높이 명시
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
                src={audioUrl}
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
                        disabled={!audioLoaded || !audioUrl}
                        style={{ 
                          display: playing ? 'none' : 'block',
                          opacity: (!audioLoaded || !audioUrl) ? 0.5 : 1,
                          cursor: (!audioLoaded || !audioUrl) ? 'not-allowed' : 'pointer'
                        }}
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
                {editMode && (
                  <div className="save-btn-wrap" style={{ marginTop: '16px', textAlign: 'center' }}>
                    <button 
                      className="save-transcript-btn type01 h40"
                      type="button"
                      onClick={handleSaveTranscript}
                      disabled={isSaving}
                      style={{
                        opacity: isSaving ? 0.6 : 1,
                        cursor: isSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isSaving ? '저장 중...' : '녹취록 저장'}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RecordingsPlayer;
