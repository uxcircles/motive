import { createContext, useContext } from "react";

export const LangCtx = createContext({ lang: "zh", setLang: () => {} });
export function useLang() { return useContext(LangCtx); }
