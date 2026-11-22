// ============================================================================
// TrialEarn — shared layout: header nav, footer, sticky ad banner.
// Every public page loads this; page content lives in the page itself.
// The sticky bottom banner is a DISPLAY-ad slot only (Infolinks in-fold /
// Adsterra banner) — never an incentivized placement, never inside a task.
// ============================================================================
(function () {
  const CFG = window.TRIALEARN_CONFIG || {};
  const NAV = [
    ["index.html", "Home"],
    ["trials.html", "Free Trials"],
    ["surveys.html", "Surveys"],
    ["games.html", "Games"],
    ["cashback.html", "Cashback"],
    ["videos.html", "Videos"],
    ["music.html", "Music"],
    ["rewards.html", "Cash Out"],
    ["referral.html", "Refer Friends"],
    ["proof.html", "Payout Proof"],
  ];
  const here = location.pathname.split("/").pop() || "index.html";

  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML =
      '<div class="topbar"><div class="wrap topbar-in">' +
      '<a class="logo" href="index.html">🎁 Trial<b>Earn</b></a>' +
      '<nav class="nav">' +
      NAV.map(([href, label]) =>
        '<a href="' + href + '"' + (href === here ? ' class="active"' : "") + ">" + label + "</a>",
      ).join("") +
      "</nav>" +
      '<div class="userbox">' +
      '<span class="coins" id="coin-balance" title="1,000 coins = $1">— coins</span>' +
      '<span id="auth-area"><a class="btn ghost" href="rewards.html">Log in</a></span>' +
      "</div></div></div>";
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML =
      '<footer><div class="wrap">' +
      '<p><b style="color:#fff">TrialEarn</b> — Get paid for free trials, surveys and games. ' +
      "1,000 coins = $1. Cash out from $10 PayPal / $3 crypto.</p>" +
      '<p><a href="about.html">About</a> · <a href="contact.html">Contact</a> · ' +
      '<a href="terms.html">Terms of Service</a> · <a href="privacy.html">Privacy Policy</a> · ' +
      '<a href="proof.html">Payout Proof</a></p>' +
      '<p class="muted" style="color:#9ca3af">18+ only. One account per person. No VPNs, bots or ' +
      "multi-accounting. Coins are earned by completing offers from our advertising " +
      "partners — never by viewing or clicking display ads. Support: " +
      (CFG.SUPPORT_EMAIL || "support@playgamesearnmoney.com") + "</p>" +
      '<p class="muted" style="color:#9ca3af">TrialEarn is operated on ' +
      (CFG.SITE_DOMAIN || "trials.playgamesearnmoney.com") +
      ". Offer availability varies by country; US users earn the most.</p>" +
      "</div></footer>";
  }

  // Sticky anchor banner (display ads only; closable; never incentivized).
  if (!document.getElementById("sticky-ad")) {
    const bar = document.createElement("div");
    bar.className = "sticky-ad";
    bar.id = "sticky-ad";
    bar.innerHTML =
      '<button class="close-ad" aria-label="Close ad" onclick="this.parentElement.remove()">×</button>' +
      '<div class="adslot" data-network="adsterra" style="border:0;margin:0;min-height:50px">Advertisement</div>';
    document.body.appendChild(bar);
  }

  // Monetag push notifications — opt-in only, and only when configured.
  if (CFG.MONETAG_PUSH_ENABLED) {
    const btn = document.getElementById("push-optin");
    if (btn) {
      btn.style.display = "";
      btn.addEventListener("click", () => {
        if ("Notification" in window) {
          Notification.requestPermission().then((p) => {
            btn.textContent = p === "granted"
              ? "Notifications on — thanks!"
              : "Notifications off — no problem.";
          });
        }
      });
    }
  }
})();
