(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('js-enabled');

  // Apply a saved theme when available; otherwise the CSS follows system preference.
  const themeButton = document.querySelector('.theme-toggle');
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('portfolio-theme');
  } catch (error) {
    // Storage may be unavailable; the theme toggle still works for this page view.
  }
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;

  const updateThemeButton = () => {
    if (!themeButton) return;
    const isDark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeButton.setAttribute('aria-pressed', String(isDark));
    themeButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  };
  updateThemeButton();
  themeButton?.addEventListener('click', () => {
    const current = root.dataset.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('portfolio-theme', next);
    } catch (error) {
      // Keep the selected theme active until this page is closed.
    }
    updateThemeButton();
  });

  // The navigation stays visible without JavaScript and collapses only when JS is active.
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');
  menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navigation?.classList.toggle('is-open', !isOpen);
  });
  navigation?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigation.classList.remove('is-open');
      menuButton?.setAttribute('aria-expanded', 'false');
      menuButton?.setAttribute('aria-label', 'Open navigation');
    });
  });

  // A native smooth anchor scroll honors reduced-motion settings and CSS header offset.
  if (reducedMotion.matches) root.style.scrollBehavior = 'auto';

  // Reveal content as it enters view; reveal everything immediately if unsupported.
  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Display the neutral placeholder until a real screenshot loads successfully.
  document.querySelectorAll('[data-image-slot]').forEach((slot) => {
    const image = slot.querySelector('img');
    if (!image) return;
    const markLoaded = () => slot.classList.add('is-loaded');
    image.addEventListener('load', markLoaded, { once: true });
    image.addEventListener('error', () => slot.classList.remove('is-loaded'), { once: true });
    if (image.complete && image.naturalWidth > 0) markLoaded();
  });

  // Highlight the current section in the home page navigation.
  const sectionLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
  const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach((section) => activeObserver.observe(section));
  }

  // Keep the copyright year current while retaining a useful static year without JS.
  document.querySelectorAll('[data-year]').forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });
})();
