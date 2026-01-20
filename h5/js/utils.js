/**
 * Utility functions for D3 Chart Application
 */

// Load config from external file
async function loadConfigFromFile(configPath = "config.json") {
  try {
    const response = await fetch(configPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const rawConfig = await response.json();
    return normalizeConfig(rawConfig);
  } catch (error) {
    console.error("加载配置文件失败:", error);

    // Check for CORS error
    const isCorsError =
      error.message.includes("Failed to fetch") ||
      error.message.includes("CORS") ||
      window.location.protocol === "file:";

    if (isCorsError) {
      throw new Error("CORS_ERROR");
    }

    throw error;
  }
}

/**
 * Data Adapter: Normalize config to internal format
 * Supports:
 * 1. Legacy Format (keyed by "keyframes")
 * 2. Simplified Format (keyed by "data" array of objects)
 */
function normalizeConfig(config) {
  // If already in legacy format, return as is (with defaults)
  if (config.keyframes && Array.isArray(config.keyframes)) {
    return {
      title: config.title || "Chart",
      ...config
    };
  }

  // Simplified Format Adapter
  if (config.data && Array.isArray(config.data)) {
    // 1. Extract all unique keys (company names) excluding 'date'
    const allKeys = new Set();
    config.data.forEach(row => {
      Object.keys(row).forEach(k => {
        if (k !== 'date' && k !== 'Date') allKeys.add(k);
      });
    });

    // 2. Build Keyframes
    const keyframes = config.data.map(row => {
      const date = row.date || row.Date || "Unknown";
      const dataItems = [];

      allKeys.forEach(name => {
        const val = parseFloat(row[name]);
        if (!isNaN(val)) {
          dataItems.push({
            name: name,
            value: val
          });
        }
      });

      return {
        date: String(date),
        data: dataItems
      };
    });

    // 3. Build Metadata / Colors
    const colors = {
      default: "#3b82f6",
      firstPlace: "#f59e0b", // Gold-ish for new default
      ...config.meta?.colors
    };

    // Allow per-item color mapping from meta
    const itemColors = config.meta?.itemColors || {};

    return {
      title: config.title || "Ranking Chart",
      useEnglishNames: config.meta?.useEnglishNames || false,
      showCountryName: false, // Default off for simple mode
      colors: colors,
      itemColors: itemColors,
      valueFormat: {
        prefix: "",
        suffix: "",
        decimals: 0,
        useCommas: true,
        ...config.meta?.valueFormat
      },
      animation: {
        interpolationSteps: 20,
        durationPerKeyframe: 3000,
        topN: 12,
        ...config.meta?.animation
      },
      nameMapping: config.nameMapping || config.meta?.nameMapping || {},
      keyframes: keyframes
    };
  }

  throw new Error("Invalid Config Format: Must contain 'keyframes' or 'data' array");
}

// Format numeric values
function formatNumber(value, formatConfig) {
  if (!formatConfig) return value;

  const format = formatConfig.useCommas
    ? d3.format(`,.${formatConfig.decimals}f`)
    : d3.format(`.${formatConfig.decimals}f`);

  return `${formatConfig.prefix || ''}${format(value)}${formatConfig.suffix || ''}`;
}

// Export config to JSON file
function exportConfig(config) {
  const configJson = JSON.stringify(config, null, 2);
  const blob = new Blob([configJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "config.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Expose functions to global scope
// Load resources from external file
async function loadResources(resourcePath = "resources.json") {
  try {
    const response = await fetch(resourcePath);
    if (!response.ok) {
      console.warn(`Resources file not found: ${resourcePath}`);
      return {};
    }
    const resources = await response.json();
    return resources;
  } catch (error) {
    console.warn("加载资源文件失败:", error);
    return {};
  }
}

// Expose functions to global scope
window.loadConfigFromFile = loadConfigFromFile;
window.formatNumber = formatNumber;
window.exportConfig = exportConfig;
window.normalizeConfig = normalizeConfig;
window.loadResources = loadResources;
