// ============================================================
// Motion utilities: word-level split reveal + universal
// bottom-to-top stagger reveal system. No paid plugins needed.
// ============================================================

// Splits an element's text into words, each wrapped in a masked
// span, ready for a "rise from below" reveal.
function splitWordsForReveal(el) {
  const text = el.textContent;
  el.textContent = '';
  const words = text.split(' ');
  words.forEach((word, i) => {
    const mask = document.createElement('span');
    mask.className = 'reveal-mask';
    const inner = document.createElement('span');
    inner.className = 'reveal-word';
    inner.textContent = word;
    mask.appendChild(inner);
    el.appendChild(mask);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return el.querySelectorAll('.reveal-word');
}

// Applies split-word reveal, triggered on scroll (or immediately
// for elements marked data-reveal-immediate, e.g. hero title).
function initTextReveals() {
  if (!window.gsap) return;
  document.querySelectorAll('[data-split-reveal]').forEach((el) => {
    const words = splitWordsForReveal(el);
    if (el.dataset.revealImmediate !== undefined) return; // handled by intro timeline
    gsap.to(words, {
      y: '0%',
      duration: 0.9,
      stagger: 0.045,
      ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
}

// Universal "rise from below" reveal for any element/group.
// data-reveal-up on a single element, or data-reveal-group on a
// parent to stagger its direct children.
function initRiseReveals() {
  if (!window.gsap) return;

  gsap.utils.toArray('[data-reveal-up]').forEach((el) => {
    gsap.from(el, {
      y: 70, opacity: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
    const children = Array.from(group.children);
    gsap.from(children, {
      y: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: group, start: 'top 88%' },
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  initTextReveals();
  initRiseReveals();
});
