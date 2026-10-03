# ⚡ OBS Survey Auto-Filler

<p align="left">
  <img src="https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/UI-iOS%20Liquid%20Glass-0ea5e9?style=for-the-badge&logo=apple&logoColor=white" alt="Liquid Glass">
  <img src="https://img.shields.io/badge/Font-Apple%20San%20Francisco-10b981?style=for-the-badge" alt="San Francisco">
  <img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" alt="License MIT">
</p>

An intelligent, distraction-free browser extension designed to effortlessly auto-fill university course and instructor evaluation surveys (OBS, EBS, BYS, and similar academic portals) in seconds.

Built with an **iOS Liquid Frosted Glass** interface, pure **hollow outline vector icons**, and Apple's **San Francisco typography**.

---

## 🌟 Highlights

- **🧠 Smart Realistic Mode (Human Bell Curve):**
  Uses contextual natural probability distribution rather than rigid straight-line scoring:
  - **Workload / Time Spent questions** (e.g. *ECTS workload, reading hours, exam preparation*): Authentically distributes ratings between **4** (~48%), **5** (~34%), and **3** (~18%).
  - **General Teaching & Instructor questions**: Scores mostly **5** (~76%), with natural **4**s (~20%) and occasional **3**s.
  - Generates an authentic **~4.68** overall score, preventing university algorithmic flags for automated straight-lining.
- **🌟 Straight 5s:** Instant perfect score across all Likert items.
- **🎯 High Achiever:** Realistic 80% 5s / 20% 4s split.
- **👍 Solid 4s & 🎲 Randomize:** Multiple presets for every grading preference.
- **🧠 Drop-Down Intelligence:** Intelligently identifies and selects the most positive student responses (*"Çok Fazla"*, *"Fazlasıyla Yeterliydi"*).
- **💧 iOS Liquid Glass Aesthetic:** Multi-layered translucent blur (`backdrop-filter: blur(32px)`), specular edge highlights, and smooth spring physics.
- **✨ 100% Hollow Outline Icons:** Pure vector SVGs with 1.6px delicate stroke widths (zero consumer emojis).
- **🌐 Instant Language Switcher (EN ⇄ TR):** One-click toggle between English and Turkish across all UI elements and notifications.
- **👁️ Floating Pill Visibility Toggle:** Freedom to hide the bottom-right floating pill anytime; control surveys entirely from the toolbar popup if preferred.
- **🌙 / ☀️ Instant Theme Switcher:** Fully customizable Dark and Light modes with persistent storage.
- **⚡ In-Page Floating Quick-Action Pill:** Sleek launcher on the bottom-right for zero-friction evaluation across multiple courses.

---

## 📖 User Guide & How to Use

Evaluating 8–10 courses every semester can take 30+ minutes of tedious clicking. Here is how to complete all evaluations in under 60 seconds:

### Step 1: Open Your Survey Page
Navigate to your university's Student Information System (OBS, EBS, BYS, Proliz, etc.) and open any Course & Instructor Evaluation Survey.

### Step 2: Open the Auto-Fill Widget
You have two quick ways to access the tool:
- **In-Page Floating Pill (Recommended):** Look at the bottom-right corner of your screen for the floating **⚡ Auto-Fill** pill. Click it to expand the modal panel.
- **Browser Toolbar Icon:** Alternatively, click the extension icon in your browser's extension bar.

### Step 3: Choose Your Evaluation Preset

| Preset | Icon | Description | Best Used For |
| :--- | :---: | :--- | :--- |
| **Smart Realistic** | ✦ | Context-aware human distribution (~75% 5s, ~20% 4s, ~5% 3s for workload) | **Everyday use (Recommended)**. Undetectable by university straight-line audit filters while giving instructors top marks. |
| **Straight 5s** | ★ | 100% score of 5 on all Likert questions | When you want to give a beloved professor the absolute maximum score. |
| **High Achiever** | ↗ | 80% 5s and 20% 4s distributed uniformly | High praise with light natural variation. |
| **Solid 4s** | ✓ | Selects 4 on all Likert questions | A consistently positive, good evaluation. |
| **Randomize** | ⇄ | Random ratings from 1 to 5 | Quick testing or simulated mixed feedback. |

### Step 4: Configure Automation Toggles
At the bottom of the panel, you will find two checkboxes:
- **`Smart fill student drop-downs` (Enabled by default):**  
  Scans all `<select>` elements (such as student background, hours spent, prior preparation) and automatically selects the most positive options (*"Çok Fazla"*, *"Fazlasıyla Yeterliydi"*).
- **`Auto-click Save/Submit button`:**  
  When enabled, the extension will automatically click the page's *"Save"* / *"Submit"* / *"Finish Evaluation"* button 500ms after filling, letting you blaze through consecutive courses with a single click.

### Step 5: Visual Confirmation
Once you click a preset, the extension will:
1. Instantly check all radio buttons and select all drop-down values.
2. Trigger native DOM events (`input`, `change`, `click`) so modern web frameworks (React, Angular, ASP.NET, jQuery) register the form updates.
3. Flash each filled row with a brief soft glow animation so you can visually verify that nothing was missed.
4. Display a clean confirmation toast stating the exact number of filled items.

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
5. Select the `obs-survey-autofill` folder on your computer.
6. Open your university portal — the floating **⚡ Auto-Fill** pill will appear automatically!

---

## ⚡ Instant Console One-Liner (Zero-Install Bookmarklet)

If you are on a public computer or do not want to install an extension, you can run this one-liner directly in DevTools:

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

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><b>1. Will my university notice that I used an automated tool?</b></summary>
<p>
If you use <b>Smart Realistic</b> mode, no. Unlike naive scripts that blindly fill all 5s in 1 millisecond, Smart Realistic mode contextualizes questions: workload and time-investment questions are rated with authentic variation (mostly 4s, some 5s, occasional 3s), while instructor delivery is rated with high praise (mostly 5s). The resulting statistical distribution matches genuine human feedback.
</p>
</details>

<details>
<summary><b>2. Is any of my student data sent anywhere?</b></summary>
<p>
Absolutely not. The extension operates 100% locally on your machine. There are no analytics, no external servers, no tracking, and no external dependencies. You can verify every single line of code in <code>content.js</code>.
</p>
</details>

<details>
<summary><b>3. What if my university portal puts rating 1 on the left and 5 on the right?</b></summary>
<p>
The extension first inspects the input values and adjacent label text (looking for explicit digits <code>1</code> through <code>5</code>). It automatically maps to the correct score regardless of column ordering.
</p>
</details>

<details>
<summary><b>4. What if the floating button doesn't appear?</b></summary>
<p>
Simply click the extension's icon in your browser's toolbar, or refresh the page with <code>F5</code>. Make sure the extension is enabled in <code>chrome://extensions</code>.
</p>
</details>

---

## 📂 Project Architecture

```
obs-survey-autofill/
├── manifest.json       # Manifest V3 configuration & permissions
├── content.js          # Core filling engine & DOM event dispatchers
├── content.css         # iOS Liquid Glass design & typography tokens
├── popup.html          # Toolbar extension interface
├── popup.js            # Toolbar message bridge & theme controller
├── icons/              # Extension icons (16px, 48px, 128px)
└── scripts/            # Build & asset generation scripts
```

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).
