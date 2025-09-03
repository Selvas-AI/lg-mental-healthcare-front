import React, { useMemo, useState } from 'react';
import SymptomBarChart from './SymptomBarChart';
import { useNavigate, useLocation } from 'react-router-dom';

const SymptomResult = ({ id, title, caption, canvas, table }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isReversed, setIsReversed] = useState(false);

    const displayedRows = useMemo(() => {
        if (!Array.isArray(table)) return [];
        return isReversed ? [...table].slice().reverse() : table;
    }, [table, isReversed]);
    
    const handleDetailClick = (rowIndex) => {
        // 현재 스크롤 위치 저장
        const currentScrollY = window.scrollY;
        
        // 현재 URL에서 쿼리 파라미터 가져오기
        const currentQuery = new URLSearchParams(location.search);
        const clientId = currentQuery.get('clientId');
        const currentTab = currentQuery.get('tab') || 'counsel';
        
        // 상세 페이지로 이동 후 뒤로가기 시 현재 탭과 스크롤 위치로 돌아오도록 설정
        const detailQuery = new URLSearchParams();
        if (clientId) detailQuery.set('clientId', clientId);
        detailQuery.set('returnTab', currentTab);
        detailQuery.set('scrollY', currentScrollY.toString());
        detailQuery.set('targetRow', rowIndex.toString()); // 클릭한 행 인덱스도 저장
        
        navigate(`/clients/consults/psychologicalTestDetail?${detailQuery.toString()}`);
    };
    return (
      <div id={id} className="result-wrap">
        <div className="result-tit">
          <strong>{title}</strong>
        </div>
        <div className="result-con">
          <div className="chart-wrap">
            <SymptomBarChart
              values={canvas.values}
              labels={canvas.labels}
              min={canvas.min}
              max={canvas.max}
              className="line-chart02"
            />
          </div>
          <div className="tb-wrap">
            <div className="tb-inner">
              <table>
                <caption>{caption}</caption>
                <colgroup>
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: 'calc(100% - 344px)' }} />
                  <col style={{ width: '104px' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th
                      className="sorting"
                      onClick={() => setIsReversed(prev => !prev)}
                      style={{ cursor: 'pointer' }}
                      title="클릭하면 순서를 뒤집습니다."
                    >
                      <span>회기</span>
                    </th>
                    <th>점수</th>
                    <th>심각도</th>
                    <th>결과 상세</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRows.map((row, i) => (
                    <tr key={i}>
                      <td>{row.session}</td>
                      <td>{row.score !== '' && row.score !== null ? `${row.score}점` : '-'}</td>
                      <td className={row.levelClass}>{row.level !== '' && row.level !== null ? row.level : '-'}</td>
                      <td>{row.memo && <button className="type12 h40" type="button" onClick={() => handleDetailClick(i)} disabled={!row.level}>결과 상세</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
}

export default SymptomResult;
