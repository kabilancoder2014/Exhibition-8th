/**
 * Form Controller for Know Ur Career (form.html)
 * Saves user choices to sessionStorage and navigates to results.html
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    profile: {
      subjects: ["biology"],
      interests: ["research"],
      strengths: ["analytical"],
      workplaces: ["laboratory"],
      workstyles: ["independent"],
      goals: ["innovation"]
    }
  };

  const categories = ["subjects", "interests", "strengths", "workplaces", "workstyles", "goals"];
  const stepTitles = ["Favourite Subjects", "Core Interests", "Natural Strengths", "Ideal Workplace", "Work Style", "Life Goals"];
  let currentStep = 0;

  // Initialize
  setupWizardStepper();
  setupMultiSelectTiles();
  setupPresets();

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
          // Submit and navigate to results.html!
          submitFormAndPredict();
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

    // Update Nav Buttons & Indicators
    const prevBtn = document.getElementById("btn-prev-step");
    const nextBtn = document.getElementById("btn-next-step");
    const indicator = document.getElementById("wizard-step-indicator");

    if (prevBtn) prevBtn.disabled = currentStep === 0;
    if (indicator) indicator.textContent = `Step ${currentStep + 1} of 6: ${stepTitles[currentStep]}`;

    if (nextBtn) {
      if (currentStep < 5) {
        nextBtn.textContent = `Next: ${stepTitles[currentStep + 1]} →`;
        nextBtn.className = "btn btn-primary";
      } else {
        nextBtn.textContent = `🚀 Predict My Career →`;
        nextBtn.className = "btn btn-primary btn-submit-glow";
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

    // Update Visual Selection
    document.querySelectorAll(`[data-group="${cat}"]`).forEach(tile => {
      const tileVal = tile.getAttribute("data-val");
      tile.classList.toggle("selected", list.includes(tileVal));
    });

    updateCounterBadge(cat);
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
  }

  function applyPreset(preset) {
    categories.forEach(cat => {
      state.profile[cat] = [...(preset[cat] || [])];

      document.querySelectorAll(`[data-group="${cat}"]`).forEach(tile => {
        const val = tile.getAttribute("data-val");
        tile.classList.toggle("selected", state.profile[cat].includes(val));
      });

      updateCounterBadge(cat);
    });
  }

  function submitFormAndPredict() {
    // Save to sessionStorage
    sessionStorage.setItem("careerProfile", JSON.stringify(state.profile));
    // Redirect to results.html
    window.location.href = "results.html";
  }

  // Reset Button
  const resetBtn = document.getElementById("btn-reset-form");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      applyPreset(PRESET_TESTS[0]);
      goToStep(0);
    });
  }

  // Check URL param if arriving with ?preset=biology
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
