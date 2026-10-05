(function () {
  "use strict";

  const grid = document.getElementById("pepites-grid");
  const filtersEl = document.getElementById("filters");
  const resultCount = document.getElementById("result-count");
  const emptyState = document.getElementById("empty-state");
  const template = document.getElementById("card-template");

  let pepites = [];
  let activeFilter = "all";

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  function embedUrl(videoId, start, end) {
    const params = new URLSearchParams({
      start: String(start),
      end: String(end),
      rel: "0",
    });
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params}`;
  }

  function watchUrl(videoId, start) {
    return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${start}s`;
  }

  function collectThemes(items) {
    const set = new Set();
    items.forEach((p) => {
      if (Array.isArray(p.themes) && p.themes.length) {
        p.themes.forEach((t) => set.add(t));
      } else if (p.theme) {
        set.add(p.theme);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }

  function matchesFilter(p, filter) {
    if (filter === "all") return true;
    if (Array.isArray(p.themes) && p.themes.includes(filter)) return true;
    if (p.theme === filter) return true;
    if (p.theme && p.theme.split(/\s*\/\s*/).map((s) => s.trim()).includes(filter)) return true;
    return false;
  }

  function buildFilters(themes) {
    // Keep "Tout", rebuild the rest
    filtersEl.querySelectorAll(".filter-btn:not([data-filter='all'])").forEach((b) => b.remove());
    themes.forEach((theme) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-btn";
      btn.dataset.filter = theme;
      btn.textContent = theme;
      filtersEl.appendChild(btn);
    });
  }

  function setActiveFilter(filter) {
    activeFilter = filter;
    filtersEl.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === filter);
    });
    render();
  }

  function createCard(p) {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".card");
    article.dataset.id = p.id || "";

    const iframe = node.querySelector("iframe");
    iframe.src = embedUrl(p.videoId, p.start, p.end);
    iframe.title = p.title || "Extrait YouTube";

    node.querySelector(".theme-pill").textContent = p.theme || (p.themes && p.themes.join(" / ")) || "—";
    node.querySelector(".time-range").textContent = `${formatTime(p.start)} → ${formatTime(p.end)}`;
    node.querySelector(".card-title").textContent = p.title || "";
    node.querySelector(".card-source").textContent = p.source || "";
    node.querySelector(".card-summary").textContent = p.summary || "";

    const link = node.querySelector(".yt-link");
    link.href = watchUrl(p.videoId, p.start);
    link.setAttribute("aria-label", `Voir « ${p.title} » sur YouTube à ${formatTime(p.start)}`);

    return node;
  }

  function render() {
    const filtered = pepites.filter((p) => matchesFilter(p, activeFilter));
    grid.innerHTML = "";
    filtered.forEach((p) => grid.appendChild(createCard(p)));

    const n = filtered.length;
    resultCount.textContent =
      n === 0
        ? "0 pépite"
        : n === 1
          ? "1 pépite"
          : `${n} pépites`;

    emptyState.hidden = n !== 0;
  }

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    setActiveFilter(btn.dataset.filter);
  });

  // Deep-link support: ?theme=Fiscalité or #holding-menottes-dorees
  function applyUrlState() {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get("theme");
    if (themeParam) {
      const themes = collectThemes(pepites);
      if (themeParam === "all" || themes.includes(themeParam)) {
        setActiveFilter(themeParam);
      }
    }
    const hash = window.location.hash.replace(/^#/, "");
    if (hash) {
      requestAnimationFrame(() => {
        const el = grid.querySelector(`[data-id="${CSS.escape(hash)}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  fetch("pepites.json", { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error("Impossible de charger pepites.json");
      return r.json();
    })
    .then((data) => {
      pepites = Array.isArray(data.pepites) ? data.pepites : [];
      buildFilters(collectThemes(pepites));
      render();
      applyUrlState();
    })
    .catch((err) => {
      resultCount.textContent = "Erreur de chargement";
      emptyState.hidden = false;
      emptyState.textContent = String(err.message || err);
      console.error(err);
    });
})();
