// Scripts du site Chez Lucette
// en-tête, fondus, menu mobile, horaires (badge ouvert/fermé), plan Google Maps au clic,
// galerie, navigation de la carte, formulaire de réservation

const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const LAST_BOOKING_BEFORE_CLOSE = 60; // minutes : dernière réservation 1h avant la fermeture
const BOOKING_DAYS_AHEAD = 60;

// Menu plein écran
const menuBtn = document.querySelector(".menu-btn");
const overlay = document.querySelector(".overlay");

if (menuBtn && overlay) {
  const label = menuBtn.querySelector(".menu-btn__label");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    label.textContent = open ? "Fermer" : "Menu";
    if (open) overlay.querySelector("a").focus();
  };
  menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  // referme le menu au clic sur un lien (ancres de la même page) ou avec Échap
  overlay.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });
}

// En-tête : hauteur réelle (bandeau de démo inclus) et fond opaque au défilement
const header = document.querySelector(".header");
if (header) {
  const setHeight = () =>
    document.documentElement.style.setProperty("--header-total", `${header.offsetHeight}px`);
  const setSolid = () => header.classList.toggle("is-solid", window.scrollY > 40);
  setHeight();
  setSolid();
  window.addEventListener("resize", setHeight);
  window.addEventListener("scroll", setSolid, { passive: true });
}

// Apparition en fondu des blocs au défilement
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

// Année du pied de page
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ---------- Horaires ----------
// Source unique : le tableau HTML (data-day, data-slots="12:00-14:30,19:00-22:30").
// Le contenu reste lisible par Google même sans JavaScript.

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// 870 -> "14h30", 720 -> "12h"
const formatTime = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
};

function readHours() {
  const table = document.querySelector("[data-hours]");
  if (!table) return null;
  const hours = {};
  table.querySelectorAll("tr[data-day]").forEach((row) => {
    const slots = row.dataset.slots.trim();
    hours[row.dataset.day] = slots
      ? slots.split(",").map((s) => s.split("-").map(toMinutes))
      : [];
  });
  return hours;
}

// Heure de Paris, quel que soit le fuseau du visiteur
function parisNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  const date = new Date(get("year"), get("month") - 1, get("day"));
  return { date, day: date.getDay(), minutes: get("hour") * 60 + get("minute") };
}

const hours = readHours();

if (hours) {
  const now = parisNow();

  // ligne du jour mise en avant
  document.querySelectorAll(`[data-hours] tr[data-day="${now.day}"]`).forEach((row) => {
    row.classList.add("is-today");
  });

  // badge "Ouvert / Fermé"
  const status = document.querySelector("[data-status]");
  if (status) {
    const today = hours[now.day] || [];
    const current = today.find(([open, close]) => now.minutes >= open && now.minutes < close);

    if (current) {
      const left = current[1] - now.minutes;
      status.textContent = left <= 30
        ? `Ouvert, ferme bientôt (${formatTime(current[1])})`
        : `Ouvert en ce moment, jusqu'à ${formatTime(current[1])}`;
      status.classList.add("is-open");
    } else {
      // prochain service : plus tard aujourd'hui, sinon les jours suivants
      let text = "Fermé en ce moment";
      const laterToday = today.find(([open]) => open > now.minutes);
      if (laterToday) {
        text = `Fermé, ouvre aujourd'hui à ${formatTime(laterToday[0])}`;
      } else {
        for (let i = 1; i <= 7; i++) {
          const d = (now.day + i) % 7;
          if (hours[d] && hours[d].length) {
            const when = i === 1 ? "demain" : DAY_NAMES[d];
            text = `Fermé, ouvre ${when} à ${formatTime(hours[d][0][0])}`;
            break;
          }
        }
      }
      status.textContent = text;
      status.classList.add("is-closed");
    }
    status.hidden = false;
  }
}

