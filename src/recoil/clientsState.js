import { atom } from "recoil";

export const clientsState = atom({
  key: "clientsState",
  default: [],
});

// 세션 데이터 상태 관리
export const sessionDataState = atom({
  key: "sessionDataState",
  default: [],
});

// 현재 선택된 세션 정보
export const currentSessionState = atom({
  key: "currentSessionState",
  default: null,
});
