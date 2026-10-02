gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Smooth scrolling
const lenis = new Lenis({
  duration: 1.15,
  smoothWheel: !prefersReducedMotion,
  wheelMultiplier: 0.9,
});

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Anchor navigation through Lenis
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const selector = link.getAttribute("href");
    const target = document.querySelector(selector);

    if (!target) return;

    event.preventDefault();
    lenis.scrollTo(target, { offset: -64 });
    document.body.classList.remove("menu-open");
  });
});

// Condensed navigation after leaving the top
const header = document.querySelector("[data-header]");

ScrollTrigger.create({
  start: 40,
  onUpdate: (self) => {
    header.classList.toggle("is-scrolled", self.scroll() > 40);
  },
});

const menuToggle = document.querySelector(".menu-toggle");

menuToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

// Build the radial confidence visualization from individual ticks
document.querySelectorAll("[data-radial]").forEach((visual) => {
  const radial = visual.querySelector(".radial");
  const score = Number(visual.dataset.radial);
  const activeTicks = Math.round(score * 0.64);

  radial.innerHTML = Array.from({ length: 64 }, (_, index) => {
    const activeClass = index < activeTicks ? "active" : "";
    return `<i class="${activeClass}" style="--i:${index}"></i>`;
  }).join("");
});

// Hero decision command surface and orbital processing response.
const heroQuery = document.querySelector("[data-hero-query]");
const heroOrbit = document.querySelector("[data-nexus-orbit]");
const heroQueryState = document.querySelector("[data-hero-query-state]");
let heroQueryTimer = 0;

if (heroQuery && heroOrbit && heroQueryState) {
  heroQuery.addEventListener("submit", (event) => {
    event.preventDefault();
    window.clearTimeout(heroQueryTimer);

    const button = heroQuery.querySelector("button[type='submit']");
    const question = heroQuery.elements.question.value.trim();
    if (!question) heroQuery.elements.question.value = "Should we expand into Germany this year?";

    heroQuery.classList.add("is-processing");
    heroOrbit.classList.add("is-processing");
    button.disabled = true;
    button.firstChild.textContent = "Preparing workspace ";
    heroQueryState.textContent = "QUESTION / INTERPRETING";

    heroQueryTimer = window.setTimeout(() => {
      heroQuery.classList.remove("is-processing");
      heroOrbit.classList.remove("is-processing");
      button.disabled = false;
      button.firstChild.textContent = "Ask NEXUS ";
      heroQueryState.textContent = "Decision workspace simulated in this demo.";
    }, prefersReducedMotion ? 300 : 1800);
  });
}

// Pinned product experience: one persistent application shell, three views.
const productExperience = document.querySelector(".product-experience");

