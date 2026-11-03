// =========================================================
// PORTFOLIO SCRIPTS
// You normally won't need to edit this file.
// Case-study content lives in content.js.
// Everything runs inside one function, so a password page can run this file
// again after it unlocks (top-level const names would clash otherwise).
// =========================================================
(() => {

const root = document.documentElement;

function save(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}

// ---- Light / dark mode ----
// Dark mode is off for now (phase 2): the pages have no theme button, so this
// only runs again once a button with id="theme-toggle" is put back (see the
// note on the dark theme in style.css).
const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  const prefersDark = matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.getAttribute("data-theme") || (prefersDark.matches ? "dark" : "light");
  const syncThemeToggle = () => themeToggle.setAttribute("aria-pressed", String(currentTheme() === "dark"));

  syncThemeToggle();
  prefersDark.addEventListener("change", syncThemeToggle);
  themeToggle.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    save("theme", next);
    syncThemeToggle();
  });
}

// ---- Mobile menu ----
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", open);
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navLinks.classList.contains("open")) {
    setMenu(false);
    menuToggle.focus();
  }
});

// ---- Header border on scroll ----
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", scrollY > 8);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---- Case-study cards (data in content.js) ----
const escapeHTML = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// The project's brand colour (or a fallback tint) becomes --tint for the element
function applyProjectColor(el, project, index) {
  if (project.color) {
    el.classList.add("has-color");
    el.style.setProperty("--project-color", project.color);
  } else {
    const tint = [1, 2, 3].includes(project.tint) ? project.tint : (index % 3) + 1;
    el.classList.add(`tint-${tint}`);
  }
}
const caseStudyHref = (project) =>
  project.href || `case-study.html?project=${encodeURIComponent(project.slug || "")}`;

// Card: the project's name (H3), chips on the right (the company first, with
// a briefcase, or what it was built with, with a tool icon, then the type of product), a one-line outcome and the mockup.
// Tags are shown on the case-study page.
// A locked card tells screen readers in its link; its cover image shows the lock.
// A project with no case-study page yet (live in content.js) has a plain title;
// its "Try the live tool" link covers the card and opens in a new tab.
function projectCard(project, index) {
  const num = String(index + 1).padStart(2, "0");
  const shot = project.image
    ? `<img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.alt)}">`
    : `<div class="shot-placeholder"><svg aria-hidden="true"><use href="#image"/></svg><span>Add your project screenshot</span></div>`;

  const card = document.createElement("article");
  card.className = "project has-stretched";
  applyProjectColor(card, project, index);
  card.setAttribute("aria-labelledby", `p${num}-title`);
  card.innerHTML = `
    <div class="project-head">
      <h3 class="project-title" id="p${num}-title">${project.live ? escapeHTML(project.title) : `<a class="stretched" href="${escapeHTML(caseStudyHref(project))}"${project.locked ? " data-locked" : ""}><span class="sr-only">View case study: </span>${escapeHTML(project.title)}${project.locked ? `<span class="sr-only"> (password protected)</span>` : ""}</a>`}</h3>
      <ul class="tags" aria-label="${project.company ? "Company and type of product" : "About this project"}">
        ${project.company ? `<li class="tag-company"><svg aria-hidden="true"><use href="#briefcase"/></svg><span class="sr-only">Company: </span>${escapeHTML(project.company)}</li>` : ""}
        ${project.tool ? `<li class="tag-company"><svg aria-hidden="true"><use href="#wrench"/></svg><span class="sr-only">Built with: </span>${escapeHTML(project.tool)}</li>` : ""}
        ${(project.type || []).map((t) =>`<li>${escapeHTML(t)}</li>`).join("")}
      </ul>
    </div>
    ${project.outcome ? `<p class="project-outcome">${escapeHTML(project.outcome)}</p>` : ""}
    ${project.live ? `<p class="project-live"><a class="stretched" href="${escapeHTML(project.live)}" target="_blank" rel="noopener">Try the live tool<svg class="ext" aria-hidden="true"><use href="#arrow-up-right"/></svg><span class="sr-only"> (opens in a new tab)</span></a><span class="project-soon">Case study coming soon</span></p>` : ""}
    <div class="project-shot${project.image ? " has-image" : ""}">${shot}</div>`;
  return card;
}

