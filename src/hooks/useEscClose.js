import { useEffect } from 'react';

/**
 * ESC 키로 닫기 훅
 * @param {boolean} enabled - 리스너 활성화 여부(일반적으로 모달 open 상태)
 * @param {Function} onClose - 닫기 콜백
 */
export default function useEscClose(enabled, onClose) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof onClose !== 'function') return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        // 입력 필드에서 ESC를 누른 경우에도 닫기 허용 (필요 시 예외처리 가능)
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onClose]);
}
