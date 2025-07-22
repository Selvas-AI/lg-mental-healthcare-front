import React, { useState } from 'react';
import SymptomResult from './SymptomResult';

function SymptomChangePanel({ onOpenSurveySendModal }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const SYMPTOM_DATA = [
    {
      id: 'result01',
      title: '1. 우울장애',
      caption: '우울장애',
      canvas: {
        values: [8, 8, 27, 20, null],
        labels: ['사전', '1회기', '2회기', '3회기', '4회기'],
        min: 0,
        max: 30,
      },
      table: [
        { session: '4회기', score: '', level: '', levelClass: '', memo: true },
        { session: '3회기', score: '20', level: '경도', levelClass: 'level-mid', memo: true },
        { session: '2회기', score: '27', level: '고도', levelClass: 'level-high', memo: true },
        { session: '1회기', score: '8', level: '경미', levelClass: 'level-low', memo: true },
        { session: '사전', score: '8', level: '경미', levelClass: 'level-low', memo: true },
      ]
    },
    {
      id: 'result02',
      title: '2. 범불안장애',
      caption: '범불안장애',
      canvas: {
        values: [5, 10, 15, 20, 25],
        labels: ['사전', '1회기', '2회기', '3회기', '4회기'],
        min: 0,
        max: 25,
      },
      table: [
        { session: '4회기', score: '25', level: '고도', levelClass: 'level-high', memo: true },
        { session: '3회기', score: '20', level: '중등도', levelClass: 'level-high', memo: true },
        { session: '2회기', score: '15', level: '중등도', levelClass: 'level-high', memo: true },
        { session: '1회기', score: '10', level: '경미', levelClass: 'level-low', memo: true },
        { session: '사전', score: '5', level: '경미', levelClass: 'level-low', memo: true },
      ]
    },
    {
      id: 'result03',
      title: '3. 스트레스',
      caption: '스트레스',
      canvas: {
        values: [10, 10, 20, 20, null],
        labels: ['사전', '1회기', '2회기', '3회기', '4회기'],
        min: 0,
        max: 40,
      },
      table: [
        { session: '4회기', score: '', level: '', levelClass: '', memo: true },
        { session: '3회기', score: '20', level: '높은 수준', levelClass: 'level-high', memo: true },
        { session: '2회기', score: '20', level: '높은 수준', levelClass: 'level-high', memo: true },
        { session: '1회기', score: '10', level: '낮은 수준', levelClass: 'level-low', memo: true },
        { session: '사전', score: '10', level: '낮은 수준', levelClass: 'level-low', memo: true },
      ]
    },
    // ...다른 증상들
  ];

  return (
    <div className="changes">
      <div className="tit-wrap">
        <strong>증상별 변화 알아보기</strong>
        <button className="type05" type="button" onClick={onOpenSurveySendModal}>심리 검사지 전송</button>
      </div>
      <div className="move-control">
        <ul>
          {[
            { id: 'result01', label: '우울장애' },
            { id: 'result02', label: '범불안장애' },
            { id: 'result03', label: '스트레스' },
            { id: 'result04', label: '알코올 사용장애' },
            { id: 'result05', label: '불면증' },
            { id: 'result06', label: 'PTSD' },
            { id: 'result07', label: '공황장애' },
            { id: 'result08', label: 'ADHD' },
            { id: 'result09', label: '강박장애' },
            { id: 'result10', label: '자살사고' },
          ].map((item, idx) => (
            <li key={item.id}>
              <a
                className={`cursor-pointer${selectedIndex === idx ? ' on' : ''}`}
                onClick={() => {
                  setSelectedIndex(idx);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {/* 증상별 변화 알아보기 */}
      <div className="sticky-area">
        {SYMPTOM_DATA.map(data => (
          <SymptomResult key={data.id} {...data} />
        ))}
      </div>
    </div>
  );
}

export default SymptomChangePanel;