// ---------- Plan Google Maps chargé au clic (RGPD) ----------
const map = document.querySelector("[data-map]");
if (map) {
  map.querySelector("button").addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = map.dataset.src;
    iframe.title = "Plan d'accès Google Maps";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    map.replaceChildren(iframe);
  });
}

// ---------- Galerie : agrandissement dans une boîte de dialogue ----------
const gallery = document.querySelector("[data-gallery]");
const lightbox = document.querySelector(".lightbox");

if (gallery && lightbox && typeof lightbox.showModal === "function") {
  const items = [...gallery.querySelectorAll(".gallery__item")];
  const img = lightbox.querySelector("img");
  const caption = lightbox.querySelector("p");
  let index = 0;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const thumb = items[index].querySelector("img");
    img.src = items[index].dataset.full;
    img.alt = thumb.alt;
    caption.textContent = `${thumb.alt} (${index + 1}/${items.length})`;
  };

  items.forEach((item, i) => {
    item.addEventListener("click", () => {
      show(i);
      lightbox.showModal();
    });
  });

  lightbox.querySelector(".lightbox__close").addEventListener("click", () => lightbox.close());
  // clic sur le fond : on ferme
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(index + 1);
    if (e.key === "ArrowLeft") show(index - 1);
  });
  // rend le focus à la vignette d'origine
  lightbox.addEventListener("close", () => items[index].focus());
}

