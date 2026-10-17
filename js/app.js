/**
 * AI Career Recommendation App
 * Supports Multi-Select (up to 2 choices per category) across 6 Categories
 */

document.addEventListener("DOMContentLoaded", () => {
  const aiEngine = new AICareerEngine(CAREERS_DATABASE);

  // Application State - arrays for multi-selection
  const state = {
    profile: {
      subjects: ["biology"],
      interests: ["research"],
      strengths: ["analytical"],
      workplaces: ["laboratory"],
      workstyles: ["independent"],
      goals: ["innovation"]
    },
    currentResult: null
  };

  const categories = ["subjects", "interests", "strengths", "workplaces", "workstyles", "goals"];
  const stepTitles = ["Favourite Subjects", "Core Interests", "Natural Strengths", "Ideal Workplace", "Work Style", "Life Goals"];
  let currentStep = 0;

  // 1. Initialize Multi-Select Tile Listeners & Stepper Navigation
  setupMultiSelectTiles();
  setupWizardStepper();

  function setupWizardStepper() {
    const stepPills = document.querySelectorAll(".step-nav-pill");
    const prevBtn = document.getElementById("btn-prev-step");
    const nextBtn = document.getElementById("btn-next-step");

    stepPills.forEach(pill => {
      pill.addEventListener("click", () => {
        const stepIndex = parseInt(pill.getAttribute("data-step"));
        goToStep(stepIndex);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentStep > 0) goToStep(currentStep - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (currentStep < 5) {
          goToStep(currentStep + 1);
        } else {
          // On final step, scroll smoothly to the top career result
          const resultCard = document.querySelector(".top-career-hero");
          if (resultCard) resultCard.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }

  function goToStep(index) {
    currentStep = Math.max(0, Math.min(5, index));

    // Update Step Pills
    document.querySelectorAll(".step-nav-pill").forEach(p => {
      p.classList.toggle("active", parseInt(p.getAttribute("data-step")) === currentStep);
    });

    // Update Panes
    document.querySelectorAll(".wizard-pane").forEach((pane, idx) => {
      pane.classList.toggle("active", idx === currentStep);
    });

    // Update Navigation Buttons & Indicators
    const prevBtn = document.getElementById("btn-prev-step");
    const nextBtn = document.getElementById("btn-next-step");
    const indicator = document.getElementById("wizard-step-indicator");

    if (prevBtn) prevBtn.disabled = currentStep === 0;
    if (indicator) indicator.textContent = `Step ${currentStep + 1} of 6: ${stepTitles[currentStep]}`;
    if (nextBtn) {
      if (currentStep < 5) {
        nextBtn.textContent = `Next: ${stepTitles[currentStep + 1]} →`;
      } else {
        nextBtn.textContent = `Finish & View AI Results ★`;
      }
    }
  }

  function setupMultiSelectTiles() {
    categories.forEach(cat => {
      const tiles = document.querySelectorAll(`[data-group="${cat}"]`);
      tiles.forEach(tile => {
        tile.addEventListener("click", () => {
          const val = tile.getAttribute("data-val");
          toggleCategorySelection(cat, val);
        });
      });
      updateCounterBadge(cat);
    });
  }

  function toggleCategorySelection(cat, val) {
    let list = state.profile[cat];
    const index = list.indexOf(val);

    if (index > -1) {
      if (list.length > 1) {
        list.splice(index, 1);
      } else {
        list.splice(index, 1);
      }
    } else {
      if (list.length >= 2) {
        list.shift(); // smooth FIFO swap
      }
      list.push(val);
    }

    // Update Visual State for Tiles in this Category
    document.querySelectorAll(`[data-group="${cat}"]`).forEach(tile => {
      const tileVal = tile.getAttribute("data-val");
      tile.classList.toggle("selected", list.includes(tileVal));
    });

    updateCounterBadge(cat);
    runAssessment();
  }

  function updateCounterBadge(cat) {
    const badge = document.getElementById(`counter-${cat}`);
    const pillBadge = document.getElementById(`pill-count-${cat}`);
    const count = (state.profile[cat] || []).length;

    if (badge) {
      badge.textContent = `${count}/2 selected`;
      badge.className = `counter-tag ${count === 2 ? 'is-max' : count === 1 ? 'is-one' : ''}`;
    }

    if (pillBadge) {
      pillBadge.textContent = `${count}/2`;
      pillBadge.style.color = count === 2 ? "var(--accent-emerald)" : "var(--accent-cyan)";
    }
  }

  // 2. Exhibition Quick Test Presets
  setupPresets();

  function setupPresets() {
    const container = document.getElementById("presets-banner");
    if (!container) return;

    PRESET_TESTS.forEach((preset, index) => {
      const btn = document.createElement("button");
      btn.className = `preset-btn ${index === 0 ? 'featured' : ''}`;
      btn.textContent = preset.name;
      btn.addEventListener("click", () => {
        applyPreset(preset);
      });
      container.appendChild(btn);
    });

    const heroBenchmarkBtn = document.getElementById("hero-quick-benchmark");
    if (heroBenchmarkBtn) {
      heroBenchmarkBtn.addEventListener("click", () => {
        applyPreset(PRESET_TESTS[0]);
        const testSection = document.getElementById("test-section");
        if (testSection) testSection.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  function applyPreset(preset) {
    categories.forEach(cat => {
      state.profile[cat] = [...(preset[cat] || [])];

      // Update UI tiles
      document.querySelectorAll(`[data-group="${cat}"]`).forEach(tile => {
        const val = tile.getAttribute("data-val");
        tile.classList.toggle("selected", state.profile[cat].includes(val));
      });

      updateCounterBadge(cat);
    });

    runAssessment();
  }

  // 3. AI Evaluation & UI Render
  function runAssessment() {
    const result = aiEngine.evaluate(state.profile);
    state.currentResult = result;
    renderResults(result);
  }

  function renderResults(result) {
    const { topCareer, runnersUp, rationale } = result;

    // Top Career Elements
    const titleEl = document.getElementById("top-career-name");
    const categoryEl = document.getElementById("top-career-category");
    const scoreEl = document.getElementById("top-match-score");
    const descEl = document.getElementById("top-career-desc");
    const narrativeEl = document.getElementById("ai-narrative-text");
    const salaryEl = document.getElementById("top-career-salary");
    const growthEl = document.getElementById("top-career-growth");
    const eduEl = document.getElementById("top-career-edu");
    const examsEl = document.getElementById("top-career-exams");
    const skillsContainer = document.getElementById("top-career-skills");

    if (titleEl) titleEl.textContent = `${topCareer.icon} ${topCareer.title}`;
    if (categoryEl) categoryEl.textContent = topCareer.category;
    if (descEl) descEl.textContent = topCareer.description;
    if (narrativeEl) narrativeEl.textContent = rationale;
    if (salaryEl) salaryEl.textContent = topCareer.salaryRange;
    if (growthEl) growthEl.textContent = topCareer.growthOutlook;
    if (eduEl) eduEl.textContent = topCareer.educationPath;
    if (examsEl) examsEl.textContent = topCareer.entranceExams;

    if (scoreEl) {
      animateScore(scoreEl, topCareer.matchScore);
    }

    if (skillsContainer && topCareer.skills) {
      skillsContainer.innerHTML = "";
      topCareer.skills.forEach(skill => {
        const chip = document.createElement("span");
        chip.className = "skill-chip";
        chip.textContent = skill;
        skillsContainer.appendChild(chip);
      });
    }

    // Render Runners-Up
    const runnersContainer = document.getElementById("runners-up-list");
    if (runnersContainer) {
      runnersContainer.innerHTML = "";
      runnersUp.forEach((career, idx) => {
        const row = document.createElement("div");
        row.className = "runner-row";
        row.innerHTML = `
          <div class="runner-left">
            <span class="runner-rank">#${idx + 2}</span>
            <div class="runner-details">
              <h4>${career.icon} ${career.title}</h4>
              <p>${career.category} • ${career.salaryRange.split("(")[0]}</p>
            </div>
          </div>
          <div class="runner-score-box">
            <div class="runner-progress-bar">
              <div class="runner-progress-fill" style="width: ${career.matchScore}%"></div>
            </div>
            <span class="runner-score-val">${career.matchScore}%</span>
          </div>
        `;
        row.addEventListener("click", () => openCareerModal(career));
        runnersContainer.appendChild(row);
      });
    }
  }

  function animateScore(el, target) {
    const current = parseInt(el.textContent) || 0;
    const diff = target - current;
    const steps = 12;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const val = Math.round(current + (diff * (step / steps)));
      el.textContent = `${val}%`;
      if (step >= steps) {
        clearInterval(timer);
        el.textContent = `${target}%`;
      }
    }, 25);
  }

  // 4. Career Details Modal
  const modalOverlay = document.getElementById("career-modal-overlay");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener("click", () => modalOverlay.classList.remove("active"));
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove("active");
    });
  }

  function openCareerModal(career) {
    if (!modalOverlay) return;

    document.getElementById("modal-career-title").textContent = `${career.icon} ${career.title}`;
    document.getElementById("modal-career-category").textContent = career.category;
    document.getElementById("modal-career-desc").textContent = career.description;
    document.getElementById("modal-career-salary").textContent = career.salaryRange;
    document.getElementById("modal-career-outlook").textContent = career.growthOutlook;
    document.getElementById("modal-career-edu").textContent = career.educationPath;
    document.getElementById("modal-career-exams").textContent = career.entranceExams;

    const skillsBox = document.getElementById("modal-career-skills");
    if (skillsBox) {
      skillsBox.innerHTML = "";
      (career.skills || []).forEach(s => {
        const tag = document.createElement("span");
        tag.className = "skill-chip";
        tag.textContent = s;
        skillsBox.appendChild(tag);
      });
    }

    modalOverlay.classList.add("active");
  }

  // 5. Print Action
  const printBtn = document.getElementById("btn-print-report");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  // Reset Button
  const resetBtn = document.getElementById("btn-reset-test");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      applyPreset(PRESET_TESTS[0]);
    });
  }

  // Initial Load (supports ?preset= query parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const requestedPreset = urlParams.get('preset');
  if (requestedPreset === 'ai') {
    applyPreset(PRESET_TESTS[1]);
  } else if (requestedPreset === 'robotics') {
    applyPreset(PRESET_TESTS[2]);
  } else if (requestedPreset === 'design') {
    applyPreset(PRESET_TESTS[3]);
  } else {
    applyPreset(PRESET_TESTS[0]);
  }
});
