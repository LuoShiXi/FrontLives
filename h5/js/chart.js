/**
 * Core D3 Chart Logic - Optimized for Glassmorphism UI
 */

let chartInitialized = false;
let keyframes = [];
let currentTime = 0;
let totalDuration = 0;
let isPlaying = false;
let animationFrameId = null;
let lastTimestamp = 0;

// Store chart instance variables for global access
window.chartVars = {
  togglePlay: () => isPlaying ? pause() : play(),
  restart: restart
};

// Smooth Rank Transition State
let prevYMap = new Map();

async function initChart() {
  const chartDiv = document.getElementById("chart");

  chartDiv.innerHTML = `<div style="text-align: center; padding: 50px; color: #fff;">
    <h2>正在加载配置...</h2>
  </div>`;

  try {
    // 1. Load Resources first
    if (!window.RESOURCES) {
      window.RESOURCES = await window.loadResources("resources.json");
    }

    // 2. Load Config
    if (!window.CONFIG || !window.CONFIG.keyframes) {
      window.CONFIG = await window.loadConfigFromFile("config.json");
    }

    if (window.CONFIG.title) {
      const titleEl = document.getElementById("title");
      if (titleEl) {
        titleEl.textContent = window.CONFIG.title;
        document.title = window.CONFIG.title;
      }
    }

    initializeChart();
    chartInitialized = true;

    if (window.loadConfigToForm) window.loadConfigToForm();

  } catch (error) {
    console.error(error);
    let msg = "加载失败";
    if (error.message === "CORS_ERROR") msg = "需启动HTTP服务器运行";
    chartDiv.innerHTML = `<div style="text-align: center; padding: 50px;"><h2>${msg}</h2><p>${error.message}</p></div>`;
  }
}

function initializeChart() {
  const CONFIG = window.CONFIG;
  if (!CONFIG || !CONFIG.keyframes) return;

  keyframes = CONFIG.keyframes;

  // Reset DOM
  const chartDiv = document.getElementById("chart");
  chartDiv.innerHTML = "";

  // Update Title
  const titleEl = document.getElementById("title");
  if (titleEl) titleEl.textContent = CONFIG.title || "Chart Title";

  // Setup SVG
  const rect = chartDiv.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  const svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

  // Initial State
  currentTime = 0;
  const durationPerFrame = CONFIG.animation.durationPerKeyframe || 3000;
  totalDuration = (keyframes.length - 1) * durationPerFrame;
  prevYMap.clear();

  // Render First Frame
  renderFrame(0, svg, width, height);
}

function getDataAtTime(time) {
  const CONFIG = window.CONFIG;
  if (!CONFIG) return { data: [], date: "" };

  const durationPerFrame = CONFIG.animation.durationPerKeyframe || 3000;

  let index = Math.floor(time / durationPerFrame);
  if (index >= keyframes.length - 1) index = keyframes.length - 2;
  if (index < 0) index = 0;

  let t = (time % durationPerFrame) / durationPerFrame;
  if (time >= totalDuration) {
    index = keyframes.length - 2;
    t = 1;
  }

  const start = keyframes[index];
  const end = keyframes[index + 1];

  // Interpolation
  const dataMap = new Map();
  start.data.forEach(d => dataMap.set(d.name, { start: d.value, end: 0 }));
  end.data.forEach(d => {
    if (dataMap.has(d.name)) dataMap.get(d.name).end = d.value;
    else dataMap.set(d.name, { start: 0, end: d.value });
  });

  const interpolated = [];
  dataMap.forEach((val, name) => {
    const v = val.start + (val.end - val.start) * t;
    interpolated.push({ name, value: v });
  });

  return {
    data: interpolated,
    date: t > 0.5 ? end.date : start.date
  };
}

