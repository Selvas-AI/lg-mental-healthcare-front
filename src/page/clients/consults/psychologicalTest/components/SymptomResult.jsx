import React, { useMemo, useState } from 'react';
import SymptomBarChart from './SymptomBarChart';
import { useNavigate, useLocation } from 'react-router-dom';

const SymptomResult = ({ id, title, caption, canvas, table }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isReversed, setIsReversed] = useState(false);

    const displayedRows = useMemo(() => {
        if (!Array.isArray(table)) return [];

        // 숫자 회기(예: "1회기")와 그 외(예: "사전 문진")를 분리
        const withIndex = table.map((row, idx) => ({ ...row, _idx: idx }));
        const hasNumber = (v) => /\d+/.test(String(v ?? ''));
        const extractNum = (v) => {
            const m = String(v ?? '').match(/(\d+)/);
            return m ? parseInt(m[1], 10) : NaN;
        };

        const numericSessions = withIndex.filter((r) => hasNumber(r.session));
        const otherSessions = withIndex.filter((r) => !hasNumber(r.session));

        // 기본: 오름차순 정렬(1회기 -> N회기). 토글 시 내림차순.
        numericSessions.sort((a, b) => {
            const na = extractNum(a.session);
            const nb = extractNum(b.session);
            return isReversed ? nb - na : na - nb;
        });

        // 숫자 없는 항목(사전 문진 등)은 기본 상태에서는 하단, 토글 시 상단으로 배치
        const combined = (
            isReversed
                ? [...otherSessions, ...numericSessions]
                : [...numericSessions, ...otherSessions]
        ).map(({ _idx, ...rest }) => rest);
        return combined;
    }, [table, isReversed]);

    // 차트용 데이터 구성: 사전 문진 맨 앞, 사후 문진 맨 뒤, 숫자 회기는 테이블 정렬의 반대로
    const chartLabels = useMemo(() => {
        if (!Array.isArray(table)) return [];
        const hasNumber = (v) => /\d+/.test(String(v ?? ''));
        const extractNum = (v) => {
            const m = String(v ?? '').match(/(\d+)/);
            return m ? parseInt(m[1], 10) : NaN;
        };
        const isPre = (v) => /사전/.test(String(v ?? ''));
        const isPost = (v) => /사후/.test(String(v ?? ''));

        const withIndex = table.map((row, idx) => ({ ...row, _idx: idx }));
        const pre = withIndex.filter(r => isPre(r.session));
        const post = withIndex.filter(r => isPost(r.session));
        const numeric = withIndex.filter(r => hasNumber(r.session));
        const others = withIndex.filter(r => !isPre(r.session) && !isPost(r.session) && !hasNumber(r.session));

        // 테이블은 isReversed=false(오름), true(내림). 차트는 그 반대로 정렬
        numeric.sort((a, b) => {
            const na = extractNum(a.session);
            const nb = extractNum(b.session);
            return isReversed ? na - nb : nb - na;
        });

        const ordered = [...pre, ...numeric, ...others, ...post];
        return ordered.map(({ session }) => session);
    }, [table, isReversed]);

    const chartValues = useMemo(() => {
        if (!Array.isArray(table)) return [];
        const hasNumber = (v) => /\d+/.test(String(v ?? ''));
        const extractNum = (v) => {
            const m = String(v ?? '').match(/(\d+)/);
            return m ? parseInt(m[1], 10) : NaN;
        };
        const isPre = (v) => /사전/.test(String(v ?? ''));
        const isPost = (v) => /사후/.test(String(v ?? ''));

        const withIndex = table.map((row, idx) => ({ ...row, _idx: idx }));
        const pre = withIndex.filter(r => isPre(r.session));
        const post = withIndex.filter(r => isPost(r.session));
        const numeric = withIndex.filter(r => hasNumber(r.session));
        const others = withIndex.filter(r => !isPre(r.session) && !isPost(r.session) && !hasNumber(r.session));

        numeric.sort((a, b) => {
            const na = extractNum(a.session);
            const nb = extractNum(b.session);
            return isReversed ? na - nb : nb - na;
        });

        const ordered = [...pre, ...numeric, ...others, ...post];
        return ordered.map(({ score }) => (score !== '' && score !== null ? Number(score) : null));
    }, [table, isReversed]);
    
    const handleDetailClick = (rowIndex) => {
        // 현재 스크롤 위치 저장
        const currentScrollY = window.scrollY;
        
        // 현재 URL에서 쿼리 파라미터 가져오기
        const currentQuery = new URLSearchParams(location.search);
        const clientId = currentQuery.get('clientId');
        const currentTab = currentQuery.get('tab') || 'counsel';
        
        // 클릭한 행의 실제 데이터 정보 추출
        const clickedRow = displayedRows[rowIndex];
        
        // 상세 페이지로 이동 후 뒤로가기 시 현재 탭과 스크롤 위치로 돌아오도록 설정
        const detailQuery = new URLSearchParams();
        if (clientId) detailQuery.set('clientId', clientId);
        detailQuery.set('returnTab', currentTab);
        detailQuery.set('scrollY', currentScrollY.toString());
        detailQuery.set('targetRow', rowIndex.toString());
        
        // 검사 식별 정보 추가
        detailQuery.set('assessmentCategory', caption); // 검사 카테고리 (우울장애, 범불안장애 등)
        detailQuery.set('sessionLabel', clickedRow.session); // 회기 라벨 (1회기, 사전 문진 등)
        
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
              values={chartValues}
              labels={chartLabels}
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
