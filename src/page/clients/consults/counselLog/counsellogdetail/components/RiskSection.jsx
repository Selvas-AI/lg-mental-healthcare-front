import React from 'react';
import RadioList from './RadioList';
import CheckboxList from './CheckboxList';

function RiskSection({
  // values
  currentRisk,
  pastRisk,
  riskFactors,
  riskFactorEtc,
  riskScale,
  // handlers
  onChangeCurrentRisk,
  onChangePastRisk,
  onChangeRiskFactors,
  onChangeRiskFactorEtc,
  onChangeRiskScale,
  // options
  currentRiskOptions,
  pastRiskOptions,
  riskFactorOptions,
  riskScaleOptions,
  // actions
  onOpenGuide,
}) {
  return (
    <>
      {/* 1. 현재 위기 상황 */}
      <div className="write-wrap">
        <div className="write-title">
          <p>1. 현재는 어떤 위기 상황이 있는지 선택해 주세요.</p>
        </div>
        <div className="write-area">
          <RadioList
            name="currentRisk"
            options={currentRiskOptions}
            value={currentRisk}
            onChange={onChangeCurrentRisk}
          />
        </div>
      </div>

      {/* 2. 과거 위기 상황 */}
      <div className="write-wrap">
        <div className="write-title">
          <p>2. 과거에는 어떤 위기 상황이 있는지 선택해 주세요.</p>
        </div>
        <div className="write-area">
          <RadioList
            name="pastRisk"
            options={pastRiskOptions}
            value={pastRisk}
            onChange={onChangePastRisk}
          />
        </div>
      </div>

      {/* 3. 위험요인 체크박스 */}
      <div className="write-wrap check">
        <div className="write-title">
          <p>3. 위험요인을 선택해 주세요. (중복 선택 가능)</p>
        </div>
        <div className="write-area">
          <CheckboxList
            name="riskFactor"
            options={riskFactorOptions}
            values={riskFactors}
            onChange={onChangeRiskFactors}
            etcInput={riskFactorEtc}
            etcValue={riskFactorEtc}
            onEtcChange={onChangeRiskFactorEtc}
          />
        </div>
      </div>

      {/* 4. 위기 단계 선택 */}
      <div className="write-wrap risk-scale">
        <div className="write-title">
          <p>4. 내담자의 위기 단계를 선택해 주세요.</p>
          <a className="panel-btn" onClick={onOpenGuide} style={{cursor:'pointer'}}>
            평정 가이드 보기
          </a>
        </div>
        <p>선택하신 내담자의 위기 단계는 위험도 뱃지에 반영됩니다.</p>
        <div className="write-area">
          <ul>
            {riskScaleOptions.map(opt => (
              <li key={opt.id}>
                <div className="top">
                  <div className="input-wrap radio">
                    <input
                      id={opt.id}
                      type="radio"
                      name="riskScale"
                      value={opt.value}
                      checked={riskScale === opt.value}
                      onChange={onChangeRiskScale}
                    />
                    <label htmlFor={opt.id}></label>
                  </div>
                  <span className={`face-icon ${opt.tag}`} aria-label="얼굴 아이콘"></span>
                  <span className={`tag ${opt.tag}`}>{opt.label}</span>
                </div>
                <div className="bottom">
                  <span>{opt.label} ({opt.score}점)</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default RiskSection;
