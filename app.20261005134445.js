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

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }


  function createCard(p) {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".card");
    article.dataset.id = p.id || "";

    const title = p.title || "Extrait YouTube";
    const passageUrl = watchUrl(p.videoId, p.start);

    node.querySelector(".theme-pill").textContent =
      p.theme || (p.themes && p.themes.join(" / ")) || "—";
    node.querySelector(".time-range").textContent =
      `${formatTime(p.start)} → ${formatTime(p.end)}`;
    node.querySelector(".card-title").textContent = p.title || "";
    node.querySelector(".card-source").textContent = p.source || "";
    node.querySelector(".card-summary").textContent = p.summary || "";

    const lirePassage = node.querySelector(".lire-passage");
    lirePassage.href = passageUrl;
    lirePassage.setAttribute(
      "aria-label",
      `Lire le passage « ${title} » sur YouTube à ${formatTime(p.start)}`
    );


    const link = node.querySelector(".yt-link");
    link.href = passageUrl;
    link.setAttribute(
      "aria-label",
      `Voir « ${title} » sur YouTube à ${formatTime(p.start)}`
    );

    const copyBtn = node.querySelector(".copy-passage-btn");
    const copyLabel = copyBtn.querySelector(".copy-label");
    copyBtn.setAttribute(
      "aria-label",
      `Copier le lien du passage « ${title} » (démarrage à ${formatTime(p.start)})`
    );
    copyBtn.addEventListener("click", async () => {
      try {
        await copyText(passageUrl);
        copyBtn.classList.add("is-copied");
        copyLabel.textContent = "Copié";
        window.clearTimeout(copyBtn._copiedTimer);
        copyBtn._copiedTimer = window.setTimeout(() => {
          copyBtn.classList.remove("is-copied");
          copyLabel.textContent = "Copier le lien";
        }, 1800);
      } catch (err) {
        console.error(err);
        copyLabel.textContent = "Erreur";
        window.clearTimeout(copyBtn._copiedTimer);
        copyBtn._copiedTimer = window.setTimeout(() => {
          copyLabel.textContent = "Copier le lien";
        }, 1800);
      }
    });

    return node;
  }

  function render() {
    const filtered = pepites.filter((p) => matchesFilter(p, activeFilter));
    grid.innerHTML = "";
    filtered.forEach((p) => grid.appendChild(createCard(p)));

    const n = filtered.length;
    resultCount.textContent =
      n === 0
        ? "0 insight"
        : n === 1
          ? "1 insight"
          : `${n} insights`;

    emptyState.hidden = n !== 0;
  }

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    setActiveFilter(btn.dataset.filter);
  });

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
