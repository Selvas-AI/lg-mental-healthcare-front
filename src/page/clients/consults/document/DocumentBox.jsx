import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { currentSessionState } from '@/recoil';
import { assessmentSetList, sessionList, assessmentSetListWithItem } from '@/api/apiCaller';
import emptyFace from '@/assets/images/common/empty_face.svg';

// 동의서 더미 데이터 (실제 API가 없으므로 UI 유지용)
const consentDocumentData = [
  // {
  //   id: 'consent-1',
  //   type: '동의서',
  //   title: '상담 동의서',
  //   submitDate: '2025.04.26(토) 오전 10시',
  //   status: '작성 요청',
  //   isCompleted: false
  // },
  // {
  //   id: 'consent-2',
  //   type: '동의서',
  //   title: '개인정보 수집 ⋅ 제3자 제공동의서',
  //   submitDate: '2025.04.19(토) 오전 10시',
  //   status: '작성 완료',
  //   isCompleted: true
  // }
];

const statusOptions = [
  { value: 'all', label: '상태 전체' },
  { value: 'requested', label: '작성 요청' },
  { value: 'completed', label: '작성 완료' }
];

function DocumentBox({ onOpenSurveySendModal, refreshKey }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentSession = useRecoilValue(currentSessionState);
  const [selectedDocumentType, setSelectedDocumentType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const selectBoxRef = useRef(null);
  const optionListRef = useRef(null);
  const [listHeight, setListHeight] = useState(0);
  const [assessmentData, setAssessmentData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 검사지 데이터 조회
  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!currentSession?.clientSeq) return;
      
      setLoading(true);
      try {
        // 회기 순서 매핑을 위한 sessionList 조회
        let seqToOrderMap = {};
        try {
          const sessionRes = await sessionList(currentSession.clientSeq);
          if (sessionRes?.code === 200 && Array.isArray(sessionRes.data)) {
            const sessions = sessionRes.data;
            const currentGroupSessions = sessions.filter(s => s.sessiongroupSeq === currentSession.sessiongroupSeq);
            // sessionSeq 기준으로 정렬 후 순서 매핑
            currentGroupSessions.sort((a, b) => a.sessionSeq - b.sessionSeq);
            currentGroupSessions.forEach((session, index) => {
              seqToOrderMap[String(session.sessionSeq)] = index + 1;
            });
            // console.log('seqToOrderMap:', seqToOrderMap);
          }
        } catch (e) {
          console.warn('sessionList 조회 실패:', e);
        }

        // 현재 내담자의 모든 검사세트 조회
        const response = await assessmentSetList(currentSession.clientSeq);
        if (response.code === 200 && response.data) {
          // console.log('검사세트 전체 데이터:', response.data);
          // 동일 회기그룹 항목만 대상으로 변환 수행
          const sameGroupItems = response.data.filter(it => String(it?.sessiongroupSeq) === String(currentSession.sessiongroupSeq));
          
          // 동일 그룹 내 PROG 항목만 필터링 (fallback 순서 산출용)
          const progItems = sameGroupItems.filter(item => item.questionType === 'PROG');
          // PROG 항목 정렬: sessionNo 우선, 없으면 seqToOrderMap 기준, 둘 다 없으면 시간 기준(오래된 것 먼저)
          const getTime = (it) => new Date(it.assignedUrlExpireTime || it.createdTime || it.createdAt || 0).getTime();
          const getOrder = (it) => {
            if (it.sessionNo != null) return Number(it.sessionNo);
            if (it.sessionSeq != null) {
              const k = String(it.sessionSeq);
              const mapped = seqToOrderMap[k];
              if (Number.isFinite(mapped)) return mapped;
            }
            return Infinity;
          };
          const progItemsOrdered = [...progItems].sort((a, b) => {
            const ao = getOrder(a);
            const bo = getOrder(b);
            if (Number.isFinite(ao) && Number.isFinite(bo)) return ao - bo;
            if (Number.isFinite(ao)) return -1;
            if (Number.isFinite(bo)) return 1;
            return getTime(a) - getTime(b);
          });
          
          // API 데이터를 문서 형태로 변환 (동일 그룹만)
          const transformedData = sameGroupItems.map((item, index) => {
            // questionType에 따른 문서명 생성
            let documentTitle = '검사지';
            let sessionLabel;
            
            if (item.questionType === 'PRE') {
              sessionLabel = '사전 문진';
              documentTitle = '사전문진 검사지';
            } else if (item.questionType === 'POST') {
              sessionLabel = '사후 문진';
              documentTitle = '사후문진 검사지';
            } else if (item.questionType === 'PROG' && (item.sessionSeq != null || item.sessionNo != null)) {
              // 그룹 내 순번(또는 sessionNo)을 사용하고, 절대 sessionSeq 원값은 라벨에 쓰지 않음
              const seqKey = item.sessionSeq != null ? String(item.sessionSeq) : null;
              const sessionNoFromSet = item.sessionNo ?? null;
              const orderFromMap = seqKey ? seqToOrderMap[seqKey] : null;
              
              // PROG 타입에서 현재 항목의 순서 계산 (정렬된 배열에서의 위치 + 1)
              const progIndex = progItemsOrdered.findIndex(progItem => progItem.setSeq === item.setSeq);
              const progFallbackOrder = progIndex >= 0 ? progIndex + 1 : 1;
              
              const finalSessionNo = sessionNoFromSet ?? orderFromMap ?? progFallbackOrder;
              sessionLabel = `${finalSessionNo}회기`;
              documentTitle = `${finalSessionNo}회기 검사지`;
              // console.log(`sessionSeq: ${item.sessionSeq}, orderFromMap: ${orderFromMap}, progFallbackOrder: ${progFallbackOrder}, finalSessionNo: ${finalSessionNo}`);
            } else {
              // PROG 타입이지만 sessionSeq가 없는 경우 (정렬된 동일그룹 리스트 기반)
              const progIndex = progItemsOrdered.findIndex(progItem => progItem.setSeq === item.setSeq);
              const progFallbackOrder = progIndex >= 0 ? progIndex + 1 : 1;
              sessionLabel = `${progFallbackOrder}회기`;
              documentTitle = `${progFallbackOrder}회기 검사지`;
            }

            return {
              id: item.setSeq,
              type: '검사지',
              title: documentTitle,
              submitDate: formatDate(item.assignedUrlExpireTime || item.createdTime || item.createdAt),
              status: item.submittedTime ? '작성 완료' : '작성 요청',
              isCompleted: !!item.submittedTime,
              setSeq: item.setSeq,
              questionType: item.questionType, // PRE/PROG/POST
              sessiongroupSeq: item.sessiongroupSeq,
              sessionSeq: item.sessionSeq
            };
          });
          
          // console.log('변환된 문서 데이터:', transformedData);
          setAssessmentData(transformedData);
        }
      } catch (error) {
        console.error('검사지 데이터 조회 실패:', error);
        setAssessmentData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [currentSession?.clientSeq, currentSession?.sessiongroupSeq, refreshKey]);

  // 날짜 포맷팅 함수
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[date.getDay()];
      const hour = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, '0');
      const period = hour >= 12 ? '오후' : '오전';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      
      return `${year}.${month}.${day}(${weekday}) ${period} ${displayHour}시${minute !== '00' ? ` ${minute}분` : ''}`;
    } catch (e) {
      return '-';
    }
  };

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

  const handleResultView = (document) => {
    // 현재 스크롤 위치 저장
    const currentScrollY = window.scrollY;
    const currentQuery = new URLSearchParams(location.search);
    const clientId = currentQuery.get('clientId');
    const currentTab = currentQuery.get('tab') || 'document';

    // 문서 타입 분기: 검사지는 세션 통합 결과 페이지로 이동
    if (document.type === '검사지') {
      const query = new URLSearchParams();
      if (clientId) query.set('clientId', clientId);
      // PRE/POST 식별을 위해 questionType 전달, 그룹 스코프 유지를 위해 sessiongroupSeq 전달
      if (document.questionType) query.set('questionType', String(document.questionType));
      if (document.sessiongroupSeq != null) query.set('sessiongroupSeq', String(document.sessiongroupSeq));
      // PROG의 경우 회기 단위 조회를 위해 sessionSeq도 함께 전달
      if (document.sessionSeq != null) query.set('sessionSeq', String(document.sessionSeq));
      query.set('returnTab', currentTab);
      query.set('scrollY', String(currentScrollY));
      navigate(`/clients/consults/sessionAssessments?${query.toString()}`);
      return;
    }

    // 그 외(동의서 등)는 기존 상세 경로 유지
    const detailQuery = new URLSearchParams();
    if (clientId) detailQuery.set('clientId', clientId);
    detailQuery.set('returnTab', currentTab);
    detailQuery.set('scrollY', String(currentScrollY));
    detailQuery.set('documentId', document.id.toString());
    navigate(`/clients/consults/psychologicalTestDetail?${detailQuery.toString()}`);
  };

  const handleDocumentSend = () => {
    // PsychologicalTest에서 사용하는 동일 모달 오픈 핸들러 재사용
    if (typeof onOpenSurveySendModal === 'function') {
      onOpenSurveySendModal();
      return;
    }
    // 안전 폴백: survey 탭으로 이동
    try {
      const params = new URLSearchParams(location.search);
      params.set('tab', 'survey');
      navigate(`${location.pathname}?${params.toString()}`);
    } catch (_) {
      console.log('문서 발송 클릭');
    }
  };

  const getSelectedStatusLabel = () => {
    const option = statusOptions.find(opt => opt.value === selectedStatus);
    return option ? option.label : '상태 전체';
  };

  // 동의서와 검사지 데이터 합치기
  const allDocuments = [...consentDocumentData, ...assessmentData];

  // 선택된 문서 타입과 상태에 따라 문서 필터링
  const filteredDocuments = allDocuments.filter(document => {
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
      {loading ? (
        <div className="con-wrap empty">
          <p className="empty-info">문서 데이터를 불러오는 중...</p>
        </div>
      ) : allDocuments.length === 0 ? (
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
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="con-wrap empty" style={{boxShadow: 'none', border: 'none', minHeight: '400px' }}>
                      <p className="empty-info">선택한 조건에 해당하는 문서가 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((document) => (
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
                        onClick={() => handleResultView(document)}
                      >
                        결과보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
    </div>
  );
}

export default DocumentBox;
