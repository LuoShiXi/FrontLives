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
    const config = await response.json();

    // Verify config format
    if (!config.keyframes || !Array.isArray(config.keyframes)) {
      throw new Error("配置文件格式错误：缺少 keyframes 数组");
    }

    return config;
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
window.loadConfigFromFile = loadConfigFromFile;
window.formatNumber = formatNumber;
window.exportConfig = exportConfig;
