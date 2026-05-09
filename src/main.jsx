import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import LifeQuiz from "./LifeQuiz.jsx";
import { LangCtx } from "./LangContext.jsx";

function detectLang() {
  const stored = localStorage.getItem("motive_lang");
  if (stored === "zh" || stored === "en") return stored;
  const nav = (navigator.language || navigator.userLanguage || "zh").toLowerCase();
  return nav.startsWith("zh") ? "zh" : "en";
}

function Root() {
  const [hash, setHash] = useState(window.location.hash);
  const [lang, setLangState] = useState(detectLang);

  const setLang = (l) => {
    localStorage.setItem("motive_lang", l);
    setLangState(l);
  };

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      {hash === "#life"
        ? <LifeQuiz onBack={() => { localStorage.setItem("motive_career_return", "result"); window.location.hash = ""; }} />
        : <App />}
    </LangCtx.Provider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
