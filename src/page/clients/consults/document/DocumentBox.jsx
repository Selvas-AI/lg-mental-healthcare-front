import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import emptyFace from '@/assets/images/common/empty_face.svg';

// 더미 데이터
const documentData = [
  {
    id: 1,
    type: '동의서',
    title: '상담 동의서',
    submitDate: '2025.04.26(토) 오전 10시',
    status: '작성 요청',
    isCompleted: false
  },
  {
    id: 2,
    type: '동의서',
    title: '개인정보 수집 ⋅ 제3자 제공동의서',
    submitDate: '2025.04.19(토) 오전 10시',
    status: '작성 완료',
    isCompleted: true
  },
  {
    id: 3,
    type: '검사지',
    title: '스트레스 자가 진단',
    submitDate: '2025.04.12(토) 오전 10시',
    status: '작성 완료',
    isCompleted: true
  },
  {
    id: 4,
    type: '검사지',
    title: '불안 자가 진단(BAI)',
    submitDate: '2025.04.05(토) 오전 10시',
    status: '작성 완료',
    isCompleted: true
  }
];

const statusOptions = [
  { value: 'all', label: '상태 전체' },
  { value: 'requested', label: '작성 요청' },
  { value: 'completed', label: '작성 완료' }
];

function DocumentBox() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDocumentType, setSelectedDocumentType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const selectBoxRef = useRef(null);
  const optionListRef = useRef(null);
  const [listHeight, setListHeight] = useState(0);

  const handleDocumentTypeChange = (type) => {
    setSelectedDocumentType(type);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setIsStatusDropdownOpen(false);
  };

  // 드롭다운 높이 계산
  useEffect(() => {
    if (isStatusDropdownOpen && optionListRef.current) {
      setListHeight(optionListRef.current.scrollHeight);
    } else {
      setListHeight(0);
    }
  }, [isStatusDropdownOpen, statusOptions.length]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (selectBoxRef.current && !selectBoxRef.current.contains(e.target)) {
        setIsStatusDropdownOpen(false);
      }
    }
    if (isStatusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isStatusDropdownOpen]);

  const handleResultView = (documentId) => {
    // 현재 스크롤 위치 저장
    const currentScrollY = window.scrollY;
    
    // 현재 URL에서 쿼리 파라미터 가져오기
    const currentQuery = new URLSearchParams(location.search);
    const clientId = currentQuery.get('clientId');
    const currentTab = currentQuery.get('tab') || 'document';
    
    // 상세 페이지로 이동 후 뒤로가기 시 현재 탭과 스크롤 위치로 돌아오도록 설정
    const detailQuery = new URLSearchParams();
    if (clientId) detailQuery.set('clientId', clientId);
    detailQuery.set('returnTab', currentTab);
    detailQuery.set('scrollY', currentScrollY.toString());
    detailQuery.set('documentId', documentId.toString()); // 문서 ID도 저장
    
    navigate(`/clients/consults/psychologicalTestDetail?${detailQuery.toString()}`);
  };

  const handleDocumentSend = () => {
    console.log('문서 발송 클릭');
  };

  const getSelectedStatusLabel = () => {
    const option = statusOptions.find(opt => opt.value === selectedStatus);
    return option ? option.label : '상태 전체';
  };

  // 선택된 문서 타입과 상태에 따라 문서 필터링
  const filteredDocuments = documentData.filter(document => {
    // 문서 타입 필터링
    let typeMatch = true;
    if (selectedDocumentType === 'consent') {
      typeMatch = document.type === '동의서';
    } else if (selectedDocumentType === 'survey') {
      typeMatch = document.type === '검사지';
    }
    
    // 상태 필터링
    let statusMatch = true;
    if (selectedStatus === 'requested') {
      statusMatch = document.status === '작성 요청';
    } else if (selectedStatus === 'completed') {
      statusMatch = document.status === '작성 완료';
    }
    
    return typeMatch && statusMatch;
  });

  return (
    <div className="inner">
      {documentData.length === 0 ? (
        <div className="con-wrap empty">
          <img src={emptyFace} alt="empty" />
          <p className="empty-info">내담자에게 전송한 문서 내역이 없습니다.</p>
          <button className="type05" type="button" onClick={handleDocumentSend}>
            문서 발송
          </button>
        </div>
      ) : (
        <div className="con-wrap">
          <div className="tb-controls">
            <div className="left">
              <div className="raido-toggle">
                <div className="toggle-btn">
                <input 
                  id="allDocument" 
                  type="radio" 
                  name="documentToggle" 
                  checked={selectedDocumentType === 'all'}
                  onChange={() => handleDocumentTypeChange('all')}
                />
                <label htmlFor="allDocument">전체</label>
              </div>
              <div className="toggle-btn">
                <input 
                  id="consentForm" 
                  type="radio" 
                  name="documentToggle"
                  checked={selectedDocumentType === 'consent'}
                  onChange={() => handleDocumentTypeChange('consent')}
                />
                <label htmlFor="consentForm">동의서</label>
              </div>
              <div className="toggle-btn">
                <input 
                  id="surveyForm" 
                  type="radio" 
                  name="documentToggle"
                  checked={selectedDocumentType === 'survey'}
                  onChange={() => handleDocumentTypeChange('survey')}
                />
                <label htmlFor="surveyForm">검사지</label>
              </div>
            </div>
          </div>
          <div className="right">
            <div className="select-wrap">
              <div className="select-box" ref={selectBoxRef}>
                <button 
                  className={`select-item ${isStatusDropdownOpen ? 'on' : ''} ${selectedStatus !== 'all' ? 'selected-custom' : ''}`}
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  {getSelectedStatusLabel()}
                </button>
                <ul 
                  className="option-list"
                  ref={optionListRef}
                  style={{
                    maxHeight: isStatusDropdownOpen ? Math.min(listHeight, 200) : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
                    pointerEvents: isStatusDropdownOpen ? 'auto' : 'none',
                    display: 'block',
                  }}
                >
                  {statusOptions.map((option) => (
                    <li key={option.value} className={selectedStatus === option.value ? 'on' : ''}>
                      <a 
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          handleStatusChange(option.value);
                        }}
                      >
                        {option.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="tb-wrap">
          <table>
            <caption>내담자 리스트</caption>
            <colgroup>
              <col style={{width: '90px'}} />
              <col style={{width: 'calc(100% - 550px)'}} />
              <col style={{width: '220px'}} />
              <col style={{width: '120px'}} />
              <col style={{width: '120px'}} />
            </colgroup>
            <thead>
              <tr>
                <th>유형</th>
                <th>문서명</th>
                <th className="sorting">
                  <span>제출 일시</span>
                </th>
                <th>진행상태</th>
                <th>검사 상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document.id}>
                  <td>{document.type}</td>
                  <td>{document.title}</td>
                  <td>{document.submitDate}</td>
                  <td>{document.status}</td>
                  <td>
                    <button 
                      className="type12 h40" 
                      type="button" 
                      disabled={!document.isCompleted}
                      onClick={() => handleResultView(document.id)}
                    >
                      결과보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
    </div>
  );
}

export default DocumentBox;
