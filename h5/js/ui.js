/**
 * UI Interaction and Configuration Logic
 */

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('chart-theme') || 'dark';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  const body = document.body;
  if (theme === 'light') {
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
  }

  // Update button text
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.textContent = theme === 'light' ? '🌙 暗色' : '☀️ 亮色';
  }

  // Save preference
  localStorage.setItem('chart-theme', theme);

  // Trigger chart update if available
  if (window.updateChartTextColors) {
    window.updateChartTextColors();
  }
}

function toggleTheme() {
  const body = document.body;
  const currentTheme = body.classList.contains('light-theme') ? 'light' : 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

// Fullscreen Management
function toggleFullscreen() {
  const body = document.body;

  if (body.classList.contains('fullscreen')) {
    exitFullscreen();
  } else {
    enterFullscreen();
  }
}

function enterFullscreen() {
  const body = document.body;
  const fullscreenBtn = document.getElementById('fullscreenBtn');

  body.classList.add('fullscreen');
  if (fullscreenBtn) fullscreenBtn.textContent = '全屏'; // Actually hidden in CSS

  // Add listeners
  window.addEventListener('resize', adjustFullscreenSize);
  document.addEventListener('mousemove', handleFullscreenMouseMove);
  document.addEventListener('keydown', handleFullscreenKeyDown);

  // Adjust size immediately
  setTimeout(() => {
    adjustFullscreenSize();
    // Refresh chart to adapt to new size
    if (window.refreshChart) window.refreshChart();
  }, 0);
}

function exitFullscreen() {
  const body = document.body;
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const exitBtn = document.getElementById('fullscreenExitBtn');
  const chartWrapper = document.querySelector('.chart-wrapper');

  // Clean up inline styles
  if (chartWrapper) {
    chartWrapper.style.width = '';
    chartWrapper.style.height = '';
  }

  body.classList.remove('fullscreen');
  if (fullscreenBtn) fullscreenBtn.textContent = '全屏';
  if (exitBtn) exitBtn.classList.remove('show');

  // Remove listeners
  window.removeEventListener('resize', adjustFullscreenSize);
  document.removeEventListener('mousemove', handleFullscreenMouseMove);
  document.removeEventListener('keydown', handleFullscreenKeyDown);

  // Refresh chart
  requestAnimationFrame(() => {
    if (window.refreshChart) window.refreshChart();
  });
}

function adjustFullscreenSize() {
  if (!document.body.classList.contains('fullscreen')) return;

  const chartWrapper = document.querySelector('.chart-wrapper');
  if (!chartWrapper) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspectRatio = 16 / 9;
  const screenRatio = vw / vh;

  let width, height;
  if (screenRatio > aspectRatio) {
    height = vh;
    width = height * aspectRatio;
  } else {
    width = vw;
    height = width / aspectRatio;
  }

  chartWrapper.style.width = width + 'px';
  chartWrapper.style.height = height + 'px';

  // Refresh chart logic handled by chart.js or global trigger if needed
  // Usually CSS handles resize, but D3 needs explicit update
  if (window.refreshChart) {
    requestAnimationFrame(window.refreshChart);
  }
}

function handleFullscreenMouseMove(e) {
  if (!document.body.classList.contains('fullscreen')) return;

  const exitBtn = document.getElementById('fullscreenExitBtn');
  if (!exitBtn) return;

  const edgeThreshold = 50;
  const isNearEdge =
    e.clientX < edgeThreshold ||
    e.clientX > window.innerWidth - edgeThreshold ||
    e.clientY < edgeThreshold ||
    e.clientY > window.innerHeight - edgeThreshold;

  if (isNearEdge) {
    exitBtn.classList.add('show');
  } else {
    exitBtn.classList.remove('show');
  }
}

function handleFullscreenKeyDown(e) {
  if (!document.body.classList.contains('fullscreen')) return;

  if (e.key === 'Escape') {
    exitFullscreen();
    return;
  }

  // Space to play/pause
  if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    if (window.togglePlayPause) window.togglePlayPause();
  }
}

// Config Panel Management
function toggleConfig() {
  const panel = document.getElementById("configPanel");
  panel.classList.toggle("open");
  if (panel.classList.contains("open")) {
    loadConfigToForm();
  }
}

function toggleSection(titleElement) {
  if (!titleElement) return;
  const section = titleElement.closest(".config-section");
  if (section) section.classList.toggle("collapsed");
}

