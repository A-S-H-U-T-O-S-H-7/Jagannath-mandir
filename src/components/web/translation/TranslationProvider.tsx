"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

type TranslationContextValue = {
  language: LanguageCode;
  isTranslating: boolean;
  changeLanguage: (language: LanguageCode) => Promise<void>;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);
const ignoredTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION", "CODE", "PRE"]);

function decodeHtml(value: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function getTextNodes(root: Element) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!node.nodeValue?.trim() || !parent || ignoredTags.has(parent.tagName) || parent.closest(".notranslate, [translate='no'], [data-no-translate]")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }
  return nodes;
}

function batchNodes(nodes: Text[]) {
  const batches: Text[][] = [];
  let batch: Text[] = [];
  let length = 0;
  nodes.forEach((node) => {
    const nodeLength = node.nodeValue?.length ?? 0;
    if (batch.length === 75 || (batch.length > 0 && length + nodeLength > 20_000)) {
      batches.push(batch);
      batch = [];
      length = 0;
    }
    batch.push(node);
    length += nodeLength;
  });
  if (batch.length) batches.push(batch);
  return batches;
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const originals = useRef(new Map<Text, string>());
  const cache = useRef(new Map<string, string>());
  const languageRef = useRef(language);
  const skipNextRouteTranslation = useRef(false);

  useEffect(() => { languageRef.current = language; }, [language]);

  const restoreEnglish = useCallback(() => {
    originals.current.forEach((original, node) => {
      if (node.isConnected) node.nodeValue = original;
    });
  }, []);

  const translateNodes = useCallback(async (nodes: Text[], target: LanguageCode) => {
    if (target === "en" || !nodes.length) return;
    nodes.forEach((node) => {
      if (!originals.current.has(node)) originals.current.set(node, node.nodeValue ?? "");
    });

    const uncached = nodes.filter((node) => {
      const text = originals.current.get(node) ?? "";
      const cached = cache.current.get(`${target}:${text}`);
      if (!cached) return true;
      if (node.isConnected) node.nodeValue = cached;
      return false;
    });

    for (const batch of batchNodes(uncached)) {
      const texts = batch.map((node) => originals.current.get(node) ?? "");
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, texts }),
      });
      if (!response.ok) throw new Error("Translation request failed");
      const { translations } = (await response.json()) as { translations: string[] };
      batch.forEach((node, index) => {
        const original = originals.current.get(node) ?? "";
        const translated = translations[index] ? decodeHtml(translations[index]) : original;
        cache.current.set(`${target}:${original}`, translated);
        if (node.isConnected) node.nodeValue = translated;
      });
    }
  }, []);

  const translatePage = useCallback(async (target: LanguageCode, resetToEnglish = false) => {
    const root = document.querySelector("[data-translation-root]");
    if (!root) return;
    if (resetToEnglish) restoreEnglish();
    await translateNodes(getTextNodes(root), target);
  }, [restoreEnglish, translateNodes]);

  const changeLanguage = useCallback(async (target: LanguageCode) => {
    if (target === languageRef.current || isTranslating) return;
    setIsTranslating(true);
    try {
      await translatePage(target, true);
      skipNextRouteTranslation.current = true;
      setLanguage(target);
    } catch (error) {
      console.error("Unable to translate this page.", error);
      restoreEnglish();
      window.alert("Translation could not be completed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  }, [isTranslating, restoreEnglish, translatePage]);

  useEffect(() => {
    if (language === "en") return;
    if (skipNextRouteTranslation.current) {
      skipNextRouteTranslation.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      setIsTranslating(true);
      translatePage(language).catch((error) => {
        console.error("Unable to translate the page.", error);
        restoreEnglish();
      }).finally(() => setIsTranslating(false));
    }, 100);
    return () => window.clearTimeout(timer);
  }, [language, pathname, restoreEnglish, translatePage]);

  useEffect(() => {
    if (language === "en") return;
    const root = document.querySelector("[data-translation-root]");
    if (!root) return;

    let timer: number | undefined;
    const pendingNodes = new Set<Text>();
    const observer = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((added) => {
        if (added.nodeType === Node.TEXT_NODE && added.parentElement) getTextNodes(added.parentElement).forEach((node) => pendingNodes.add(node));
        if (added instanceof Element) getTextNodes(added).forEach((node) => pendingNodes.add(node));
      }));
      if (!pendingNodes.size) return;

      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const nodes = [...pendingNodes];
        pendingNodes.clear();
        setIsTranslating(true);
        translateNodes(nodes, language)
          .catch((error) => console.error("Unable to translate newly loaded content.", error))
          .finally(() => setIsTranslating(false));
      }, 250);
    });

    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [language, pathname, translateNodes]);

  const value = useMemo(() => ({ language, isTranslating, changeLanguage }), [language, isTranslating, changeLanguage]);
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) throw new Error("useTranslation must be used inside TranslationProvider");
  return context;
}
