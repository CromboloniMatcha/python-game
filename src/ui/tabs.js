import { $ } from '../utils/dom.js';

export function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.onclick = () => {
      tabs.forEach((t) => t.classList.toggle('on', t === tab));
      ['learn', 'abyss'].forEach((id) => $('#' + id).classList.toggle('hide', id !== tab.dataset.tab));
    };
  });
}