function renderFrame(time, svg, width, height) {
  const { data, date } = getDataAtTime(time);
  const CONFIG = window.CONFIG;

  // Update Year
  const yearEl = document.getElementById("yearDisplay");
  if (yearEl) yearEl.textContent = date;

  // Sort and Top N
  const topN = CONFIG.animation.topN || 12;
  data.sort((a, b) => b.value - a.value);
  const currentData = data.slice(0, topN);

  // Scales
  const margin = { top: 20, right: 100, bottom: 20, left: 160 }; // Increase left for names
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const barHeight = innerHeight / topN;
  const maxValue = d3.max(data, d => d.value) || 100;

  const xScale = d3.scaleLinear()
    .domain([0, maxValue])
    .range([0, innerWidth]);

  const group = svg.selectAll(".chart-group").data([null]);
  const groupEnter = group.enter().append("g")
    .attr("class", "chart-group")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const chartGroup = group.merge(groupEnter);

  // Bars
  const bars = chartGroup.selectAll(".bar-group")
    .data(currentData, d => d.name);

  bars.exit().transition().duration(0).remove(); // Remove immediately to prevent ghosting

  const enter = bars.enter().append("g")
    .attr("class", "bar-group")
    .attr("transform", (d, i) => `translate(0, ${i * barHeight})`); // Initial position

  // Background Track (glass effect)
  // enter.append("rect")
  //     .attr("class", "bar-bg")
  //     .attr("width", innerWidth)
  //     .attr("height", barHeight * 0.8)
  //     .attr("rx", 6)
  //     .attr("fill", "rgba(255,255,255,0.02)");

  enter.append("rect")
    .attr("class", "bar")
    .attr("height", barHeight * 0.7)
    .attr("rx", 6) // Rounded corners
    .attr("y", barHeight * 0.15); // Center vertically in slot

  // Icons (Logo/Flag/etc)
  enter.append("image")
    .attr("class", "item-icon")
    .attr("x", 0)
    .attr("y", 0)
    .attr("preserveAspectRatio", "xMidYMid slice");

  // Labels (Name)
  enter.append("text")
    .attr("class", "label")
    .attr("x", -15)
    .attr("y", barHeight * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end");

  // Values
  enter.append("text")
    .attr("class", "value")
    .attr("y", barHeight * 0.5)
    .attr("dy", "0.35em")
    .attr("x", 0);

  // Update
  const allBars = enter.merge(bars);

  // Smooth Reordering Y Position
  allBars.each(function (d, i) {
    const targetY = i * barHeight;
    let prevY = prevYMap.get(d.name);
    if (prevY === undefined) prevY = targetY;

    // Soft approach
    let nextY = prevY + (targetY - prevY) * 0.2;
    if (Math.abs(nextY - targetY) < 1) nextY = targetY;

    prevYMap.set(d.name, nextY);
    d3.select(this).attr("transform", `translate(0, ${nextY})`);
  });

  allBars.select(".bar")
    .attr("width", d => xScale(d.value))
    .attr("fill", (d, i) => {
      if (CONFIG.itemColors && CONFIG.itemColors[d.name]) return CONFIG.itemColors[d.name];
      return i === 0 ? (CONFIG.colors.firstPlace || "#f59e0b") : (CONFIG.colors.default || "#3b82f6");
    });

  // Calculate dynamic icon size and spacing
  const iconSize = barHeight * 0.6;
  const iconPadding = 8;

  allBars.select(".item-icon")
    .attr("width", iconSize)
    .attr("height", iconSize)
    .attr("y", barHeight * 0.5 - iconSize * 0.5)
    .attr("x", d => xScale(d.value) + 5)
    .attr("href", d => {
      // 1. Check Config Mapping
      const m = CONFIG.nameMapping?.[d.name];
      if (m && (m.logo || m.flag || m.icon)) return m.logo || m.flag || m.icon;

      // 2. Check Central Resources using name or nameEn
      let res = window.RESOURCES?.[d.name];
      if (!res && m?.nameEn) res = window.RESOURCES?.[m.nameEn];

      if (res && (res.logo || res.flag || res.icon)) return res.logo || res.flag || res.icon;
      return "";
    })
    .attr("xlink:href", d => {
      const m = CONFIG.nameMapping?.[d.name];
      if (m && (m.logo || m.flag || m.icon)) return m.logo || m.flag || m.icon;

      let res = window.RESOURCES?.[d.name];
      if (!res && m?.nameEn) res = window.RESOURCES?.[m.nameEn];

      if (res && (res.logo || res.flag || res.icon)) return res.logo || res.flag || res.icon;
      return "";
    })
    .style("opacity", d => {
      const m = CONFIG.nameMapping?.[d.name];
      const res = window.RESOURCES?.[d.name] || (m?.nameEn ? window.RESOURCES?.[m.nameEn] : null);
      const hasImg = (m && (m.logo || m.flag || m.icon)) || (res && (res.logo || res.flag || res.icon));
      return hasImg ? 1 : 0;
    });

  allBars.select(".label")
    .text(d => {
      // 1. Config Mapping
      if (CONFIG.nameMapping && CONFIG.nameMapping[d.name]) {
        return CONFIG.useEnglishNames ?
          (CONFIG.nameMapping[d.name].nameEn || d.name) :
          (CONFIG.nameMapping[d.name].nameZh || d.name);
      }

      // 2. Central Resources
      if (window.RESOURCES && window.RESOURCES[d.name]) {
        return CONFIG.useEnglishNames ?
          (window.RESOURCES[d.name].nameEn || d.name) :
          (window.RESOURCES[d.name].nameZh || d.name);
      }

      return d.name;
    });

  allBars.select(".value")
    .attr("x", d => {
      const m = CONFIG.nameMapping?.[d.name];
      const res = window.RESOURCES?.[d.name] || (m?.nameEn ? window.RESOURCES?.[m.nameEn] : null);
      const hasImg = (m && (m.logo || m.flag || m.icon)) || (res && (res.logo || res.flag || res.icon));
      return xScale(d.value) + 10 + (hasImg ? iconSize + 5 : 0);
    })
    .text(d => {
      const val = Math.round(d.value).toLocaleString();
      const prefix = CONFIG.valueFormat?.prefix || "";
      const suffix = CONFIG.valueFormat?.suffix || "";
      return prefix + val + suffix;
    });
}


function loop(timestamp) {
  if (!isPlaying) return;
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  currentTime += delta;
  if (currentTime >= totalDuration) {
    currentTime = totalDuration;
    isPlaying = false;
    togglePlayIcon(); // Update UI
  }

  const svg = d3.select("#chart svg");
  const rect = document.getElementById("chart").getBoundingClientRect();
  renderFrame(currentTime, svg, rect.width, rect.height);

  animationFrameId = requestAnimationFrame(loop);
}

function play() {
  if (isPlaying) return;
  isPlaying = true;
  lastTimestamp = 0;
  togglePlayIcon();
  animationFrameId = requestAnimationFrame(loop);
}

function pause() {
  isPlaying = false;
  togglePlayIcon();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
}

function restart() {
  pause();
  currentTime = 0;
  prevYMap.clear();
  const svg = d3.select("#chart svg");
  const rect = document.getElementById("chart").getBoundingClientRect();
  renderFrame(0, svg, rect.width, rect.height);
  setTimeout(play, 500);
}

function togglePlayIcon() {
  const playIcon = document.getElementById("iconPlay");
  const pauseIcon = document.getElementById("iconPause");
  if (playIcon && pauseIcon) {
    if (isPlaying) {
      playIcon.style.display = "none";
      pauseIcon.style.display = "block";
    } else {
      playIcon.style.display = "block";
      pauseIcon.style.display = "none";
    }
  }
}

