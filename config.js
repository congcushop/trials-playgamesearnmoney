// ============================================================================
// TrialEarn (site #3 — trials-led) — SITE CONFIG
// Fill in the values as accounts are approved. ANY value left empty means
// that stream stays dormant: no tag is loaded, no broken iframe is shown,
// and the section renders an honest "coming soon" state.
// NEVER put secret keys here — only public/publishable IDs and URLs.
// ============================================================================
window.TRIALEARN_CONFIG = {
  // --- Brand / site ---------------------------------------------------------
  SITE_NAME: "TrialEarn",
  SITE_DOMAIN: "trials.playgamesearnmoney.com",
  SITE_URL: "https://trials.playgamesearnmoney.com",
  SUPPORT_EMAIL: "support@playgamesearnmoney.com",

  // --- Shared Supabase backend (same project as sites #1 and #2) -----------
  SUPABASE_URL: "https://hqkjcwjqxhbhenvanteu.supabase.co", // e.g. "https://xxxxxxxx.supabase.co"
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxa2pjd2pxeGhiaGVudmFudGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzODUxMjEsImV4cCI6MjExMDk2MTEyMX0.y_J73wKX30ZSkB6iXtLpm5dvB3P_jpbHJOQzdC4rbGY", // publishable anon key only — never the service key

  // --- Coin economy (LOCKED — do not change without the owner) -------------
  COINS_PER_DOLLAR: 1000,
  USER_SHARE: 0.60, // user gets 60% of offerwall value
  REFERRAL_PCT: 0.10, // referrer earns 10% of referred user's earnings
  SIGNUP_BONUS_COINS: 250, // locked until first offer completes
  CHECKIN_COINS: 10, // per day; day-7 streak = 100
  CHECKIN_STREAK_BONUS_COINS: 100,
  WITHDRAW_MIN_PAYPAL_USD: 10,
  WITHDRAW_MIN_CRYPTO_USD: 3,
  LEVEL_CAPS_USD: { 1: 10, 2: 25, 3: 50 }, // max per withdrawal by level
  LEVEL_THRESHOLDS_OFFERS: { 2: 10, 3: 50 }, // offers completed to level up
  FIRST_WITHDRAWAL_HOLD_HOURS: "24–72h + manual review",
  PAYOUT_DAYS: "Tue + Fri (batched, daily cap applies)",
  DAILY_PAYOUT_CAP_USD: 500, // site-level cap per payout day

  // --- Offerwalls (shared with sites #1/#2 — ONE account each) ------------
  // Paste the placement iframe/embed URL from each dashboard.
  // Offerwall.GG: Placements → your placement → Embed (iframe URL).
  // AdGem: Property → Web Offerwall → embed URL (contains your app id).
  // The {USER_ID} token is replaced at runtime with the signed-in user id.
  OFFERWALL_GG_IFRAME_URL: "https://offerwall.gg/wall/5cdd431f1439b328ed3d0da1e0990f2a?userId={USER_ID}", // e.g. "https://offerwall.gg/wall/XXXX?userId={USER_ID}"
  ADGEM_WALL_URL: "", // e.g. "https://api.adgem.com/v1/wall?appid=XXXX&playerid={USER_ID}"

  // --- Extra survey routers -------------------------------------------------
  // CPX Research: dashboard → integration → survey wall URL (app_id + ext_user_id).
  // TheoremReach: dashboard → respondent link (api_key + user_id).
  CPX_WALL_URL: "", // e.g. "https://offers.cpx-research.com/index.php?app_id=XXXX&ext_user_id={USER_ID}"
  THEOREMREACH_URL: "", // e.g. "https://theoremreach.com/respondent?api_key=XXXX&user_id={USER_ID}"

  // --- Rewarded video (Phase 2, now installed) ----------------------------
  // Provider embed/zone for rewarded video. Only loads when configured.
  // NEVER reward users for watching display ads — rewarded video only.
  REWARDED_VIDEO_ZONE_URL: "",

  // --- Music retention (SliceThePie-style, tiny rewards only) --------------
  // Stream URL for the focus-music player. Empty = section shows "soon".
  MUSIC_STREAM_URL: "",

  // --- Cashback shopping (Phase 2, now installed) --------------------------
  // LIVE stores — the same 6 approved Rakuten/Impact deals as site #1
  // (js/config.js cashback.stores). Rates are the approved offer rates —
  // never invent a rate or a tracking link. Wondershare is approved on
  // BOTH networks at 30% (Impact Brand 59772 AND Rakuten MID 37160 /
  // Offer 2137962) — ONE card, using the Rakuten deep link, because the
  // Impact tracking URL needs an {Ad ID} chosen per asset in the Impact
  // dashboard and no Ad ID is on file. Do NOT invent an Ad ID.
  // The user gets 50% of each store's commission as coins.
  // Shape: { name, url, cashback } — cashback is the display string.
  CASHBACK_STORES: [
    { name: "Wondershare", category: "Software", cashback: "30%",
      desc: "Video, PDF & data tools — Dr.Fone Full Toolkit $139.95, Recoverit $79.99, MobileTrans $54.99.",
      network: "Rakuten + Impact",
      url: "https://click.linksynergy.com/link?id=%2fg%2fjHJaZtI4&offerid=2137962&type=2&murl=https%3A%2F%2Fwww.wondershare.com" },
    { name: "Keeper Security", category: "Security Software", cashback: "10%",
      desc: "Password manager & cybersecurity for families and teams. 10% base, up to $5 per action.",
      network: "Rakuten",
      url: "https://click.linksynergy.com/link?id=%2fg%2fjHJaZtI4&offerid=2065364&type=2&murl=https%3A%2F%2Fwww.keepersecurity.com" },
    { name: "Waterdrop Filter", category: "Home & Kitchen", cashback: "8%",
      desc: "Reverse-osmosis & gravity water filters for clean drinking water.",
      network: "Rakuten",
      url: "https://click.linksynergy.com/link?id=%2fg%2fjHJaZtI4&offerid=1888875&type=2&murl=https%3A%2F%2Fwww.waterdropfilter.com" },
    { name: "Easy Plumbing", category: "Home & Garden", cashback: "5%",
      desc: "KOHLER & Moen fixtures, faucets, sinks and bath furniture.",
      network: "Rakuten",
      url: "https://click.linksynergy.com/link?id=%2fg%2fjHJaZtI4&offerid=1898982&type=2&murl=https%3A%2F%2Fwww.easyplumbing.com" },
    { name: "KitchenAid", category: "Appliances", cashback: "2%",
      desc: "Stand mixers & major kitchen appliances.",
      network: "Rakuten", badge: "Ends 7 Dec 2026",
      url: "https://click.linksynergy.com/link?id=%2fg%2fjHJaZtI4&offerid=1972089&type=2&murl=https%3A%2F%2Fwww.kitchenaid.com" },
    { name: "Paw.com", category: "Pet Supplies", cashback: "2%",
      desc: "Pet beds, carriers & accessories.",
      network: "Rakuten",
      url: "https://click.linksynergy.com/link?id=%2fg%2fjHJaZtI4&offerid=1783560&type=2&murl=https%3A%2F%2Fwww.paw.com" },
  ],

  // --- Fraud layer ----------------------------------------------------------
  TURNSTILE_SITE_KEY: "", // Cloudflare Turnstile site key (signup/login/withdraw)
  FINGERPRINTJS_ENABLED: true, // open-source FingerprintJS via CDN

  // --- Ad networks: ALL 11 no-minimum networks ----------------------------
  // Safe formats ONLY: banners, native, in-text, in-page push.
  // NO popunders. NEVER reward users for viewing/clicking display ads.
  // A network with an empty id is NOT loaded (code-ready, account pending).
  ADS: {
    // 1. Infolinks — in-text + in-fold only (no interstitial/sticky).
    infolinks: { pid: "", wsid: 0 },
    // 2. Monetag — in-page push ONLY, frequency-capped. No popunder/push/SmartLink.
    monetag: { zoneId: "", tagDomain: "" }, // tagDomain assigned per account, e.g. "fpyf8.com"
    // 3. Adsterra — native + display banners ONLY. No popunder/Social Bar/SmartLink.
    adsterra: { bannerKey: "" },
    // 4. Adcash — display/native/in-page push only. No popunder/interstitial/Autotag.
    adcash: { zoneId: "" },
    // 5. HilltopAds — banner/in-page push/video only. No popunder/MultiTag/Direct Link.
    hilltopads: { zoneId: "" },
    // 6. Clickadu — banner/in-page push/video pre-roll only. No popunder/push/SKIM.
    clickadu: { zoneId: "" },
    // 7. RichAds — native/in-page push/pre-roll video only. No push/popunder/Direct Click.
    richads: { zoneId: "" },
    // 8. Evadav — native/banner/in-page push only. No push/popunder.
    evadav: { zoneId: "" },
    // 9. PopAds — POPUNDER-ONLY network: NO safe format exists.
    //    Deliberately NOT loaded (no-popunder rule). Account pending; add only
    //    if the owner explicitly approves ONE capped popunder later.
    popads: { enabled: false, note: "popunder-only, excluded by rule" },
    // 10. Mondiad — native + banner only. No popunder/push/interstitial.
    mondiad: { zoneId: "" },
    // 11. Media.net — contextual native + display. Apply early; add when accepted.
    medianet: { cid: "", crid: "" },
  },

  // --- Monetag push notifications (opt-in only) -----------------------------
  MONETAG_PUSH_ENABLED: false, // turn on only after user opts in, test carefully
};
