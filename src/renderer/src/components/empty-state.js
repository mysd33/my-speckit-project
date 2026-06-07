export function createEmptyState(message = 'No albums yet', ctaText, onCtaClick) {
  const wrapper = document.createElement('div');
  wrapper.className = 'empty-state';

  wrapper.innerHTML = `
    <div class="empty-state-icon">📷</div>
    <div class="empty-state-message">${message}</div>
  `;

  if (ctaText && typeof onCtaClick === 'function') {
    const ctaContainer = document.createElement('div');
    ctaContainer.className = 'empty-state-cta';

    const button = document.createElement('button');
    button.className = 'button';
    button.type = 'button';
    button.textContent = ctaText;
    button.addEventListener('click', onCtaClick);

    ctaContainer.appendChild(button);
    wrapper.appendChild(ctaContainer);
  }

  return wrapper;
}

export default createEmptyState;
