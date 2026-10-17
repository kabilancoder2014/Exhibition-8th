/**
 * Results Controller for AI Career Prediction (results.html)
 * Reads profile from sessionStorage and displays 99% career chance
 */

document.addEventListener("DOMContentLoaded", () => {
  const aiEngine = new AICareerEngine(CAREERS_DATABASE);

  // 1. Retrieve profile from sessionStorage or default to benchmark
  let profile = null;
  try {
    const stored = sessionStorage.getItem("careerProfile");
    if (stored) {
      profile = JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Could not read sessionStorage:", e);
  }

  // Fallback to Biology benchmark if empty
  if (!profile || !profile.subjects || profile.subjects.length === 0) {
    profile = PRESET_TESTS[0];
  }

  // 2. Evaluate with AI Engine
  const result = aiEngine.evaluate(profile);
  renderResultsPage(result);

  function renderResultsPage(res) {
    const { topCareer, runnersUp, rationale } = res;

    // Top Career Elements
    const titleEl = document.getElementById("results-career-title");
    const categoryEl = document.getElementById("results-career-category");
    const scoreEl = document.getElementById("results-score-value");
    const descEl = document.getElementById("results-career-desc");
    const narrativeEl = document.getElementById("results-narrative");
    const salaryEl = document.getElementById("results-salary");
    const growthEl = document.getElementById("results-growth");
    const eduEl = document.getElementById("results-edu");
    const examsEl = document.getElementById("results-exams");
    const skillsContainer = document.getElementById("results-skills");

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
    const runnersContainer = document.getElementById("results-runners-list");
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
    let current = 0;
    const duration = 600;
    const steps = 20;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const val = Math.round(target * (step / steps));
      el.textContent = `${val}%`;
      if (step >= steps) {
        clearInterval(timer);
        el.textContent = `${target}%`;
      }
    }, duration / steps);
  }

  // 3. Modal Details
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

  // 4. Print Handler
  const printBtn = document.getElementById("btn-print-report");
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }
});
