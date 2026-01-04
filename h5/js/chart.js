/**
 * Core D3 Chart Logic - Optimized for Smoothness
 * (Cleaned: Removed Line Chart)
 */

let chartInitialized = false;
let keyframes = [];
let currentTime = 0; // Current time in ms from start
let totalDuration = 0;
let isPlaying = false;

// Smooth Rank Transition
let prevYMap = new Map(); // Store previous Y positions for smooth transition

// Animation State
let animationFrameId = null;
let lastTimestamp = 0;

// Initialize Chart (Entry Point)
async function initChart() {
  const chartElement = document.getElementById("chart");
  chartElement.innerHTML = `
    <div style="text-align: center; padding: 50px; color: #fff;">
      <h2>正在加载配置...</h2>
    </div>
  `;

  try {
    if (!window.CONFIG || !window.CONFIG.keyframes) {
      window.CONFIG = await window.loadConfigFromFile("config.json");
    }

    if (window.CONFIG.title) {
      document.getElementById("title").textContent = window.CONFIG.title;
      document.title = window.CONFIG.title;
    }

    initializeChart();
    chartInitialized = true;

    if (window.loadConfigToForm) window.loadConfigToForm();

  } catch (error) {
    console.error(error);
    let msg = "加载失败";
    if (error.message === "CORS_ERROR") msg = "需启动HTTP服务器运行";
    chartElement.innerHTML = `<div style="text-align: center; padding: 50px;"><h2>${msg}</h2><p>${error.message}</p></div>`;
  }
}

// Main Initialization
function initializeChart() {
  const CONFIG = window.CONFIG;
  if (!CONFIG.keyframes || CONFIG.keyframes.length === 0) return;

  keyframes = CONFIG.keyframes;

  // Clean container
  const chartElement = document.getElementById("chart");
  chartElement.innerHTML = "";

  // Year Display
  const yearDisplayDiv = document.createElement("div");
  yearDisplayDiv.className = "year-display";
  yearDisplayDiv.id = "yearDisplay";
  yearDisplayDiv.textContent = keyframes[0].date;
  chartElement.appendChild(yearDisplayDiv);

  // Init SVG
  const chartRect = chartElement.getBoundingClientRect();
  const width = chartRect.width || 800;
  const height = chartRect.height || 600;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Reset State
  currentTime = 0;
  // Calculate total duration based on config
  const durationPerFrame = CONFIG.animation.durationPerKeyframe || 2000;
  totalDuration = (keyframes.length - 1) * durationPerFrame;

  prevYMap.clear();

  // Initial Render at t=0
  renderFrame(0, svg, width, height);
}

// Get Interpolated Data at exact time t (ms)
function getDataAtTime(time) {
  const CONFIG = window.CONFIG;
  if (!CONFIG || !CONFIG.animation) return { data: [], date: "", globalT: time };

  const durationPerFrame = CONFIG.animation.durationPerKeyframe || 2000;

  // Find index
  let index = Math.floor(time / durationPerFrame);
  if (index >= keyframes.length - 1) index = keyframes.length - 2;
  if (index < 0) index = 0;

  const t = (time % durationPerFrame) / durationPerFrame;

  const startFrame = keyframes[index];
  const endFrame = keyframes[index + 1];

  // Final frame check: if time is at totalDuration, ensure t=1.0 and use last frame
  const finalT = time >= totalDuration ? 1.0 : t;
  const displayDate = finalT >= 0.5 ? endFrame.date : startFrame.date;

  // Interpolate Values
  const startMap = new Map((startFrame.data || []).map(d => [d.name, d.value]));
  const endMap = new Map((endFrame.data || []).map(d => [d.name, d.value]));
  const allNames = new Set([...startMap.keys(), ...endMap.keys()]);

  const data = [];
  allNames.forEach(name => {
    const startVal = startMap.get(name) || 0;
    const endVal = endMap.get(name) || 0;
    const val = startVal + (endVal - startVal) * finalT;
    data.push({ name, value: val });
  });

  return { data, date: displayDate, globalT: time };
}