if (productExperience) {
  const productCopies = [...productExperience.querySelectorAll("[data-product-copy]")];
  const productScreens = [...productExperience.querySelectorAll("[data-product-screen]")];
  const productSteps = [...productExperience.querySelectorAll("[data-product-step]")];
  const productCount = productExperience.querySelector("[data-product-count]");
  const appNav = [...productExperience.querySelectorAll("[data-app-nav]")];
  let activeProductStage = 0;

  function setProductStage(index, immediate = false) {
    if (index === activeProductStage && productScreens[index].classList.contains("is-active")) return;

    const previousScreen = productScreens[activeProductStage];
    const nextScreen = productScreens[index];
    activeProductStage = index;

    productCopies.forEach((copy, copyIndex) => {
      const active = copyIndex === index;
      copy.classList.toggle("is-active", active);
      copy.setAttribute("aria-hidden", String(!active));
      if (!active) gsap.set(copy, { autoAlpha: 0 });
      if (active && (prefersReducedMotion || immediate)) {
        gsap.set(copy, { autoAlpha: 1, y: 0 });
      }
    });
    productScreens.forEach((screen, screenIndex) => {
      const active = screenIndex === index;
      screen.classList.toggle("is-active", active);
      screen.setAttribute("aria-hidden", String(!active));
      if (!active) gsap.set(screen, { autoAlpha: 0 });
      if (active && (prefersReducedMotion || immediate)) {
        gsap.set(screen, { autoAlpha: 1, x: 0, scale: 1 });
      }
    });
    productSteps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
    productCount.textContent = `0${index + 1}`;

    const navKey = ["overview", "decisions", "intelligence"][index];
    appNav.forEach((item) => item.classList.toggle("is-active", item.dataset.appNav === navKey));

    if (!prefersReducedMotion && !immediate) {
      gsap.killTweensOf([previousScreen, nextScreen, ...nextScreen.children]);
      gsap.fromTo(nextScreen, { autoAlpha: 0, x: 18, scale: 0.992 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.72, ease: "power3.out" });
      gsap.fromTo(nextScreen.children, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power2.out", delay: 0.08 });
      gsap.fromTo(productCopies[index], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.52, ease: "power2.out" });
    }
  }

  function productStageAt(progress) {
    if (progress < 0.3) return 0;
    if (progress < 0.65) return 1;
    return 2;
  }

  setProductStage(0, true);

  ScrollTrigger.create({
    trigger: productExperience,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => setProductStage(productStageAt(self.progress)),
    onRefresh: (self) => setProductStage(productStageAt(self.progress), true),
  });

  productSteps.forEach((step, index) => {
    step.addEventListener("click", () => {
      const scrollDistance = productExperience.offsetHeight - window.innerHeight;
      const progress = [0.12, 0.46, 0.82][index];
      lenis.scrollTo(productExperience.offsetTop + scrollDistance * progress);
    });
  });

  productExperience.querySelectorAll("[data-open-decision]").forEach((control) => {
    control.addEventListener("click", () => productSteps[1].click());
  });

  const evidenceButtons = [...productExperience.querySelectorAll("[data-evidence]")];
  const signalMap = productExperience.querySelector("[data-signal-map]");
  evidenceButtons.forEach((button) => {
    button.addEventListener("pointerenter", () => {
      evidenceButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      signalMap.dataset.signalMap = button.dataset.evidence;
    });
  });
}

// A quiet cursor-following pool of analytical light
const cursorLight = document.querySelector(".cursor-light");

window.addEventListener("pointermove", (event) => {
  cursorLight.style.setProperty("--x", `${event.clientX}px`);
  cursorLight.style.setProperty("--y", `${event.clientY}px`);
});

// Pinned, user-facing decision workflow. The node position is sampled from the
// actual SVG ellipse so its movement and the illuminated path stay in sync.
const workflowSection = document.querySelector(".decision-workflow");

