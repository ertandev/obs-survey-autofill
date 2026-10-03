document.addEventListener('DOMContentLoaded', async () => {
  const statusText = document.getElementById('status-text');
  const themeToggle = document.getElementById('popup-theme-toggle');
  const langToggle = document.getElementById('popup-lang-toggle');
  const optFloating = document.getElementById('popup-opt-floating');

  const SUN_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  const MOON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

  const I18N = {
    en: {
      title: 'Survey Auto-Filler',
      scanning: 'Scanning active tab...',
      found: 'Found <b>{r}</b> ratings & <b>{s}</b> drop-downs.',
      notFound: 'No survey questions found on this tab.',
      ready: 'Survey elements ready to fill.',
      filling: 'Filling survey...',
      done: 'Done! {n} items filled.',
      smart: 'Smart Realistic',
      smart_sub: 'Bell Curve',
      all5: 'Straight 5s',
      all5_sub: 'All 5',
      natural: 'High Achiever',
      natural_sub: '80/20',
      all4: 'Solid 4s',
      all4_sub: 'All 4',
      random: 'Randomize',
      random_sub: '1 - 5',
      opt_floating: 'Show floating button on pages',
      lang_btn: 'TR'
    },
    tr: {
      title: 'OBS Anket Doldurucu',
      scanning: 'Aktif sekme taranıyor...',
      found: 'Sekmede <b>{r}</b> puanlama & <b>{s}</b> açılır kutu bulundu.',
      notFound: 'Bu sayfada anket sorusu bulunamadı.',
      ready: 'Anket soruları doldurulmaya hazır.',
      filling: 'Dolduruluyor...',
      done: 'Tamamlandı! {n} soru dolduruldu.',
      smart: 'Akıllı Gerçekçi',
      smart_sub: 'Gauss Dağılımı',
      all5: 'Hepsine 5 Ver',
      all5_sub: 'Tam Puan',
      natural: 'Dengeli Başarı',
      natural_sub: '80/20 Oran',
      all4: 'Hepsine 4 Ver',
      all4_sub: 'Tümü 4',
      random: 'Rastgele Doldur',
      random_sub: '1 - 5 Karışık',
      opt_floating: 'Sayfada yüzen butonu göster',
      lang_btn: 'EN'
    }
  };

  let currentSettings = {
    theme: 'dark',
    lang: 'tr',
    showFloating: true
  };

  function t(key, params = {}) {
    const dict = I18N[currentSettings.lang] || I18N.tr;
    let text = dict[key] || I18N.tr[key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  function applyUI() {
    document.body.setAttribute('data-theme', currentSettings.theme);
    themeToggle.innerHTML = currentSettings.theme === 'dark' ? SUN_SVG : MOON_SVG;
    langToggle.innerText = t('lang_btn');

    document.getElementById('popup-title').innerText = t('title');
    document.getElementById('lbl-smart').innerText = t('smart');
    document.getElementById('sub-smart').innerText = t('smart_sub');
    document.getElementById('lbl-all5').innerText = t('all5');
    document.getElementById('sub-all5').innerText = t('all5_sub');
    document.getElementById('lbl-natural').innerText = t('natural');
    document.getElementById('sub-natural').innerText = t('natural_sub');
    document.getElementById('lbl-all4').innerText = t('all4');
    document.getElementById('sub-all4').innerText = t('all4_sub');
    document.getElementById('lbl-random').innerText = t('random');
    document.getElementById('sub-random').innerText = t('random_sub');
    document.getElementById('lbl-opt-floating').innerText = t('opt_floating');

    optFloating.checked = currentSettings.showFloating;
  }

  // Load settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['obs_settings'], (result) => {
      if (result && result.obs_settings) {
        currentSettings = { ...currentSettings, ...result.obs_settings };
      }
      applyUI();
    });
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  function saveSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['obs_settings'], (res) => {
        const s = (res && res.obs_settings) || {};
        Object.assign(s, currentSettings);
        chrome.storage.local.set({ obs_settings: s });
      });
    }
  }

  themeToggle.addEventListener('click', () => {
    currentSettings.theme = currentSettings.theme === 'dark' ? 'light' : 'dark';
    applyUI();
    saveSettings();

    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'SET_THEME', theme: currentSettings.theme });
    }
  });

  langToggle.addEventListener('click', () => {
    currentSettings.lang = currentSettings.lang === 'tr' ? 'en' : 'tr';
    applyUI();
    saveSettings();

    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'SET_LANG', lang: currentSettings.lang });
    }
  });

  optFloating.addEventListener('change', (e) => {
    currentSettings.showFloating = e.target.checked;
    saveSettings();

    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'SET_FLOATING', showFloating: currentSettings.showFloating });
    }
  });

  if (!tab || !tab.id) {
    statusText.innerText = 'No active tab found.';
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: 'GET_STATS' }, (response) => {
    if (chrome.runtime.lastError || !response) {
      statusText.innerText = t('ready');
    } else if (response.totalQuestions > 0) {
      statusText.innerHTML = t('found', { r: response.radioGroupsCount, s: response.selectsCount });
    } else {
      statusText.innerText = t('notFound');
    }
  });

  function sendFill(mode) {
    statusText.innerText = t('filling');
    chrome.tabs.sendMessage(tab.id, { action: 'FILL', mode }, (response) => {
      if (chrome.runtime.lastError) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ['content.js']
          },
          () => {
            chrome.tabs.sendMessage(tab.id, { action: 'FILL', mode }, (res) => {
              if (res && res.success) {
                statusText.innerText = t('done', { n: res.filledCount });
              }
            });
          }
        );
      } else if (response && response.success) {
        statusText.innerText = t('done', { n: response.filledCount });
      }
    });
  }

  document.getElementById('btn-smart').addEventListener('click', () => sendFill('smart'));
  document.getElementById('btn-all5').addEventListener('click', () => sendFill('all5'));
  document.getElementById('btn-natural').addEventListener('click', () => sendFill('natural'));
  document.getElementById('btn-all4').addEventListener('click', () => sendFill('all4'));
  document.getElementById('btn-random').addEventListener('click', () => sendFill('random'));
});
