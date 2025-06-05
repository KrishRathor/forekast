import { atom } from "recoil";

export const walletState = atom({
  key: "walletState",
  default: {
    balance: 0,
    reserve: 0,
  },
});
