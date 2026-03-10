"use client";

// Hook removed - using applyProviderTheme function instead

function getContrastColor(hexColor: string): string {
  // Improved contrast calculation using WCAG guidelines
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white text for dark backgrounds, black text for light backgrounds .
  // Adjusted threshold for better readability
  return luminance > 0.4 ? "#000000" : "#ffffff";
}

function updateTailwindColors(
  primary: string,
  secondary: string,
  accent: string
) {
  const root = document.documentElement;

  // Update chart colors based on provider theme /
  root.style.setProperty("--chart-1", primary);
  root.style.setProperty("--chart-2", secondary);
  root.style.setProperty("--chart-3", accent);

  // Update ring color for focus states
  root.style.setProperty("--ring", primary);

  // CCS-specific colors are already defined in globals.css
  // No need to set them again here
}

// Utility functions to access provider config from CSS variables
export function getProviderConfig() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  return {
    logo: computedStyle
      .getPropertyValue("--provider-logo")
      .replace(/^url\(|\)$/g, ""),
    payingLicense:
      computedStyle.getPropertyValue("--provider-paying-license") === "true",
    domain: computedStyle.getPropertyValue("--provider-domain"),
    resultFeature:
      parseInt(computedStyle.getPropertyValue("--provider-result-feature")) ||
      0,
    resultFeatureData: computedStyle.getPropertyValue(
      "--provider-result-feature-data"
    ),
  };
}

// Check if provider has paid license (for hiding "Powered by" branding)
export function hasPaidLicense(): boolean {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  return computedStyle.getPropertyValue("--provider-paying-license") === "true";
}

// Get result feature configuration
export function getResultFeatureConfig() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  return {
    feature:
      parseInt(computedStyle.getPropertyValue("--provider-result-feature")) ||
      0,
    data: computedStyle.getPropertyValue("--provider-result-feature-data"),
  };
}

// Direct theme application function (not a hook)
export function applyProviderTheme(config: {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logo: string;
  payingLicense: boolean;
  domain: string;
  resultFeature: number;
  resultFeatureData: string;
}) {
  console.log("applyProviderTheme called with:", config);

  const root = document.documentElement;

  // Only override colors if they're different from default (Care for Kids)
  const defaultPrimary = "#5a60ec";
  const defaultSecondary = "#5BC0DE";
  const defaultAccent = "#5CB85C";

  if (config.primaryColor !== defaultPrimary) {
    root.style.setProperty("--primary", config.primaryColor);
    root.style.setProperty(
      "--primary-foreground",
      getContrastColor(config.primaryColor)
    );
  }

  if (config.secondaryColor !== defaultSecondary) {
    root.style.setProperty("--secondary", config.secondaryColor);
    root.style.setProperty(
      "--secondary-foreground",
      getContrastColor(config.secondaryColor)
    );
  }

  if (config.accentColor !== defaultAccent) {
    root.style.setProperty("--accent", config.accentColor);
    root.style.setProperty(
      "--accent-foreground",
      getContrastColor(config.accentColor)
    );
  }

  console.log("Applied colors:", {
    primary: config.primaryColor,
    secondary: config.secondaryColor,
    accent: config.accentColor,
  });

  // Apply font family via CSS variable only
  root.style.setProperty("--font-family", config.fontFamily);
  // Only override font-sans if provider has custom font (not default Poppins)
  if (config.fontFamily && !config.fontFamily.includes("Poppins")) {
    root.style.setProperty("--font-sans", config.fontFamily);
  } else {
    // Reset to default Poppins font-sans
    root.style.removeProperty("--font-sans");
  }

  // Update Tailwind colors only if colors changed
  if (
    config.primaryColor !== defaultPrimary ||
    config.secondaryColor !== defaultSecondary ||
    config.accentColor !== defaultAccent
  ) {
    updateTailwindColors(
      config.primaryColor,
      config.secondaryColor,
      config.accentColor
    );
  }

  // Store provider config in CSS variables for easy access
  root.style.setProperty("--provider-logo", config.logo);
  root.style.setProperty(
    "--provider-paying-license",
    config.payingLicense.toString()
  );
  root.style.setProperty("--provider-domain", config.domain);
  root.style.setProperty(
    "--provider-result-feature",
    config.resultFeature.toString()
  );
  root.style.setProperty(
    "--provider-result-feature-data",
    config.resultFeatureData
  );

  console.log("Theme application completed");
}

// Convert CSS color to hex format for MUI compatibility
function cssColorToHex(cssColor: string): string {
  if (!cssColor) return "#5a60ec";

  // If already hex, return as is
  if (cssColor.startsWith("#")) return cssColor;

  // Create temporary element to compute color
  const tempEl = document.createElement("div");
  tempEl.style.color = cssColor;
  document.body.appendChild(tempEl);

  const computedColor = getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  // Convert rgb() to hex
  const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  return "#5a60ec"; // fallback
}

// MUI Theme Integration
export function createMuiThemeFromProvider() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  const primaryColorRaw =
    computedStyle.getPropertyValue("--primary") || "#5a60ec";
  const secondaryColorRaw =
    computedStyle.getPropertyValue("--secondary") || "#5BC0DE";
  const accentColorRaw =
    computedStyle.getPropertyValue("--accent") || "#5CB85C";
  const fontFamily =
    computedStyle.getPropertyValue("--font-family") ||
    "Poppins, Inter, system-ui, sans-serif";

  // Convert to hex for MUI compatibility
  const primaryColor = cssColorToHex(primaryColorRaw);
  const secondaryColor = cssColorToHex(secondaryColorRaw);
  const accentColor = cssColorToHex(accentColorRaw);

  // Import createTheme dynamically to avoid SSR issues
  const { createTheme } = require("@mui/material/styles");

  return createTheme({
    palette: {
      primary: { main: primaryColor },
      secondary: { main: secondaryColor },
      error: { main: "#DD3E3E" },
      success: { main: "#5CB85C" },
      warning: { main: "#F0AD4E" },
    },
    typography: {
      fontFamily: fontFamily,
      h1: { fontFamily: fontFamily },
      h2: { fontFamily: fontFamily },
      h3: { fontFamily: fontFamily },
      h4: { fontFamily: fontFamily },
      h5: { fontFamily: fontFamily },
      h6: { fontFamily: fontFamily },
      body1: { fontFamily: fontFamily },
      body2: { fontFamily: fontFamily },
      button: { fontFamily: fontFamily },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "12px",
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginLeft: 0,
            marginRight: 0,
            "&.Mui-error": {
              marginLeft: 0,
              marginRight: 0,
            },
          },
        },
      },
    },
  });
}
