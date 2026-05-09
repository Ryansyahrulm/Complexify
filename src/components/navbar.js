/**
 * @typedef {Object} NavbarOptions
 * @property {string} activePage - Key of the active page: 'beranda'|'materi'|'game'|'kuis'|'tim'
 * @property {string} basePath   - Relative path prefix to reach the root (e.g. '' or '../')
 */

const NAV_LINKS = [
  { key: 'beranda', label: 'Beranda', href: 'index.html' },
  { key: 'materi', label: 'Materi', href: 'materi.html' },
  { key: 'game', label: 'Game', href: 'game.html' },
  { key: 'kuis', label: 'Kuis', href: 'kuis.html' },
  { key: 'tim', label: 'Tim Kami', href: 'tim.html' },
];

/**
 * Renders and mounts the navbar into #navbar-root.
 * @param {NavbarOptions} options
 */
export function initNavbar({ activePage = 'beranda', basePath = '' } = {}) {
  const root = document.getElementById('navbar-root');
  if (!root) return;

  root.innerHTML = buildNavbarHTML({ activePage, basePath });

  setupMobileMenu(root);
  setupScrollBehavior(root);
}

/**
 * Builds the navbar HTML string.
 * @param {NavbarOptions} options
 * @returns {string}
 */
function buildNavbarHTML({ activePage, basePath }) {
  const links = NAV_LINKS.map(({ key, label, href }) => {
    const isActive = key === activePage;
    const cls = `navbar__link${isActive ? ' navbar__link--active' : ''}`;
    return `<li><a href="${basePath}${href}" class="${cls}" id="nav-${key}">${label}</a></li>`;
  }).join('');

  return `
    <nav class="navbar" id="main-navbar" aria-label="Main navigation">
      <div class="navbar__inner">
        <a href="${basePath}index.html" class="navbar__brand" aria-label="Complexify Home">
          Complexify
        </a>

        <ul class="navbar__links" role="list">
          ${links}
        </ul>

        <div class="navbar__cta">
          <a href="${basePath}materi.html" class="btn btn-primary" id="nav-cta-btn">
            Mulai Belajar
          </a>
          <button
            class="navbar__hamburger"
            id="hamburger-btn"
            aria-label="Toggle menu"
            aria-expanded="false"
            aria-controls="mobile-menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div class="navbar__mobile-menu" id="mobile-menu" role="navigation" aria-label="Mobile navigation">
        ${NAV_LINKS.map(({ key, label, href }) => {
    const isActive = key === activePage;
    const cls = `navbar__mobile-link${isActive ? ' navbar__mobile-link--active' : ''}`;
    return `<a href="${basePath}${href}" class="${cls}">${label}</a>`;
  }).join('')}
      </div>
    </nav>
  `;
}

/**
 * Wires the hamburger toggle button to open/close the mobile menu.
 * @param {HTMLElement} root
 */

function setupMobileMenu(root) {
  const hamburger = root.querySelector('#hamburger-btn');
  const mobileMenu = root.querySelector('#mobile-menu');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.classList.toggle('is-open', isOpen);  // ← tambah ini
  });
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) {
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('is-open');  // ← tambah ini
    }
  });
}

/**
 * Adds a subtle background tint when the user scrolls down.
 * @param {HTMLElement} root
 */
function setupScrollBehavior(root) {
  const nav = root.querySelector('.navbar');
  if (!nav) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      nav.style.background = 'rgba(6, 10, 20, 0.95)';
    } else {
      nav.style.background = '';
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}