// ---------- Carte : rubrique active dans la barre de navigation ----------
const menuLinks = document.querySelectorAll(".tabs a");
if (menuLinks.length && "IntersectionObserver" in window) {
  const byId = new Map([...menuLinks].map((a) => [a.hash.slice(1), a]));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      menuLinks.forEach((a) => a.classList.remove("is-active"));
      const link = byId.get(entry.target.id);
      if (link) link.classList.add("is-active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}

// ---------- Formulaire de réservation ----------
const form = document.querySelector("#booking-form");

if (form && hours) {
  const dateInput = form.querySelector("#date");
  const guestsValue = () => (form.querySelector('input[name="guests"]:checked') || {}).value;
  const slotsBox = form.querySelector("[data-slots]");
  const status = form.querySelector(".form-status");
  const field = (id) => form.querySelector(`#${id}`);

  const toISO = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const fromISO = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  // bornes du calendrier : aujourd'hui -> +60 jours
  const today = parisNow();
  const maxDate = new Date(today.date);
  maxDate.setDate(maxDate.getDate() + BOOKING_DAYS_AHEAD);
  dateInput.min = toISO(today.date);
  dateInput.max = toISO(maxDate);

  // créneaux toutes les 30 min, du début du service à 1h avant la fermeture
  function slotsFor(dateStr) {
    const date = fromISO(dateStr);
    const isToday = dateStr === toISO(today.date);
    const minStart = isToday ? parisNow().minutes + 60 : 0; // au moins 1h à l'avance
    return (hours[date.getDay()] || []).map(([open, close]) => {
      const times = [];
      for (let t = open; t <= close - LAST_BOOKING_BEFORE_CLOSE; t += 30) {
        if (t >= minStart) times.push(t);
      }
      return { label: open < 17 * 60 ? (date.getDay() === 0 ? "Brunch" : "Déjeuner") : "Dîner", times };
    }).filter((s) => s.times.length);
  }

  function renderSlots() {
    const value = dateInput.value;
    slotsBox.replaceChildren();
    const msg = (text) => {
      const p = document.createElement("p");
      p.className = "slots__empty";
      p.textContent = text;
      slotsBox.append(p);
    };

    if (!value) return msg("Choisissez d'abord une date.");
    const day = fromISO(value).getDay();
    if (!hours[day] || !hours[day].length) return msg(`Le restaurant est fermé le ${DAY_NAMES[day]}.`);

    const services = slotsFor(value);
    if (!services.length) return msg("Plus aucun créneau disponible ce jour-là. Essayez une autre date.");

    services.forEach((service) => {
      const group = document.createElement("div");
      group.className = "slots__group";
      group.innerHTML = `<p class="slots__label">${service.label}</p><div class="chips"></div>`;
      const list = group.querySelector(".chips");
      service.times.forEach((t) => {
        const label = document.createElement("label");
        label.className = "chip";
        const hhmm = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
        label.innerHTML = `<input type="radio" name="time" value="${hhmm}"><span>${formatTime(t)}</span>`;
        list.append(label);
      });
      slotsBox.append(group);
    });
  }

  // chaque règle renvoie un message d'erreur, ou "" si c'est bon
  const rules = {
    date: () => {
      const v = dateInput.value;
      if (!v) return "Choisissez une date.";
      if (v < dateInput.min || v > dateInput.max) return "Les réservations sont ouvertes sur les 60 prochains jours.";
      const day = fromISO(v).getDay();
      if (!hours[day] || !hours[day].length) return `Nous sommes fermés le ${DAY_NAMES[day]}.`;
      return "";
    },
    guests: () =>
      guestsValue() === "more"
        ? "Au-delà de 8 personnes, appelez-nous au 01 99 00 56 78 : on vous prépare une table."
        : "",
    time: () => (form.querySelector('input[name="time"]:checked') ? "" : "Choisissez une heure d'arrivée."),
    name: () => (field("name").value.trim().length >= 2 ? "" : "Indiquez votre nom."),
    phone: () =>
      /^(?:\+33\s?|0)[67](?:[\s.-]?\d{2}){4}$/.test(field("phone").value.trim())
        ? ""
        : "Numéro de mobile invalide (ex. : 06 12 34 56 78).",
    email: () => {
      const v = field("email").value.trim();
      return v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Adresse e-mail invalide.";
    },
    consent: () => (field("consent").checked ? "" : "Merci de cocher cette case pour continuer."),
  };

  function check(name) {
    const message = rules[name]();
    const error = form.querySelector(`#${name}-error`);
    error.textContent = message;
    error.closest(".field").classList.toggle("has-error", Boolean(message));
    const input = ["time", "guests"].includes(name) ? null : form.querySelector(`#${name}`);
    if (input) input.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  }

  dateInput.addEventListener("change", () => {
    renderSlots();
    check("date");
  });
  form.querySelectorAll('input[name="guests"]').forEach((r) => r.addEventListener("change", () => check("guests")));
  slotsBox.addEventListener("change", () => check("time"));
  ["name", "phone", "email"].forEach((name) => {
    form.querySelector(`#${name}`).addEventListener("blur", () => check(name));
  });
  field("consent").addEventListener("change", () => check("consent"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";

    // robot : on fait semblant que tout va bien
    if (field("website").value) return;

    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      status.classList.add("is-error");
      status.textContent = "Certains champs sont à corriger.";
      const firstError = form.querySelector(".has-error input");
      if (firstError) firstError.focus();
      return;
    }

    const date = fromISO(dateInput.value);
    const time = form.querySelector('input[name="time"]:checked').value;
    const guests = Number(guestsValue());
    const summary = `${DAY_NAMES[date.getDay()]} ${date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} à ${formatTime(toMinutes(time))}, ${guests} personne${guests > 1 ? "s" : ""}`;

    // démo : action vide, rien n'est envoyé
    if (form.getAttribute("action")) {
      try {
        const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(res.statusText);
      } catch {
        status.classList.add("is-error");
        status.textContent = "L'envoi n'a pas fonctionné. Réessayez ou appelez-nous au 01 99 00 56 78.";
        return;
      }
    }

    status.classList.add("is-ok");
    status.textContent = `Merci ${field("name").value.trim()} ! Votre demande pour ${summary} est bien enregistrée. Vous allez recevoir un SMS de confirmation.`;
    form.reset();
    renderSlots();
  });
}
