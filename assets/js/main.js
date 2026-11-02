/* ============================================================
   PORTFOLIO — Alex XU · comportements du site
   Thème, menu, barre de progression, apparitions, compteurs,
   formulaire de contact (Formspree).
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var isEN = (root.lang || 'fr').indexOf('en') === 0;

  /* ---------- thème : sombre par défaut, choix mémorisé ---------- */
  var themeBtn = document.getElementById('theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- logo : image éventuelle définie dans assets/js/config.js ---------- */
  var cfg = window.SITE || {};
  var logo = document.querySelector('.logo');
  if (cfg.logoImage && logo) {
    var img = new Image();
    img.alt = cfg.name || '';
    img.onload = function () { logo.textContent = ''; logo.appendChild(img); };  /* initiales conservées si l'image manque */
    img.src = (isEN ? '../' : '') + cfg.logoImage;
  }

  /* ---------- menu mobile ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- barre de progression de lecture ---------- */
  var bar = document.getElementById('progress');
  if (bar) {
    var ticking = false;
    var update = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ')';  /* transform : aucun recalcul de mise en page */
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- animations : éléments à faire apparaître, sections, bandeau ---------- */
  document.querySelectorAll('.rows>.card,.tl,.week,.fig,.diff-item,.src-item,.contact-list>*').forEach(function (el) { el.classList.add('rv'); });
  /* ---------- apparition au scroll ---------- */
  var items = document.querySelectorAll('.rv');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (en.isIntersecting) {
          setTimeout(function () { en.target.classList.add('in'); }, i * 60);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }
  /* trait supérieur de chaque section : se dessine à l'entrée */
  var secs = document.querySelectorAll('.sec');
  if (reduce || !('IntersectionObserver' in window)) {
    secs.forEach(function (s) { s.classList.add('in'); });
  } else {
    var ioS = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ioS.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    secs.forEach(function (s) { ioS.observe(s); });
  }
  /* bandeau défilant : en pause quand il n'est pas visible */
  var tk = document.querySelector('.ticker');
  if (tk && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { tk.classList.toggle('off', !es[0].isIntersecting); }).observe(tk);
  }

  /* ---------- compteurs animés ---------- */
  function runCount(el) {
    var to = +el.dataset.to, sfx = el.dataset.suffix || '';
    if (reduce) { el.textContent = to + sfx; return; }
    var start = performance.now(), dur = 1400;
    (function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      /* à p = 1 la courbe n'atteint pas tout à fait la cible (870 → 868) : on force la valeur exacte */
      el.textContent = (p === 1 ? to : Math.round(to * (1 - Math.pow(2, -9 * p)))) + sfx;
      if (p < 1) requestAnimationFrame(frame);
    })(start);
  }
  var counts = document.querySelectorAll('.count');
  if (!('IntersectionObserver' in window)) {
    counts.forEach(runCount);
  } else {
    var ioC = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); ioC.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counts.forEach(function (el) { ioC.observe(el); });
  }

  /* ---------- formulaire de contact ---------- */
  var form = document.getElementById('form-contact');
  if (!form) return;

  var T = isEN ? {
    required: 'This field is required.',
    checkbox: 'This box must be ticked.',
    email: 'This email address does not look valid.',
    sending: 'Sending…',
    send: 'Send message',
    ok: 'Message sent. Thank you, I will reply as soon as possible.',
    ko: 'Sending failed. Please write directly to ',
    subject: '[Portfolio] '
  } : {
    required: 'Ce champ est obligatoire.',
    checkbox: 'Cette case doit être cochée.',
    email: 'Cette adresse ne semble pas valide.',
    sending: 'Envoi…',
    send: 'Envoyer le message',
    ok: 'Message envoyé. Merci, je réponds dès que possible.',
    ko: 'L\'envoi a échoué. Écrivez directement à ',
    subject: '[Portfolio] '
  };

  var msg = document.getElementById('form-msg');
  var button = form.querySelector('button[type="submit"]');
  var label = button ? button.querySelector('.libelle') : null;
  var MAIL = 'xualex300@gmail.com';

  function setError(field, text) {
    var box = field.closest('.field') || field.closest('.check');
    var err = box && box.querySelector('.field-err');
    if (box) box.classList.add('invalide');
    if (err) err.textContent = text;
    field.setAttribute('aria-invalid', 'true');
  }
  function clearError(field) {
    var box = field.closest('.field') || field.closest('.check');
    var err = box && box.querySelector('.field-err');
    if (box) box.classList.remove('invalide');
    if (err) err.textContent = '';
    field.removeAttribute('aria-invalid');
  }
  form.querySelectorAll('input,select,textarea').forEach(function (c) {
    c.addEventListener('input', function () { clearError(c); });
  });

  function validate() {
    var ok = true, first = null;
    form.querySelectorAll('[required]').forEach(function (c) {
      clearError(c);
      var v = (c.value || '').trim();
      if (c.type === 'checkbox' ? !c.checked : !v) {
        setError(c, c.type === 'checkbox' ? T.checkbox : T.required);
        ok = false; first = first || c;
      } else if (c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
        setError(c, T.email);
        ok = false; first = first || c;
      }
    });
    if (first) first.focus();
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'form-msg';
    if (form.querySelector('.hp input').value) return;   /* piège à robots */
    if (!validate()) return;

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    delete data._gotcha;

    var endpoint = form.dataset.endpoint || '';
    var configured = endpoint && endpoint.indexOf('VOTRE_ID') === -1;

    /* Sans service d'envoi configuré : repli sur le client e-mail. */
    if (!configured) {
      var body = 'Nom : ' + data.nom + '\nE-mail : ' + data.email + '\nObjet : ' + data.objet + '\n\n' + data.message;
      window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(T.subject + data.objet) + '&body=' + encodeURIComponent(body);
      return;
    }

    if (label) label.textContent = T.sending;
    if (button) button.disabled = true;

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error('status ' + r.status);
      form.reset();
      msg.className = 'form-msg ok';
      msg.textContent = T.ok;
    }).catch(function () {
      msg.className = 'form-msg ko';
      msg.innerHTML = T.ko + '<a href="mailto:' + MAIL + '">' + MAIL + '</a>.';
    }).then(function () {
      if (label) label.textContent = T.send;
      if (button) button.disabled = false;
    });
  });
})();
