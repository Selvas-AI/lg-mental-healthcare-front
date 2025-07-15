import { atom } from "recoil";

export const foldState = atom({
  key: "foldState",
  default: false,
});

export const supportPanelState = atom({
  key: "supportPanelState",
  default: false,
});