const projectList = document.getElementById("projects");
const aiList = document.getElementById("ai-projects");
if (projectList && Array.isArray(window.PROJECTS)) {
  window.PROJECTS.forEach((project, i) => (project.group === "ai" && aiList ? aiList : projectList).appendChild(projectCard(project, i)));
}

// ---- Project highlight: the card in the middle of the screen lifts ----
// (Other cards stay at full contrast; nothing is faded.)
const projects = [...document.querySelectorAll(".project")];

if ("IntersectionObserver" in window && projects.length) {
  const zone = { rootMargin: "-45% 0px -45% 0px" }; // thin band across the middle of the screen

  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        projects.forEach((p) => p.classList.toggle("is-active", p === entry.target));
      }
    });
  }, zone);
  projects.forEach((p) => projectObserver.observe(p));

  // When a list leaves the middle of the screen, none of its cards is highlighted
  const listObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) entry.target.querySelectorAll(".project").forEach((p) => p.classList.remove("is-active"));
    });
  }, zone);
  document.querySelectorAll(".projects").forEach((list) => listObserver.observe(list));
}

// ---- Case-study pages ----
// The template (case-study.html?project=slug) fills its header from content.js.
// A finished case study (e.g. primetrack.html) names its project with
// data-project="slug" and writes its own header; only the colour and the
// "Next case study" link come from content.js.
const caseStudy = document.getElementById("case-study");
if (caseStudy && Array.isArray(window.PROJECTS) && window.PROJECTS.length) {
  const list = window.PROJECTS;
  const slug = caseStudy.dataset.project || new URLSearchParams(location.search).get("project");
  const index = Math.max(0, list.findIndex((p) => p.slug === slug));
  const project = list[index];
  const field = (name) => caseStudy.querySelector(`[data-field="${name}"]`);
  const fill = (name, update) => { const el = field(name); if (el) update(el); };

  fill("company", (el) => { el.textContent = project.company || ""; });
  fill("title", (el) => {
    el.textContent = project.title || "";
    document.title = `${project.title} · Raksha Patidar`;
  });
  fill("outcome", (el) => { el.textContent = project.outcome || ""; });
  fill("tags", (el) => el.replaceChildren(
    ...(project.tags || []).slice(0, 3).map((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      return li;
    })
  ));
  if (project.image) {
    fill("cover", (el) => {
      const img = document.createElement("img");
      img.src = project.image;
      img.alt = project.alt || "";
      el.replaceChildren(img);
      el.classList.add("has-image");
    });
  }
  applyProjectColor(caseStudy, project, index);

  // "Next case study": the next project that has a finished case study
  // (its own page or a screenshot). If there is none yet, link back to all work.
  fill("next", (link) => {
    let nextIndex = -1;
    for (let step = 1; step < list.length; step++) {
      const i = (index + step) % list.length;
      if (!list[i].live && (list[i].href || list[i].image)) { nextIndex = i; break; }
    }
    const label = link.querySelector("[data-field='next-label']");
    const title = link.querySelector("[data-field='next-title']");
    if (nextIndex >= 0) {
      const next = list[nextIndex];
      link.href = caseStudyHref(next);
      if (label) label.textContent = "Next case study";
      title.textContent = next.title;
      applyProjectColor(link, next, nextIndex);
    } else {
      link.href = "index.html#work";
      if (label) label.textContent = "More work";
      title.textContent = "Back to all case studies";
    }
  });
}

// ---- Case-study contents (style.css: "Contents") ----
// Built from the numbered sections (a .section-num above an <h2> with an id):
// a list beside the text on laptops, a pill that opens the list on tablets and
// phones. CSS shows one or the other. Both mark the section on screen
// (aria-current="location") and show how far through the story you are.
const tocSections = [...document.querySelectorAll(".case-section")]
  .filter((s) => s.querySelector(":scope > .section-num") && s.querySelector(":scope > h2[id]"));
