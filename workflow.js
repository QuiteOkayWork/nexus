(() => {
  const section = document.querySelector(".decision-workflow");
  if (!section) return;

  window.__nexusWorkflowInitialized = true;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const sticky = section.querySelector(".workflow-sticky");
  const svg = section.querySelector(".workflow-orbit svg");
  const path = section.querySelector(".workflow-path--base");
  const progressPath = section.querySelector(".workflow-path--progress");
  const node = section.querySelector(".workflow-node");
  const nodeLabel = node.querySelector("text");
  const stages = [...section.querySelectorAll(".workflow-stage")];
  const markersGroup = section.querySelector(".workflow-markers");
  const status = section.querySelector("[data-workflow-status]");
  const grid = section.querySelector(".workflow-grid");
  const orbit = section.querySelector(".workflow-orbit");
  const stageNames = ["DEFINE", "GATHER", "EVALUATE", "DECIDE", "LEARN"];
  const scrollStops = [0, 0.15, 0.35, 0.6, 0.82, 1];
  const motionStops = [0, 0.075, 0.25, 0.475, 0.71, 0.91, 1];
  const pathStops = [0.08, 0.08, 0.25, 0.5, 0.75, 0.92, 0.98];
  const markerPositions = [0.08, 0.25, 0.5, 0.75, 0.97];
  const pathLength = path.getTotalLength();
  const valueFrames = new WeakMap();
  let activeStage = 0;
  let scrollFrame = 0;

  progressPath.style.strokeDasharray = pathLength;
  progressPath.style.strokeDashoffset = pathLength;

  const markerNodes = markerPositions.map((position, index) => {
    const point = path.getPointAtLength(pathLength * position);
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    marker.setAttribute("class", "workflow-marker");
    marker.setAttribute("cx", point.x);
    marker.setAttribute("cy", point.y);
    marker.setAttribute("r", index === 4 ? 2.7 : 2.2);
    markersGroup.appendChild(marker);
    return marker;
  });

  function stageAt(progress) {
    if (progress < scrollStops[1]) return 0;
    if (progress < scrollStops[2]) return 1;
    if (progress < scrollStops[3]) return 2;
    if (progress < scrollStops[4]) return 3;
    return 4;
  }

  function pathProgressAt(progress) {
    let segment = motionStops.length - 2;

    for (let index = 0; index < motionStops.length - 1; index += 1) {
      if (progress <= motionStops[index + 1]) {
        segment = index;
        break;
      }
    }

    const start = motionStops[segment];
    const end = motionStops[segment + 1];
    const local = (progress - start) / Math.max(end - start, 0.001);
    return pathStops[segment] +
      (pathStops[segment + 1] - pathStops[segment]) * local;
  }

  function animateValues(stage) {
    if (reducedMotion) return;

    stage.querySelectorAll("[data-workflow-value]").forEach((element) => {
      const previousFrame = valueFrames.get(element);
      if (previousFrame) cancelAnimationFrame(previousFrame);

      const target = Number(element.dataset.workflowValue);
      const startTime = performance.now();

      const tick = (time) => {
        const elapsed = Math.min(1, (time - startTime) / 700);
        const eased = 1 - (1 - elapsed) ** 3;
        element.textContent = Math.round(target * eased);

        if (elapsed < 1) {
          valueFrames.set(element, requestAnimationFrame(tick));
        }
      };

      valueFrames.set(element, requestAnimationFrame(tick));
    });
  }

  function setStage(index) {
    if (index === activeStage && stages[index].classList.contains("is-active")) {
      return;
    }

    activeStage = index;
    stages.forEach((stage, stageIndex) => {
      const isActive = stageIndex === index;
      stage.classList.toggle("is-active", isActive);
      stage.setAttribute("aria-hidden", String(!isActive));
    });

    status.textContent = `0${index + 1} / ${stageNames[index]}`;
    nodeLabel.textContent = `0${index + 1}`;
    node.classList.remove("is-entering");
    void node.getBoundingClientRect();
    node.classList.add("is-entering");
    animateValues(stages[index]);
  }

  function render(progress) {
    const stageIndex = stageAt(progress);
    setStage(stageIndex);

    let nodeProgress = reducedMotion
      ? markerPositions[stageIndex]
      : pathProgressAt(progress);

    if (window.innerWidth <= 720) {
      nodeProgress = 0.18 + nodeProgress * 0.64;
    }

    const point = path.getPointAtLength(pathLength * nodeProgress);
    node.setAttribute("transform", `translate(${point.x} ${point.y})`);

    const illuminatedProgress =
      stageIndex === 4 && progress > 0.96 ? 1 : nodeProgress;
    progressPath.style.strokeDashoffset =
      pathLength * (1 - illuminatedProgress);

    const screenPoint = svg.createSVGPoint();
    screenPoint.x = point.x;
    screenPoint.y = point.y;
    const transformed = screenPoint.matrixTransform(svg.getScreenCTM());
    const stickyRect = sticky.getBoundingClientRect();
    sticky.style.setProperty(
      "--workflow-node-x",
      ((transformed.x - stickyRect.left) / stickyRect.width) * 100,
    );
    sticky.style.setProperty(
      "--workflow-node-y",
      ((transformed.y - stickyRect.top) / stickyRect.height) * 100,
    );

    markerNodes.forEach((marker, index) => {
      marker.classList.toggle("is-complete", index < stageIndex);
      marker.classList.toggle("is-current", index === stageIndex);
    });

    const exitProgress = Math.max(0, (progress - 0.985) / 0.015);
    orbit.style.opacity = 1 - exitProgress * 0.42;
    grid.style.opacity = 0.26 * (1 - exitProgress * 0.55);
  }

  function renderFromScroll() {
    scrollFrame = 0;
    const rect = section.getBoundingClientRect();
    const distance = Math.max(section.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, -rect.top / distance));
    render(progress);
  }

  function scheduleRender() {
    if (!scrollFrame) {
      scrollFrame = requestAnimationFrame(renderFromScroll);
    }
  }

  render(0);
  window.addEventListener("scroll", scheduleRender, { passive: true });
  window.addEventListener("resize", scheduleRender);
  window.addEventListener("load", scheduleRender);
  window.addEventListener("pageshow", scheduleRender);
})();
