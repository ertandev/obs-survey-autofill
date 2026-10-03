# ⚡ OBS Survey Auto-Filler

<p align="left">
  <img src="https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/UI-iOS%20Liquid%20Glass-0ea5e9?style=for-the-badge&logo=apple&logoColor=white" alt="Liquid Glass">
  <img src="https://img.shields.io/badge/Font-Apple%20San%20Francisco-10b981?style=for-the-badge" alt="San Francisco">
  <img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" alt="License MIT">
</p>

An intelligent, distraction-free browser extension designed to effortlessly auto-fill university course and instructor evaluation surveys (OBS, EBS, and similar academic portals) in seconds.

Built with an **iOS Liquid Frosted Glass** interface, pure **hollow outline vector icons**, and Apple's **San Francisco typography**.

---

## 🌟 Highlights

- **🧠 Smart Realistic Mode (Human Bell Curve):**
  Uses contextual natural probability distribution rather than rigid straight-line scoring:
  - **Workload / Time Spent questions** (e.g. *ECTS workload, reading time, difficulty*): Authentically distributes ratings between **4** (~48%), **5** (~34%), and **3** (~18%).
  - **General Teaching & Instructor questions**: Scores mostly **5** (~76%), with natural **4**s (~20%) and occasional **3**s.
  - Generates an authentic **~4.68** overall score, preventing university algorithmic flags for automated straight-lining.
- **🌟 Straight 5s:** Instant perfect score across all Likert items.
- **🎯 High Achiever:** Realistic 80% 5s / 20% 4s split.
- **👍 Solid 4s & 🎲 Randomize:** Multiple presets for every grading preference.
- **🧠 Drop-Down Intelligence:** Intelligently identifies and selects the most positive student responses (*"Çok Fazla"*, *"Fazlasıyla Yeterliydi"*).
- **💧 iOS Liquid Glass Aesthetic:** Multi-layered translucent blur (`backdrop-filter: blur(32px)`), specular edge highlights, and smooth spring physics.
- **✨ 100% Hollow Outline Icons:** Pure vector SVGs with 1.6px delicate stroke widths (zero consumer emojis).
- **🌙 / ☀️ Instant Theme Switcher:** Fully customizable Dark and Light modes with persistent storage.
- **⚡ In-Page Floating Quick-Action Pill:** Sleek launcher on the bottom-right for zero-friction evaluation across multiple courses.

---

## 🚀 Installation (Chrome, Brave, Edge, Opera)

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/ertandev/obs-survey-autofill.git
   ```
2. Open your Chromium-based browser and navigate to:
   - **Chrome / Brave:** `chrome://extensions`
   - **Edge:** `edge://extensions`
3. Toggle on **Developer mode** in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the `obs-survey-autofill` folder.
6. Navigate to any university survey page — the **⚡ Auto-Fill** pill will appear automatically on the bottom-right corner!

---

## ⚡ Instant Console One-Liner (No Extension Needed)

If you need to fill a survey immediately without installing the extension:

1. Press `F12` (or right-click ➔ **Inspect**) and open the **Console** tab.
2. Paste the following script and hit `Enter`:

```javascript
(() => {
  const pKw1 = ['çok fazla', 'fazlasıyla yeterliydi', 'fazlasıyla', 'kesinlikle katılıyorum'];
  const pKw2 = ['yeterliydi', 'yeterli', 'fazla', 'çok iyi', 'katılıyorum'];
  let count = 0;
  const radios = Array.from(document.querySelectorAll('input[type="radio"]'));
  const groups = new Map();
  radios.forEach(r => {
    const k = r.name || r.closest('tr') || r.parentElement;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  });
  groups.forEach(list => {
    const rowText = (list[0].closest('tr')?.innerText || '').toLowerCase();
    const isWorkload = /iş yükü|zaman|çalışma|saat|okuma|akts|ödev/.test(rowText);
    let targetScore = 5;
    if (isWorkload) {
      const r = Math.random();
      targetScore = r < 0.48 ? 4 : (r < 0.82 ? 5 : 3);
    } else {
      const r = Math.random();
      targetScore = r < 0.76 ? 5 : (r < 0.96 ? 4 : 3);
    }
    let target = list.find(r => r.value == targetScore) || list.find(r => (r.parentElement?.textContent || '').includes(String(targetScore))) || list[0];
    if (target) {
      target.checked = true;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
      target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      count++;
    }
  });
  document.querySelectorAll('select').forEach(sel => {
    const opts = Array.from(sel.options).filter(o => o.value && !o.text.toLowerCase().includes('seçiniz'));
    const t1 = opts.find(o => pKw1.some(k => o.text.toLowerCase().includes(k)));
    const t2 = opts.find(o => pKw2.some(k => o.text.toLowerCase().includes(k)));
    const chosen = (t1 && t2) ? (Math.random() < 0.7 ? t1 : t2) : (t1 || t2 || opts[0]);
    if (chosen) {
      sel.value = chosen.value;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      count++;
    }
  });
  alert(`${count} survey questions filled successfully!`);
})();
```

---

## 📂 Project Architecture

```
obs-survey-autofill/
├── manifest.json       # Manifest V3 configuration & permissions
├── content.js          # Core filling engine & DOM event dispatchers
├── content.css         # iOS Liquid Glass design & typography tokens
├── popup.html          # Toolbar extension interface
├── popup.js            # Toolbar message bridge & theme controller
├── generate_icons.py   # Minimalist hollow PNG icon generator
└── icons/              # Extension icons (16px, 48px, 128px)
```

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