if (tocSections.length >= 3) {
  const tocItems = tocSections.map((s) => {
    const h2 = s.querySelector(":scope > h2");
    return { id: h2.id, title: h2.textContent.trim(), num: s.querySelector(":scope > .section-num").textContent.trim() };
  });
  const tocTotal = String(tocItems.length).padStart(2, "0");

  const rail = document.createElement("nav");
  rail.className = "case-rail";
  rail.setAttribute("aria-label", "Case study sections");
  rail.innerHTML = `
    <p class="case-rail-label">On this page</p>
    <ol>${tocItems.map((i) => `<li><a href="#${i.id}">${escapeHTML(i.title)}</a></li>`).join("")}</ol>`;

  const pill = document.createElement("div");
  pill.className = "case-pill";
  pill.innerHTML = `
    <nav class="case-pill-menu" id="case-pill-menu" aria-label="Case study sections" hidden>
      <ol>${tocItems.map((i) => `<li><a href="#${i.id}"><span class="case-pill-num" aria-hidden="true">${escapeHTML(i.num)}</span>${escapeHTML(i.title)}</a></li>`).join("")}</ol>
    </nav>
    <button class="case-pill-btn" type="button" aria-expanded="false" aria-controls="case-pill-menu">
      <span class="sr-only">Case study sections, now reading </span>
      <span class="case-pill-count"></span><span class="case-pill-title"></span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>
    </button>`;
  tocSections[0].before(rail, pill);

  const railList = rail.querySelector("ol");
  const links = [...rail.querySelectorAll("a"), ...pill.querySelectorAll("a")];
  const pillBtn = pill.querySelector("button");
  const pillMenu = pill.querySelector("nav");
  const pillCount = pill.querySelector(".case-pill-count");
  const pillTitle = pill.querySelector(".case-pill-title");

  // The pill's list closes on a choice, on Escape and on a click outside it
  const setPillOpen = (open) => {
    pillMenu.hidden = !open;
    pillBtn.setAttribute("aria-expanded", open);
  };
  pillBtn.addEventListener("click", () => setPillOpen(pillMenu.hidden));
  pillMenu.addEventListener("click", (e) => { if (e.target.closest("a")) setPillOpen(false); });
  document.addEventListener("click", (e) => { if (!pill.contains(e.target)) setPillOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !pillMenu.hidden) { setPillOpen(false); pillBtn.focus(); }
  });

  let currentIndex = null;
  const updateContents = () => {
    const line = innerHeight * 0.4;   // the section crossing this line is the current one
    const tops = tocSections.map((s) => s.getBoundingClientRect().top);
    const last = tocSections[tocSections.length - 1].getBoundingClientRect();
    let index = -1;
    tops.forEach((top, n) => { if (top <= line) index = n; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) index = tocSections.length - 1;   // the very end of the page

    // Both appear when the story starts and leave when it ends
    const on = tops[0] < innerHeight * 0.75 && last.bottom > innerHeight * 0.25;
    rail.classList.toggle("is-on", on);
    pill.classList.toggle("is-on", on);
    if (!on) setPillOpen(false);

    if (index !== currentIndex) {
      currentIndex = index;
      const href = index >= 0 ? `#${tocItems[index].id}` : null;
      links.forEach((a) => (a.getAttribute("href") === href ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current")));
      const shown = tocItems[Math.max(index, 0)];
      pillCount.textContent = `${shown.num}/${tocTotal}`;
      pillTitle.textContent = shown.title;
    }

    // The pill's line: how far through the whole story
    const start = tops[0] + scrollY - line;
    const end = last.bottom + scrollY - innerHeight;
    const progress = Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, end - start)));
    pillBtn.style.setProperty("--progress", `${(progress * 100).toFixed(1)}%`);

    // The list's line: down to the current section, then through it as you read
    if (index >= 0) {
      const box = tocSections[index].getBoundingClientRect();
      const through = Math.min(1, Math.max(0, (line - box.top) / Math.max(1, box.height)));
      const item = railList.children[index];
      railList.style.setProperty("--fill", `${(item.offsetTop + item.offsetHeight * through).toFixed(1)}px`);
    } else {
      railList.style.setProperty("--fill", "0px");
    }
  };
  let contentsFrame = 0;
  const queueContents = () => {
    if (!contentsFrame) contentsFrame = requestAnimationFrame(() => { contentsFrame = 0; updateContents(); });
  };
  addEventListener("scroll", queueContents, { passive: true });
  addEventListener("resize", queueContents);
  if (document.fonts) document.fonts.ready.then(queueContents);
  updateContents();
}

