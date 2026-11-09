import { createFormScene } from "./form-engine.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const scenes = [
  createFormScene(document.querySelector("#hero-canvas"), { mode: "hero" }),
  createFormScene(document.querySelector("#process-canvas"), { mode: "story" }),
  createFormScene(document.querySelector("#material-canvas"), {
    mode: "material",
  }),
];
let paused = reduced.matches;
const motion = document.querySelector(".motion-toggle");
function setMotion() {
  scenes.forEach((scene) => scene.update({ paused }));
  motion.setAttribute("aria-pressed", String(paused));
  motion.innerHTML = paused
    ? '<span aria-hidden="true">▷</span> Wznów ruch'
    : '<span aria-hidden="true">Ⅱ</span> Wstrzymaj ruch';
  document.body.classList.toggle("motion-paused", paused);
}
motion.addEventListener("click", () => {
  paused = !paused;
  setMotion();
});
reduced.addEventListener("change", () => {
  paused = reduced.matches;
  setMotion();
});
setMotion();
document.querySelector("#year").textContent = new Date().getFullYear();
const toggle = document.querySelector(".menu-toggle"),
  links = document.querySelector(".navigation-links");
const coveredContent = document.querySelectorAll(
  "main, footer, .hero-heading, .hero-scene, .hero-note, .hero-foot, .shape-toggle",
);
const closeMenu = () => {
  coveredContent.forEach((element) => {
    element.inert = false;
  });
  toggle.setAttribute("aria-expanded", "false");
  links.classList.remove("is-open");
  document.body.classList.remove("menu-open");
};
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  links.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  coveredContent.forEach((element) => {
    element.inert = open;
  });
});
links.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab" && toggle.getAttribute("aria-expanded") === "true") {
    const items = [...document.querySelectorAll(".navigation a, .menu-toggle")];
    const first = items[0],
      last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    toggle.focus();
  }
});
window.addEventListener(
  "resize",
  () => {
    if (innerWidth > 700) closeMenu();
  },
  { passive: true },
);

const process = document.querySelector(".process");
const steps = [
  [
    "01 — 03",
    "Wszystko zaczyna się<br>od rozmowy.",
    "Pokaż szkic, opisz problem albo wyślij plik. Ustalimy, czego naprawdę potrzebujesz.",
  ],
  [
    "02 — 03",
    "Warstwa po warstwie.<br>Coraz bliżej.",
    "Dobieramy materiał, dopracowujemy model i testujemy detale. To moment na sprawdzenie pomysłu.",
  ],
  [
    "03 — 03",
    "Już nie tylko<br>w Twojej głowie.",
    "Drukuję i wykańczam element. Jedna sztuka lub mała seria — z terminem ustalonym wspólnie.",
  ],
];
let pending = false,
  previous = -1;
function updateScroll() {
  const rect = process.getBoundingClientRect();
  const progress = Math.max(
    0,
    Math.min(1, -rect.top / (process.offsetHeight - innerHeight)),
  );
  scenes[1].update({ progress });
  const index = progress < 0.27 ? 0 : progress < 0.73 ? 1 : 2;
  if (index !== previous) {
    previous = index;
    document.querySelector(".process-counter").textContent = steps[index][0];
    document.querySelector("#process-step-title").innerHTML = steps[index][1];
    document.querySelector("#process-step-copy").textContent = steps[index][2];
    document.querySelectorAll(".process-rail a").forEach((a, i) => {
      a.classList.toggle("active", i === index);
      if (i === index) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    });
  }
  pending = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(updateScroll);
    }
  },
  { passive: true },
);
window.addEventListener("resize", updateScroll, { passive: true });
updateScroll();
const materials = {
  pla: {
    color: "#9658ee",
    roughness: 0.2,
    category: "ESTETYKA & POMYSŁ",
    title: "Pierwsza forma<br>Twojego pomysłu.",
    copy: "Dekoracje, makiety i prototypy. PLA dobrze sprawdza się tam, gdzie liczy się detal, a element nie pracuje w wysokiej temperaturze.",
    swatch: "PLA / VIOLET",
  },
  petg: {
    color: "#dfff70",
    roughness: 0.13,
    category: "FUNKCJA & WYTRZYMAŁOŚĆ",
    title: "Na co dzień.<br>Do konkretnej pracy.",
    copy: "Uchwyty, obudowy i części użytkowe. PETG łączy wytrzymałość z lekką elastycznością. Dobry punkt wyjścia dla funkcjonalnych elementów.",
    swatch: "PETG / ACID",
  },
  tpu: {
    color: "#ff7d9f",
    roughness: 0.46,
    category: "ELASTYCZNOŚĆ & DOTYK",
    title: "Trochę mniej sztywno.<br>Dużo więcej możliwości.",
    copy: "Osłony, odbojniki i elastyczne detale. TPU ugina się tam, gdzie sztywny materiał nie wystarczy. Twardość dobieramy do zastosowania.",
    swatch: "TPU / PINK",
  },
};
document.querySelectorAll("[data-material]").forEach((button) =>
  button.addEventListener("click", () => {
    const data = materials[button.dataset.material];
    document
      .querySelectorAll("[data-material]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    scenes[2].update({ color: data.color, roughness: data.roughness });
    document.querySelector("#material-category").textContent = data.category;
    document.querySelector("#material-title").innerHTML = data.title;
    document.querySelector("#material-copy").textContent = data.copy;
    document.querySelector("#material-swatch").textContent = data.swatch;
  }),
);
window.addEventListener("pagehide", (event) => {
  if (!event.persisted) scenes.forEach((scene) => scene.dispose());
});

const shapeToggle = document.querySelector(".shape-toggle");
shapeToggle.addEventListener("click", () => {
  const changed = shapeToggle.getAttribute("aria-pressed") !== "true";
  shapeToggle.setAttribute("aria-pressed", String(changed));
  scenes[0].update({ morph: changed ? 1 : 0 });
});

// Keep the two local previews connected without changing production domains.
if (["localhost", "127.0.0.1"].includes(location.hostname)) {
  document.querySelectorAll('a[href="https://3d.karpas.pl"]').forEach((a) => {
    a.href = `${location.protocol}//${location.hostname}:8081/`;
  });
}
