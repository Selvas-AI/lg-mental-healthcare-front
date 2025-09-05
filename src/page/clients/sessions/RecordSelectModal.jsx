import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import CustomSelect from '@/components/CustomSelect';

const RecordSelectModal = ({ open, onClose, onSave, initialSessionDate, minDate, minDateTime }) => {
  const [selectedRecord, setSelectedRecord] = useState("");
  const [currentStep, setCurrentStep] = useState(2); // 1: 녹음파일 선택(주석처리), 2: 날짜/시간 선택
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showTimeOptions, setShowTimeOptions] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // 날짜 포맷 함수 (yy.mm.dd 형식)
  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 30분 단위로 24시간 전체 시간 옵션 생성
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const period = hour < 12 ? '오전' : '오후';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const timeStr = `${period} ${displayHour}:${minute.toString().padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  const defaultScrollTime = '오전 9:00';

  // 초기 sessionDate 파싱: "YYYY-MM-DD HH:MM" -> Date, "오전/오후 H:MM"
  const parseInitialSession = (sessionStr) => {
    if (!sessionStr || typeof sessionStr !== 'string') return { date: null, timeLabel: "" };
    const [datePart, timePart] = sessionStr.split(' ');
    if (!datePart || !timePart) return { date: null, timeLabel: "" };
    const [y, m, d] = datePart.split('-').map(n => parseInt(n, 10));
    const [hh, mm] = timePart.split(':').map(n => parseInt(n, 10));
    if (isNaN(y) || isNaN(m) || isNaN(d) || isNaN(hh) || isNaN(mm)) return { date: null, timeLabel: "" };
    const dateObj = new Date(y, m - 1, d);
    const period = hh < 12 ? '오전' : '오후';
    let displayHour = hh % 12;
    if (displayHour === 0) displayHour = 12; // 0 또는 12시는 12 표시
    const timeLabel = `${period} ${displayHour}:${String(mm).padStart(2, '0')}`;
    return { date: dateObj, timeLabel };
  };

  // 모달이 열릴 때 초기값 세팅
  useEffect(() => {
    if (open) {
      if (initialSessionDate) {
        const { date, timeLabel } = parseInitialSession(initialSessionDate);
        if (date) {
          setSelectedDate(date);
        }
        if (timeLabel && timeOptions.includes(timeLabel)) {
          setSelectedTime(timeLabel);
        }
      } else {
        // 지정된 값이 없다면 오늘 날짜 선택
        setSelectedDate(new Date());
      }
      setCurrentStep(2);
    }
  }, [open, initialSessionDate]);

  // const handleRecordSelect = (recordId) => {
  //   setSelectedRecord(recordId);
  // };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setShowTimeOptions(false);
    // TODO: 실제로는 선택된 날짜/시간에 이미 상담이 있는지 체크

  };

  const handleNextStep = () => {
    if (selectedRecord) {
      setCurrentStep(2);
    }
  };

  // HH:MM(24h) 문자열로 변환 (이미 있으니 그대로 사용)
  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(' ');
    if (parts.length !== 2) return null;
    const [period, time] = parts;
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    let hour24 = h;
    if (period === '오후' && h !== 12) hour24 = h + 12;
    if (period === '오전' && h === 12) hour24 = 0;
    return `${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // 선택된 날짜가 minDateTime과 같은 날인지
  const isSameDayWithMin = (date) => {
    if (!date || !minDateTime) return false;
    return (
      date.getFullYear() === minDateTime.getFullYear() &&
      date.getMonth() === minDateTime.getMonth() &&
      date.getDate() === minDateTime.getDate()
    );
  };

  // CustomSelect에 줄 옵션: 같은 날이면 minDateTime 이전 시간은 disabled
  const timeOptionsForSelect = timeOptions.map((timeStr) => {
    // timeStr: "오전 9:00" 형태
    const value24 = convertTo24Hour(timeStr); // "09:00"
    let disabled = false;

    if (selectedDate && minDateTime && isSameDayWithMin(selectedDate)) {
      const [hh, mm] = value24.split(':').map(Number);
      const candidate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hh, mm
      );
      // 직전 회기 "이후만" 허용 → 이전/같음은 disabled
      disabled = candidate <= minDateTime;
    }

    return { label: timeStr, value: timeStr, disabled };
  });

  // 같은 날로 바꾸었을 때, 현재 선택된 시간이 불가 상태면 리셋
  useEffect(() => {
    if (!selectedDate || !selectedTime || !minDateTime) return;
    if (!isSameDayWithMin(selectedDate)) return;

    const selected24 = convertTo24Hour(selectedTime);
    const [hh, mm] = selected24.split(':').map(Number);
    const chosen = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hh, mm
    );
    if (chosen <= minDateTime) {
      setSelectedTime(""); // 불가한 시간이면 선택 해제
    }
  }, [selectedDate, selectedTime, minDateTime]);

  // 저장 버튼 보호: 같은 날이면서 minDateTime 이전/같음이면 저장 비활성화
  const isSaveDisabled = (() => {
    if (!selectedDate || !selectedTime) return true;
    if (!minDateTime) return false;
    if (!isSameDayWithMin(selectedDate)) return false;
    const selected24 = convertTo24Hour(selectedTime);
    const [hh, mm] = selected24.split(':').map(Number);
    const chosen = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hh, mm
    );
    return chosen <= minDateTime;
  })();

  const handleSave = () => {
    if (selectedDate && selectedTime) {
      // 날짜를 YYYY-MM-DD 형식으로 변환
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // 시간을 24시간 형식으로 변환
      const timeStr = convertTo24Hour(selectedTime);
      
      if (!timeStr) {
        console.error('시간 변환 실패:', selectedTime);
        return;
      }
      
      // sessionDate 형식: "2025-08-05 10:30"
      const sessionDate = `${dateStr} ${timeStr}`;      
      const sessionData = {
        sessionDate: sessionDate
      };
      
      onSave(sessionData);
      resetModal();
    }
  };

  const handleCancel = () => {
    resetModal();
    onClose();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const resetModal = () => {
    setSelectedRecord("");
    setCurrentStep(1);
    setSelectedDate(null);
    setSelectedTime("");
    setShowWarning(false);
  };

  if (!open) return null;

  // 1단계: 녹음파일 선택 UI (주석처리)
  /*
  const renderRecordSelectStep = () => (
    <div className={`modal select-record ${open ? "on" : ""}`}>
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={handleClose}></div>
      <div className="inner z-[1000]">
        <div className="modal-hd">
          <strong>녹음파일 선택</strong>
          <button 
            className="close-btn" 
            type="button" 
            aria-label="닫기"
            onClick={handleClose}
          ></button>
        </div>
        <div className="list-wrap">
          <ul>
            {recordFiles.map((record) => (
              <li key={record.id}>
                <div className="input-wrap radio">
                  <input 
                    id={record.id}
                    type="radio" 
                    name="selectRecord"
                    checked={selectedRecord === record.id}
                    onChange={() => handleRecordSelect(record.id)}
                  />
                  <label htmlFor={record.id}>
                    <span>{record.name}</span>
                    <p className="datetime-wrap">
                      <span className="date-wrap">{record.date}</span>
                      <span className="time-wrap">{record.duration}</span>
                    </p>
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="btn-wrap">
          <button 
            className="type08" 
            type="button"
            onClick={handleCancel}
          >
            취소
          </button>
          <button 
            className="type08 black" 
            type="button"
            onClick={handleNextStep}
            disabled={!selectedRecord}
          >
            선택
          </button>
        </div>
      </div>
    </div>
  );
  */

  // 2단계: 날짜/시간 선택 UI
  const renderDateTimeSelectStep = () => (
    <div className={`modal select-datetime ${open ? "on" : ""}`}>
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={handleCancel}></div>
      <div className="inner z-[1000]">
        <div className="modal-hd">
          <strong>상담일시 선택</strong>
          <button 
            className="close-btn" 
            type="button" 
            aria-label="닫기"
            onClick={handleClose}
          ></button>
        </div>
        <div className="con-wrap">
          <div className="setting">
            <div className="datepicker-wrap">
              <label className="necessary" htmlFor="selectDate">날짜</label>
              <DatePicker
                id="selectDate"
                className="datepicker"
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy.MM.dd"
                placeholderText="날짜 선택"
                locale={ko}
                showPopperArrow={false}
                disabledKeyboardNavigation
                // 날짜는 직전 회기 "날짜" 이전은 선택 불가
                minDate={minDate || null}
                filterDate={(date) => {
                  if (!minDate) return true;
                  // 날짜 단위 비교 (같은 날은 허용 → 시간은 아래 CustomSelect에서 필터링)
                  const d0 = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                  return d1 >= d0;
                }}
                dayClassName={(date) => {
                  if (!minDate) return;
                  const d0 = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                  return d1 < d0 ? 'is-before-min' : undefined; // 표시만 다르게
                }}
                popperClassName="custom-datepicker-popper"
                renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                  <div className="custom-datepicker-header">
                    <button type="button" className="custom-nav-btn prev" onClick={decreaseMonth}>
                      <span></span>
                    </button>
                    <div className="custom-month-year">
                      {date.getFullYear()}.{String(date.getMonth() + 1).padStart(2, '0')}
                    </div>
                    <button type="button" className="custom-nav-btn next" onClick={increaseMonth}>
                      <span></span>
                    </button>
                  </div>
                )}
              />
            </div>
            <div className="select-area">
              <span className="necessary">시간</span>
              <CustomSelect
                options={timeOptionsForSelect}
                value={selectedTime}
                onChange={setSelectedTime}
                placeholder="시간선택"
                getOptionValue={(option) => option.value}
                getOptionLabel={(option) => option.label}
                maxHeight={260}
                initialScrollToValue={!selectedTime ? defaultScrollTime : undefined}
              />
            </div>
          </div>
          {/* <p className={`warning ${showWarning ? "on" : ""}`}>
            이미 해당 일시에 작성된 상담이 있습니다.
          </p> */}
        </div>
        <div className="btn-wrap">
          <button 
            className="type08" 
            type="button"
            onClick={handleCancel}
          >
            취소
          </button>
          <button 
            className="type08 black" 
            type="button"
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );

  // 1단계 주석처리로 2단계만 사용
  return renderDateTimeSelectStep();
  // return currentStep === 1 ? renderRecordSelectStep() : renderDateTimeSelectStep();
};

export default RecordSelectModal;