// ---- Password-protected case studies ----
// A project with locked: true in content.js is published as a password page
// (site-tools/publish.ps1): the case study is encrypted inside it, and only the
// right password opens it. Its Work card and the page itself show a small
// password dialog. The tab remembers the password until it is closed.
// In the local preview the page isn't encrypted, so any password opens it.
const LOCK_ROUNDS = 600000;
const unlockKey = (url) => "unlock:" + new URL(url, location.href).pathname.split("/").pop();
const lockPayloadIn = (html) => (html.match(/<script type="text\/plain" id="lock-payload">([^<]+)<\/script>/) || [])[1];

async function openLocked(payload, password) {
  const all = Uint8Array.from(atob(payload.trim()), (c) => c.charCodeAt(0));
  const salt = all.slice(0, 16), iv = all.slice(16, 28), data = all.slice(28);
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: LOCK_ROUNDS, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data));   // fails if the password is wrong
}

// The dialog: title with a lock, a close button, one field and Unlock.
// onUnlock(password) resolves when it worked and throws when the password is wrong.
function lockDialog({ onUnlock, onClose }) {
  const dialog = document.createElement("dialog");
  dialog.className = "lock-dialog";
  dialog.setAttribute("aria-labelledby", "lock-title");
  dialog.innerHTML = `
    <form class="lock-form" novalidate>
      <div class="lock-head">
        <h2 class="h5" id="lock-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Password protected</h2>
        <button class="icon-btn lock-close" type="button" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <p class="lock-text">This case study is password protected. Enter the password to read it.</p>
      <label class="h6" for="lock-password">Password</label>
      <div class="lock-row">
        <input id="lock-password" type="password" autocomplete="off" required>
        <button class="lock-submit" type="submit">Unlock</button>
      </div>
      <p class="lock-error" role="alert" hidden>That password isn't right. Please try again.</p>
      <p class="lock-help">Don't have it? <a href="mailto:ux.rakshapatidar@gmail.com?subject=Password%20for%20the%20Tellora%20case%20study">Email me</a> and I'll send it to you.</p>
    </form>`;
  document.body.appendChild(dialog);
  const form = dialog.querySelector("form"), input = dialog.querySelector("input"),
        submit = dialog.querySelector(".lock-submit"), error = dialog.querySelector(".lock-error");
  dialog.querySelector(".lock-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });   // a click on the dimmed backdrop
  dialog.addEventListener("close", () => { dialog.remove(); if (onClose) onClose(); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!input.value) { input.focus(); return; }
    error.hidden = true; submit.disabled = true; submit.textContent = "Unlocking…";
    try { await onUnlock(input.value); }
    catch (err) { error.hidden = false; submit.disabled = false; submit.textContent = "Unlock"; input.select(); }
  });
  dialog.showModal();
  input.focus();
}

// The published password page: open it from the remembered password, or ask
const lockPayload = document.getElementById("lock-payload");
if (lockPayload) {
  const key = unlockKey(location.href);
  const show = (html) => { document.open(); document.write(html); document.close(); };
  const ask = () => lockDialog({
    onUnlock: async (password) => {
      const html = await openLocked(lockPayload.textContent, password);
      try { sessionStorage.setItem(key, password); } catch (e) { /* ignore */ }
      show(html);
    },
    onClose: () => { location.href = "index.html#work"; },
  });
  let saved = null;
  try { saved = sessionStorage.getItem(key); } catch (e) { /* ignore */ }
  if (saved) openLocked(lockPayload.textContent, saved).then(show, () => ask());
  else ask();
}

