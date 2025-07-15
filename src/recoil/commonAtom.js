import { atom } from "recoil";

// 개인 정보 마스킹
export const maskingState = atom({
  key: "maskingState",
  default: false,
});

// 녹취록 탭 상태
export const recordingsTabState = atom({
  key: 'recordingsTabState',
  default: 'recordings',
});
