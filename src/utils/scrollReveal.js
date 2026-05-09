export function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach((el) => observer.observe(el));
}

/**
 * Adds staggered reveal delay to child elements.
 * @param {string} parentSelector  - CSS selector of parent container
 * @param {string} childSelector   - CSS selector of children to stagger
 * @param {number} baseDelay       - Starting delay in ms
 * @param {number} step            - Increment per child in ms
 */
export function staggerReveal(parentSelector, childSelector, baseDelay = 0, step = 80) {
  const parent = document.querySelector(parentSelector);
  if (!parent) return;

  parent.querySelectorAll(childSelector).forEach((el, i) => {
    el.style.transitionDelay = `${baseDelay + i * step}ms`;
    el.classList.add('reveal');
  });
}
