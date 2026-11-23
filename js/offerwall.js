// ============================================================================
// TrialEarn — offerwall + survey-router embeds.
// Each wall loads ONLY when its URL is set in config.js; otherwise the
// container shows an honest "offers are being connected" state.
// The offerwall iframe is the EARNING flow — display ads are never placed
// inside it (compliance: no incentivized ad traffic).
// {USER_ID} in a URL is replaced with the signed-in user's id at runtime.
// ============================================================================
(function () {
  const CFG = window.TRIALEARN_CONFIG || {};
  let currentUserId = null;

  // app.js sets this when the session is known; offerwall init waits for it.
  window.TRIALEARN_SET_USER = function (uid) {
    currentUserId = uid;
    mountWalls();
  };

  function fillUrl(tpl) {
    return tpl.replace("{USER_ID}", encodeURIComponent(currentUserId || "guest"));
  }

  function mountOne(el) {
    const kind = el.getAttribute("data-wall");
    const map = {
      offerwall_gg: CFG.OFFERWALL_GG_IFRAME_URL,
      adgem: CFG.ADGEM_WALL_URL,
      cpx: CFG.CPX_WALL_URL,
      theoremreach: CFG.THEOREMREACH_URL,
    };
    const url = map[kind] || "";
    if (!url) {
      // Honest placeholder for a wall that is genuinely not configured yet.
      // Name the wall so it is never mistaken for the live one above it,
      // and never mention tables/steps that do not exist.
      const names = {
        adgem: "AdGem",
        cpx: "CPX Research",
        theoremreach: "TheoremReach",
        offerwall_gg: "Offerwall.GG",
      };
      const name = names[kind] || kind;
      el.innerHTML =
        '<div class="warn"><b>More offers (' + name + ') are coming soon.</b> ' +
        "This wall is being connected — the Offerwall.GG wall above is live " +
        "and already shows offers. Check back soon for a second wall here.</div>";
      return;
    }
    if (el.getAttribute("data-mounted") === "1") return;
    el.setAttribute("data-mounted", "1");
    const frame = document.createElement("iframe");
    frame.src = fillUrl(url);
    frame.style.cssText = "width:100%;height:720px;border:2px solid #dbeafe;border-radius:16px;background:#fff";
    frame.setAttribute("title", "Offer wall — " + kind);
    frame.setAttribute("allow", "clipboard-write");
    el.innerHTML = "";
    el.appendChild(frame);
  }

  function mountWalls() {
    document.querySelectorAll("[data-wall]").forEach(mountOne);
  }

  document.addEventListener("DOMContentLoaded", mountWalls);
})();
