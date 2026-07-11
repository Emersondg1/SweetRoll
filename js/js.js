/* ===========================
   Sweet Roll — script.js
   =========================== */

'use strict';
const SR_PHONE = '22962117497';

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

    const bars = toggle.querySelectorAll('span');
    if (isOpen) {
      bars[0].style.transform = 'translateY(8px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-8px) rotate(-45deg)';
    } else {
      fermer();
    }
  });

  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) fermer();
  });

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
   3. SCROLLSPY — lien de nav actif
   =========================== */

(function initScrollspy() {
  const links = document.querySelectorAll('.nav-links a[data-section]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const sections = Array.from(links)
    .map(function (link) { return document.getElementById(link.dataset.section); })
    .filter(Boolean);

  if (!sections.length) return;

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.toggle('active', link.dataset.section === id);
    });
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (s) { observer.observe(s); });
})();


/* ===========================
   4. ANIMATIONS AU SCROLL
   =========================== */

(function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.menu-card, .step, .testimonial, .section-head, .delivery-banner'
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
   5. FILTRES DE LA CARTE (Sucrées / Salées / Tout)
   =========================== */

(function initMenuFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards   = document.querySelectorAll('.menu-card');
  const empty   = document.getElementById('menuEmpty');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filtre = btn.dataset.filter;
      let visibles = 0;

      cards.forEach(function (card) {
        const match = filtre === 'all' || card.dataset.category === filtre;
        card.classList.toggle('is-hidden', !match);
        if (match) visibles++;
      });

      if (empty) empty.hidden = visibles > 0;
    });
  });
})();


/* ===========================
   6. PANIER — quantités, ajout, message WhatsApp groupé
   =========================== */

const panier = (function initPanier() {
  const state = {}; // { "Crêpe Chocolat": { qty, price, name } }

  const bar          = document.getElementById('panierBar');
  const countEl       = document.getElementById('panierCount');
  const totalEl       = document.getElementById('panierTotal');
  const btnCommander  = document.getElementById('panierCommander');
  const btnClear      = document.getElementById('panierClear');

  function formatFCFA(n) {
    return n.toLocaleString('fr-FR') + ' FCFA';
  }

  function refreshBar() {
    const items = Object.values(state).filter(function (i) { return i.qty > 0; });
    const totalQty = items.reduce(function (sum, i) { return sum + i.qty; }, 0);
    const totalPrice = items.reduce(function (sum, i) { return sum + i.qty * i.price; }, 0);

    if (countEl) countEl.textContent = totalQty + (totalQty > 1 ? ' articles' : ' article');
    if (totalEl) totalEl.textContent = formatFCFA(totalPrice);

    if (bar) bar.classList.toggle('is-visible', totalQty > 0);
    document.body.classList.toggle('has-cart-items', totalQty > 0);
  }

  function updateCard(card) {
    const name  = card.dataset.name;
    const price = Number(card.dataset.price);
    const qtyEl = card.querySelector('.qty-value');
    const addBtn = card.querySelector('.btn-add');
    const qty = (state[name] && state[name].qty) || 0;

    if (qtyEl) qtyEl.textContent = qty;
    if (addBtn) addBtn.disabled = qty === 0;
    card.classList.toggle('in-cart', !!(state[name] && state[name].inCart));

    void price; // conservé pour lisibilité, prix déjà stocké dans state à l'ajout
  }

  document.querySelectorAll('.menu-card').forEach(function (card) {
    const name  = card.dataset.name;
    const price = Number(card.dataset.price);
    const minus = card.querySelector('.qty-minus');
    const plus  = card.querySelector('.qty-plus');
    const addBtn = card.querySelector('.btn-add');

    if (!state[name]) state[name] = { name: name, price: price, qty: 0, inCart: false };

    let pendingQty = 0;

    function setPending(n) {
      pendingQty = Math.max(0, n);
      const qtyEl = card.querySelector('.qty-value');
      if (qtyEl) qtyEl.textContent = pendingQty;
      if (addBtn) addBtn.disabled = pendingQty === 0;
    }

    if (minus) minus.addEventListener('click', function () { setPending(pendingQty - 1); });
    if (plus)  plus.addEventListener('click', function () { setPending(pendingQty + 1); });

    if (addBtn) {
      addBtn.addEventListener('click', function () {
        if (pendingQty === 0) return;
        state[name].qty += pendingQty;
        state[name].inCart = true;
        card.classList.add('in-cart');

        addBtn.textContent = 'Ajouté ✓';
        addBtn.classList.add('is-added');
        setTimeout(function () {
          addBtn.textContent = 'Ajouter au panier';
          addBtn.classList.remove('is-added');
        }, 1200);

        setPending(0);
        refreshBar();
      });
    }
  });

  function buildMessage() {
    const items = Object.values(state).filter(function (i) { return i.qty > 0; });
    if (!items.length) return null;

    const total = items.reduce(function (sum, i) { return sum + i.qty * i.price; }, 0);

    const lignes = items.map(function (i) {
      return '👉 ' + i.qty + 'x *' + i.name + '* — ' + formatFCFA(i.qty * i.price);
    });

    return [
      '🥞 *Bonjour Sweet Roll !*',
      '',
      'Je souhaite commander :',
      ...lignes,
      '',
      'Total : ' + formatFCFA(total),
      '',
      'Pouvez-vous confirmer la disponibilité et le délai de livraison ? Merci 😊',
    ].join('\n');
  }

  if (btnCommander) {
    btnCommander.addEventListener('click', function () {
      const msg = buildMessage();
      if (!msg) return;
      ouvrirWhatsApp(msg);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', function () {
      Object.keys(state).forEach(function (name) {
        state[name].qty = 0;
        state[name].inCart = false;
      });
      document.querySelectorAll('.menu-card').forEach(updateCard);
      refreshBar();
    });
  }

  return { state, refreshBar };
})();


/* ===========================
   7. OFFRE DU JOUR — bouton éventuel
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
   8. LIENS CTA GÉNÉRAUX ("Commander" direct)
   =========================== */

(function initCtaLinks() {
  const motsCles = /commander|passer.+commande|order/i;

  document.querySelectorAll('a.btn, button.btn').forEach(function (el) {
    if (el.dataset.srHandled) return;
    if (el.closest('.menu-card') || el.id === 'panierCommander') return; // gérés par le panier
    if (!motsCles.test(el.textContent)) return;
    if (el.getAttribute('href') && el.getAttribute('href').indexOf('wa.me') === -1) return;

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