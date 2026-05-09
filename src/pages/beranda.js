import { initNavbar } from '../components/navbar.js';
import { initFooter } from '../components/footer.js';
import { initScrollReveal, staggerReveal } from '../utils/scrollReveal.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar({ activePage: 'beranda', basePath: '' });
  initFooter({ basePath: '' });
  staggerReveal('.bento-grid', '.bento-card', 100, 100);
  initScrollReveal();
});
