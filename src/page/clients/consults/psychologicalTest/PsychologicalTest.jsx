import React from 'react';
import emptyFace from '@/assets/images/common/empty_face.svg';

function PsychologicalTest({ onOpenSurveySendModal }) {
  return (
    <div className="inner">
      <div className="empty-board">
        <img src={emptyFace} alt="empty" />
        <p className="empty-info">아직 전송된 심리 검사지가 없어요.<br />내담자에게 필요한 심리 검사지를 전송해보세요.</p>
        <button className="type05" type="button" onClick={onOpenSurveySendModal}>심리검사지 전송</button>
      </div>
    </div>
  );
}

export default PsychologicalTest;
