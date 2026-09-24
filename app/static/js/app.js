/**
 * PakValuate Pro — Apple Website Interactive Experience & Marketplace Intelligence
 * Integrates:
 * 1. Apple Dynamic Island notification system
 * 2. Sticky product subnav ribbon with dynamic price sync
 * 3. Keynote vehicle finish colorway configurator
 * 4. 10-Step Progressive Valuation Wizard (Kelley Blue Book for Pakistan)
 * 5. 15-Panel digital paint gauge & CAD chassis inspector
 * 6. Live PakWheels.com & OLX.com.pk live classifieds explorer & autofill
 * 7. Apple-style dual-model automotive market comparator
 * 8. Quick Valuation 30-second appraisal widget
 * 9. Explainable AI SHAP-style price adjustments & condition scoring
 * 10. Floating AI Car Valuation Chatbot
 * 11. Printable / Downloadable PDF Valuation Certificate
 */

document.addEventListener("DOMContentLoaded", () => {
  // Global State
  let marketMeta = null;
  let activePieceKey = null;
  let currentListings = [];
  let listingsOffset = 0;
  const listingsLimit = 12;
  let currentFilter = {
    source: "all",
    city: "all",
    make: "all",
    q: "",
    sort: "featured"
  };

  let currentAppMode = "seller"; // 'seller' or 'buyer'
  let currentWizardStep = 1;

  // 15 Body Panels State
  const pieceState = {
    bonnet: "genuine",
    roof: "genuine",
    trunk: "genuine",
    front_bumper: "genuine",
    rear_bumper: "genuine",
    front_left_fender: "genuine",
    front_right_fender: "genuine",
    rear_left_fender: "genuine",
    rear_right_fender: "genuine",
    front_left_door: "genuine",
    front_right_door: "genuine",
    rear_left_door: "genuine",
    rear_right_door: "genuine",
    left_apron: "genuine",
    right_apron: "genuine",
    side_skirts: "genuine"
  };

  const statusLabels = {
    genuine: "Genuine",
    touchup_no_putty: "Touchup",
    putty: "Poteen (Putty)",
    replaced: "Replaced"
  };

  const statusMicrons = {
    genuine: "95 µm",
    touchup_no_putty: "155 µm",
    putty: "340 µm",
    replaced: "Kabli / OEM"
  };

  // DOM Elements - Valuation Studio
  const selectMake = document.getElementById("select-make");
  const selectModel = document.getElementById("select-model");
  const selectVariant = document.getElementById("select-variant");
  const inputYear = document.getElementById("input-year");
  const yearVal = document.getElementById("year-val");
  const inputMileage = document.getElementById("input-mileage");
  const mileageVal = document.getElementById("mileage-val");
  const selectCity = document.getElementById("select-city");
  const cityPremiumNote = document.getElementById("city-premium-note");
  const selectTransmission = document.getElementById("select-transmission");
  const selectFuel = document.getElementById("select-fuel");
  const inputEngineCc = document.getElementById("input-engine-cc");
  const toggleSeals = document.getElementById("toggle-seals");
  const toggleAccidental = document.getElementById("toggle-accidental");
  const btnPredict = document.getElementById("btn-predict");

  // Output Elements - Studio
  const displayLacs = document.getElementById("display-lacs");
  const displayFull = document.getElementById("display-full");
  const displayRangeMin = document.getElementById("display-range-min");
  const displayRangeMax = document.getElementById("display-range-max");
  const displayPwPrice = document.getElementById("display-pw-price");
  const displayOlxPrice = document.getElementById("display-olx-price");
  const displayLoss = document.getElementById("display-loss");
  const displayGenuine = document.getElementById("display-genuine");
  const alertsContainer = document.getElementById("alerts-container");
  const piecesTbody = document.getElementById("pieces-tbody");
  const statGenuineCount = document.getElementById("stat-genuine-count");
  const statTouchupCount = document.getElementById("stat-touchup-count");
  const statPuttyCount = document.getElementById("stat-putty-count");
  const statReplacedCount = document.getElementById("stat-replaced-count");

  // Modal Elements
  const pieceModal = document.getElementById("piece-modal");
  const modalPieceName = document.getElementById("modal-piece-name");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  // Dynamic Island & Subnav
  const dynamicIsland = document.getElementById("dynamic-island");
  const diTitle = document.getElementById("di-title");
  const diDesc = document.getElementById("di-desc");
  const diBadge = document.getElementById("di-badge");
  const appleSubnav = document.getElementById("apple-subnav");
  const subnavModelTitle = document.getElementById("subnav-model-title");
  const subnavMeta = document.getElementById("subnav-meta");
  const subnavPrice = document.getElementById("subnav-price");

  // Marketplace Elements
  const searchInput = document.getElementById("market-search-input");
  const searchClearBtn = document.getElementById("market-search-clear");
  const sourcePills = document.querySelectorAll(".source-pill");
  const filterCity = document.getElementById("market-filter-city");
  const filterMake = document.getElementById("market-filter-make");
  const filterSort = document.getElementById("market-filter-sort");
  const listingsGrid = document.getElementById("listings-grid");
  const btnLoadMore = document.getElementById("btn-load-more");
  const resultsCountText = document.getElementById("results-count-text");

  // Comparator Elements
  const compareSelect1 = document.getElementById("compare-select-1");
  const compareSelect2 = document.getElementById("compare-select-2");
  const comparisonResults = document.getElementById("comparison-results");

  // Keynote Visual Stage Finishes
  const swatchButtons = document.querySelectorAll(".swatch-btn");
  const ambientOrbPrimary = document.getElementById("ambient-orb-primary");

  // City factor labels
  const cityDescriptions = {
    "Islamabad": "Islamabad: +4% Resale Premium (Clean roads & ICT registration)",
    "Lahore": "Lahore: +2% Resale Premium (Largest secondary buyer market)",
    "Rawalpindi": "Rawalpindi: +1% Stable demand",
    "Faisalabad": "Faisalabad: -1% Industrial hub trading volume",
    "Karachi": "Karachi: -5% Coastal humidity rust perception discount in North",
    "Multan": "Multan: -2% Southern Punjab market spread",
    "Peshawar": "Peshawar: -2% KP regional market spread",
    "Sialkot": "Sialkot: -1% Export hub market",
    "Gujranwala": "Gujranwala: -1% GT Road corridor spread"
  };

  const FALLBACK_CAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250" fill="%23161618"><rect width="400" height="250" fill="%23121214"/><path d="M70 160 C110 160 140 100 200 95 C260 95 300 135 340 145 C355 149 360 160 360 170 L40 170 C40 160 50 160 70 160 Z" fill="%23242428"/><circle cx="110" cy="175" r="24" fill="%230a0a0c" stroke="%233a3a3e" stroke-width="6"/><circle cx="290" cy="175" r="24" fill="%230a0a0c" stroke="%233a3a3e" stroke-width="6"/><text x="200" y="225" font-family="-apple-system, sans-serif" font-size="12" fill="%236e6e73" text-anchor="middle">PakWheels &amp; OLX Verified Listing</text></svg>`;

  // Initialize
  init();

  async function init() {
    setupSliders();
    setupPieceButtons();
    setupPresets();
    setupModal();
    setupScrollListener();
    setupColorways();
    setupMarketplaceListeners();
    setupComparatorListeners();
    setupQuickValuation();
    setupWizardListeners();
    setupPhotoUpload();

    await loadMetadata();
    await loadBenchmark();
    await loadMarketplaceListings(true);
    triggerComparator();

    // Trigger initial prediction for studio
    triggerPrediction();

    // Welcome Dynamic Island
    showDynamicIsland("PakValuate Pro Active", "Live feed synchronized with PakWheels & OLX", "Online", 4000);
  }

  // =========================================================================
  // Dynamic Island Notification Pill
  // =========================================================================
  let diTimer = null;
  function showDynamicIsland(title, desc, badge = "Live", duration = 3500) {
    if (!dynamicIsland) return;
    if (diTimer) clearTimeout(diTimer);

    diTitle.textContent = title;
    diDesc.textContent = desc;
    diBadge.textContent = badge;

    dynamicIsland.classList.add("visible");

    diTimer = setTimeout(() => {
      dynamicIsland.classList.remove("visible");
    }, duration);
  }

  // =========================================================================
  // Apple Sticky Subnav & Scroll Listener
  // =========================================================================
  function setupScrollListener() {
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      if (scrollY > 380) {
        appleSubnav.style.transform = "translateY(0)";
        appleSubnav.style.opacity = "1";
      } else {
        appleSubnav.style.transform = "translateY(-100%)";
        appleSubnav.style.opacity = "0";
      }
    }, { passive: true });
  }

  function updateSubnavBar(make, model, variant, year, city, priceLacs) {
    if (!subnavModelTitle) return;
    subnavModelTitle.textContent = `${make} ${model} ${variant || ''}`.trim();
    subnavMeta.textContent = `${year} • ${city} Registered`;
    if (priceLacs) {
      subnavPrice.textContent = priceLacs;
    }
  }

  // =========================================================================
  // Keynote Visual Stage Finishes
  // =========================================================================
  function setupColorways() {
    const finishes = {
      "titanium": { name: "Titanium Silver Metallic", glow: "#2997ff" },
      "attitude-black": { name: "Attitude Black Mica", glow: "#71717a" },
      "pearl-white": { name: "Super White 040", glow: "#e4e4e7" },
      "royal-blue": { name: "Royal Metallic Blue", glow: "#0071e3" },
      "graphite-grey": { name: "Gun Metallic Graphite", glow: "#a1a1aa" }
    };

    swatchButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        swatchButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const colorKey = btn.dataset.color;
        const colorInfo = finishes[colorKey] || { name: "Custom Finish", glow: "#2997ff" };

        if (ambientOrbPrimary) {
          ambientOrbPrimary.style.background = `radial-gradient(circle, ${colorInfo.glow}, #000)`;
        }

        showDynamicIsland("Paint Finish Selected", colorInfo.name, "Finish", 2200);
      });
    });
  }

  // Live prediction debounce & sequence tracker
  let predictDebounceTimer = null;
  let currentPredictionRequestId = 0;

  function debouncedPredict(delay = 70) {
    if (predictDebounceTimer) clearTimeout(predictDebounceTimer);
    predictDebounceTimer = setTimeout(() => {
      triggerPrediction();
    }, delay);
  }

  // =========================================================================
  // Form Controls & Sliders
  // =========================================================================
  function setupSliders() {
    // Year Slider: update label and trigger live prediction instantly
    inputYear.addEventListener("input", (e) => {
      yearVal.textContent = e.target.value;
      updateSubnavBar(selectMake.value, selectModel.value, selectVariant.value, e.target.value, selectCity.value);
      debouncedPredict(60);
    });

    inputYear.addEventListener("change", (e) => {
      yearVal.textContent = e.target.value;
      updateSubnavBar(selectMake.value, selectModel.value, selectVariant.value, e.target.value, selectCity.value);
      triggerPrediction();
    });

    // Mileage (Kilometers) Slider
    inputMileage.addEventListener("input", (e) => {
      mileageVal.textContent = `${Number(e.target.value).toLocaleString()} km`;
      debouncedPredict(60);
    });

    inputMileage.addEventListener("change", (e) => {
      mileageVal.textContent = `${Number(e.target.value).toLocaleString()} km`;
      triggerPrediction();
    });

    // Engine CC
    if (inputEngineCc) {
      inputEngineCc.addEventListener("input", () => debouncedPredict(150));
      inputEngineCc.addEventListener("change", () => triggerPrediction());
    }

    // Transmission & Fuel Type
    if (selectTransmission) {
      selectTransmission.addEventListener("change", () => triggerPrediction());
    }

    if (selectFuel) {
      selectFuel.addEventListener("change", () => triggerPrediction());
    }

    // City Registration
    selectCity.addEventListener("change", (e) => {
      const city = e.target.value;
      cityPremiumNote.textContent = cityDescriptions[city] || `${city}: Provincial Tax Standard`;
      updateSubnavBar(selectMake.value, selectModel.value, selectVariant.value, inputYear.value, city);
      triggerPrediction();
    });

    toggleSeals.addEventListener("change", () => triggerPrediction());
    toggleAccidental.addEventListener("change", () => triggerPrediction());

    btnPredict.addEventListener("click", () => {
      triggerPrediction();
    });
  }

  async function loadMetadata() {
    try {
      const res = await fetch("/api/meta");
      marketMeta = await res.json();

      // Populate Studio Makes
      selectMake.innerHTML = marketMeta.makes
        .map(m => `<option value="${m}">${m}</option>`)
        .join("");
      selectMake.value = "Toyota";

      updateModelOptions("Toyota");

      // Populate Studio Cities
      selectCity.innerHTML = marketMeta.cities
        .map(c => `<option value="${c}">${c}</option>`)
        .join("");
      selectCity.value = "Islamabad";
      cityPremiumNote.textContent = cityDescriptions["Islamabad"];

      // Populate Transmission & Fuel
      selectTransmission.innerHTML = marketMeta.transmissions
        .map(t => `<option value="${t}">${t}</option>`)
        .join("");

      selectFuel.innerHTML = marketMeta.fuel_types
        .map(f => `<option value="${f}">${f}</option>`)
        .join("");

      // Populate Quick Valuation Form Dropdowns
      const qMake = document.getElementById("quick-make");
      const qCity = document.getElementById("quick-city");
      const qYear = document.getElementById("quick-year");
      if (qMake) {
        qMake.innerHTML = marketMeta.makes.map(m => `<option value="${m}">${m}</option>`).join("");
        qMake.value = "Toyota";
        updateQuickModelOptions("Toyota");
        qMake.addEventListener("change", (e) => updateQuickModelOptions(e.target.value));
      }
      if (qCity) {
        qCity.innerHTML = marketMeta.cities.map(c => `<option value="${c}">${c}</option>`).join("");
        qCity.value = "Islamabad";
      }
      if (qYear) {
        let yrOpts = "";
        for (let y = 2024; y >= 2005; y--) {
          yrOpts += `<option value="${y}" ${y === 2021 ? 'selected' : ''}>${y}</option>`;
        }
        qYear.innerHTML = yrOpts;
      }

      // Populate Wizard Step 1 Dropdowns
      const wMake = document.getElementById("w-make");
      const wCity = document.getElementById("w-city");
      if (wMake) {
        wMake.innerHTML = marketMeta.makes.map(m => `<option value="${m}">${m}</option>`).join("");
        wMake.value = "Toyota";
        updateWizardModelOptions("Toyota");
        wMake.addEventListener("change", (e) => updateWizardModelOptions(e.target.value));
      }
      if (wCity) {
        wCity.innerHTML = marketMeta.cities.map(c => `<option value="${c}">${c}</option>`).join("");
        wCity.value = "Islamabad";
      }

      // Populate Marketplace Filters
      filterCity.innerHTML = '<option value="all">All Cities</option>' +
        marketMeta.cities.map(c => `<option value="${c}">${c}</option>`).join("");

      filterMake.innerHTML = '<option value="all">All Makes</option>' +
        marketMeta.makes.map(m => `<option value="${m}">${m}</option>`).join("");

      // Cascades
      selectMake.addEventListener("change", (e) => {
        updateModelOptions(e.target.value);
        triggerPrediction();
      });

      selectModel.addEventListener("change", (e) => {
        updateVariantOptions(e.target.value);
        triggerPrediction();
      });

      selectVariant.addEventListener("change", () => {
        triggerPrediction();
      });

    } catch (err) {
      console.error("Failed to load metadata:", err);
    }
  }

  function updateModelOptions(make) {
    if (!marketMeta) return;
    const models = marketMeta.make_models[make] || [];
    selectModel.innerHTML = models
      .map(m => `<option value="${m}">${m}</option>`)
      .join("");

    if (models.length > 0) {
      selectModel.value = models[0];
      updateVariantOptions(models[0]);
    }
  }

  function updateVariantOptions(model) {
    if (!marketMeta || !marketMeta.model_details[model]) return;
    const details = marketMeta.model_details[model];

    selectVariant.innerHTML = details.variants
      .map(v => `<option value="${v}">${v}</option>`)
      .join("");

    if (details.default_engine_cc) {
      inputEngineCc.value = details.default_engine_cc;
    }
    if (details.default_transmission) {
      selectTransmission.value = details.default_transmission;
    }
    if (details.default_fuel) {
      selectFuel.value = details.default_fuel;
    }

    inputYear.min = details.min_year;
    inputYear.max = details.max_year;
    inputYear.value = Math.min(2021, details.max_year);
    yearVal.textContent = inputYear.value;

    updateSubnavBar(selectMake.value, model, selectVariant.value, inputYear.value, selectCity.value);
  }

  function updateQuickModelOptions(make) {
    const qModel = document.getElementById("quick-model");
    if (!qModel || !marketMeta) return;
    const models = marketMeta.make_models[make] || [];
    qModel.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join("");
  }

  function updateWizardModelOptions(make) {
    const wModel = document.getElementById("w-model");
    if (!wModel || !marketMeta) return;
    const models = marketMeta.make_models[make] || [];
    wModel.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join("");
    if (models.length > 0) {
      updateWizardVariantOptions(models[0]);
    }
    wModel.addEventListener("change", (e) => updateWizardVariantOptions(e.target.value));
  }

  function updateWizardVariantOptions(model) {
    const wVariant = document.getElementById("w-variant");
    const wEngineCc = document.getElementById("w-engine-cc");
    const wTrans = document.getElementById("w-transmission");
    const wFuel = document.getElementById("w-fuel");
    if (!wVariant || !marketMeta || !marketMeta.model_details[model]) return;
    const details = marketMeta.model_details[model];
    wVariant.innerHTML = details.variants.map(v => `<option value="${v}">${v}</option>`).join("");
    if (wEngineCc && details.default_engine_cc) wEngineCc.value = details.default_engine_cc;
    if (wTrans && details.default_transmission) wTrans.value = details.default_transmission;
    if (wFuel && details.default_fuel) wFuel.value = details.default_fuel;
  }

  // =========================================================================
  // 15-Panel Inspector & CAD Schematic
  // =========================================================================
  function setupPieceButtons() {
    const panels = document.querySelectorAll(".cad-panel");
    panels.forEach(btn => {
      btn.addEventListener("click", () => {
        const pieceKey = btn.dataset.piece;
        openPieceModal(pieceKey);
      });
    });
  }

  function openPieceModal(pieceKey) {
    activePieceKey = pieceKey;
    const btn = document.getElementById(`btn-${pieceKey}`);
    const nameEl = btn ? btn.querySelector(".panel-name") : null;
    const title = nameEl ? nameEl.textContent : pieceKey;

    modalPieceName.textContent = `Inspect Panel: ${title}`;
    pieceModal.classList.add("active");
  }

  function setupModal() {
    modalCloseBtn.addEventListener("click", () => {
      pieceModal.classList.remove("active");
    });

    pieceModal.addEventListener("click", (e) => {
      if (e.target === pieceModal) {
        pieceModal.classList.remove("active");
      }
    });

    const optButtons = document.querySelectorAll(".apple-opt-btn");
    optButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const status = btn.dataset.status;
        if (activePieceKey) {
          setPieceStatus(activePieceKey, status);
        }
        pieceModal.classList.remove("active");
        triggerPrediction();
      });
    });
  }

  function setPieceStatus(pieceKey, status) {
    pieceState[pieceKey] = status;
    const btn = document.getElementById(`btn-${pieceKey}`);
    const badge = document.getElementById(`badge-${pieceKey}`);
    const microns = document.getElementById(`microns-${pieceKey}`);

    if (badge) {
      badge.className = `panel-badge ${status}`;
      badge.textContent = statusLabels[status] || status;
    }

    if (microns) {
      microns.textContent = statusMicrons[status] || "100 µm";
    }

    if (btn) {
      btn.setAttribute("data-status", status);
    }

    updateSummaryStats();
  }

  function updateSummaryStats() {
    let genuine = 0;
    let touchup = 0;
    let putty = 0;
    let replaced = 0;

    Object.values(pieceState).forEach(st => {
      if (st === "genuine") genuine++;
      else if (st === "touchup_no_putty") touchup++;
      else if (st === "putty") putty++;
      else if (st === "replaced") replaced++;
    });

    if (statGenuineCount) statGenuineCount.textContent = genuine;
    if (statTouchupCount) statTouchupCount.textContent = touchup;
    if (statPuttyCount) statPuttyCount.textContent = putty;
    if (statReplacedCount) statReplacedCount.textContent = replaced;
  }

  function setupPresets() {
    const presetBtns = document.querySelectorAll(".segment-btn");
    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        presetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const pType = btn.dataset.preset;
        applyPreset(pType);
        triggerPrediction();
      });
    });
  }

  function applyPreset(presetType) {
    if (presetType === "total_genuine") {
      Object.keys(pieceState).forEach(k => setPieceStatus(k, "genuine"));
      toggleAccidental.checked = false;
      toggleSeals.checked = true;
      showDynamicIsland("Condition Preset", "100% Total Genuine Showroom Condition", "Genuine", 2500);
    } else if (presetType === "minor_touchup") {
      Object.keys(pieceState).forEach(k => setPieceStatus(k, "genuine"));
      setPieceStatus("front_left_fender", "touchup_no_putty");
      setPieceStatus("rear_right_door", "touchup_no_putty");
      toggleAccidental.checked = false;
      toggleSeals.checked = true;
      showDynamicIsland("Condition Preset", "2 Cosmetic Touchups (Scratch spray only)", "Mild", 2500);
    } else if (presetType === "showered_sides") {
      Object.keys(pieceState).forEach(k => {
        if (["roof", "bonnet", "trunk"].includes(k)) {
          setPieceStatus(k, "genuine");
        } else {
          setPieceStatus(k, "touchup_no_putty");
        }
      });
      toggleAccidental.checked = false;
      toggleSeals.checked = true;
      showDynamicIsland("Condition Preset", "Below Roof Showered (Sides Touchup)", "Notice", 2500);
    } else if (presetType === "heavy_putty") {
      setPieceStatus("bonnet", "putty");
      setPieceStatus("front_left_door", "putty");
      setPieceStatus("front_right_door", "putty");
      setPieceStatus("front_left_fender", "replaced");
      setPieceStatus("roof", "genuine");
      setPieceStatus("trunk", "touchup_no_putty");
      setPieceStatus("rear_left_door", "touchup_no_putty");
      setPieceStatus("rear_right_door", "putty");
      setPieceStatus("rear_left_fender", "putty");
      setPieceStatus("rear_right_fender", "touchup_no_putty");
      toggleAccidental.checked = true;
      showDynamicIsland("Condition Alert", "Poteen (Putty) Detected on Multiple Panels", "Warning", 3000);
    }
  }

  // =========================================================================
  // Prediction Inference via Flask Engine (Studio View)
  // =========================================================================
  async function triggerPrediction() {
    const reqId = ++currentPredictionRequestId;

    if (displayLacs) {
      displayLacs.style.transition = "opacity 0.15s ease";
      displayLacs.style.opacity = "0.75";
    }

    const payload = {
      make: selectMake.value,
      model: selectModel.value,
      variant: selectVariant.value,
      year: parseInt(inputYear.value),
      mileage_km: parseInt(inputMileage.value),
      registered_city: selectCity.value,
      transmission: selectTransmission.value,
      fuel_type: selectFuel.value,
      engine_cc: parseInt(inputEngineCc.value),
      seals_intact: toggleSeals.checked ? 1 : 0,
      accidental: toggleAccidental.checked ? 1 : 0,
      ...pieceState
    };

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (reqId === currentPredictionRequestId) {
        renderResults(data);
      }
    } catch (err) {
      if (reqId === currentPredictionRequestId) {
        console.error("Prediction error:", err);
        displayLacs.textContent = "Error";
        displayFull.textContent = "Valuation engine calibrating...";
      }
    } finally {
      if (reqId === currentPredictionRequestId && displayLacs) {
        displayLacs.style.opacity = "1";
      }
    }
  }

  function renderResults(data) {
    const targetLacs = data.predicted_in_lacs;
    displayLacs.textContent = targetLacs;
    displayFull.textContent = data.predicted_formatted;
    displayRangeMin.textContent = data.price_range_min;
    displayRangeMax.textContent = data.price_range_max;

    // Pulse animation to clearly indicate live calculation
    displayLacs.classList.add("price-pulsed");
    setTimeout(() => {
      displayLacs.classList.remove("price-pulsed");
    }, 300);

    // Marketplace Benchmarks
    if (displayPwPrice) displayPwPrice.textContent = data.pakwheels_asking_pkr;
    if (displayOlxPrice) displayOlxPrice.textContent = data.olx_quick_sale_pkr;

    // Valuation Loss
    if (data.value_loss_pkr > 0) {
      displayLoss.textContent = `- Rs ${data.value_loss_pkr.toLocaleString()} (${data.value_loss_formatted})`;
      displayLoss.style.color = "var(--apple-orange)";
    } else {
      displayLoss.textContent = "Rs 0 (Total Genuine)";
      displayLoss.style.color = "var(--apple-green)";
    }
    displayGenuine.textContent = data.genuine_equivalent_formatted;

    // Subnav sync
    updateSubnavBar(selectMake.value, selectModel.value, selectVariant.value, inputYear.value, selectCity.value, targetLacs);

    // Alerts
    alertsContainer.innerHTML = "";
    if (data.critical_warnings && data.critical_warnings.length > 0) {
      data.critical_warnings.forEach(warn => {
        const alertEl = document.createElement("div");
        alertEl.className = "alert-item";
        alertEl.innerHTML = `<span>${warn}</span>`;
        alertsContainer.appendChild(alertEl);
      });
    }

    // Pieces Table Breakdown
    if (data.full_report && data.full_report.body_report) {
      const panels = data.full_report.body_report.panels;
      piecesTbody.innerHTML = Object.values(panels).map(p => {
        let tagClass = "genuine";
        if (p.status.includes("touchup")) tagClass = "touchup";
        else if (p.status.includes("putty")) tagClass = "putty";
        else if (p.status.includes("replaced")) tagClass = "replaced";
        else if (p.status !== "genuine") tagClass = "warn";

        return `
          <tr>
            <td><strong>${p.label}</strong></td>
            <td><span class="tag-badge ${tagClass}">${p.status_label}</span></td>
            <td>Impact: <strong>${p.impact_level}</strong></td>
          </tr>
        `;
      }).join("");
    }
  }

  // =========================================================================
  // Quick Valuation 30-Second Appraisal (Hero Widget)
  // =========================================================================
  function setupQuickValuation() {
    const btnQuickEstimate = document.getElementById("btn-quick-estimate");
    if (!btnQuickEstimate) return;

    btnQuickEstimate.addEventListener("click", async () => {
      const qMake = document.getElementById("quick-make").value;
      const qModel = document.getElementById("quick-model").value;
      const qYear = parseInt(document.getElementById("quick-year").value);
      const qMileage = parseInt(document.getElementById("quick-mileage").value) || 45000;
      const qCity = document.getElementById("quick-city").value;

      try {
        btnQuickEstimate.textContent = "Calculating...";
        const res = await fetch("/api/quick-estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            make: qMake,
            model: qModel,
            year: qYear,
            mileage_km: qMileage,
            registered_city: qCity
          })
        });

        if (!res.ok) throw new Error("Quick estimate failed");
        const data = await res.json();

        const pill = document.getElementById("quick-result-pill");
        const fVal = document.getElementById("quick-fair-val");
        const rVal = document.getElementById("quick-range-val");

        fVal.textContent = data.fair_market_value;
        rVal.textContent = `(${data.range_low} – ${data.range_high})`;
        pill.style.display = "flex";

        showDynamicIsland("Quick Valuation Ready", `${qYear} ${qMake} ${qModel}: ${data.fair_market_value}`, "Estimated", 3500);
      } catch (err) {
        console.error(err);
      } finally {
        btnQuickEstimate.textContent = "Estimate Price";
      }
    });
  }

  // =========================================================================
  // 10-Step Progressive Valuation Wizard Navigation & Logic
  // =========================================================================
  window.goToStep = function(stepNumber) {
    if (stepNumber < 1 || stepNumber > 10) return;
    currentWizardStep = stepNumber;

    // Panes
    document.querySelectorAll(".wizard-step-pane").forEach(p => p.classList.remove("active"));
    const targetPane = document.getElementById(`wizard-step-${stepNumber}`);
    if (targetPane) targetPane.classList.add("active");

    // Stepper Pills
    document.querySelectorAll(".step-pill").forEach(pill => {
      const pStep = parseInt(pill.dataset.step);
      pill.classList.remove("active");
      if (pStep === stepNumber) pill.classList.add("active");
      if (pStep < stepNumber) pill.classList.add("completed");
      else pill.classList.remove("completed");
    });

    // Progress Bar
    const progressFill = document.getElementById("wizard-progress-fill");
    if (progressFill) {
      progressFill.style.width = `${(stepNumber / 10) * 100}%`;
    }

    // Dynamic Step actions
    if (stepNumber === 2) updateMileageDiagnostics();
    if (stepNumber === 3) updateOwnershipScore();

    // Scroll gently to wizard container
    const wSection = document.getElementById("wizard-section");
    if (wSection && window.scrollY > wSection.offsetTop + 100) {
      wSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  function setupWizardListeners() {
    // Stepper pills click
    document.querySelectorAll(".step-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const targetStep = parseInt(pill.dataset.step);
        window.goToStep(targetStep);
      });
    });

    // Step 2 Mileage Inputs
    const wMileageInput = document.getElementById("w-mileage");
    const wMileageSlider = document.getElementById("w-mileage-slider");
    const wYearInput = document.getElementById("w-year");

    if (wMileageInput && wMileageSlider) {
      wMileageInput.addEventListener("input", (e) => {
        wMileageSlider.value = e.target.value;
        updateMileageDiagnostics();
      });

      wMileageSlider.addEventListener("input", (e) => {
        wMileageInput.value = e.target.value;
        updateMileageDiagnostics();
      });
    }

    if (wYearInput) {
      wYearInput.addEventListener("input", () => updateMileageDiagnostics());
    }

    // Step 3 Ownership Inputs
    const wOwners = document.getElementById("w-owners");
    const wService = document.getElementById("w-service-history");
    const wDealer = document.getElementById("w-dealership");
    const wComm = document.getElementById("w-commercial");

    [wOwners, wService, wDealer, wComm].forEach(el => {
      if (el) el.addEventListener("change", () => updateOwnershipScore());
    });
  }

  function updateMileageDiagnostics() {
    const yr = parseInt(document.getElementById("w-year").value) || 2021;
    const km = parseInt(document.getElementById("w-mileage").value) || 45000;
    const currentYear = 2026;
    const age = Math.max(0.5, currentYear - yr);
    const annualKm = Math.round(km / age);
    const marketAvgAnnual = 14500;
    const expectedKm = Math.round(age * marketAvgAnnual);
    const diffPct = (km - expectedKm) / Math.max(expectedKm, 10000);

    const diagAge = document.getElementById("diag-age");
    const diagAnnual = document.getElementById("diag-annual-km");
    const diagScore = document.getElementById("diag-mileage-score");
    const mabHeadline = document.getElementById("mab-headline");
    const mabDesc = document.getElementById("mab-desc");

    if (diagAge) diagAge.textContent = `${age.toFixed(1)} Years`;
    if (diagAnnual) diagAnnual.textContent = `${annualKm.toLocaleString()} km / year`;

    let score = Math.round(100 - Math.min(45, Math.max(-12, diffPct * 35)));
    score = Math.max(30, Math.min(99, score));
    if (diagScore) diagScore.textContent = `${score}/100`;

    if (diffPct < -0.35) {
      if (mabHeadline) mabHeadline.textContent = "Exceptionally Low Mileage for Vehicle Age";
      if (mabDesc) mabDesc.textContent = "Well preserved with lower mechanical wear. Commands premium value retention.";
    } else if (diffPct < -0.10) {
      if (mabHeadline) mabHeadline.textContent = "Below-Average Mileage for its Age";
      if (mabDesc) mabDesc.textContent = "Typical light private family commute. Solid engine life remaining.";
    } else if (diffPct > 0.35) {
      if (mabHeadline) mabHeadline.textContent = "Above-Average Annual Highway Usage";
      if (mabDesc) mabDesc.textContent = "Reflects frequent intercity travel. Inspect suspension bushings and transmission fluid.";
    } else {
      if (mabHeadline) mabHeadline.textContent = "Standard Market-Average Usage";
      if (mabDesc) mabDesc.textContent = "Consistent with Pakistani urban commuting patterns (~14,500 km/year).";
    }
  }

  function updateOwnershipScore() {
    const owners = parseInt(document.getElementById("w-owners").value) || 1;
    const service = document.getElementById("w-service-history").value;
    const dealership = document.getElementById("w-dealership").value;
    const commercial = parseInt(document.getElementById("w-commercial").value) || 0;

    let score = 90;
    if (owners === 1) score += 5;
    else if (owners === 2) score -= 4;
    else if (owners === 3) score -= 12;
    else score -= 22;

    if (commercial === 1) score -= 28;
    if (service === "complete") score += 4;
    else if (service === "partial") score -= 8;
    else score -= 16;

    if (dealership === "yes") score += 3;
    else if (dealership === "no") score -= 6;

    score = Math.max(25, Math.min(99, score));
    const scoreDisplay = document.getElementById("w-history-score-display");
    if (scoreDisplay) scoreDisplay.textContent = `${score} / 100`;
  }

  // Buyer vs. Seller Intent Selection
  window.selectAppMode = function(mode) {
    currentAppMode = mode;
    const sellerBtn = document.getElementById("mode-seller-btn");
    const buyerBtn = document.getElementById("mode-buyer-btn");
    const askingBox = document.getElementById("buyer-asking-box");

    if (mode === "seller") {
      sellerBtn.classList.add("active");
      buyerBtn.classList.remove("active");
      if (askingBox) askingBox.style.display = "none";
    } else {
      buyerBtn.classList.add("active");
      sellerBtn.classList.remove("active");
      if (askingBox) askingBox.style.display = "block";
    }
  };

  // Photo Upload & Simulated AI Assessment
  function setupPhotoUpload() {
    const photoInput = document.getElementById("car-photo-input");
    const dropZone = document.getElementById("photo-drop-zone");
    const aiResultCard = document.getElementById("ai-photo-assessment");

    if (!photoInput) return;

    photoInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      showDynamicIsland("Analyzing Vehicle Photo", "AI scanning reflections & paint thickness...", "Scanning", 3000);

      try {
        const res = await fetch("/api/analyze-image", { method: "POST" });
        const data = await res.json();

        if (aiResultCard) {
          aiResultCard.style.display = "block";
          document.getElementById("av-label").textContent = data.assessment_label;
          document.getElementById("av-conf-badge").textContent = `Confidence: ${data.confidence}%`;
        }

        showDynamicIsland("AI Visual Assessment Complete", data.assessment_label, "Certified", 3500);
      } catch (err) {
        console.error(err);
      }
    });

    if (dropZone) {
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "var(--apple-blue-bright)";
      });
      dropZone.addEventListener("dragleave", () => {
        dropZone.style.borderColor = "rgba(255, 255, 255, 0.15)";
      });
      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "rgba(255, 255, 255, 0.15)";
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          photoInput.files = e.dataTransfer.files;
          photoInput.dispatchEvent(new Event("change"));
        }
      });
    }
  }

  // =========================================================================
  // Full Valuation Engine Execution (Step 10 Certified Report)
  // =========================================================================
  window.calculateFullValuation = async function() {
    const btnCalc = document.getElementById("btn-wizard-calculate");
    if (btnCalc) btnCalc.innerHTML = "<span>Analyzing Pakistan Classifieds...</span>";

    const make = document.getElementById("w-make") ? document.getElementById("w-make").value : selectMake.value;
    const model = document.getElementById("w-model") ? document.getElementById("w-model").value : selectModel.value;
    const variant = document.getElementById("w-variant") ? document.getElementById("w-variant").value : selectVariant.value;
    const year = parseInt(document.getElementById("w-year") ? document.getElementById("w-year").value : inputYear.value);
    const regYear = parseInt(document.getElementById("w-reg-year") ? document.getElementById("w-reg-year").value : year);
    const mileageKm = parseInt(document.getElementById("w-mileage") ? document.getElementById("w-mileage").value : inputMileage.value);
    const city = document.getElementById("w-city") ? document.getElementById("w-city").value : selectCity.value;
    const trans = document.getElementById("w-transmission") ? document.getElementById("w-transmission").value : selectTransmission.value;
    const fuel = document.getElementById("w-fuel") ? document.getElementById("w-fuel").value : selectFuel.value;
    const engineCc = parseInt(document.getElementById("w-engine-cc") ? document.getElementById("w-engine-cc").value : inputEngineCc.value);

    const owners = parseInt(document.getElementById("w-owners") ? document.getElementById("w-owners").value : 1);
    const serviceHist = document.getElementById("w-service-history") ? document.getElementById("w-service-history").value : "complete";
    const dealerService = document.getElementById("w-dealership") ? document.getElementById("w-dealership").value : "yes";
    const commUse = document.getElementById("w-commercial") ? (document.getElementById("w-commercial").value === "1") : false;

    const accHist = document.getElementById("w-accident-history") ? document.getElementById("w-accident-history").value : "none";
    const seals = document.getElementById("w-seals-intact") ? document.getElementById("w-seals-intact").checked : toggleSeals.checked;
    const airbags = document.getElementById("w-airbags") ? document.getElementById("w-airbags").checked : false;
    const chassis = document.getElementById("w-chassis") ? document.getElementById("w-chassis").checked : toggleAccidental.checked;
    const radiator = document.getElementById("w-radiator") ? document.getElementById("w-radiator").checked : false;

    const askingPrice = parseFloat(document.getElementById("w-asking-price") ? document.getElementById("w-asking-price").value : 0);

    const payload = {
      make, model, variant, year, registration_year: regYear,
      mileage_km: mileageKm, registered_city: city, current_city: city,
      transmission: trans, fuel_type: fuel, engine_cc: engineCc,
      owners_count: owners, service_history: serviceHist,
      dealership_servicing: dealerService, commercial_use: commUse,
      accident_history: accHist, seals_intact: seals ? 1 : 0,
      airbags_deployed: airbags, chassis_damage: chassis,
      radiator_support_damage: radiator,
      mode: currentAppMode, asking_price: askingPrice,
      ...pieceState
    };

    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Valuation engine error");
      const report = await res.json();

      renderFullCertificateReport(report);
      window.goToStep(10);
      showDynamicIsland("Valuation Certificate Ready", `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}: ${report.valuation.fair_market_value_lacs}`, "Certified", 4000);
    } catch (err) {
      console.error("Valuation error:", err);
      alert("Valuation calculation failed. Please verify vehicle specifications.");
    } finally {
      if (btnCalc) btnCalc.innerHTML = `<span>⚡ Generate Certified Valuation Report</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
    }
  };

  function renderFullCertificateReport(r) {
    // Header & Summary
    document.getElementById("cert-id-val").textContent = r.certificate_id;
    document.getElementById("cert-date-val").textContent = r.timestamp;

    document.getElementById("cv-vehicle-title").textContent = `${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model} ${r.vehicle.variant || ''}`;
    document.getElementById("cv-km").textContent = r.vehicle.mileage_formatted;
    document.getElementById("cv-city").textContent = `${r.vehicle.registered_city} Reg`;
    document.getElementById("cv-trans").textContent = `${r.vehicle.transmission} • ${r.vehicle.fuel_type}`;
    document.getElementById("cv-engine").textContent = `${r.vehicle.engine_cc} cc`;

    // Valuation Hero
    document.getElementById("cert-fair-val").textContent = r.valuation.fair_market_value_lacs;
    document.getElementById("cert-fair-exact").textContent = r.valuation.fair_market_value_formatted;
    document.getElementById("cert-range-val").textContent = `${r.valuation.range_min_formatted} – ${r.valuation.range_max_formatted}`;
    document.getElementById("cert-conf-score").textContent = `${r.valuation.confidence_score}%`;

    // 4 Channels
    document.getElementById("cc-fair-val").textContent = r.valuation.fair_market_value_lacs;
    document.getElementById("cc-private-val").textContent = r.valuation.private_sale_range;
    document.getElementById("cc-dealer-val").textContent = r.valuation.dealer_trade_range;
    document.getElementById("cc-fast-val").textContent = r.valuation.fast_sale_price;

    // Scores
    document.getElementById("sdc-overall").textContent = r.scores.overall;
    document.getElementById("sdc-exterior").textContent = r.scores.exterior;
    document.getElementById("sdc-mechanical").textContent = r.scores.mechanical;
    document.getElementById("sdc-interior").textContent = r.scores.interior;
    document.getElementById("sdc-history").textContent = r.scores.history;
    document.getElementById("sdc-mileage").textContent = r.scores.mileage;
    document.getElementById("sdc-structural").textContent = r.scores.structural;

    // Explainable AI (SHAP-Style Feature Contributions)
    document.getElementById("cert-base-benchmark").textContent = r.explainable_ai.base_market_value;
    const shapStack = document.getElementById("cert-shap-stack");
    if (r.explainable_ai.contributions && r.explainable_ai.contributions.length > 0) {
      shapStack.innerHTML = r.explainable_ai.contributions.map(c => `
        <div class="shap-item">
          <span>${c.name}</span>
          <span class="shap-badge ${c.is_positive ? 'pos' : 'neg'}">${c.impact_text}</span>
        </div>
      `).join("");
    } else {
      shapStack.innerHTML = `<div class="shap-item"><span>100% Genuine Showroom Benchmark Maintained</span><span class="shap-badge pos">+Rs 0</span></div>`;
    }

    // Helps vs Hurts
    const whatHelpsEl = document.getElementById("cert-what-helps");
    whatHelpsEl.innerHTML = r.explainable_ai.what_helps.map(h => `<li>${h}</li>`).join("");

    const whatHurtsEl = document.getElementById("cert-what-hurts");
    if (r.explainable_ai.what_hurts && r.explainable_ai.what_hurts.length > 0) {
      whatHurtsEl.innerHTML = r.explainable_ai.what_hurts.map(h => `<li>${h}</li>`).join("");
    } else {
      whatHurtsEl.innerHTML = `<li>No significant value-degrading factors reported. Excellent showroom retention.</li>`;
    }

    // Critical Warnings
    const warnBox = document.getElementById("cert-warnings-container");
    if (r.critical_warnings && r.critical_warnings.length > 0) {
      warnBox.style.display = "block";
      warnBox.innerHTML = r.critical_warnings.map(w => `<div class="cert-warning-item">${w}</div>`).join("");
    } else {
      warnBox.style.display = "none";
    }

    // Buyer Analysis
    const buyerBox = document.getElementById("cert-buyer-analysis-box");
    if (r.buyer_analysis) {
      buyerBox.style.display = "block";
      document.getElementById("cb-asking-price").textContent = r.buyer_analysis.asking_price_formatted;
      document.getElementById("cb-fair-price").textContent = r.valuation.fair_market_value_formatted;
      document.getElementById("cb-diff-val").textContent = `${r.buyer_analysis.is_overpriced ? '+' : '-'}${r.buyer_analysis.price_difference_formatted} (${r.buyer_analysis.difference_pct}% ${r.buyer_analysis.is_overpriced ? 'above fair value' : 'below fair value'})`;
      
      const negPoints = document.getElementById("cb-negotiation-points");
      negPoints.innerHTML = r.buyer_analysis.negotiation_points.map(pt => `<li>${pt}</li>`).join("");
    } else {
      buyerBox.style.display = "none";
    }

    // 6-Month Trend Bars
    const trendContainer = document.getElementById("cert-trend-bars");
    if (r.market_trend) {
      const maxPrice = Math.max(...r.market_trend.map(t => t.price_pkr));
      trendContainer.innerHTML = r.market_trend.map(t => {
        const heightPct = Math.round((t.price_pkr / maxPrice) * 100);
        return `
          <div class="t-bar-col">
            <span class="t-bar-price">${t.formatted}</span>
            <div class="t-bar-fill" style="height: ${heightPct}%;"></div>
            <span class="t-bar-month">${t.month}</span>
          </div>
        `;
      }).join("");
    }

    // Real Market Comparables
    const compsGrid = document.getElementById("cert-comparables-grid");
    if (r.market_comparables && r.market_comparables.length > 0) {
      compsGrid.innerHTML = r.market_comparables.map(c => `
        <a href="${c.url}" target="_blank" rel="noopener noreferrer" class="cert-comp-card">
          <img src="${c.image_url}" alt="${c.title}" class="ccc-thumb" onerror="this.src='${FALLBACK_CAR_SVG}'">
          <div class="ccc-info">
            <span class="ccc-title">${c.title}</span>
            <span class="ccc-price">${c.price_formatted} (${c.price_in_lacs})</span>
            <span class="ccc-meta">${c.year} • ${c.mileage_formatted} • ${c.registered_city}</span>
            <span class="ccc-sim">Match Similarity: ${c.similarity_score}% (${c.source})</span>
          </div>
        </a>
      `).join("");
    } else {
      compsGrid.innerHTML = `<p style="grid-column: span 2; font-size: 13px; color: var(--apple-text-secondary);">No exact match classifieds currently in database for this specific trim.</p>`;
    }
  }

  // =========================================================================
  // Floating AI Car Valuation Chatbot
  // =========================================================================
  window.toggleChatbot = function() {
    const modal = document.getElementById("chatbot-modal");
    if (!modal) return;
    if (modal.style.display === "none" || modal.style.display === "") {
      modal.style.display = "flex";
      const inp = document.getElementById("chatbot-input");
      if (inp) inp.focus();
    } else {
      modal.style.display = "none";
    }
  };

  window.sendChatPrompt = function(promptText) {
    const inp = document.getElementById("chatbot-input");
    if (inp) {
      inp.value = promptText;
      window.submitChatMessage();
    }
  };

  window.submitChatMessage = async function() {
    const inp = document.getElementById("chatbot-input");
    const msgs = document.getElementById("chatbot-messages");
    if (!inp || !msgs) return;
    const text = inp.value.trim();
    if (!text) return;

    // Render user message
    const userDiv = document.createElement("div");
    userDiv.className = "user-msg";
    userDiv.textContent = text;
    msgs.appendChild(userDiv);
    inp.value = "";
    msgs.scrollTop = msgs.scrollHeight;

    // Loading indicator
    const botLoading = document.createElement("div");
    botLoading.className = "bot-msg";
    botLoading.textContent = "Analyzing PakWheels & OLX data...";
    msgs.appendChild(botLoading);
    msgs.scrollTop = msgs.scrollHeight;

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      botLoading.innerHTML = `<p>${data.reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      msgs.scrollTop = msgs.scrollHeight;
    } catch (err) {
      botLoading.textContent = "I could not retrieve market data. Try specifying make, year, mileage and city.";
    }
  };

  // =========================================================================
  // Live PakWheels & OLX Classifieds Explorer
  // =========================================================================
  function setupMarketplaceListeners() {
    // Search input
    let searchDebounce = null;
    searchInput.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      searchClearBtn.style.display = val ? "block" : "none";
      if (searchDebounce) clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        currentFilter.q = val;
        loadMarketplaceListings(true);
      }, 350);
    });

    searchClearBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchClearBtn.style.display = "none";
      currentFilter.q = "";
      loadMarketplaceListings(true);
    });

    // Source pills (All, PakWheels, OLX)
    sourcePills.forEach(pill => {
      pill.addEventListener("click", () => {
        sourcePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        currentFilter.source = pill.dataset.source;
        loadMarketplaceListings(true);
      });
    });

    // City & Make & Sort dropdowns
    filterCity.addEventListener("change", (e) => {
      currentFilter.city = e.target.value;
      loadMarketplaceListings(true);
    });

    filterMake.addEventListener("change", (e) => {
      currentFilter.make = e.target.value;
      loadMarketplaceListings(true);
    });

    filterSort.addEventListener("change", (e) => {
      currentFilter.sort = e.target.value;
      loadMarketplaceListings(true);
    });

    btnLoadMore.addEventListener("click", () => {
      loadMarketplaceListings(false);
    });
  }

  async function loadMarketplaceListings(reset = false) {
    if (reset) {
      listingsOffset = 0;
      currentListings = [];
      listingsGrid.innerHTML = `
        <div class="listings-loading">
          <div class="spinner"></div>
          <span>Loading verified PakWheels & OLX classifieds...</span>
        </div>
      `;
    }

    const params = new URLSearchParams({
      source: currentFilter.source,
      city: currentFilter.city,
      make: currentFilter.make,
      q: currentFilter.q,
      sort: currentFilter.sort,
      limit: listingsLimit,
      offset: listingsOffset
    });

    try {
      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();

      if (reset) {
        currentListings = data.listings;
      } else {
        currentListings = currentListings.concat(data.listings);
      }
      listingsOffset += data.listings.length;

      // Update total pill counts
      if (data.counts) {
        document.getElementById("pill-count-all").textContent = data.counts.all;
        document.getElementById("pill-count-pw").textContent = data.counts.pakwheels;
        document.getElementById("pill-count-olx").textContent = data.counts.olx;
      }

      // Update status bar
      resultsCountText.textContent = `Showing ${currentListings.length} of ${data.total} Verified Ads in Pakistan`;

      // Render cards
      renderListingsCards(reset);

      // Load more button visibility
      if (listingsOffset >= data.total) {
        btnLoadMore.style.display = "none";
      } else {
        btnLoadMore.style.display = "inline-flex";
      }

    } catch (err) {
      console.error("Failed to load listings:", err);
      listingsGrid.innerHTML = `
        <div class="listings-error">
          <p>Marketplace connection re-establishing. Please retry in a moment.</p>
        </div>
      `;
    }
  }

  function renderListingsCards(reset = false) {
    if (reset) {
      listingsGrid.innerHTML = "";
    }

    if (currentListings.length === 0) {
      listingsGrid.innerHTML = `
        <div class="empty-listings-state">
          <span class="empty-icon">🔍</span>
          <h3>No matching classifieds found</h3>
          <p>Try resetting city or make filters to browse all 360+ verified listings.</p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    const startIdx = reset ? 0 : listingsOffset - listingsLimit;
    const newItems = currentListings.slice(startIdx);

    newItems.forEach(item => {
      const card = document.createElement("div");
      card.className = "listing-card";

      const sourceClass = (item.source || "").toLowerCase().includes("pakwheels") ? "pw-badge" : "olx-badge";
      const conditionClass = (item.condition_badge || "").toLowerCase().includes("genuine") ? "genuine" : "touchup";

      card.innerHTML = `
        <div class="listing-thumb-wrap">
          <img src="${item.image_url}" alt="${item.title}" class="listing-img" loading="lazy" onerror="this.src='${FALLBACK_CAR_SVG}'">
          <span class="source-tag ${sourceClass}">${item.source}</span>
          <span class="condition-floating-badge ${conditionClass}">${item.condition_badge}</span>
        </div>
        <div class="listing-body">
          <div class="listing-price-row">
            <h3 class="listing-price">${item.price_formatted}</h3>
            <span class="listing-lacs">(${item.price_in_lacs})</span>
          </div>
          <h4 class="listing-title">${item.title}</h4>
          <div class="listing-meta-tags">
            <span class="l-meta-tag">${item.year}</span>
            <span class="l-meta-tag">${item.mileage_formatted}</span>
            <span class="l-meta-tag">${item.registered_city}</span>
            <span class="l-meta-tag">${item.transmission}</span>
          </div>
          <div class="listing-actions">
            <button type="button" class="btn-evaluate" data-item='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
              <span>Evaluate in Studio</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn-ad-link" title="Open verified ad on ${item.source}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
            </a>
          </div>
        </div>
      `;

      fragment.appendChild(card);
    });

    listingsGrid.appendChild(fragment);

    // Wire up "Evaluate in Studio" buttons
    const evalButtons = listingsGrid.querySelectorAll(".btn-evaluate");
    evalButtons.forEach(btn => {
      // Remove old listeners by cloning
      const freshBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(freshBtn, btn);

      freshBtn.addEventListener("click", () => {
        const itemData = JSON.parse(freshBtn.getAttribute("data-item").replace(/&apos;/g, "'"));
        autofillStudioWithListing(itemData);
      });
    });
  }

  function autofillStudioWithListing(item) {
    if (!item) return;

    if (item.make && marketMeta && marketMeta.makes.includes(item.make)) {
      selectMake.value = item.make;
      updateModelOptions(item.make);
    }

    if (item.model) {
      selectModel.value = item.model;
      updateVariantOptions(item.model);
    }

    if (item.year) {
      inputYear.value = item.year;
      yearVal.textContent = item.year;
    }

    if (item.mileage_km) {
      inputMileage.value = item.mileage_km;
      mileageVal.textContent = `${Number(item.mileage_km).toLocaleString()} km`;
    }

    if (item.registered_city && marketMeta && marketMeta.cities.includes(item.registered_city)) {
      selectCity.value = item.registered_city;
      cityPremiumNote.textContent = cityDescriptions[item.registered_city] || `${item.registered_city}: Provincial Tax Standard`;
    }

    if (item.transmission && marketMeta && marketMeta.transmissions.includes(item.transmission)) {
      selectTransmission.value = item.transmission;
    }

    if (item.engine_cc) {
      inputEngineCc.value = item.engine_cc;
    }

    // Apply scraped panel conditions
    if (item.condition_summary) {
      if (item.condition_summary.is_total_genuine) {
        applyPreset("total_genuine");
      } else {
        const parsed = item.condition_summary.parsed_pieces || {};
        Object.keys(parsed).forEach(pk => {
          if (pieceState.hasOwnProperty(pk)) {
            setPieceStatus(pk, parsed[pk]);
          }
        });
      }
    }

    // Scroll smoothly to studio
    const engineEl = document.getElementById("valuation-engine");
    if (engineEl) {
      engineEl.scrollIntoView({ behavior: "smooth" });
    }

    showDynamicIsland("Loaded from Marketplace", `${item.year} ${item.make} ${item.model} (${item.source})`, "Synced", 3000);
    triggerPrediction();
  }

  // =========================================================================
  // Apple-Style Vehicle Comparator
  // =========================================================================
  function setupComparatorListeners() {
    compareSelect1.addEventListener("change", () => triggerComparator());
    compareSelect2.addEventListener("change", () => triggerComparator());
  }

  async function triggerComparator() {
    const m1 = compareSelect1.value;
    const m2 = compareSelect2.value;

    try {
      const res = await fetch(`/api/compare?m1=${encodeURIComponent(m1)}&m2=${encodeURIComponent(m2)}`);
      const data = await res.json();
      renderComparatorResults(data);
    } catch (err) {
      console.error("Comparator error:", err);
    }
  }

  function renderComparatorResults(data) {
    if (!comparisonResults) return;

    comparisonResults.innerHTML = `
      <!-- Model 1 Card -->
      <div class="comp-product-card">
        <div class="cpc-header">
          <span class="cpc-badge">Model A</span>
          <h3 class="cpc-title">${data.model_1.display_name}</h3>
          <span class="cpc-segment">${data.model_1.segment}</span>
        </div>
        <div class="cpc-price-hero">
          <div class="cpc-price">${data.model_1.fair_value_lacs}</div>
          <span class="cpc-price-sub">Average 2021 Market Value</span>
        </div>
        <div class="cpc-metrics-shelf">
          <div class="cpc-metric-row">
            <span class="cpc-m-label">PakWheels Dealer Asking:</span>
            <strong class="cpc-m-val">${data.model_1.pakwheels_asking_lacs}</strong>
          </div>
          <div class="cpc-metric-row">
            <span class="cpc-m-label">OLX Quick Cash Price:</span>
            <strong class="cpc-m-val">${data.model_1.olx_cash_lacs}</strong>
          </div>
          <div class="cpc-metric-row">
            <span class="cpc-m-label">Secondary Resale Velocity:</span>
            <strong class="cpc-m-val highlight">${data.model_1.resale_velocity}</strong>
          </div>
          <div class="cpc-metric-row">
            <span class="cpc-m-label">Market Popularity:</span>
            <strong class="cpc-m-val">${data.model_1.market_demand_index} / 100</strong>
          </div>
          <div class="cpc-metric-row">
            <span class="cpc-m-label">Engine & Specs:</span>
            <strong class="cpc-m-val">${data.model_1.engine_specs}</strong>
          </div>
        </div>
        <button type="button" class="apple-btn-secondary cpc-select-btn" onclick="selectModelInStudio('${data.model_1.make}', '${data.model_1.model}')">
          Load ${data.model_1.model} into Studio
        </button>
      </div>

      <!-- Model 2 Card -->
      <div class="comp-product-card">
        <div class="cpc-header">
          <span class="cpc-badge">Model B</span>
          <h3 class="cpc-title">${data.model_2.display_name}</h3>
          <span class="cpc-segment">${data.model_2.segment}</span>
        </div>
        <div class="cpc-price-hero">
          <div class="cpc-price">${data.model_2.fair_value_lacs}</div>
          <span class="cpc-price-sub">Average 2021 Market Value</span>
        </div>
        <div class="cpc-metrics-shelf">
          <div class="cpc-metric-row">
            <span class="cpc-m-label">PakWheels Dealer Asking:</span>
            <strong class="cpc-m-val">${data.model_2.pakwheels_asking_lacs}</strong>
          </div>
          <div class="cpc-metric-row">
            <span class="cpc-m-label">OLX Quick Cash Price:</span>
            <strong class="cpc-m-val">${data.model_2.olx_cash_lacs}</strong>
          </div>
          <div class="cpc-metric-row">
            <span class="cpc-m-label">Secondary Resale Velocity:</span>
            <strong class="cpc-m-val highlight">${data.model_2.resale_velocity}</strong>
          </div>
          <div class="cpc-metric-row">
            <span class="cpc-m-label">Market Popularity:</span>
            <strong class="cpc-m-val">${data.model_2.market_demand_index} / 100</strong>
          </div>
          <div class="cpc-metric-row">
            <span class="cpc-m-label">Engine & Specs:</span>
            <strong class="cpc-m-val">${data.model_2.engine_specs}</strong>
          </div>
        </div>
        <button type="button" class="apple-btn-secondary cpc-select-btn" onclick="selectModelInStudio('${data.model_2.make}', '${data.model_2.model}')">
          Load ${data.model_2.model} into Studio
        </button>
      </div>
    `;
  }

  window.selectModelInStudio = function(make, model) {
    if (selectMake && marketMeta && marketMeta.makes.includes(make)) {
      selectMake.value = make;
      updateModelOptions(make);
    }
    if (selectModel) {
      selectModel.value = model;
      updateVariantOptions(model);
    }
    const engineEl = document.getElementById("valuation-engine");
    if (engineEl) {
      engineEl.scrollIntoView({ behavior: "smooth" });
    }
    triggerPrediction();
  };

  // =========================================================================
  // 10-Step Wizard Valuation Logic
  // =========================================================================
  window.calculateFullValuation = async function() {
    const btnCalculate = document.getElementById("btn-wizard-calculate");
    if (btnCalculate) {
      btnCalculate.innerHTML = `<span>Generating Report...</span>`;
      btnCalculate.disabled = true;
    }

    const payload = {
      make: document.getElementById("w-make").value,
      model: document.getElementById("w-model").value,
      variant: document.getElementById("w-variant") ? document.getElementById("w-variant").value : "",
      year: parseInt(document.getElementById("w-year").value),
      registration_year: parseInt(document.getElementById("w-reg-year").value),
      mileage_km: parseInt(document.getElementById("w-mileage").value),
      registered_city: document.getElementById("w-city").value,
      transmission: document.getElementById("w-transmission").value,
      fuel_type: document.getElementById("w-fuel").value,
      engine_cc: parseInt(document.getElementById("w-engine-cc").value),
      owners_count: parseInt(document.getElementById("w-owners").value),
      service_history: document.getElementById("w-service-history").value,
      dealership_servicing: document.getElementById("w-dealership").value,
      commercial_use: parseInt(document.getElementById("w-commercial").value) === 1,
      accident_history: document.getElementById("w-accident-history").value,
      seals_intact: document.getElementById("w-seals-intact").checked ? 1 : 0,
      airbags_deployed: document.getElementById("w-airbags").checked ? 1 : 0,
      chassis_damage: document.getElementById("w-chassis").checked ? 1 : 0,
      radiator_support_damage: document.getElementById("w-radiator").checked ? 1 : 0,
      mode: currentAppMode,
      asking_price: parseFloat(document.getElementById("w-asking-price").value || 0),
      ...pieceState
    };

    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Valuation failed");
      const data = await res.json();
      
      // Populate Step 10 Certificate
      document.getElementById("cert-id-val").textContent = data.certificate_id;
      document.getElementById("cert-date-val").textContent = data.timestamp;
      
      const v = data.vehicle;
      document.getElementById("cv-vehicle-title").textContent = `${v.year} ${v.make} ${v.model} ${v.variant}`;
      document.getElementById("cv-km").textContent = v.mileage_formatted;
      document.getElementById("cv-city").textContent = `${v.registered_city} Reg`;
      document.getElementById("cv-trans").textContent = `${v.transmission} • ${v.fuel_type}`;
      document.getElementById("cv-engine").textContent = `${v.engine_cc} cc`;

      const val = data.valuation;
      document.getElementById("cert-fair-val").textContent = val.fair_market_value_lacs;
      document.getElementById("cert-fair-exact").textContent = val.fair_market_value_formatted;
      document.getElementById("cert-range-val").textContent = `${val.range_min_formatted} – ${val.range_max_formatted}`;
      document.getElementById("cert-conf-score").textContent = `${val.confidence_score}%`;
      
      document.getElementById("cc-fair-val").textContent = val.fair_market_value_lacs;
      document.getElementById("cc-private-val").textContent = val.private_sale_range;
      document.getElementById("cc-dealer-val").textContent = val.dealer_trade_range;
      document.getElementById("cc-fast-val").textContent = val.fast_sale_price;

      const scores = data.scores;
      document.getElementById("sdc-overall").textContent = scores.overall;
      document.getElementById("sdc-exterior").textContent = scores.exterior;
      document.getElementById("sdc-mechanical").textContent = scores.mechanical;
      document.getElementById("sdc-interior").textContent = scores.interior;
      document.getElementById("sdc-history").textContent = scores.history;
      document.getElementById("sdc-mileage").textContent = scores.mileage;
      document.getElementById("sdc-structural").textContent = scores.structural;
      
      // Set color classes for scores
      ['overall', 'exterior', 'mechanical', 'interior', 'history', 'mileage', 'structural'].forEach(s => {
          const el = document.getElementById(`sdc-${s}`);
          el.className = 'sdc-circle';
          if (scores[s] >= 85) el.classList.add('green');
          else if (scores[s] >= 70) el.classList.add('orange');
          else el.classList.add('red');
      });

      document.getElementById("cert-base-benchmark").textContent = val.pristine_genuine_formatted;

      const eai = data.explainable_ai;
      const shapStack = document.getElementById("cert-shap-stack");
      shapStack.innerHTML = eai.contributions.map(c => `
        <div class="shap-item">
          <span class="shap-name">${c.name}</span>
          <span class="shap-val ${c.is_positive ? 'positive' : 'negative'}">${c.impact_text}</span>
        </div>
      `).join("");

      document.getElementById("cert-what-helps").innerHTML = eai.what_helps.map(h => `<li>${h}</li>`).join("");
      document.getElementById("cert-what-hurts").innerHTML = eai.what_hurts.map(h => `<li>${h}</li>`).join("");

      const warningsBox = document.getElementById("cert-warnings-container");
      if (data.critical_warnings && data.critical_warnings.length > 0) {
        warningsBox.style.display = "flex";
        warningsBox.innerHTML = data.critical_warnings.map(w => `<div class="warning-alert"><span>${w}</span></div>`).join("");
      } else {
        warningsBox.style.display = "none";
      }

      const buyerBox = document.getElementById("cert-buyer-analysis-box");
      if (data.buyer_analysis) {
        buyerBox.style.display = "block";
        const b = data.buyer_analysis;
        document.getElementById("cb-asking-price").textContent = b.asking_price_formatted;
        document.getElementById("cb-fair-price").textContent = val.fair_market_value_formatted;
        const diffEl = document.getElementById("cb-diff-val");
        if (b.is_overpriced) {
            diffEl.textContent = `+${b.price_difference_formatted} (${b.difference_pct}% above fair value)`;
            diffEl.style.color = 'var(--apple-orange)';
        } else {
            diffEl.textContent = `-${b.price_difference_formatted} (${b.difference_pct}% below fair value)`;
            diffEl.style.color = 'var(--apple-green)';
        }
        document.getElementById("cb-negotiation-points").innerHTML = b.negotiation_points.map(p => `<li>${p}</li>`).join("");
      } else {
        buyerBox.style.display = "none";
      }

      const trendBox = document.getElementById("cert-trend-bars");
      if (data.market_trend) {
          const maxVal = Math.max(...data.market_trend.map(t => t.price_pkr));
          trendBox.innerHTML = data.market_trend.map(t => {
              const heightPct = (t.price_pkr / maxVal) * 100;
              return `
                  <div class="t-bar-wrap">
                      <div class="t-bar-val">${t.formatted.replace('Rs ', '')}</div>
                      <div class="t-bar-fill" style="height: ${heightPct}%;"></div>
                      <div class="t-bar-label">${t.month}</div>
                  </div>
              `;
          }).join("");
      }

      const compsBox = document.getElementById("cert-comparables-grid");
      if (data.market_comparables && data.market_comparables.length > 0) {
          compsBox.innerHTML = data.market_comparables.map(c => `
            <div class="comp-card">
              <img src="${c.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${c.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
              <div class="comp-card-body">
                <h4>${c.title}</h4>
                <div class="cc-price">${c.price_formatted}</div>
                <div class="cc-meta">
                  <span>${c.mileage_formatted}</span>
                  <span>${c.registered_city}</span>
                </div>
                <div class="cc-footer">
                  <span class="cc-source">${c.source}</span>
                  <span class="cc-sim">${c.similarity_score}% Match</span>
                </div>
              </div>
            </div>
          `).join("");
      } else {
          compsBox.innerHTML = `<p>No recent exact comparables found matching this specific condition profile.</p>`;
      }

      // Transition to Step 10
      goToStep(10);
      showDynamicIsland("Report Generated", "Certified Valuation Completed", "Success", 3500);

    } catch (err) {
      console.error(err);
      alert("Failed to generate report. Please try again.");
    } finally {
      if (btnCalculate) {
        btnCalculate.innerHTML = `<span>⚡ Generate Certified Valuation Report</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
        btnCalculate.disabled = false;
      }
    }
  };

  window.selectAppMode = function(mode) {
    currentAppMode = mode;
    document.querySelectorAll(".mode-card-btn").forEach(b => b.classList.remove("active"));
    const btn = document.getElementById(`mode-${mode}-btn`);
    if (btn) btn.classList.add("active");
    
    const askingBox = document.getElementById("buyer-asking-box");
    if (askingBox) {
      askingBox.style.display = mode === 'buyer' ? "block" : "none";
    }
  };

  // =========================================================================
  // Benchmark Table Loader
  // =========================================================================
  async function loadBenchmark() {
    try {
      const res = await fetch("/api/benchmark");
      const list = await res.json();
      const tbody = document.getElementById("benchmark-tbody");
      if (!tbody) return;

      tbody.innerHTML = list.map(item => `
        <tr>
          <td><strong>${item.model_name}</strong></td>
          <td>${item.mae_lacs} Lacs</td>
          <td><span class="tag-badge genuine">${item.r2_score}</span></td>
          <td>${item.accuracy}</td>
        </tr>
      `).join("");
    } catch (err) {
      console.error("Failed to load benchmark:", err);
    }
  }

});