// Render Loop Function
function renderFrame(time, svg, width, height) {
  const { data, date, globalT } = getDataAtTime(time);
  const CONFIG = window.CONFIG;
  if (!CONFIG || !CONFIG.animation) return;

  // Update Year
  const yearEl = document.getElementById("yearDisplay");
  if (yearEl) yearEl.textContent = date;

  // Layout Logic
  const maxTopN = CONFIG.animation.topN || 10;
  const isFullscreen = document.body.classList.contains('fullscreen');

  // Adjust dimensions
  if (isFullscreen) {
    const wrapper = document.querySelector('.chart-wrapper');
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      width = rect.width - 40;
      height = rect.height - 40;
      svg.attr("width", width).attr("height", height);
    }
  } else {
    const rect = document.getElementById("chart").getBoundingClientRect();
    if (rect.width !== width) {
      width = rect.width;
      height = rect.height;
      svg.attr("width", width).attr("height", height);
    }
  }

  // --- Data Process ---
  const items = data.filter(d => d.value > 0);
  items.sort((a, b) => b.value - a.value);
  const topN = items.slice(0, maxTopN);

  const actualCount = Math.max(1, topN.length);
  const maxValue = Math.max(...data.map(d => d.value), 1) * 1.1;

  // --- Layout Calculations ---
  const margins = { top: 40, right: 150, bottom: 40, left: 200 };
  const availableHeight = height - margins.top - margins.bottom;

  const barHeight = availableHeight / actualCount;
  const xScale = d3.scaleLinear().domain([0, maxValue]).range([0, width - margins.left - margins.right]);

  // Calculate Target Y positions (Rank based)
  const targetYMap = new Map();
  topN.forEach((d, i) => {
    targetYMap.set(d.name, margins.top + i * barHeight);
  });

  // --- Rendering ---
  // 2. Bar Chart
  let barGroups = svg.selectAll(".bar-group").data(topN, d => d.name);
  barGroups.exit().remove();

  const enter = barGroups.enter().append("g").attr("class", "bar-group");
  enter.append("rect").attr("class", "bar").attr("rx", 4).attr("opacity", 0.85);
  enter.append("text").attr("class", "label").attr("text-anchor", "end").attr("dy", "0.35em");
  enter.append("text").attr("class", "value").attr("dy", "0.35em");

  barGroups = enter.merge(barGroups);

  barGroups.each(function (d) {
    const name = d.name;
    let prevY = prevYMap.get(name);
    const targetY = targetYMap.get(name);
    if (prevY === undefined) prevY = targetY;
    let nextY = prevY + (targetY - prevY) * 0.15;
    // If we are at the last frame, force to target to avoid 'drifting' or overlapping
    if (Math.abs(nextY - targetY) < 1 || time >= totalDuration) nextY = targetY;
    prevYMap.set(name, nextY);
    d3.select(this).attr("transform", `translate(0, ${nextY})`);
  });

  barGroups.each(function (d) {
    const g = d3.select(this);
    const barWidth = Math.max(0, xScale(d.value));
    const color = getBarColor(d, topN.findIndex(x => x.name === d.name));

    g.select(".bar")
      .attr("x", margins.left)
      .attr("width", barWidth)
      .attr("height", barHeight * 0.85)
      .attr("fill", color);

    g.select(".label")
      .attr("x", margins.left - 15)
      .attr("y", barHeight * 0.85 / 2)
      .attr("fill", "var(--text-primary)")
      .each(function (d) {
        const text = getDisplayName(d);
        const el = d3.select(this);
        el.text(text);

        // Simple clipping: if too wide, truncate
        const maxWidth = margins.left - 30; // Leave some space for padding
        let textWidth = this.getComputedTextLength();
        if (textWidth > maxWidth) {
          let truncated = text;
          while (textWidth > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
            el.text(truncated + "...");
            textWidth = this.getComputedTextLength();
          }
        }
      });

    g.select(".value")
      .attr("x", margins.left + barWidth + 10)
      .attr("y", barHeight * 0.85 / 2)
      .attr("fill", "var(--text-primary)")
      .text(window.formatNumber(d.value, CONFIG.valueFormat));
  });
}

// --- Helper Functions ---
function getBarColor(d, rank) {
  const CONFIG = window.CONFIG;
  if (CONFIG.itemColors && CONFIG.itemColors[d.name]) return CONFIG.itemColors[d.name];
  if (rank === 0) return CONFIG.colors.firstPlace;
  return CONFIG.colors.default;
}

function getDisplayName(d) {
  const CONFIG = window.CONFIG;
  if (CONFIG.nameMapping && CONFIG.nameMapping[d.name]) {
    return CONFIG.useEnglishNames ?
      (CONFIG.nameMapping[d.name].nameEn || d.name) :
      (CONFIG.nameMapping[d.name].nameZh || d.name);
  }
  return d.name;
}

// --- Control Logic ---
function loop(timestamp) {
  if (!isPlaying) return;
  if (!lastTimestamp) lastTimestamp = timestamp;

  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  currentTime += delta;

  if (currentTime >= totalDuration) {
    currentTime = totalDuration;
    isPlaying = false;
    renderFrame(currentTime, d3.select("#chart svg"), 0, 0); // Final frame
    return;
  }

  const svg = d3.select("#chart svg");
  renderFrame(currentTime, svg, 0, 0);

  animationFrameId = requestAnimationFrame(loop);
}

function play() {
  if (isPlaying) return;
  isPlaying = true;
  lastTimestamp = 0;
  animationFrameId = requestAnimationFrame(loop);
}

function pause() {
  isPlaying = false;
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
}

function restart() {
  pause();
  currentTime = 0;
  prevYMap.clear();
  const svg = d3.select("#chart svg");
  renderFrame(0, svg, 0, 0);

  setTimeout(() => {
    play();
  }, 500);
}

// Expose
window.initChart = initChart;
window.initializeChart = initializeChart;
window.play = play;
window.pause = pause;
window.restart = restart;
window.refreshChart = function () {
  const svg = d3.select("#chart svg");
  renderFrame(currentTime, svg, 0, 0);
};
window.updateChartTextColors = function () {
  window.refreshChart();
};
window.togglePlayPause = function () {
  if (isPlaying) pause(); else play();
};
