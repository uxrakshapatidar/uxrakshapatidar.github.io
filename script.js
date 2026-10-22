// =========================================================
// PORTFOLIO SCRIPTS
// You normally won't need to edit this file.
// Case-study content lives in content.js.
// Everything runs inside one function, so a password page can run this file
// again after it unlocks (top-level const names would clash otherwise).
// =========================================================
(() => {

const root = document.documentElement;

function getSaved(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
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

// ---- Audience tabs: swap the hero headline (arrow keys supported) ----
const tabs = [...document.querySelectorAll('[role="tab"]')];

function selectTab(tab, focus) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.setAttribute("aria-selected", selected);
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
  });
  if (focus) tab.focus();
  save("audience", tab.id);
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab, false));
  tab.addEventListener("keydown", (e) => {
    let next = null;
    if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
    if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === "Home") next = tabs[0];
    if (e.key === "End") next = tabs[tabs.length - 1];
    if (next) { e.preventDefault(); selectTab(next, true); }
  });
});
const savedTab = document.getElementById(getSaved("audience") || "");
if (savedTab && tabs.includes(savedTab)) selectTab(savedTab, false);

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
// a briefcase, then the type of product), a one-line outcome and the mockup.
// Tags are shown on the case-study page.
// A locked card tells screen readers in its link; its cover image shows the lock.
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
      <h3 class="project-title" id="p${num}-title"><a class="stretched" href="${escapeHTML(caseStudyHref(project))}"${project.locked ? " data-locked" : ""}><span class="sr-only">View case study: </span>${escapeHTML(project.title)}${project.locked ? `<span class="sr-only"> (password protected)</span>` : ""}</a></h3>
      <ul class="tags" aria-label="Company and type of product">
        ${project.company ? `<li class="tag-company"><svg aria-hidden="true"><use href="#briefcase"/></svg><span class="sr-only">Company: </span>${escapeHTML(project.company)}</li>` : ""}
        ${(project.type || []).map((t) => `<li>${escapeHTML(t)}</li>`).join("")}
      </ul>
    </div>
    ${project.outcome ? `<p class="project-outcome">${escapeHTML(project.outcome)}</p>` : ""}
    <div class="project-shot${project.image ? " has-image" : ""}">${shot}</div>`;
  return card;
}

const projectList = document.getElementById("projects");
if (projectList && Array.isArray(window.PROJECTS)) {
  window.PROJECTS.forEach((project, i) => projectList.appendChild(projectCard(project, i)));
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

  // When the list leaves the middle of the screen, no card is highlighted
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) projects.forEach((p) => p.classList.remove("is-active"));
    });
  }, zone).observe(projectList);
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
      if (list[i].href || list[i].image) { nextIndex = i; break; }
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

// ---- Current year in the footer ----
document.getElementById("year").textContent = new Date().getFullYear();

})();