// A locked Work card opens the dialog first, then goes to the page already unlocked
if (projectList) {
  projectList.addEventListener("click", (e) => {
    const link = e.target.closest("a[data-locked]");
    if (!link || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // new tabs go straight to the page
    e.preventDefault();
    const target = link.href, page = fetch(target).then((r) => r.text());   // loads while they type
    lockDialog({
      onUnlock: async (password) => {
        const payload = lockPayloadIn(await page);
        if (payload) await openLocked(payload, password);
        try { sessionStorage.setItem(unlockKey(target), password); } catch (err) { /* ignore */ }
        location.href = target;
      },
    });
  });
}

// ---- Motion: Framer-style (section 11 of style.css) ----
// The hero headline rises word by word, sections fade up as they scroll in,
// arrow circles follow the pointer and the header tucks away on the way down.
// Nothing moves for "reduce motion". Runs after the Work cards are built.
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  root.classList.add("motion-on");

  // Hero headline: every word in its own mask
  const heroTitles = [...document.querySelectorAll(".hero h1")];
  heroTitles.forEach((h1) => {
    let n = 0;
    h1.querySelectorAll(".line").forEach((line) => {
      const words = line.textContent.trim().split(/\s+/);
      line.textContent = "";
      words.forEach((word, i) => {
        const mask = document.createElement("span");
        mask.className = "w";
        const inner = document.createElement("span");
        inner.textContent = word;
        inner.style.setProperty("--w", n++);
        mask.append(inner);
        line.append(mask);
        if (i < words.length - 1) line.append(" ");
      });
    });
  });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(() =>
    heroTitles.forEach((h1) => h1.classList.add("is-in"))));  // Reveal on scroll; "stagger" makes siblings arrive one after another
  const reveal = (selector, stagger) => document.querySelectorAll(selector).forEach((el) => {
    el.setAttribute("data-reveal", "");
    if (stagger) {
      const siblings = [...el.parentElement.children].filter((c) => c.matches(selector));
      el.style.setProperty("--i", siblings.indexOf(el) % 6);
    }
  });
  // Home page
  reveal(".hero-intro");
  reveal(".section-head");
  reveal(".section-intro");
  reveal(".project");
  reveal(".bento .tile", true);
  reveal(".statement");
  reveal(".xp");
  reveal(".footer-top > *", true);
  // Case-study pages
  reveal(".case-hero > *", true);
  reveal(".case-meta");
  reveal(".case-cover");
  reveal(".case-figure");
  reveal(".cs-card, .cs-cell, .cs-stat", true);
  reveal(".cs-panel, .case-decision, .case-quote, .case-flow, .persona-group, .next-case");

  const revealed = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealed.forEach((el) => revealObserver.observe(el));
  } else {
    revealed.forEach((el) => el.classList.add("is-in"));
  }

  // Arrow circles follow the pointer a little (magnetic), on mouse and trackpad only
  if (matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".circle-btn").forEach((btn) => {
      const zone = btn.closest(".has-circle, .footer-email, .next-case") || btn;
      zone.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        btn.style.translate = Math.hypot(dx, dy) > 180 ? "" : `${(dx * 0.3).toFixed(1)}px ${(dy * 0.3).toFixed(1)}px`;
      });
      zone.addEventListener("pointerleave", () => { btn.style.translate = ""; });
    });
  }

  // The header tucks away going down and comes back going up. It stays while
  // the menu is open, and comes back as soon as anything in it gets keyboard focus.
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    const keep = navLinks.classList.contains("open") || header.contains(document.activeElement);
    if (keep || y <= 160 || y < lastY - 2) header.classList.remove("is-tucked");
    else if (y > lastY + 2) header.classList.add("is-tucked");
    lastY = y;
  }, { passive: true });
  header.addEventListener("focusin", () => header.classList.remove("is-tucked"));
}