function loadConfigToForm() {
  if (!window.CONFIG) return; // Wait for config to load

  const CONFIG = window.CONFIG;

  // Basic Info
  setValue("configTitle", CONFIG.title || "");
  setChecked("useEnglishNames", CONFIG.useEnglishNames || false);
  setChecked("showCountryName", CONFIG.showCountryName !== undefined ? CONFIG.showCountryName : true);

  // Update label text
  const langBtn = document.getElementById("langToggleBtn");
  if (langBtn) {
    langBtn.textContent = CONFIG.useEnglishNames ? "切换到中文" : "Switch to English";
  }

  // Name Mapping
  setValue("nameMapping", CONFIG.nameMapping ? JSON.stringify(CONFIG.nameMapping, null, 2) : "");

  // Colors
  if (CONFIG.colors) {
    setValue("colorDefault", CONFIG.colors.default || "#3b82f6");
    setValue("colorFirstPlace", CONFIG.colors.firstPlace || "#76b900");
  }

  // Value Format
  if (CONFIG.valueFormat) {
    setValue("valuePrefix", CONFIG.valueFormat.prefix || "");
    setValue("valueSuffix", CONFIG.valueFormat.suffix || "");
    setValue("valueDecimals", CONFIG.valueFormat.decimals || 1);
    setChecked("valueUseCommas", CONFIG.valueFormat.useCommas !== false);
  }

  // Animation
  if (CONFIG.animation) {
    setValue("animSteps", CONFIG.animation.interpolationSteps || 80);
    setValue("animDuration", CONFIG.animation.durationPerKeyframe || 5000);
    setValue("animTopN", CONFIG.animation.topN || 10);
  }

  // Keyframes
  renderKeyframes();
}

// Helper to set value safely
function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
function setChecked(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = val;
}

