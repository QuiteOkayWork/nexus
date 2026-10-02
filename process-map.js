// Keep the process map independent from optional animation libraries.
const processPanel = document.querySelector(".process-panel");
const processSvg = processPanel?.querySelector(".process-connectors");
let activeProcessStage = null;

function updateProcessConnectors() {
  if (!processPanel || !processSvg || window.innerWidth <= 720) return;

  const panelRect = processPanel.getBoundingClientRect();
  const engineRect = processPanel
    .querySelector(".map-engine")
    .getBoundingClientRect();
  const engineLeft = engineRect.left - panelRect.left;
  const engineRight = engineRect.right - panelRect.left;
  const activeRect = activeProcessStage?.getBoundingClientRect();
  const hubY = activeRect
    ? activeRect.top - panelRect.top + activeRect.height / 2
    : engineRect.top - panelRect.top + engineRect.height / 2;
  const hubIn = { x: engineLeft, y: hubY };
  const hubOut = { x: engineRight, y: hubY };

  processSvg.setAttribute(
    "viewBox",
    `0 0 ${panelRect.width} ${panelRect.height}`,
  );

  const getNodePort = (name) => {
    const portRect = processPanel
      .querySelector(`[data-node="${name}"] i`)
      .getBoundingClientRect();
    return {
      x: portRect.left - panelRect.left + portRect.width / 2,
      y: portRect.top - panelRect.top + portRect.height / 2,
    };
  };

  const inputNodes = [
    ...processPanel.querySelectorAll(".map-column--inputs [data-node]"),
  ];
  const outputNodes = [
    ...processPanel.querySelectorAll(".map-column--outputs [data-node]"),
  ];
  const inputStartX = getNodePort(inputNodes[0].dataset.node).x;
  const outputEndX = getNodePort(outputNodes[0].dataset.node).x;

  const setGradientRange = (id, startX, endX) => {
    const gradient = processSvg.querySelector(`#${id}`);
    gradient.setAttribute("x1", startX);
    gradient.setAttribute("x2", endX);
    gradient.setAttribute("y1", 0);
    gradient.setAttribute("y2", 0);
  };

  setGradientRange("connectorIn", inputStartX, engineLeft);
  setGradientRange("connectorOut", engineRight, outputEndX);

  const setPoint = (name, point) => {
    const circle = processSvg.querySelector(`[data-point="${name}"]`);
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
  };

  const setCurve = (name, start, end) => {
    const distance = end.x - start.x;
    processSvg
      .querySelector(`[data-connector="${name}"]`)
      .setAttribute(
        "d",
        `M${start.x} ${start.y} C${start.x + distance * 0.42} ${start.y}, ${end.x - distance * 0.42} ${end.y}, ${end.x} ${end.y}`,
      );
  };

  inputNodes.forEach((node) => {
    const name = node.dataset.node;
    const start = getNodePort(name);
    setCurve(name, start, hubIn);
  });

  outputNodes.forEach((node) => {
    const name = node.dataset.node;
    const end = getNodePort(name);
    setCurve(name, hubOut, end);
  });

  setPoint("hub-in", hubIn);
  setPoint("hub-out", hubOut);
}

updateProcessConnectors();
window.addEventListener("load", updateProcessConnectors);
new ResizeObserver(updateProcessConnectors).observe(processPanel);

const processStages = processPanel.querySelectorAll("[data-stage]");

function focusProcessStage(stage) {
  const related = new Set(
    `${stage.dataset.inputs || ""} ${stage.dataset.outputs || ""}`
      .trim()
      .split(/\s+/),
  );

  activeProcessStage = stage;
  processPanel.classList.add("is-map-filtering");
  processPanel.querySelectorAll("[data-node]").forEach((node) => {
    node.classList.toggle("is-related", related.has(node.dataset.node));
  });
  processPanel.querySelectorAll("[data-connector]").forEach((connector) => {
    connector.classList.toggle(
      "is-related",
      related.has(connector.dataset.connector),
    );
  });
  processPanel.querySelectorAll("[data-point]").forEach((point) => {
    point.classList.toggle("is-related", related.has(point.dataset.point));
  });
  processStages.forEach((item) => {
    item.classList.toggle("is-hovered", item === stage);
  });
  updateProcessConnectors();
}

function clearProcessStage() {
  activeProcessStage = null;
  processPanel.classList.remove("is-map-filtering");
  processPanel.querySelectorAll(".is-related, .is-hovered").forEach((item) => {
    item.classList.remove("is-related", "is-hovered");
  });
  updateProcessConnectors();
}

processStages.forEach((stage) => {
  stage.tabIndex = 0;
  stage.addEventListener("pointerenter", () => focusProcessStage(stage));
  stage.addEventListener("pointerleave", clearProcessStage);
  stage.addEventListener("focus", () => focusProcessStage(stage));
  stage.addEventListener("blur", clearProcessStage);
});
processPanel.addEventListener("pointerleave", clearProcessStage);
window.addEventListener("pageshow", clearProcessStage);
