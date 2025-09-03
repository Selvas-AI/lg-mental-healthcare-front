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
    
    const handleDetailClick = (row) => {
        // 현재 스크롤 위치 저장
        const currentScrollY = window.scrollY;

        // 현재 URL에서 쿼리 파라미터 가져오기
        const currentQuery = new URLSearchParams(location.search);
        const clientId = currentQuery.get('clientId');
        const currentTab = currentQuery.get('tab') || 'counsel';

        // 안정적인 식별자 구성
        const sessionSeq = row?.sessionSeq;
        // order는 PRE(-1), POST(999), PROG(1~)로 설정됨. PROG만 회기번호로 유효.
        const order = Number(row?.order);
        // session 라벨에서 숫자 추출 폴백 (e.g., "3회기")
        const parsedFromLabel = (() => {
            if (typeof row?.session === 'string') {
                const n = parseInt(row.session, 10);
                return Number.isFinite(n) ? n : undefined;
            }
            return undefined;
        })();

        const detailQuery = new URLSearchParams();
        if (clientId) detailQuery.set('clientId', clientId);
        detailQuery.set('returnTab', currentTab);
        detailQuery.set('scrollY', currentScrollY.toString());
        // 상세 페이지 매핑용 파라미터: sessionSeq 우선, 없으면 회기번호 전달
        if (sessionSeq != null) {
            detailQuery.set('sessionSeq', String(sessionSeq));
        } else {
            const sessionNo = Number.isFinite(order) && order > 0 ? order : parsedFromLabel;
            if (Number.isFinite(sessionNo)) {
                detailQuery.set('sessionNo', String(sessionNo));
            }
        }
        // 컨텍스트 보조용(선택): PRE/PROG/POST
        if (row?.questionType) {
            detailQuery.set('questionType', String(row.questionType));
        }
        if (row?.assessmentName) {
            detailQuery.set('assessmentName', String(row.assessmentName));
        }
        if (row?.sessiongroupSeq != null) {
            detailQuery.set('sessiongroupSeq', String(row.sessiongroupSeq));
        }

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
                      <td>{row.memo && <button className="type12 h40" type="button" onClick={() => handleDetailClick(row)} disabled={!row.level}>결과 상세</button>}</td>
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
