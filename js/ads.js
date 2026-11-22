// ============================================================================
// TrialEarn — Ad network loader (ALL 11 no-minimum networks).
// RULES (non-negotiable, from the research + owner decisions):
//  1. Safe formats ONLY: banners, native, in-text, in-page push.
//     NO popunders — ever. PopAds is popunder-only, so it is NEVER loaded.
//  2. NEVER reward users for viewing/clicking display ads. Ads live in
//     content slots only — never inside a task, the offerwall, or payouts.
//  3. A network loads ONLY when its publisher ID is set in config.js.
//     Unconfigured = code-ready, account pending. No broken tags, no 404s.
// Each slot in the HTML is <div class="adslot" data-network="infolinks">
// etc. This loader fills configured slots and leaves the rest as a
// labelled placeholder (visible only to staff via ?debug=ads).
// SETUP NOTE: before going live, verify each network's tag URL against the
// exact snippet shown in that network's own dashboard and adjust the
// matching loader below if it differs — the publisher/zone ids themselves
// always come from config.js, never hard-coded here.
// ============================================================================
(function () {
  const CFG = (window.TRIALEARN_CONFIG || {}).ADS || {};
  const DEBUG = new URLSearchParams(location.search).has("debug");

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.async = true;
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("ad tag failed: " + src));
      document.head.appendChild(s);
    });
  }
  function loadInline(code) {
    const s = document.createElement("script");
    s.text = code;
    document.head.appendChild(s);
  }

  // One entry per network: `ready` = configured? `load` = inject its tag.
  // Tag patterns follow each network's published integration docs; the
  // publisher/zone ids come from config.js (dashboard values).
  const NETWORKS = {
    infolinks: {
      name: "Infolinks (in-text + in-fold)",
      ready: () => !!CFG.infolinks?.pid,
      load: async () => {
        loadInline(
          "var infolinks_pid = " + CFG.infolinks.pid +
          "; var infolinks_wsid = " + (CFG.infolinks.wsid || 0) + ";",
        );
        await loadScript("https://resources.infolinks.com/js/infolinks_main.js");
      },
    },
    monetag: {
      name: "Monetag (in-page push only)",
      ready: () => !!CFG.monetag?.zoneId && !!CFG.monetag?.tagDomain,
      load: async () => {
        // Monetag assigns a per-account tag domain; the zone id selects the
        // in-page-push format. Frequency capping is set in the dashboard.
        const s = document.createElement("script");
        s.src = "https://" + CFG.monetag.tagDomain + "/88/tag.min.js";
        s.setAttribute("data-zone", CFG.monetag.zoneId);
        s.async = true;
        s.setAttribute("data-cfasync", "false");
        document.head.appendChild(s);
      },
    },
    adsterra: {
      name: "Adsterra (native + display banners)",
      ready: () => !!CFG.adsterra?.bannerKey,
      load: async () => {
        // Adsterra banner tag: the key comes from the dashboard (Websites →
        // ad unit). The loader fills every [data-adsterra-slot] container.
        await loadScript(
          "https://www.profitablecpmrate.com/" + CFG.adsterra.bannerKey + "/invoke.js",
        );
      },
    },
    adcash: {
      name: "Adcash (display / native / in-page push)",
      ready: () => !!CFG.adcash?.zoneId,
      load: async () => {
        loadInline("var adcash_zone = '" + CFG.adcash.zoneId + "';");
        await loadScript("https://cdn.adcash.com/script/java/lib/anti.js");
      },
    },
    hilltopads: {
      name: "HilltopAds (banner / in-page push / video)",
      ready: () => !!CFG.hilltopads?.zoneId,
      load: async () => {
        await loadScript(
          "https://hilltopads.net/" + CFG.hilltopads.zoneId + "/tag.min.js",
        );
      },
    },
    clickadu: {
      name: "Clickadu (banner / in-page push / video pre-roll)",
      ready: () => !!CFG.clickadu?.zoneId,
      load: async () => {
        await loadScript(
          "https://cdn.clickadu.com/" + CFG.clickadu.zoneId + "/tag.min.js",
        );
      },
    },
    richads: {
      name: "RichAds (native / in-page push / pre-roll video)",
      ready: () => !!CFG.richads?.zoneId,
      load: async () => {
        await loadScript(
          "https://cdn.richads.com/" + CFG.richads.zoneId + "/tag.min.js",
        );
      },
    },
    evadav: {
      name: "Evadav (native / banner / in-page push)",
      ready: () => !!CFG.evadav?.zoneId,
      load: async () => {
        await loadScript(
          "https://cdn.evadav.com/" + CFG.evadav.zoneId + "/tag.min.js",
        );
      },
    },
    popads: {
      name: "PopAds — EXCLUDED (popunder-only, no safe format)",
      ready: () => false, // deliberately never loads (no-popunder rule)
      load: async () => {
        throw new Error("PopAds refused: popunder-only network");
      },
    },
    mondiad: {
      name: "Mondiad (native + banner)",
      ready: () => !!CFG.mondiad?.zoneId,
      load: async () => {
        await loadScript(
          "https://cdn.mondiad.com/" + CFG.mondiad.zoneId + "/tag.min.js",
        );
      },
    },
    medianet: {
      name: "Media.net (contextual native + display)",
      ready: () => !!CFG.medianet?.cid && !!CFG.medianet?.crid,
      load: async () => {
        loadInline(
          "var medianet_versionId = '121199'; " +
          "var medianet_crid = '" + CFG.medianet.crid + "';",
        );
        await loadScript(
          "https://contextual.media.net/dmedianet.js?cid=" + CFG.medianet.cid,
        );
      },
    },
  };

  // Status object for the footer/debug panel and INTEGRATION_STATUS.md.
  window.TRIALEARN_ADS_STATUS = {};
  const jobs = Object.keys(NETWORKS).map(async (key) => {
    const net = NETWORKS[key];
    const status = { name: net.name, configured: false, loaded: false, error: null };
    window.TRIALEARN_ADS_STATUS[key] = status;
    try {
      status.configured = net.ready();
      if (!status.configured) return; // code-ready, account pending
      await net.load();
      status.loaded = true;
    } catch (e) {
      status.error = String(e && e.message ? e.message : e);
    }
  });

  Promise.allSettled(jobs).then(() => {
    if (DEBUG) {
      console.table(window.TRIALEARN_ADS_STATUS);
      document.querySelectorAll(".adslot").forEach((el) => {
        const key = el.getAttribute("data-network");
        const st = window.TRIALEARN_ADS_STATUS[key];
        el.textContent =
          "AD SLOT [" + key + "]: " +
          (st ? (st.loaded ? "LOADED" : st.configured ? "CONFIGURED, load failed: " + st.error : "NOT CONFIGURED — account pending") : "unknown");
        el.style.display = "block";
      });
    }
  });
})();
