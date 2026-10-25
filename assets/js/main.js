/* MISS ROSE — interactions
   preloader · scroll reveal · header state · marquee-free JS
   parallax · counter · cursor · mobile nav · mock enquiry
*/
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- preloader ---------- */
  var preloader = document.getElementById('preloader');
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (preloader) preloader.classList.add('is-done');
    }, prefersReduced ? 0 : 900);
  });
  // safety: never trap the user behind the loader
  setTimeout(function () { if (preloader) preloader.classList.add('is-done'); }, 3200);

  /* ---------- header state ---------- */
  var head = document.getElementById('siteHead');
  var onScrollHead = function () {
    head.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScrollHead, { passive: true });
  onScrollHead();

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- parallax (rAF-throttled) ---------- */
  var parallaxImg = document.querySelector('.parallax__media img');
  if (parallaxImg && !prefersReduced) {
    var ticking = false;
    var updateParallax = function () {
      var rect = parallaxImg.parentElement.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        parallaxImg.style.transform = 'translateY(' + (progress * -8) + '%)';
      }
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- counters ---------- */
  var counters = document.querySelectorAll('.numbers__val');
  var animateCount = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var dur = 1600, t0 = null;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && !prefersReduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* ---------- custom cursor (fine pointers only) ---------- */
  var cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches && !prefersReduced) {
    var cx = 0, cy = 0, tx = 0, ty = 0, rafId = null;
    var loop = function () {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      rafId = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!cursor.classList.contains('is-on')) { cursor.classList.add('is-on'); loop(); }
    }, { passive: true });
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      var interactive = t.closest && t.closest('a, button, .chip, input, textarea, .prod-card__media');
      cursor.classList.toggle('is-hover', !!interactive);
    });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); });
    window.addEventListener('blur', function () { cursor.classList.remove('is-on'); });
  }

  /* ---------- mock enquiry submit (static site) ---------- */
  var form = document.getElementById('enquiryForm');
  var done = document.getElementById('enqDone');
  if (form && done) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var required = form.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function (f) {
        if (!f.value.trim()) { valid = false; f.style.borderColor = '#C4756F'; }
        else { f.style.borderColor = ''; }
      });
      var email = form.querySelector('input[type="email"]');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        valid = false; email.style.borderColor = '#C4756F';
      }
      if (!valid) return;
      done.hidden = false;
      form.querySelector('.enq__submit').disabled = true;
      form.querySelector('.enq__submit').style.opacity = '.55';
      // NOTE: wire this to a real endpoint (Shopify contact form / Formspree / CRM) before launch.
    });
  }
})();
