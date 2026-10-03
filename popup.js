document.addEventListener('DOMContentLoaded', async () => {
  const statusText = document.getElementById('status-text');
  const themeToggle = document.getElementById('popup-theme-toggle');

  const SUN_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
  const MOON_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;

  let currentTheme = 'dark';

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['obs_settings'], (result) => {
      if (result && result.obs_settings && result.obs_settings.theme) {
        currentTheme = result.obs_settings.theme;
      }
      setPopupTheme(currentTheme);
    });
  }

  function setPopupTheme(theme) {
    currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    themeToggle.innerHTML = theme === 'dark' ? SUN_SVG : MOON_SVG;
    themeToggle.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }

  themeToggle.addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setPopupTheme(nextTheme);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['obs_settings'], (res) => {
        const s = (res && res.obs_settings) || {};
        s.theme = nextTheme;
        chrome.storage.local.set({ obs_settings: s });
      });
    }

    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'SET_THEME', theme: nextTheme });
    }
  });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id) {
    statusText.innerText = 'No active tab found.';
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: 'GET_STATS' }, (response) => {
    if (chrome.runtime.lastError || !response) {
      statusText.innerText = 'Survey elements ready to fill.';
    } else {
      statusText.innerHTML = `Found <b>${response.radioGroupsCount}</b> ratings & <b>${response.selectsCount}</b> drop-downs.`;
    }
  });

  function sendFill(mode) {
    statusText.innerText = 'Filling survey...';
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
                statusText.innerText = `Done! ${res.filledCount} items filled.`;
              }
            });
          }
        );
      } else if (response && response.success) {
        statusText.innerText = `Done! ${response.filledCount} items filled.`;
      }
    });
  }

  document.getElementById('btn-smart').addEventListener('click', () => sendFill('smart'));
  document.getElementById('btn-all5').addEventListener('click', () => sendFill('all5'));
  document.getElementById('btn-natural').addEventListener('click', () => sendFill('natural'));
  document.getElementById('btn-all4').addEventListener('click', () => sendFill('all4'));
  document.getElementById('btn-random').addEventListener('click', () => sendFill('random'));
});
