"use client";

import { ReactNode, useState, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { createMuiThemeFromProvider } from "./provider-theme";

interface MuiProviderThemeWrapperProps {
  children: ReactNode;
}

export function MuiProviderThemeWrapper({
  children,
}: MuiProviderThemeWrapperProps) {
  const [muiTheme, setMuiTheme] = useState(() => createMuiThemeFromProvider());

  useEffect(() => {
    // Update MUI theme when CSS variables change
    const updateTheme = () => {
      const newTheme = createMuiThemeFromProvider();
      setMuiTheme(newTheme);
    };

    // Listen for CSS variable changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // Initial theme update after a short delay to ensure CSS variables are set
    const timeoutId = setTimeout(updateTheme, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
}

// Re-export for convenience
export { MuiProviderThemeWrapper as MuiThemeProvider };
