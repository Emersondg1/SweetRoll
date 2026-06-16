/* ===========================
   Sweet Roll — script.js
   =========================== */

'use strict';
const SR_PHONE = '22960000000';

/* Construit l'URL wa.me et l'ouvre dans un nouvel onglet */
function ouvrirWhatsApp(message) {
  const url = 'https://wa.me/' + SR_PHONE + '?text=' + encodeURIComponent(message);
  window.open(url, '_blank', 'noopener,noreferrer');
}


/* ===========================
   1. MENU HAMBURGER MOBILE
   =========================== */

(function initNavMobile() {
  const toggle   = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label',    'Ouvrir le menu');
  toggle.setAttribute('aria-controls', 'nav-links');
  navLinks.setAttribute('id', 'nav-links');

  function fermer() {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label',    'Ouvrir le menu');
    const bars = toggle.querySelectorAll('span');
    bars[0].style.transform = '';
    bars[1].style.opacity   = '';
    bars[2].style.transform = '';
  }

  toggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');

    /* 3 barres → croix */
    const bars = toggle.querySelectorAll('span');
    if (isOpen) {
      bars[0].style.transform = 'translateY(8px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-8px) rotate(-45deg)';
    } else {
      fermer();
    }
  });

  /* Clic en dehors → fermer */
  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) fermer();
  });

  /* Clic sur un lien du menu → fermer */
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', fermer);
  });
})();


/* ===========================
   2. HEADER — OMBRE AU SCROLL
   =========================== */

(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    header.style.boxShadow = window.scrollY > 10
      ? '0 4px 20px rgba(58,38,24,.14)'
      : '';
  }, { passive: true });
})();


/* ===========================
   3. ANIMATIONS AU SCROLL
   =========================== */

(function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.menu-card, .step, .testimonial, .section-head, .delivery-banner, .offer-card, .drinks-panel'
  );

  if (!targets.length || !('IntersectionObserver' in window)) return;

  targets.forEach(function (el) {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(24px)';
    el.style.transition = 'opacity .45s ease, transform .45s ease';
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(function (el) { observer.observe(el); });
})();


/* ===========================
   4. BOUTONS "COMMANDER"
      → WhatsApp direct avec le plat pré-rempli
   =========================== */

(function initCommanderButtons() {

  document.querySelectorAll('.menu-card .btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      const card  = btn.closest('.menu-card');
      const plat  = card?.querySelector('h3')?.textContent.trim()    || 'un plat';
      const prix  = card?.querySelector('.price')?.textContent.trim() || '';

      const message = [
        '🥞 *Bonjour Sweet Roll !*',
        '',
        'Je souhaite commander :',
        '👉 *' + plat + '*' + (prix ? '  —  ' + prix : ''),
        '',
        'Pouvez-vous confirmer la disponibilité et les modalités de livraison ? Merci 😊',
      ].join('\n');

      ouvrirWhatsApp(message);
    });
  });

})();


/* ===========================
   5. OFFRE DU JOUR — bouton éventuel
      Même logique que les menu-cards
   =========================== */

(function initOfferButton() {
  const btn = document.querySelector('.offer-card .btn');
  if (!btn) return;

  btn.addEventListener('click', function (e) {
    e.preventDefault();

    const titre = document.querySelector('.offer-card h3')?.textContent.trim() || "l'offre du jour";

    const message = [
      '🥞 *Bonjour Sweet Roll !*',
      '',
      "Je suis intéressé(e) par votre offre : *" + titre + "*",
      '',
      'Pouvez-vous me donner plus de détails ? Merci 😊',
    ].join('\n');

    ouvrirWhatsApp(message);
  });
})();


/* ===========================
   6. BOUTONS "COMMANDER" DE LA BARRE MOBILE
      (.mobile-actionbar)
   =========================== */

(function initMobileActionBar() {
  const bar = document.querySelector('.mobile-actionbar');
  if (!bar) return;

  bar.querySelectorAll('.btn').forEach(function (btn) {
    /* Ne pas écraser les boutons déjà gérés ailleurs */
    if (btn.dataset.srHandled) return;

    btn.addEventListener('click', function (e) {
      e.preventDefault();

      const message = [
        '🥞 *Bonjour Sweet Roll !*',
        '',
        'Je souhaite passer une commande.',
        'Pouvez-vous m\'indiquer les plats disponibles et les délais de livraison ? Merci 😊',
      ].join('\n');

      ouvrirWhatsApp(message);
    });

    btn.dataset.srHandled = 'true';
  });
})();


/* ===========================
   7. BOUTON WHATSAPP FLOTTANT
   =========================== */

(function initWhatsAppFloat() {
  const btn = document.querySelector('.whatsapp-float');
  if (!btn) return;

  const message = 'Bonjour Sweet Roll ! Je voudrais passer une commande 🥞';

  btn.href = 'https://wa.me/' + SR_PHONE + '?text=' + encodeURIComponent(message);
  btn.setAttribute('target', '_blank');
  btn.setAttribute('rel',    'noopener noreferrer');
  btn.setAttribute('aria-label', 'Contacter Sweet Roll sur WhatsApp');
})();


/* ===========================
   8. LIENS CTA GÉNÉRAUX
      Tout bouton/lien dont le texte contient
      "Commander" ou "Passer commande" → WhatsApp
   =========================== */

(function initCtaLinks() {
  const motsCles = /commander|passer.+commande|order/i;

  document.querySelectorAll('a.btn, button.btn').forEach(function (el) {
    /* Déjà géré par une autre fonction → ignorer */
    if (el.dataset.srHandled) return;
    if (!motsCles.test(el.textContent)) return;

    el.addEventListener('click', function (e) {
      e.preventDefault();

      const message = [
        '🥞 *Bonjour Sweet Roll !*',
        '',
        'Je souhaite passer une commande.',
        'Pouvez-vous me guider ? Merci 😊',
      ].join('\n');

      ouvrirWhatsApp(message);
    });

    el.dataset.srHandled = 'true';
  });
})();


/* ===========================
   9. SMOOTH SCROLL (ancres internes)
   =========================== */

(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const cible = document.querySelector(link.getAttribute('href'));
      if (!cible) return;
      e.preventDefault();
      cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();