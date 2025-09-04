"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  lightTheme: boolean;
  setLightTheme: (theme: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lightTheme, setLightTheme] = useState(false);

  useEffect(() => {
    // Set data-theme attribute on document for CSS overrides
    if (lightTheme) {
      document.documentElement.setAttribute("data-theme", "light-red");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [lightTheme]);

  return (
    <ThemeContext.Provider value={{ lightTheme, setLightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