if (workflowSection && !window.__nexusWorkflowInitialized) {
  const workflowSticky = workflowSection.querySelector(".workflow-sticky");
  const workflowSvg = workflowSection.querySelector(".workflow-orbit svg");
  const workflowPath = workflowSection.querySelector(".workflow-path--base");
  const workflowProgressPath = workflowSection.querySelector(
    ".workflow-path--progress",
  );
  const workflowNode = workflowSection.querySelector(".workflow-node");
  const workflowNodeLabel = workflowNode.querySelector("text");
  const workflowStages = [...workflowSection.querySelectorAll(".workflow-stage")];
  const workflowMarkers = workflowSection.querySelector(".workflow-markers");
  const workflowStatus = workflowSection.querySelector("[data-workflow-status]");
  const workflowGrid = workflowSection.querySelector(".workflow-grid");
  const workflowOrbit = workflowSection.querySelector(".workflow-orbit");
  const stageNames = ["DEFINE", "GATHER", "EVALUATE", "DECIDE", "LEARN"];
  const scrollStops = [0, 0.15, 0.35, 0.6, 0.82, 1];
  const motionStops = [0, 0.075, 0.25, 0.475, 0.71, 0.91, 1];
  const pathStops = [0.08, 0.08, 0.25, 0.5, 0.75, 0.92, 0.98];
  const markerPositions = [0.08, 0.25, 0.5, 0.75, 0.97];
  const pathLength = workflowPath.getTotalLength();
  let currentWorkflowStage = 0;

  workflowProgressPath.style.strokeDasharray = pathLength;
  workflowProgressPath.style.strokeDashoffset = pathLength;

  const markerNodes = markerPositions.map((position, index) => {
    const point = workflowPath.getPointAtLength(pathLength * position);
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    marker.setAttribute("class", "workflow-marker");
    marker.setAttribute("cx", point.x);
    marker.setAttribute("cy", point.y);
    marker.setAttribute("r", index === 4 ? 2.7 : 2.2);
    workflowMarkers.appendChild(marker);
    return marker;
  });

  function workflowStageAt(progress) {
    if (progress < scrollStops[1]) return 0;
    if (progress < scrollStops[2]) return 1;
    if (progress < scrollStops[3]) return 2;
    if (progress < scrollStops[4]) return 3;
    return 4;
  }

  function interpolateWorkflowProgress(progress) {
    const segment = Math.min(
      motionStops.length - 2,
      Math.max(0, motionStops.findIndex((stop, index) =>
        index < motionStops.length - 1 && progress <= motionStops[index + 1],
      )),
    );
    const start = motionStops[segment];
    const end = motionStops[segment + 1];
    const local = (progress - start) / Math.max(end - start, 0.001);
    return pathStops[segment] +
      (pathStops[segment + 1] - pathStops[segment]) * local;
  }

  function animateWorkflowValues(stage) {
    if (prefersReducedMotion) return;

    stage.querySelectorAll("[data-workflow-value]").forEach((element) => {
      const target = Number(element.dataset.workflowValue);
      const counter = { value: 0 };
      gsap.killTweensOf(element);
      gsap.to(counter, {
        value: target,
        duration: 0.75,
        ease: "power2.out",
        onUpdate: () => {
          element.textContent = Math.round(counter.value);
        },
      });
    });
  }

  function setWorkflowStage(index) {
    if (index === currentWorkflowStage && workflowStages[index].classList.contains("is-active")) {
      return;
    }

    currentWorkflowStage = index;
    workflowStages.forEach((stage, stageIndex) => {
      const active = stageIndex === index;
      stage.classList.toggle("is-active", active);
      stage.setAttribute("aria-hidden", String(!active));
    });
    workflowStatus.textContent = `0${index + 1} / ${stageNames[index]}`;
    workflowNodeLabel.textContent = `0${index + 1}`;
    workflowNode.classList.remove("is-entering");
    void workflowNode.getBoundingClientRect();
    workflowNode.classList.add("is-entering");
    animateWorkflowValues(workflowStages[index]);
  }

  function renderWorkflow(progress) {
    const stageIndex = workflowStageAt(progress);
    setWorkflowStage(stageIndex);

    let nodeProgress = prefersReducedMotion
      ? markerPositions[stageIndex]
      : interpolateWorkflowProgress(progress);

    if (window.innerWidth <= 720) {
      nodeProgress = 0.18 + nodeProgress * 0.64;
    }

    const point = workflowPath.getPointAtLength(pathLength * nodeProgress);
    workflowNode.setAttribute("transform", `translate(${point.x} ${point.y})`);
    workflowProgressPath.style.strokeDashoffset =
      pathLength * (1 - (stageIndex === 4 && progress > 0.96 ? 1 : nodeProgress));

    const screenPoint = workflowSvg.createSVGPoint();
    screenPoint.x = point.x;
    screenPoint.y = point.y;
    const transformed = screenPoint.matrixTransform(workflowSvg.getScreenCTM());
    const stickyRect = workflowSticky.getBoundingClientRect();
    workflowSticky.style.setProperty(
      "--workflow-node-x",
      ((transformed.x - stickyRect.left) / stickyRect.width) * 100,
    );
    workflowSticky.style.setProperty(
      "--workflow-node-y",
      ((transformed.y - stickyRect.top) / stickyRect.height) * 100,
    );

    markerNodes.forEach((marker, index) => {
      marker.classList.toggle("is-complete", index < stageIndex);
      marker.classList.toggle("is-current", index === stageIndex);
    });

    const exitProgress = Math.max(0, (progress - 0.985) / 0.015);
    workflowOrbit.style.opacity = 1 - exitProgress * 0.42;
    workflowGrid.style.opacity = 0.26 * (1 - exitProgress * 0.55);
  }

  renderWorkflow(0);

  ScrollTrigger.create({
    trigger: workflowSection,
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => renderWorkflow(self.progress),
    onRefresh: (self) => renderWorkflow(self.progress),
  });
}

