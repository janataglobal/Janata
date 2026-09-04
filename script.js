/* =============================================
   JANATA GLOBAL EXPORT — Main JavaScript
   ============================================= */

(function () {
  'use strict';

  /* ==================== MOBILE NAV TOGGLE ==================== */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ==================== HEADER SCROLL SHADOW ==================== */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ==================== ACTIVE NAV LINK (scroll-based, homepage) ==================== */
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.site-nav > a:not(.btn-cta-nav)');

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              const href = link.getAttribute('href');
              if (href && href.includes('#' + entry.target.id)) {
                link.classList.add('active');
              } else if (href && href.startsWith('#')) {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      { threshold: 0.35 }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ==================== RFQ MODAL ==================== */
  const modal = document.getElementById('rfq-modal');
  const modalClose = document.getElementById('modal-close');

  const openModal = () => {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Open buttons: any element with id open-modal-* or data-modal="true"
  document.querySelectorAll('[id^="open-modal"], [data-modal="true"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Close button
  if (modalClose) modalClose.addEventListener('click', closeModal);

  // Click outside to close
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  /* ==================== PRODUCT FILTER TABS ==================== */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const productCards = document.querySelectorAll('.product-card[data-category]');

  if (filterTabs.length && productCards.length) {
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;

        // Update active tab
        filterTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Filter cards
        productCards.forEach((card) => {
          const cat = card.dataset.category;
          const visible = filter === 'all' || cat === filter;
          card.style.display = visible ? '' : 'none';
          // Animate in
          if (visible) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          }
        });
      });
    });
  }

  /* ==================== FORM SUBMISSION (page & modal) ==================== */
  function setupForm(form, statusEl) {
    if (!form || !statusEl) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const requiredFields = ['name', 'company', 'email', 'phone', 'country', 'product', 'quantity'];
      const missing = requiredFields.filter((f) => !String(data.get(f) || '').trim());

      if (missing.length) {
        statusEl.textContent = '⚠️ Please fill in all required fields to submit your enquiry.';
        statusEl.className = 'form-status error';
        // Highlight missing
        missing.forEach((fieldName) => {
          const input = form.querySelector(`[name="${fieldName}"]`);
          if (input) {
            input.style.borderColor = '#dc2626';
            input.addEventListener('input', () => (input.style.borderColor = ''), { once: true });
          }
        });
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
      }
      statusEl.textContent = '⏳ Submitting your enquiry…';
      statusEl.className = 'form-status';

      try {
        const response = await fetch('/api/enquiry', {
          method: 'POST',
          body: data,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              'Your enquiry could not be sent right now. Please email sales@janataglobal.com directly.'
          );
        }

        form.reset();
        statusEl.textContent =
          '✅ Thank you! Your enquiry has been received. Our export team will respond within 24 business hours.';
        statusEl.className = 'form-status success';
      } catch (err) {
        statusEl.textContent =
          err.message ||
          '❌ Your enquiry could not be sent. Please email sales@janataglobal.com or WhatsApp +91 9550506546 directly.';
        statusEl.className = 'form-status error';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText || 'Submit RFQ';
        }
      }
    });

    // Store original button text
    const btn = form.querySelector('[type="submit"]');
    if (btn) btn.dataset.originalText = btn.textContent;
  }

  // Page RFQ form
  setupForm(document.getElementById('rfq-form'), document.getElementById('rfq-status'));

  // Modal RFQ form
  setupForm(document.getElementById('modal-rfq-form'), document.getElementById('modal-status'));

  /* ==================== SMOOTH SCROLL FOR ANCHOR LINKS ==================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const annoBar = document.querySelector('.announcement-bar');
        const annoHeight = annoBar ? annoBar.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - annoHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ==================== HERO BG PARALLAX (subtle) ==================== */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener(
      'scroll',
      () => {
        const scrolled = window.scrollY;
        heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
      },
      { passive: true }
    );
  }

  /* ==================== PRODUCT CARD HOVER — INQUIRE BUTTON REVEAL ==================== */
  // Cards already handle this via CSS hover, but we can add keyboard focus for a11y
  document.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('focusin', () => card.classList.add('focused'));
    card.addEventListener('focusout', () => card.classList.remove('focused'));
  });

  /* ==================== ANIMATE ELEMENTS ON SCROLL ==================== */
  const animatables = document.querySelectorAll(
    '.product-card, .step-card, .quality-card, .market-card, .trust-item, .value-point'
  );

  if ('IntersectionObserver' in window && animatables.length) {
    const animObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            animObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animatables.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      animObs.observe(el);
    });
  }

})();