// Render Keyframes List in Config
function renderKeyframes() {
  const container = document.getElementById("keyframesContainer");
  if (!container || !window.CONFIG) return;

  container.innerHTML = "";
  const frames = window.CONFIG.keyframes || [];

  if (frames.length === 0) {
    container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无数据，请添加时间点</p>';
    return;
  }

  frames.forEach((frame, index) => {
    const keyframeDiv = document.createElement("div");
    keyframeDiv.className = "keyframe-item";
    const safeDate = (frame.date || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

    keyframeDiv.innerHTML = `
      <div class="keyframe-header">
        <div class="keyframe-title">时间点 ${index + 1}</div>
        <button type="button" class="keyframe-remove" onclick="removeKeyframe(${index})">删除</button>
      </div>
      <div class="form-group">
        <label>日期/标签</label>
        <input type="text" class="keyframe-date" value="${safeDate}" onchange="updateKeyframeDate(${index}, this.value)">
      </div>
      <div class="data-mode-toggle">
        <button type="button" class="data-mode-btn active" data-mode="table" data-index="${index}" onclick="switchDataMode(${index}, 'table')">表格模式</button>
        <button type="button" class="data-mode-btn" data-mode="text" data-index="${index}" onclick="switchDataMode(${index}, 'text')">文本粘贴</button>
      </div>
      <div id="keyframe-data-${index}" data-mode="table"></div>
    `;
    container.appendChild(keyframeDiv);
    renderDataItems(index, frame.data || []);
  });
}

function renderDataItems(keyframeIndex, data) {
  const container = document.getElementById(`keyframe-data-${keyframeIndex}`);
  if (!container) return;

  const mode = container.dataset.mode || "table";

  if (mode === "table") {
    if (data.length === 0) {
      container.innerHTML = `
        <p style="color: #999; text-align: center; padding: 20px;">暂无数据</p>
        <button type="button" class="btn-add" onclick="addDataItem(${keyframeIndex})">+ 添加数据项</button>
      `;
      return;
    }

    // Sort for display
    const sortedData = [...data].map((item, originalIndex) => ({
      ...item, originalIndex
    })).sort((a, b) => (b.value || 0) - (a.value || 0));

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>标识/名称</th>
            <th>数值</th>
            <th class="table-actions">操作</th>
          </tr>
        </thead>
        <tbody>
    `;

    sortedData.forEach((item, displayIndex) => {
      const safeName = (item.name || "").replace(/"/g, "&quot;");
      html += `
        <tr>
          <td>${displayIndex + 1}</td>
          <td><input type="text" value="${safeName}" onchange="updateDataItem(${keyframeIndex}, ${item.originalIndex}, 'name', this.value)" placeholder="名称"></td>
          <td><input type="number" value="${item.value || 0}" step="0.1" onchange="updateDataItem(${keyframeIndex}, ${item.originalIndex}, 'value', this.value)"></td>
          <td class="table-actions">
            <button type="button" class="table-remove" onclick="removeDataItem(${keyframeIndex}, ${item.originalIndex})">删除</button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>
      <button type="button" class="btn-add" onclick="addDataItem(${keyframeIndex})" style="margin-top: 10px;">+ 添加数据项</button>
    `;
    container.innerHTML = html;
  }
}

// Data manipulation helpers
function updateKeyframeDate(index, value) {
  if (window.CONFIG.keyframes[index]) window.CONFIG.keyframes[index].date = value;
}

function addDataItem(keyframeIndex) {
  if (!window.CONFIG.keyframes[keyframeIndex].data) window.CONFIG.keyframes[keyframeIndex].data = [];
  window.CONFIG.keyframes[keyframeIndex].data.push({ name: "", value: 0 });
  renderDataItems(keyframeIndex, window.CONFIG.keyframes[keyframeIndex].data);
}

function updateDataItem(keyframeIndex, itemIndex, field, value) {
  const item = window.CONFIG.keyframes[keyframeIndex].data[itemIndex];
  if (item) {
    if (field === 'value') item.value = parseFloat(value) || 0;
    else item[field] = value;
  }
}

function removeDataItem(keyframeIndex, itemIndex) {
  window.CONFIG.keyframes[keyframeIndex].data.splice(itemIndex, 1);
  renderDataItems(keyframeIndex, window.CONFIG.keyframes[keyframeIndex].data);
}

function addKeyframe() {
  if (!window.CONFIG.keyframes) window.CONFIG.keyframes = [];
  window.CONFIG.keyframes.push({ date: `时间点 ${window.CONFIG.keyframes.length + 1}`, data: [] });
  renderKeyframes();
}

function removeKeyframe(index) {
  if (confirm("确定要删除这个时间点吗？")) {
    window.CONFIG.keyframes.splice(index, 1);
    renderKeyframes();
  }
}

// Textarea / Quick Paste Logic
function switchDataMode(keyframeIndex, mode) {
  const container = document.getElementById(`keyframe-data-${keyframeIndex}`);
  const buttons = document.querySelectorAll(`[data-index="${keyframeIndex}"].data-mode-btn`);

  buttons.forEach(btn => btn.classList.toggle("active", btn.dataset.mode === mode));
  container.dataset.mode = mode;

  if (mode === 'table') {
    // Remove textarea view if present
    const textAreaDiv = document.getElementById(`keyframe-textarea-${keyframeIndex}`);
    if (textAreaDiv) textAreaDiv.remove();
    container.style.display = 'block';
    renderDataItems(keyframeIndex, window.CONFIG.keyframes[keyframeIndex].data);
  } else {
    // Show textarea view
    container.style.display = 'none';
    showTextareaView(keyframeIndex, container);
  }
}

function showTextareaView(keyframeIndex, container) {
  let textAreaDiv = document.getElementById(`keyframe-textarea-${keyframeIndex}`);
  if (!textAreaDiv) {
    textAreaDiv = document.createElement("div");
    textAreaDiv.id = `keyframe-textarea-${keyframeIndex}`;
    textAreaDiv.className = "data-textarea-container";
    container.parentNode.insertBefore(textAreaDiv, container.nextSibling);
  }

  const frame = window.CONFIG.keyframes[keyframeIndex];
  const nameMapping = window.CONFIG.nameMapping || {};
  const textData = (frame.data || []).map(d => {
    const mapping = nameMapping[d.name];
    const displayName = mapping ? (mapping.nameZh || d.name) : d.name;
    return `${displayName}\t${d.value || 0}`;
  }).join("\n");

  textAreaDiv.innerHTML = `
    <textarea id="keyframe-textarea-input-${keyframeIndex}" placeholder="格式：名称 数值 (Tab分隔)">${textData}</textarea>
    <div class="data-textarea-hint">提示：每行格式 <code>名称 数值</code> (Tab、逗号或空格分隔)</div>
    <button type="button" class="btn-add" onclick="parseTextData(${keyframeIndex})" style="margin-top: 10px;">解析并应用</button>
  `;
}

function parseTextData(keyframeIndex) {
  const input = document.getElementById(`keyframe-textarea-input-${keyframeIndex}`);
  if (!input) return;

  const lines = input.value.trim().split("\n");
  const newData = [];

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    let parts = line.split("\t");
    if (parts.length < 2) parts = line.split(",");
    if (parts.length < 2) parts = line.split(/\s+/);

    if (parts.length >= 2) {
      newData.push({ name: parts[0].trim(), value: parseFloat(parts[1].trim()) || 0 });
    }
  });

  if (newData.length > 0) {
    window.CONFIG.keyframes[keyframeIndex].data = newData;
    switchDataMode(keyframeIndex, 'table');
    alert(`成功解析 ${newData.length} 条数据`);
  } else {
    alert("未能解析出有效数据");
  }
}

function quickPasteToKeyframe() {
  const textarea = document.getElementById('quickPasteArea');
  const text = textarea.value.trim();
  if (!text) { alert("请先粘贴数据"); return; }

  const lines = text.split("\n");
  const newData = [];
  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    let parts = line.split("\t");
    if (parts.length < 2) parts = line.split(",");
    if (parts.length < 2) parts = line.split(/\s+/);
    if (parts.length >= 2) newData.push({ name: parts[0].trim(), value: parseFloat(parts[1].trim()) || 0 });
  });

  if (newData.length === 0) {
    alert("解析失败");
    return;
  }

  // Add to last keyframe or create new
  if (!window.CONFIG.keyframes) window.CONFIG.keyframes = [];
  let targetIndex = window.CONFIG.keyframes.length - 1;
  if (targetIndex < 0) {
    window.CONFIG.keyframes.push({ date: '初始', data: [] });
    targetIndex = 0;
  }

  window.CONFIG.keyframes[targetIndex].data = newData;
  renderKeyframes();
  textarea.value = "";
  alert("数据已更新到最后一个时间点");
}

function clearQuickPaste() {
  const el = document.getElementById('quickPasteArea');
  if (el) el.value = '';
}

// Form Submit
function handleSubmit(event) {
  event.preventDefault();

  // 1. Gather all data from form to window.CONFIG
  // Note: keyframes are already updated in window.CONFIG by onchange handlers, 
  // but we can re-sync if needed. For now assuming sync.

  const title = document.getElementById("configTitle").value;
  window.CONFIG.title = title;
  window.CONFIG.useEnglishNames = document.getElementById("useEnglishNames").checked;
  window.CONFIG.showCountryName = document.getElementById("showCountryName").checked;

  try {
    const mappingVal = document.getElementById("nameMapping").value.trim();
    if (mappingVal) window.CONFIG.nameMapping = JSON.parse(mappingVal);

    const colorsVal = document.getElementById("itemColors").value.trim();
    if (colorsVal) window.CONFIG.itemColors = JSON.parse(colorsVal);
  } catch (e) {
    alert("JSON格式错误: " + e.message);
    return;
  }

  window.CONFIG.colors = {
    default: document.getElementById("colorDefault").value,
    firstPlace: document.getElementById("colorFirstPlace").value
  };

  window.CONFIG.valueFormat = {
    prefix: document.getElementById("valuePrefix").value,
    suffix: document.getElementById("valueSuffix").value,
    decimals: parseInt(document.getElementById("valueDecimals").value) || 0,
    useCommas: document.getElementById("valueUseCommas").checked
  };

  window.CONFIG.animation = {
    interpolationSteps: parseInt(document.getElementById("animSteps").value) || 80,
    durationPerKeyframe: parseInt(document.getElementById("animDuration").value) || 5000,
    topN: parseInt(document.getElementById("animTopN").value) || 10
  };

  // Re-initialize chart
  if (window.initializeChart) {
    // Update Title UI
    if (window.CONFIG.title) {
      document.getElementById("title").textContent = window.CONFIG.title;
      document.title = window.CONFIG.title;
    }

    window.initializeChart();
    toggleConfig();
    alert("配置已应用");
  } else {
    console.error("initializeChart not found");
  }
}

// Handle direct title editing
function handleTitleEdit(newTitle) {
  if (window.CONFIG) {
    window.CONFIG.title = newTitle;
    document.title = newTitle;
    const configTitleInput = document.getElementById("configTitle");
    if (configTitleInput) configTitleInput.value = newTitle;
  }
}

// Global Load Wrapper
function loadConfig() {
  document.getElementById("configFileInput").click();
}

// Initialization on Load
document.addEventListener('DOMContentLoaded', initTheme);

// Expose
window.toggleConfig = toggleConfig;
window.toggleSection = toggleSection;
window.loadConfigToForm = loadConfigToForm;
window.toggleTheme = toggleTheme;
window.toggleFullscreen = toggleFullscreen;
window.exitFullscreen = exitFullscreen;
window.enterFullscreen = enterFullscreen;
window.handleSubmit = handleSubmit;
window.addKeyframe = addKeyframe;
window.removeKeyframe = removeKeyframe;
window.updateKeyframeDate = updateKeyframeDate;
window.addDataItem = addDataItem;
window.updateDataItem = updateDataItem;
window.removeDataItem = removeDataItem;
window.switchDataMode = switchDataMode;
window.parseTextData = parseTextData;
window.quickPasteToKeyframe = quickPasteToKeyframe;
window.clearQuickPaste = clearQuickPaste;
window.loadConfig = loadConfig;
window.handleTitleEdit = handleTitleEdit;
window.handleFileLoad = function (event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      window.CONFIG = JSON.parse(e.target.result);
      loadConfigToForm();
      alert("配置已加载，请点击应用");
    } catch (err) {
      alert("错误: " + err.message);
    }
  };
  reader.readAsText(file);
};


