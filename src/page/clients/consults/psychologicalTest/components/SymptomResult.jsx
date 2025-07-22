import SymptomBarChart from './SymptomBarChart';

const SymptomResult = ({ id, title, caption, canvas, table }) => {
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
                    <th className="sorting"><span>회기</span></th>
                    <th>점수</th>
                    <th>심각도</th>
                    <th>메모</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((row, i) => (
                    <tr key={i}>
                      <td>{row.session}</td>
                      <td>{row.score !== '' && row.score !== null ? `${row.score}점` : '-'}</td>
                      <td className={row.levelClass}>{row.level !== '' && row.level !== null ? row.level : '-'}</td>
                      <td>{row.memo && <button className="type12 h40" type="button">결과 상세</button>}</td>
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