// ---- The hero squiggle ----
// A tangle that ends in one decision; a click or tap tidies it into a case study's straight line.
// The hint is a tooltip, nothing permanent: it follows the cursor, and on a touch screen
// it sits above the line until the first tap.
const squiggle = document.querySelector(".squiggle");
if (squiggle) {
  const moving = root.classList.contains("motion-on");
  const path = squiggle.querySelector(".squiggle-path");
  const tip = squiggle.querySelector(".squiggle-tip");
  const canHover = matchMedia("(hover: hover)").matches;
  const PUNCHLINE = "How it looks in a case study";
  const CLICK_HINT = "Click to tidy it up";
  const smooth = (v) => { const n = Math.min(1, Math.max(0, v)); return n * n * (3 - 2 * n); };
  // Rounds off any sharp corners, so it reads as one confident hand-drawn line
  const soften = (list) => list.map((_, i) => {
    const from = Math.max(0, i - 9), to = Math.min(list.length - 1, i + 9);
    let sum = 0;
    for (let j = from; j <= to; j++) sum += list[j];
    return sum / (to - from + 1);
  });
  // A dense ball of loops above the baseline. It opens out, comes down as a wave and runs straight to the dot.
  const draw = (calmness) => {
    const wild = 1 - calmness;
    const xs = [], ys = [];
    for (let i = 0; i <= 1400; i++) {
      const t = i / 1400;
      const mess = Math.max(0, 1 - t / 0.76) * wild;
      const turn = t * 2 * Math.PI * 17 + 0.8 * Math.sin(t * 19) + 2.6;
      const across = 5 + wild * 98 + (449 - wild * 98) * Math.pow(t, 1 + wild * 0.62);
      const lift = wild * 122 * (1 - smooth((t - 0.38) / 0.38));
      xs.push(across + mess * (100 * Math.cos(turn) + 22 * Math.cos(2.37 * turn + 1) + 12 * Math.sin(t * 61)));
      ys.push(244 - lift + mess * (104 * Math.sin(turn * 0.97 + 0.5) + 20 * Math.sin(1.71 * turn + 2) + 8 * Math.cos(t * 47)));
    }
    const sx = soften(soften(xs)), sy = soften(soften(ys));
    path.setAttribute("d", sx.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)} ${sy[i].toFixed(1)}`).join(""));
  };
  draw(0);
  // The dots on the neat line sit exactly above their labels
  const placeTicks = () => {
    const art = squiggle.querySelector("svg").getBoundingClientRect();
    if (!art.width) return;
    const ticks = squiggle.querySelectorAll(".squiggle-tick");
    squiggle.querySelectorAll(".squiggle-labels .is-neat > span").forEach((label, i) => {
      if (!ticks[i]) return;
      const box = label.getBoundingClientRect();
      ticks[i].setAttribute("cx", ((box.left + box.width / 2 - art.left) * 460 / art.width).toFixed(1));
    });
  };
  addEventListener("resize", placeTicks);
  placeTicks();
  if (document.fonts) document.fonts.ready.then(placeTicks);

  let calm = 0, goal = 0, frame = 0;
  const step = () => {
    calm += (goal - calm) * 0.085;
    if (Math.abs(goal - calm) < 0.002) calm = goal;
    draw(calm);
    frame = calm === goal ? 0 : requestAnimationFrame(step);
  };
  const tidy = (on) => {
    goal = on ? 1 : 0;
    squiggle.classList.toggle("is-tidy", on);
    squiggle.setAttribute("aria-pressed", on);
    if (!moving) { calm = goal; draw(calm); }
    else if (!frame) frame = requestAnimationFrame(step);
  };

  let tipTimer = 0;
  const showTip = (text, fixed) => {
    tip.textContent = text;
    tip.classList.toggle("is-fixed", fixed);
    tip.classList.add("is-on");
  };
  const hideTip = () => tip.classList.remove("is-on");
  const reset = () => { tidy(false); hideTip(); };
  const tipToCursor = (e) => {
    const art = tip.parentElement.getBoundingClientRect();
    const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 12) - art.left;
    tip.style.setProperty("--x", `${Math.round(x)}px`);
    tip.style.setProperty("--y", `${Math.round(e.clientY + 20 - art.top)}px`);
  };
  if (canHover) {
    squiggle.addEventListener("pointerenter", (e) => { tipToCursor(e); showTip(CLICK_HINT, false); });
    squiggle.addEventListener("pointermove", tipToCursor);
    squiggle.addEventListener("pointerleave", reset);
  } else {
    tipTimer = setTimeout(() => showTip("Tap to tidy it up", true), moving ? 3400 : 300);   // after the line has drawn
  }
  squiggle.addEventListener("click", (e) => {
    const on = goal === 0;
    clearTimeout(tipTimer);
    tidy(on);
    if (canHover && e.detail > 0) showTip(on ? PUNCHLINE : CLICK_HINT, false);
    else if (on) showTip(PUNCHLINE, true);
    else hideTip();
  });
  squiggle.addEventListener("focus", () => {
    if (!squiggle.matches(":focus-visible")) return;
    clearTimeout(tipTimer);
    showTip("Press Enter to tidy it up", true);
  });
  squiggle.addEventListener("blur", reset);
  // Escape always dismisses the tooltip (WCAG 1.4.13)
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") reset(); });
}

// ---- Current year in the footer ----
document.getElementById("year").textContent = new Date().getFullYear();

})();
