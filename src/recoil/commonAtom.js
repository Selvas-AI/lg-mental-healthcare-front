import { atom } from "recoil";

// 개인 정보 마스킹
export const maskingState = atom({
  key: "maskingState",
  default: true,
});

// 녹취록 탭 상태
export const recordingsTabState = atom({
  key: 'recordingsTabState',
  default: 'recordings',
});

// 상담일지 노트 데이터 상태 (API 중복 호출 방지)
export const sessionNoteState = atom({
  key: 'sessionNoteState',
  default: null,
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      const storageKey = 'sessionNoteState';
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setSelf(JSON.parse(saved));
        }
      } catch (e) {
        // ignore parse errors
      }
      onSet((newVal, _, isReset) => {
        try {
          if (isReset || newVal == null) {
            localStorage.removeItem(storageKey);
          } else {
            localStorage.setItem(storageKey, JSON.stringify(newVal));
          }
        } catch (e) {
          // ignore storage errors
        }
      });
    }
  ],
});

// 전역 EditorConfirm 모달 상태
export const editorConfirmState = atom({
  key: 'editorConfirmState',
  default: {
    open: false,
    title: '',
    message: '',
    confirmText: '확인',
  },
});

// 음성파일 업로드 상태 관리 (세션별)
export const audioUploadState = atom({
  key: 'audioUploadState',
  default: {},
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      const storageKey = 'audioUploadState';
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setSelf(JSON.parse(saved));
        }
      } catch (e) {
        // ignore parse errors
      }
      onSet((newVal, _, isReset) => {
        try {
          if (isReset || newVal == null) {
            localStorage.removeItem(storageKey);
          } else {
            localStorage.setItem(storageKey, JSON.stringify(newVal));
          }
        } catch (e) {
          // ignore storage errors
        }
      });
    }
  ],
});
