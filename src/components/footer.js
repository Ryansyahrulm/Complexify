/**
 * @param {{ basePath?: string }} options
 */
export function initFooter({ basePath = '' } = {}) {
  const root = document.getElementById('footer-root');
  if (!root) return;
  root.innerHTML = buildFooterHTML({ basePath });
}

/**
 * @param {{ basePath: string }} options
 * @returns {string}
 */
function buildFooterHTML({ basePath }) {
  const year = new Date().getFullYear();

  return `
    <footer class="footer" role="contentinfo">
      <div class="footer__inner">

        <div class="footer__brand">
          <p class="footer__brand-copy">© ${year} Complexify.</p>
        </div>

      </div>
    </footer>
  `;
}