if (!prefersReducedMotion) {
  // Hero entry sequence
  gsap.from(".hero__intro > *", {
    autoAlpha: 0,
    y: 22,
    duration: 0.8,
    stagger: 0.09,
    ease: "power3.out",
    delay: 0.15,
  });

  gsap.from(".nexus-orbit", {
    autoAlpha: 0,
    x: 30,
    duration: 1.1,
    ease: "power3.out",
    delay: 0.35,
  });

  // Section reveals — callback driven so content is never pre-hidden forever.
  document
    .querySelectorAll(".reveal:not(.hero__intro):not(.nexus-orbit)")
    .forEach((element) => {
      ScrollTrigger.create({
        trigger: element,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              ease: "power3.out",
              clearProps: "visibility,opacity,transform",
            },
          );
        },
      });
    });

  // Draw each information chart on entry, then replay only that chart when
  // its signal card is hovered.
  const signalChartTimelines = new WeakMap();

  function playSignalChartAnimation(chart) {
    const previousTimeline = signalChartTimelines.get(chart);
    if (previousTimeline) {
      previousTimeline.progress(1);
      previousTimeline.kill();
    }

    chart
      .querySelectorAll(".chart-line:not(.chart-line--secondary)")
      .forEach((line) => {
        const length = line.getTotalLength();
        gsap.set(line, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
      });

    const timeline = gsap.timeline();
    signalChartTimelines.set(chart, timeline);

    timeline
      .fromTo(
        chart.querySelectorAll(".chart-grid line"),
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.7, stagger: 0.06, ease: "power2.out" },
      )
      .fromTo(
        chart.querySelectorAll(".chart-area"),
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.75, ease: "power2.out" },
        0.15,
      )
      .to(
        chart.querySelectorAll(".chart-line:not(.chart-line--secondary)"),
        {
          strokeDashoffset: 0,
          duration: 1.25,
          stagger: 0.12,
          ease: "power2.inOut",
        },
        0.12,
      )
      .fromTo(
        chart.querySelectorAll(".chart-line--secondary"),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.8, ease: "power2.out" },
        0.35,
      )
      .from(
        chart.querySelectorAll(".cohort-bars rect, .pressure-rows .bar-value"),
        {
          scaleY: (index, element) =>
            element.closest(".cohort-bars") ? 0 : 1,
          scaleX: (index, element) =>
            element.closest(".pressure-rows") ? 0 : 1,
          transformOrigin: (index, element) =>
            element.closest(".cohort-bars") ? "center bottom" : "left center",
          duration: 0.85,
          stagger: 0.08,
          ease: "power3.out",
        },
        0.12,
      )
      .from(
        chart.querySelectorAll(
          ".chart-points circle, .margin-start, .margin-end",
        ),
        {
          scale: 0,
          transformOrigin: "center",
          duration: 0.35,
          stagger: 0.1,
          ease: "back.out(2)",
        },
        0.75,
      )
      .from(
        chart.querySelectorAll(
          ".bar-values text, .margin-values text, .chart-legend span",
        ),
        { autoAlpha: 0, y: 5, duration: 0.4, stagger: 0.05 },
        0.72,
      );
  }

  document.querySelectorAll(".signal-chart").forEach((chart) => {
    ScrollTrigger.create({
      trigger: chart,
      start: "top 86%",
      once: true,
      onEnter: () => playSignalChartAnimation(chart),
    });

    chart.closest(".signal")?.addEventListener("pointerenter", () => {
      playSignalChartAnimation(chart);
    });
  });

  // Count only the high-value metrics
  document.querySelectorAll("[data-count]").forEach((element) => {
    const endValue = Number(element.dataset.count);
    const counter = { value: 0 };

    gsap.to(counter, {
      scrollTrigger: {
        trigger: element,
        start: "top 90%",
        once: true,
      },
      value: endValue,
      duration: 1.4,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = Math.round(counter.value);
      },
    });
  });

  // Directional depth and signal convergence
  gsap.to(".hero__ambient", {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: 1,
    },
  });

}
