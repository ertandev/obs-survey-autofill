/**
 * OBS Survey Auto-Filler - Content Script
 * Intelligent, realistic evaluation filler for university course and faculty surveys.
 */

(function () {
  if (window.__OBS_AUTOFILL_LOADED__) return;
  window.__OBS_AUTOFILL_LOADED__ = true;

  // Vector SVGs
  const ICONS = {
    bolt: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    sparkle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
    star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    chart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    shuffle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.6-8.6c.8-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.4c1.3 0 2.5.6 3.3 1.7l1.7 2.2"/><path d="M14.6 13.9l2.1 2.4c.8 1.1 2 1.7 3.3 1.7H22"/><path d="m18 14 4 4-4 4"/></svg>`,
    sun: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    moon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    close: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
  };

  const POSITIVE_KEYWORDS_TIER1 = [
    'çok fazla',
    'fazlasıyla yeterliydi',
    'fazlasıyla yeterli',
    'fazlasıyla',
    'kesinlikle katılıyorum',
    'üst düzey',
    'oldukça',
    'tamamen'
  ];

  const POSITIVE_KEYWORDS_TIER2 = [
    'yeterliydi',
    'yeterli',
    'fazla',
    'çok iyi',
    'katılıyorum',
    'iyi',
    'yüksek'
  ];

  const MODERATE_KEYWORDS = ['orta', 'ortalama', 'kısmen', 'kararsızım', 'fark etmez'];
  const WORKLOAD_KEYWORDS = ['iş yükü', 'zaman', 'çalışma', 'saat', 'okuma', 'akts', 'ödev', 'zorluk', 'tekrar'];

  let settings = {
    fillDropdowns: true,
    leftIsFive: true,
    autoSave: false,
    highlight: true,
    theme: 'dark'
  };

  // Load saved settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['obs_settings'], (result) => {
      if (result && result.obs_settings) {
        settings = { ...settings, ...result.obs_settings };
      }
      applyTheme(settings.theme);
    });
  }

  // Runtime message handler
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'FILL') {
        const result = executeFill(request.mode);
        sendResponse(result);
      } else if (request.action === 'GET_STATS') {
        const stats = detectFormStats();
        sendResponse(stats);
      } else if (request.action === 'SET_THEME') {
        settings.theme = request.theme;
        applyTheme(settings.theme);
        sendResponse({ success: true, theme: settings.theme });
      }
      return true;
    });
  }

  injectUI();

  function applyTheme(theme) {
    const container = document.getElementById('obs-af-container');
    if (!container) return;
    container.setAttribute('data-theme', theme);
    const themeBtn = document.getElementById('obs-af-theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
      themeBtn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  }

  function detectFormStats() {
    const radioGroups = getRadioGroups();
    const selects = document.querySelectorAll('select');
    return {
      radioGroupsCount: radioGroups.length,
      selectsCount: selects.length,
      totalQuestions: radioGroups.length + selects.length
    };
  }

  function getRadioGroups() {
    const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
    if (radios.length === 0) return [];

    const groupsByName = new Map();
    radios.forEach((r) => {
      const name = r.name || 'unnamed';
      if (!groupsByName.has(name)) groupsByName.set(name, []);
      groupsByName.get(name).push(r);
    });

    let validNameGroups = true;
    for (const [, list] of groupsByName.entries()) {
      if (list.length > 7) {
        validNameGroups = false;
        break;
      }
    }

    if (validNameGroups && groupsByName.size > 0 && !(groupsByName.size === 1 && radios.length > 7)) {
      return Array.from(groupsByName.values());
    }

    const groupsByRow = new Map();
    radios.forEach((r) => {
      const row = r.closest('tr') || r.closest('.row') || r.closest('li') || r.parentElement.parentElement;
      if (!groupsByRow.has(row)) groupsByRow.set(row, []);
      groupsByRow.get(row).push(r);
    });

    return Array.from(groupsByRow.values());
  }

  function getRadioScore(radio, index, total) {
    const val = (radio.value || '').trim();

    if (/^[1-5]$/.test(val)) {
      return parseInt(val, 10);
    }

    const labelText = (
      (radio.labels && radio.labels[0] ? radio.labels[0].textContent : '') +
      ' ' +
      (radio.nextSibling ? radio.nextSibling.textContent : '') +
      ' ' +
      (radio.parentElement ? radio.parentElement.textContent : '')
    ).trim();

    const match = labelText.match(/\b([1-5])\b/);
    if (match) {
      return parseInt(match[1], 10);
    }

    if (total === 5) {
      return settings.leftIsFive ? 5 - index : index + 1;
    }

    return settings.leftIsFive ? total - index : index + 1;
  }

  function dispatchFormEvents(element) {
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  function executeFill(mode = 'smart') {
    const radioGroups = getRadioGroups();
    const selects = Array.from(document.querySelectorAll('select'));
    let filledCount = 0;

    // 1. Radios
    radioGroups.forEach((group) => {
      let targetScore = 5;

      const row = group[0].closest('tr') || group[0].parentElement;
      const rowText = (row ? row.innerText : '').toLowerCase();
      const isWorkloadQuestion = WORKLOAD_KEYWORDS.some((kw) => rowText.includes(kw));

      switch (mode) {
        case 'smart': {
          if (isWorkloadQuestion) {
            const rand = Math.random();
            if (rand < 0.48) targetScore = 4;
            else if (rand < 0.82) targetScore = 5;
            else targetScore = 3;
          } else {
            const rand = Math.random();
            if (rand < 0.76) targetScore = 5;
            else if (rand < 0.96) targetScore = 4;
            else targetScore = 3;
          }
          break;
        }

        case 'all5':
          targetScore = 5;
          break;

        case 'natural':
          targetScore = Math.random() < 0.82 ? 5 : 4;
          break;

        case 'all4':
          targetScore = 4;
          break;

        case 'random':
          targetScore = Math.floor(Math.random() * 5) + 1;
          break;

        default:
          targetScore = 5;
      }

      let selectedRadio = null;

      for (let i = 0; i < group.length; i++) {
        const score = getRadioScore(group[i], i, group.length);
        if (score === targetScore) {
          selectedRadio = group[i];
          break;
        }
      }

      if (!selectedRadio && group.length > 0) {
        if (targetScore >= 4) {
          selectedRadio = settings.leftIsFive ? group[0] : group[group.length - 1];
        } else if (targetScore <= 2) {
          selectedRadio = settings.leftIsFive ? group[group.length - 1] : group[0];
        } else {
          selectedRadio = group[Math.floor(group.length / 2)];
        }
      }

      if (selectedRadio) {
        selectedRadio.checked = true;
        dispatchFormEvents(selectedRadio);
        filledCount++;

        if (settings.highlight && row) {
          row.classList.remove('obs-af-highlight-row');
          void row.offsetWidth;
          row.classList.add('obs-af-highlight-row');
        }
      }
    });

    // 2. Selects
    if (settings.fillDropdowns) {
      selects.forEach((select) => {
        if (select.offsetParent === null && select.style.display === 'none') return;

        const options = Array.from(select.options);
        if (options.length <= 1) return;

        const validOptions = options.filter(
          (opt) =>
            opt.value !== '' &&
            opt.value !== '0' &&
            !opt.text.toLowerCase().includes('seçiniz') &&
            !opt.text.toLowerCase().includes('lütfen') &&
            !opt.text.toLowerCase().includes('select')
        );

        if (validOptions.length === 0) return;

        let chosenOption = null;

        if (mode === 'smart' || mode === 'natural') {
          const tier1 = validOptions.find((opt) =>
            POSITIVE_KEYWORDS_TIER1.some((kw) => opt.text.toLowerCase().includes(kw))
          );
          const tier2 = validOptions.find((opt) =>
            POSITIVE_KEYWORDS_TIER2.some((kw) => opt.text.toLowerCase().includes(kw))
          );

          if (tier1 && tier2) {
            chosenOption = Math.random() < 0.72 ? tier1 : tier2;
          } else {
            chosenOption = tier1 || tier2 || validOptions[0];
          }
        } else if (mode === 'all5') {
          chosenOption =
            validOptions.find((opt) =>
              [...POSITIVE_KEYWORDS_TIER1, ...POSITIVE_KEYWORDS_TIER2].some((kw) => opt.text.toLowerCase().includes(kw))
            ) || validOptions[0];
        } else if (mode === 'all4') {
          chosenOption =
            validOptions.find((opt) =>
              POSITIVE_KEYWORDS_TIER2.some((kw) => opt.text.toLowerCase().includes(kw))
            ) || validOptions[0];
        } else if (mode === 'random') {
          chosenOption = validOptions[Math.floor(Math.random() * validOptions.length)];
        }

        if (chosenOption) {
          select.value = chosenOption.value;
          dispatchFormEvents(select);
          filledCount++;

          const row = select.closest('tr') || select.parentElement;
          if (settings.highlight && row) {
            row.classList.remove('obs-af-highlight-row');
            void row.offsetWidth;
            row.classList.add('obs-af-highlight-row');
          }
        }
      });
    }

    if (settings.autoSave) {
      setTimeout(() => {
        triggerSaveButton();
      }, 500);
    }

    showToast(`${filledCount} questions filled successfully`);

    return {
      success: true,
      filledCount,
      totalFound: radioGroups.length + selects.length
    };
  }

  function triggerSaveButton() {
    const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a.btn'));
    const saveBtn = buttons.find((b) => {
      const text = (b.innerText || b.value || '').toLowerCase();
      return (
        text.includes('kaydet') ||
        text.includes('gönder') ||
        text.includes('tamamla') ||
        text.includes('save') ||
        text.includes('submit') ||
        text.includes('finish')
      );
    });

    if (saveBtn) {
      showToast('Saving survey responses...');
      saveBtn.click();
    }
  }

  function showToast(message) {
    let existingToast = document.querySelector('.obs-af-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'obs-af-toast';
    toast.innerHTML = `<span style="color:#10b981; display:flex;">${ICONS.check}</span><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-6px) scale(0.96)';
      toast.style.transition = 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  function injectUI() {
    if (document.getElementById('obs-af-container')) return;

    const container = document.createElement('div');
    container.id = 'obs-af-container';
    container.setAttribute('data-theme', settings.theme);

    container.innerHTML = `
      <!-- Liquid Glass Launcher Pill -->
      <div class="obs-af-launcher" id="obs-af-launcher-btn" title="OBS Survey Auto-Filler">
        <span class="obs-af-icon">${ICONS.bolt}</span>
        <span>Auto-Fill</span>
      </div>

      <!-- Liquid Glass Panel -->
      <div class="obs-af-panel obs-af-hidden" id="obs-af-popup-panel">
        <div class="obs-af-header">
          <div class="obs-af-header-title">
            <span class="obs-af-mini-bolt">${ICONS.bolt}</span>
            <span>Survey Auto-Filler</span>
            <span class="obs-af-badge">v1.4</span>
          </div>
          <div class="obs-af-header-actions">
            <button class="obs-af-icon-btn" id="obs-af-theme-toggle" title="Toggle Theme">
              ${settings.theme === 'dark' ? ICONS.sun : ICONS.moon}
            </button>
            <button class="obs-af-icon-btn" id="obs-af-close-panel" title="Close">${ICONS.close}</button>
          </div>
        </div>

        <div class="obs-af-body">
          <div class="obs-af-info" id="obs-af-stats-text">
            <span class="obs-af-info-dot"></span>
            <span>Scanning page...</span>
          </div>

          <div class="obs-af-options">
            <button class="obs-af-btn obs-af-btn-smart" data-mode="smart">
              <span class="obs-af-btn-label">
                <span class="obs-af-vector-icon">${ICONS.sparkle}</span>
                <span>Smart Realistic</span>
              </span>
              <span class="obs-af-btn-sub">Bell Curve</span>
            </button>

            <button class="obs-af-btn obs-af-btn-primary" data-mode="all5">
              <span class="obs-af-btn-label">
                <span class="obs-af-vector-icon">${ICONS.star}</span>
                <span>Straight 5s</span>
              </span>
              <span class="obs-af-btn-sub">All 5</span>
            </button>

            <button class="obs-af-btn" data-mode="natural">
              <span class="obs-af-btn-label">
                <span class="obs-af-vector-icon">${ICONS.chart}</span>
                <span>High Achiever</span>
              </span>
              <span class="obs-af-btn-sub">80/20</span>
            </button>

            <button class="obs-af-btn" data-mode="all4">
              <span class="obs-af-btn-label">
                <span class="obs-af-vector-icon">${ICONS.check}</span>
                <span>Solid 4s</span>
              </span>
              <span class="obs-af-btn-sub">All 4</span>
            </button>

            <button class="obs-af-btn" data-mode="random">
              <span class="obs-af-btn-label">
                <span class="obs-af-vector-icon">${ICONS.shuffle}</span>
                <span>Randomize</span>
              </span>
              <span class="obs-af-btn-sub">1 - 5</span>
            </button>
          </div>

          <div class="obs-af-settings">
            <label class="obs-af-checkbox-row">
              <input type="checkbox" id="obs-opt-dropdowns" ${settings.fillDropdowns ? 'checked' : ''}>
              <span>Smart fill student drop-downs</span>
            </label>
            <label class="obs-af-checkbox-row">
              <input type="checkbox" id="obs-opt-autosave" ${settings.autoSave ? 'checked' : ''}>
              <span>Auto-click Save/Submit button</span>
            </label>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const launcherBtn = document.getElementById('obs-af-launcher-btn');
    const panel = document.getElementById('obs-af-popup-panel');
    const closeBtn = document.getElementById('obs-af-close-panel');
    const themeBtn = document.getElementById('obs-af-theme-toggle');
    const statsText = document.getElementById('obs-af-stats-text');
    const optDropdowns = document.getElementById('obs-opt-dropdowns');
    const optAutoSave = document.getElementById('obs-opt-autosave');

    function updateStats() {
      const stats = detectFormStats();
      if (stats.totalQuestions > 0) {
        statsText.innerHTML = `
          <span class="obs-af-info-dot" style="background:#10b981;"></span>
          <span>Found <b>${stats.radioGroupsCount}</b> ratings & <b>${stats.selectsCount}</b> drop-downs.</span>
        `;
      } else {
        statsText.innerHTML = `
          <span class="obs-af-info-dot" style="background:#f59e0b;"></span>
          <span>No survey questions found on this page.</span>
        `;
      }
    }

    launcherBtn.addEventListener('click', () => {
      panel.classList.toggle('obs-af-hidden');
      if (!panel.classList.contains('obs-af-hidden')) {
        updateStats();
      }
    });

    closeBtn.addEventListener('click', () => {
      panel.classList.add('obs-af-hidden');
    });

    themeBtn.addEventListener('click', () => {
      settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
      applyTheme(settings.theme);
      saveSettings();
    });

    optDropdowns.addEventListener('change', (e) => {
      settings.fillDropdowns = e.target.checked;
      saveSettings();
    });

    optAutoSave.addEventListener('change', (e) => {
      settings.autoSave = e.target.checked;
      saveSettings();
    });

    function saveSettings() {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ obs_settings: settings });
      }
    }

    panel.querySelectorAll('.obs-af-btn[data-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        executeFill(mode);
        panel.classList.add('obs-af-hidden');
      });
    });
  }
})();
