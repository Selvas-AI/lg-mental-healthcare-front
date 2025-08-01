import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import CustomSelect from '@/components/CustomSelect';

const RecordSelectModal = ({ open, onClose, onSave }) => {
  const [selectedRecord, setSelectedRecord] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1: 녹음파일 선택, 2: 날짜/시간 선택
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
  const recordFiles = [
    {
      id: "record01",
      name: "김마음 녹음파일 1",
      date: "2025.04.23(수)",
      duration: "50:11"
    },
    {
      id: "record02", 
      name: "박케어 녹음파일 2",
      date: "2025.04.23(수)",
      duration: "50:11"
    },
    {
      id: "record03",
      name: "4월 16일 두번째 상담 녹취",
      date: "2025.04.23(수)", 
      duration: "50:11"
    },
    {
      id: "record04",
      name: "녹음파일명 노출영역입니다.",
      date: "2025.04.23(수)",
      duration: "50:11"
    },
    {
      id: "record05",
      name: "녹음파일명 노출영역입니다.",
      date: "2025.04.23(수)",
      duration: "50:11"
    },
    {
      id: "record06",
      name: "녹음파일명 노출영역입니다.",
      date: "2025.04.23(수)",
      duration: "50:11"
    },
    {
      id: "record07",
      name: "녹음파일명 노출영역입니다.",
      date: "2025.04.23(수)",
      duration: "50:11"
    }
  ];

  // 시간 선택 옵션
  const timeOptions = [
    "오후 4:00",
    "오후 4:30",
    "오후 5:00",
    "오후 5:30",
    "오후 6:00",
    "오후 6:30",
    "오후 7:00",
    "오후 7:30"
  ];

  const handleRecordSelect = (recordId) => {
    setSelectedRecord(recordId);
  };

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

  const handleSave = () => {
    if (currentStep === 2 && selectedRecord && selectedDate && selectedTime) {
      const selectedRecordData = recordFiles.find(record => record.id === selectedRecord);
      const sessionData = {
        ...selectedRecordData,
        date: formatDate(selectedDate),
        time: selectedTime
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

  // 1단계: 녹음파일 선택 UI
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

  // 2단계: 날짜/시간 선택 UI
  const renderDateTimeSelectStep = () => (
    <div className={`modal select-datetime ${open ? "on" : ""}`}>
      <div className="modal-dim fixed top-0 left-0 w-full h-full z-[999]" onClick={handleCancel}></div>
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
          <p className={`warning ${showWarning ? "on" : ""}`}>
            이미 해당 일시에 작성된 상담이 있습니다.
          </p>
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

  return currentStep === 1 ? renderRecordSelectStep() : renderDateTimeSelectStep();
};

export default RecordSelectModal;
