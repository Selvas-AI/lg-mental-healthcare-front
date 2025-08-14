import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import CustomSelect from '@/components/CustomSelect';

const RecordSelectModal = ({ open, onClose, onSave }) => {
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

  // 더미 녹음파일 데이터
  // const recordFiles = [
  //   {
  //     id: "record01",
  //     name: "김마음 녹음파일 1",
  //     date: "2025.04.23(수)",
  //     duration: "50:11"
  //   },
  //   {
  //     id: "record02", 
  //     name: "박케어 녹음파일 2",
  //     date: "2025.04.23(수)",
  //     duration: "50:11"
  //   },
  //   {
  //     id: "record03",
  //     name: "4월 16일 두번째 상담 녹취",
  //     date: "2025.04.23(수)", 
  //     duration: "50:11"
  //   },
  //   {
  //     id: "record04",
  //     name: "녹음파일명 노출영역입니다.",
  //     date: "2025.04.23(수)",
  //     duration: "50:11"
  //   },
  //   {
  //     id: "record05",
  //     name: "녹음파일명 노출영역입니다.",
  //     date: "2025.04.23(수)",
  //     duration: "50:11"
  //   },
  //   {
  //     id: "record06",
  //     name: "녹음파일명 노출영역입니다.",
  //     date: "2025.04.23(수)",
  //     duration: "50:11"
  //   },
  //   {
  //     id: "record07",
  //     name: "녹음파일명 노출영역입니다.",
  //     date: "2025.04.23(수)",
  //     duration: "50:11"
  //   }
  // ];

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

  // 시간 문자열 24시간 형식으로 변환
  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return null;
    
    const parts = timeStr.split(' ');
    if (parts.length !== 2) return null;
    
    const [period, time] = parts;
    const timeParts = time.split(':');
    if (timeParts.length !== 2) return null;
    
    const hour = parseInt(timeParts[0]);
    const minute = parseInt(timeParts[1]);
    
    if (isNaN(hour) || isNaN(minute)) return null;
    
    let hour24 = hour;
    
    if (period === '오후' && hour !== 12) {
      hour24 = hour + 12;
    } else if (period === '오전' && hour === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

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
      
      console.log('전송될 sessionDate:', sessionDate); // 디버깅용
      
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
                popperClassName="custom-datepicker-popper"
                renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                  <div className="custom-datepicker-header">
                    <button 
                      type="button" 
                      className="custom-nav-btn prev" 
                      onClick={decreaseMonth}
                    >
                      <span></span>
                    </button>
                    <div className="custom-month-year">
                      {date.getFullYear()}.{String(date.getMonth() + 1).padStart(2, '0')}
                    </div>
                    <button 
                      type="button" 
                      className="custom-nav-btn next" 
                      onClick={increaseMonth}
                    >
                      <span></span>
                    </button>
                  </div>
                )}
              />
            </div>
            <div className="select-area">
              <span className="necessary">시간</span>
              <CustomSelect
                options={timeOptions}
                value={selectedTime}
                onChange={setSelectedTime}
                placeholder="시간선택"
                getOptionValue={(option) => option}
                getOptionLabel={(option) => option}
                maxHeight={260}
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
            disabled={!selectedDate || !selectedTime}
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
