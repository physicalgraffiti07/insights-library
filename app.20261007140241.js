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

  function isInstagram(p) {
    if (!p) return false;
    if (p.platform === "instagram") return true;
    if (p.instagramUrl || p.instagramShortcode) return true;
    if (!p.videoId && (p.instagramUrl || p.instagramShortcode)) return true;
    return false;
  }

  function instagramShortcode(p) {
    if (p.instagramShortcode) return String(p.instagramShortcode).trim();
    const url = p.instagramUrl || "";
    const m = String(url).match(/\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
    return m ? m[1] : "";
  }

  function instagramWatchUrl(p) {
    if (p.instagramUrl) return p.instagramUrl;
    const code = instagramShortcode(p);
    return code ? `https://www.instagram.com/reel/${code}/` : "";
  }

  function instagramEmbedUrl(p) {
    const code = instagramShortcode(p);
    if (!code) return "";
    return `https://www.instagram.com/reel/${encodeURIComponent(code)}/embed`;
  }

  function watchUrl(videoId, start) {
    return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${start}s`;
  }

  function embedUrl(videoId, start, end) {
    const params = new URLSearchParams({
      start: String(start ?? 0),
      rel: "0",
      playsinline: "1",
      autoplay: "1",
      mute: "0",
      enablejsapi: "1",
      widget_referrer: window.location.origin || "",
      origin: window.location.origin || "",
    });
    if (end != null && end !== "" && Number(end) > Number(start)) {
      params.set("end", String(end));
    }
    return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params}`;
  }

  function coverLabel(p) {
    if (Array.isArray(p.themes) && p.themes.length) {
      return p.themes[0];
    }
    if (p.theme) {
      return String(p.theme).split(/\s*\/\s*/)[0].trim() || p.theme;
    }
    if (p.source) {
      const parts = String(p.source).split(/[—–\-]/);
      const last = parts[parts.length - 1].trim();
      if (last) return last.split("/")[0].trim();
    }
    return "Insight";
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

  function activateYoutubeEmbed(stage, article, videoId, start, end, title) {
    if (stage.dataset.activated === "1") return;
    stage.dataset.activated = "1";
    stage.classList.add("is-playing");
    article.classList.add("is-playing");
    const cover = stage.closest(".cover");
    if (cover) cover.classList.add("is-playing");

    const iframe = document.createElement("iframe");
    iframe.src = embedUrl(videoId, start, end);
    iframe.title = title || "Extrait YouTube";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("frameborder", "0");
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.setAttribute("loading", "eager");

    const fallback = document.createElement("a");
    fallback.className = "embed-fallback";
    fallback.href = watchUrl(videoId, start);
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.textContent = "Si l’écran reste noir, ouvrir sur YouTube";

    stage.innerHTML = "";
    stage.appendChild(iframe);
    stage.appendChild(fallback);
  }

  function activateInstagramEmbed(stage, article, p, title) {
    if (stage.dataset.activated === "1") return;
    stage.dataset.activated = "1";
    stage.classList.add("is-playing", "is-instagram");
    article.classList.add("is-playing", "is-instagram");
    const cover = stage.closest(".cover");
    if (cover) cover.classList.add("is-playing", "is-instagram");

    const watch = instagramWatchUrl(p);
    const embed = instagramEmbedUrl(p);

    const iframe = document.createElement("iframe");
    iframe.src = embed;
    iframe.title = title || "Reel Instagram";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.setAttribute("loading", "eager");

    const fallback = document.createElement("a");
    fallback.className = "embed-fallback";
    fallback.href = watch;
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.textContent = "Si l’écran reste vide, ouvrir sur Instagram";

    stage.innerHTML = "";
    stage.appendChild(iframe);
    stage.appendChild(fallback);
  }

  function createCard(p) {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".card");
    article.dataset.id = p.id || "";

    const ig = isInstagram(p);
    const title = p.title || (ig ? "Reel Instagram" : "Extrait YouTube");
    const passageUrl = ig ? instagramWatchUrl(p) : watchUrl(p.videoId, p.start);
    const timeLabel = ig
      ? "Reel"
      : `${formatTime(p.start)} → ${formatTime(p.end)}`;
    const platformMeta = ig ? "Reel" : timeLabel;

    if (ig) article.classList.add("platform-instagram");

    // Typographic cover (no images, no faces) — click to embed
    node.querySelector(".cover-label").textContent = coverLabel(p);
    node.querySelector(".cover-title").textContent = title;
    node.querySelector(".cover-meta").textContent = platformMeta;

    const stage = node.querySelector(".cover-stage");
    const facade = node.querySelector(".cover-facade");
    facade.setAttribute(
      "aria-label",
      ig
        ? `Lire ici « ${title} » (Instagram)`
        : `Lire ici « ${title} » (${formatTime(p.start)} → ${formatTime(p.end)})`
    );
    facade.addEventListener("click", () => {
      if (ig) {
        activateInstagramEmbed(stage, article, p, title);
      } else {
        activateYoutubeEmbed(stage, article, p.videoId, p.start, p.end, title);
      }
    });

    node.querySelector(".theme-pill").textContent =
      p.theme || (p.themes && p.themes.join(" / ")) || "—";
    node.querySelector(".time-range").textContent = timeLabel;
    node.querySelector(".card-title").textContent = p.title || "";
    node.querySelector(".card-source").textContent = p.source || "";
    node.querySelector(".card-summary").textContent = p.summary || "";

    const lirePassage = node.querySelector(".lire-passage");
    lirePassage.href = passageUrl;
    if (ig) {
      lirePassage.textContent = "Voir sur Instagram";
      lirePassage.setAttribute(
        "aria-label",
        `Voir « ${title} » sur Instagram`
      );
    } else {
      lirePassage.setAttribute(
        "aria-label",
        `Lire le passage « ${title} » sur YouTube à ${formatTime(p.start)}`
      );
    }

    const link = node.querySelector(".yt-link");
    link.href = passageUrl;
    const linkLabel = link.querySelector("span");
    if (linkLabel) {
      linkLabel.textContent = ig ? "Voir sur Instagram" : "Voir sur YouTube";
    }
    link.setAttribute(
      "aria-label",
      ig
        ? `Voir « ${title} » sur Instagram`
        : `Voir « ${title} » sur YouTube à ${formatTime(p.start)}`
    );

    const copyBtn = node.querySelector(".copy-passage-btn");
    const copyLabel = copyBtn.querySelector(".copy-label");
    copyBtn.setAttribute(
      "aria-label",
      ig
        ? `Copier le lien Instagram « ${title} »`
        : `Copier le lien du passage « ${title} » (démarrage à ${formatTime(p.start)})`
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
