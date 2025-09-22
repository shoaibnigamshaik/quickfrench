import { useState, useEffect, useRef } from "react";
import { expandGenderedParentheticalsForSpeech } from "@/lib/utils";
import { getStorageItem, setStorageItem } from "@/lib/storage";

export function useSpeechSynthesis() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>(
    [],
  );
  const [speechVolume, setSpeechVolume] = useState<number>(1);
  const [speechPitch, setSpeechPitch] = useState<number>(1);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [speechVoiceURI, setSpeechVoiceURI] = useState<string | null>(null);
  const [hasFrenchVoice, setHasFrenchVoice] = useState<boolean>(false);

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      const vol = parseFloat(getStorageItem("speechVolume", "1"));
      const pitch = parseFloat(getStorageItem("speechPitch", "1"));
      const rate = parseFloat(getStorageItem("speechRate", "1"));
      const uri = getStorageItem("speechVoiceURI");
      if (!Number.isNaN(vol)) setSpeechVolume(Math.min(Math.max(vol, 0), 1));
      if (!Number.isNaN(pitch))
        setSpeechPitch(Math.min(Math.max(pitch, 0.5), 2));
      if (!Number.isNaN(rate)) setSpeechRate(Math.min(Math.max(rate, 0.1), 10));
      setSpeechVoiceURI(uri);
    };
    loadSettings();
  }, []);

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const synth = window.speechSynthesis;

    const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
      return new Promise((resolve) => {
        const existing = synth.getVoices?.() || [];
        if (existing.length) return resolve(existing);

        let resolved = false;
        const tryResolve = () => {
          if (resolved) return;
          const arr = synth.getVoices?.() || [];
          if (arr.length) {
            resolved = true;
            cleanup();
            resolve(arr);
          }
        };

        const onVoicesChanged = () => tryResolve();
        const interval = setInterval(tryResolve, 250);
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve(synth.getVoices?.() || []);
          }
        }, 5000);
        const cleanup = () => {
          clearInterval(interval);
          clearTimeout(timeout);
          synth.removeEventListener?.("voiceschanged", onVoicesChanged);
        };
        synth.addEventListener?.("voiceschanged", onVoicesChanged);
        tryResolve();
      });
    };

    let cancelled = false;
    const pickVoice = (voices: SpeechSynthesisVoice[]) => {
      const frVoices = voices.filter((v) => {
        const lang = (v.lang || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        return lang.startsWith("fr") || /fr(ancais|ançais)?|french/.test(name);
      });
      setHasFrenchVoice(frVoices.length > 0);
      setAvailableVoices(voices);

      const byURI = speechVoiceURI
        ? frVoices.find((v) => v.voiceURI === speechVoiceURI) || null
        : null;
      if (byURI) {
        voiceRef.current = byURI;
        return;
      }
      const preferred = frVoices.find(
        (v) => (v.lang || "").toLowerCase() === "fr-fr",
      );
      const anyFr = frVoices[0] || null;
      voiceRef.current = preferred || anyFr;
    };

    (async () => {
      const voices = await waitForVoices();
      if (cancelled) return;
      pickVoice(voices);
    })();

    return () => {
      cancelled = true;
    };
  }, [speechVoiceURI]);

  const frenchVoices = availableVoices.filter((v) =>
    v.lang.toLowerCase().startsWith("fr"),
  );
  const selectedVoice = frenchVoices.find((v) => v.voiceURI === speechVoiceURI);

  const updateSetting = (key: string, value: number | string) => {
    if (key === "speechVolume") setSpeechVolume(value as number);
    else if (key === "speechPitch") setSpeechPitch(value as number);
    else if (key === "speechRate") setSpeechRate(value as number);
    else if (key === "speechVoiceURI") setSpeechVoiceURI(value as string);
    setStorageItem(key, value.toString());
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const synth = window.speechSynthesis;
    try {
      if (synth.speaking) synth.cancel();
      const expandedForSpeech = expandGenderedParentheticalsForSpeech(text || "");
      const cleaned = expandedForSpeech
        .replace(/\(\s*(?:mpl|fpl)\s*\)/gi, "")
        .replace(/\b(?:mpl|fpl)\b/gi, "")
        .replace(/\s*\/\s*/g, ", ")
        .replace(/\s{2,}/g, " ")
        .trim();
      const utter = new SpeechSynthesisUtterance(cleaned);
      if (voiceRef.current) utter.voice = voiceRef.current;
      utter.lang = "fr-FR";
      utter.volume = speechVolume;
      utter.rate = speechRate;
      utter.pitch = speechPitch;
      synth.speak(utter);
    } catch {
      // no-op
    }
  };

  const testSpeak = () => {
    speak("Bonjour, comment allez-vous?");
  };

  return {
    availableVoices,
    frenchVoices,
    selectedVoice,
    hasFrenchVoice,
    speechVolume,
    speechPitch,
    speechRate,
    speechVoiceURI,
    setSpeechVolume: (v: number) => updateSetting("speechVolume", v),
    setSpeechPitch: (v: number) => updateSetting("speechPitch", v),
    setSpeechRate: (v: number) => updateSetting("speechRate", v),
    setSpeechVoiceURI: (v: string | null) =>
      updateSetting("speechVoiceURI", v || ""),
    speak,
    testSpeak,
  };
}