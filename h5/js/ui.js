/**
 * UI Interaction and Configuration Logic
 */

// Global State
let isConfigOpen = false;

// Format Toggle
function toggleConfig() {
  const p = document.getElementById("configPanel");
  isConfigOpen = !isConfigOpen;
  if (isConfigOpen) {
    p.classList.add("open");
    loadConfigToForm();
  } else {
    p.classList.remove("open");
  }
}

function toggleSection(titleElement) {
  const content = titleElement.nextElementSibling;
  if (content) {
    const isHidden = content.style.display === "none";
    content.style.display = isHidden ? "block" : "none";
    // Rotate arrow if present
    const arrow = titleElement.querySelector("span:last-child");
    if (arrow) arrow.textContent = isHidden ? "▼" : "▶";
  }
}

// Data Handling
function applySimpleData() {
  const input = document.getElementById("simpleDataInput");
  try {
    const rawData = JSON.parse(input.value);

    // Normalize
    const config = window.normalizeConfig(rawData);
    window.CONFIG = config;

    // Refresh Chart
    if (window.initializeChart) {
      window.initializeChart();
      alert("Data Applied Successfully!");
    }
  } catch (e) {
    alert("Invalid JSON format: " + e.message);
  }
}

function loadConfigToForm() {
  if (!window.CONFIG) return;
  const C = window.CONFIG;

  // Set Title
  setValue("configTitle", C.title || "");

  // Animation Settings
  if (C.animation) {
    setValue("animTopN", C.animation.topN || 12);
    setValue("animDuration", C.animation.durationPerKeyframe || 3000);
  }

  // Value Format
  if (C.valueFormat) {
    setValue("configPrefix", C.valueFormat.prefix || "");
    setValue("configSuffix", C.valueFormat.suffix || "");
  }

  // Checkboxes
  setChecked("useEnglishNames", C.useEnglishNames || false);

  // If "Simple Data" (data array exists in original or we reverse engineer it), show it
  // For now we just leave the textarea empty or placeholder unless we want to show current config
}

function handleSubmit(e) {
  if (e) e.preventDefault();
  if (!window.CONFIG) return;

  // Update CONFIG from Form
  window.CONFIG.title = document.getElementById("configTitle").value;
  window.CONFIG.useEnglishNames = document.getElementById("useEnglishNames").checked;

  if (!window.CONFIG.animation) window.CONFIG.animation = {};
  window.CONFIG.animation.topN = parseInt(document.getElementById("animTopN").value) || 12;
  window.CONFIG.animation.durationPerKeyframe = parseInt(document.getElementById("animDuration").value) || 3000;

  if (!window.CONFIG.valueFormat) window.CONFIG.valueFormat = {};
  window.CONFIG.valueFormat.prefix = document.getElementById("configPrefix").value;
  window.CONFIG.valueFormat.suffix = document.getElementById("configSuffix").value;

  // Re-init
  if (window.initializeChart) {
    window.initializeChart();
  }
  toggleConfig();
}

function handleFileLoad(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const json = JSON.parse(e.target.result);
      const config = window.normalizeConfig(json);
      window.CONFIG = config;
      loadConfigToForm();
      if (window.initializeChart) window.initializeChart();
    } catch (err) {
      alert("Error loading file: " + err.message);
    }
  };
  reader.readAsText(file);
}

// Helpers
function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
function setChecked(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = val;
}

// Fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((e) => {
      console.error(e);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Expose
window.toggleConfig = toggleConfig;
window.toggleSection = toggleSection;
window.applySimpleData = applySimpleData;
window.handleSubmit = handleSubmit;
window.handleFileLoad = handleFileLoad;
window.toggleFullscreen = toggleFullscreen;
window.togglePlayPause = function () {
  if (window.chartVars && window.chartVars.togglePlay) {
    window.chartVars.togglePlay();
  }
}
window.restart = function () {
  if (window.chartVars && window.chartVars.restart) {
    window.chartVars.restart();
  }
}
