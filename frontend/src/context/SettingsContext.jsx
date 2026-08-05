import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext(null);

const DEFAULTS = {
  language: "en",
  dateFormat: "DD MMM YYYY",
  itemsPerPage: 10,
  notifications: { email: true, highPollution: true, weekly: false },
};

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function SettingsProvider({ children }) {
  const [language, setLanguageState] = useState(() =>
    readLocal("littora_language", DEFAULTS.language)
  );
  const [dateFormat, setDateFormatState] = useState(() =>
    readLocal("littora_dateformat", DEFAULTS.dateFormat)
  );
  const [itemsPerPage, setItemsPerPageState] = useState(() =>
    readLocal("littora_ipp", DEFAULTS.itemsPerPage)
  );
  const [notifications, setNotificationsState] = useState(() =>
    readLocal("littora_notifs", DEFAULTS.notifications)
  );

  const setLanguage = (v) => {
    setLanguageState(v);
    localStorage.setItem("littora_language", JSON.stringify(v));
  };
  const setDateFormat = (v) => {
    setDateFormatState(v);
    localStorage.setItem("littora_dateformat", JSON.stringify(v));
  };
  const setItemsPerPage = (v) => {
    setItemsPerPageState(Number(v));
    localStorage.setItem("littora_ipp", JSON.stringify(Number(v)));
  };
  const setNotifications = (v) => {
    setNotificationsState(v);
    localStorage.setItem("littora_notifs", JSON.stringify(v));
  };

  /**
   * Format a date string or Date according to the active dateFormat setting.
   * Returns a formatted string.
   */
  const formatDate = (dateInput) => {
    if (!dateInput) return "—";
    const d = new Date(dateInput);
    if (isNaN(d)) return String(dateInput);
    const day   = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en", { month: "short" });
    const year  = d.getFullYear();
    const mm    = String(d.getMonth() + 1).padStart(2, "0");
    switch (dateFormat) {
      case "MM/DD/YYYY": return `${mm}/${day}/${year}`;
      case "YYYY-MM-DD": return `${year}-${mm}-${day}`;
      default:           return `${day} ${month} ${year}`;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        language, setLanguage,
        dateFormat, setDateFormat,
        itemsPerPage, setItemsPerPage,
        notifications, setNotifications,
        formatDate,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
