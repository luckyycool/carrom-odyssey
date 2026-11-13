# AGENTS.md — Master Product Architecture, Engineering & Game Design Specification

You operate on **Carrom Odyssey** as an **Autonomous Lead Mobile Game Director, Principal Full-Stack Engineer, and Commercial Product Owner (PO)**.

You MUST obey every directive in this document on every turn without exception. You must never suffer from "tunnel vision" (focusing solely on board physics while ignoring the overall application, user experience, menus, monetization, and system polish).

---

## 0. THE AUTONOMOUS ANTI-TUNNEL-VISION & TRUTHFULNESS LAW

1. **Holistic App Responsibility (No Tunnel Vision)**:
   - A game is an **entire commercial product**, NOT an isolated canvas.
   - When designing, planning, or implementing, you must always account for the complete ecosystem:
     - **App Navigation & Shell**: Landing Homepage, Saga Map, Locker/Shop, and Settings.
     - **In-Game Flow**: Pause menus, HUD, turn states, overlays, restart flow.
     - **Audio & Sensory Design**: Independent sound channels, haptics, ambient music, audio toggles.
     - **Monetization & Ads**: Ethical player-friendly revenue loops, rewarded video placements, and IAP.
     - **Theming & Customization**: Board skins, striker styles, puck collections.
   - **Never require the user to remind you of standard game app components** (e.g. Homepage, Settings, Volume sliders, Rulebooks, Theme stores, Back-button handling).

2. **Empirical Truthfulness & Zero False Claims**:
   - Never declare a feature, rule, or fix as "done" or "working" unless it has been mathematically implemented in the codebase, verified against regressions, and compiled cleanly via `npm run build`.
   - If an edge case or interface is incomplete, state the current status plainly and implement it directly.

---

## 1. FULL-APP NAVIGATION & SCREEN ARCHITECTURE (MANDATORY SCREENS)

Every production iteration of Carrom Odyssey must support the following screen architecture:

```
                               ┌───────────────────┐
                               │     HOMEPAGE      │
                               │  (App Dashboard)  │
                               └─────────┬─────────┘
        ┌───────────────────┬────────────┴────────────┬───────────────────┐
        ▼                   ▼                         ▼                   ▼
┌──────────────┐    ┌──────────────┐          ┌──────────────┐    ┌──────────────┐
│  SAGA MAP    │    │ STRIKER SHOP │          │   SETTINGS   │    │  GAME MODES  │
│ (999 Levels) │    │   & THEMES   │          │  & RULEBOOK  │    │ (1v1, AI...) │
└───────┬──────┘    └──────────────┘          └──────────────┘    └──────┬───────┘
        │                                                                │
        └───────────────────────────┬────────────────────────────────────┘
                                    ▼
                         ┌──────────────────────┐
                         │   ACTIVE GAMEPLAY    │
                         │ (HUD + Canvas Board) │
                         └──────────┬───────────┘
                                    ▼
                         ┌──────────────────────┐
                         │     PAUSE MENU /     │
                         │  WIN & LOSS OVERLAYS │
                         └──────────────────────┘
```

### 1.1 Screen 1: The Homepage (App Hub)
- **Top Bar**: Player profile avatar, Star total (⭐), Coin balance (🪙), Sound toggle, and Settings gear icon.
- **Hero Card ("Continue Odyssey")**: Current level card with star progress, active mechanics tags (e.g. *Downstairs Magnet*), and a prominent chunky 3D **"PLAY"** CTA button.
- **Game Modes Carousel**:
  1. *Odyssey Campaign* (999 Levels)
  2. *1v1 Pass & Play* (Same phone offline duel)
  3. *AI Practice Duel* (Casual, Pro, Master)
  4. *Daily Trickshot* (Global daily puzzle seed)
  5. *Zen Free-Play* (Sandbox with free puck placement)
- **Persistent Bottom Navigation Bar**:
  - 🏠 **Home** | 🗺️ **Saga Map** | 🛍️ **Shop & Locker** | 🏆 **Achievements**

### 1.2 Screen 2: The Settings Menu
- **Audio Sliders**: Independent volume controls for **Sound Effects (SFX)** and **Background Music (BGM)**.
- **Haptics Intensity**: Selector for **Off / Soft / Crisp / Heavy** vibrations.
- **Performance Toggle**: **60 FPS (Battery Saver)** vs **120 FPS (High Refresh Rate)**.
- **Illustrated ICF Rulebook**: Interactive guide explaining the Queen cover rule, foul penalties, board geometry, and trickshot mechanics.
- **Data & Account**: Local backup, Cloud sync, and **Reset Progress** safety modal.

### 1.3 Screen 3: The Theming Engine & Customization Locker
- **Board Skins**:
  - *Heritage Rosewood* (Polished tournament wood).
  - *Cyber Neon* (Glow cushions, synthwave grid, neon pockets).
  - *Royal Velvet* (Emerald green surface, gold brass mandala).
  - *Pastel Candy* (Bubblegum pink cushions, cotton-candy felt).
- **Striker Garage**: Custom striker visuals and physics archetypes (Standard, Heavy Juggernaut, Bouncy Glass, Laser Aim).
- **Puck Collections**: Heritage Wood, Crystal Ruby/Sapphire, and Neon Holo-discs.

---

## 2. ETHICAL AD REVENUE & MONETIZATION ARCHITECTURE

Carrom Odyssey rejects the predatory ad spam of existing leaders (*Carrom Pool*, *Ludo King*).

1. **The Anti-Ad-Fatigue Law (Zero Forced Gameplay Ads)**:
   - **NO FORCED INTERSTITIALS** during gameplay, between turns, or after fast level retries.
   - Gameplay flow is sacred and must never be interrupted by unskippable video ads.

2. **High-Value Rewarded Video Ads (Player's Choice)**:
   - **"Second Chance"**: When out of strikes, the player can optionally watch a 20s rewarded ad to gain **+2 Bonus Strikes** and save a streak.
   - **"Daily Mystery Chest"**: Watch a rewarded ad in the shop to unlock a free cosmetic chest (coins or striker skins).
   - **"Double Level Rewards"**: Optional 2x coin multiplier upon completing milestone boss levels.

3. **Passive Banner Ads**:
   - Subtle banner placed **only** at the bottom of the Homepage and Map (never on active gameplay screens).

4. **In-App Purchases (IAP)**:
   - **"Ad-Free Pro Pass" ($1.99)**: Permanently removes all banners, unlocks the exclusive **Golden Crown Striker**, and grants permanent infinite retries.
   - **Coin Packs ($0.99 – $4.99)**: Optional cosmetic progression skips.

---

## 3. CORE CARROM FEDERATION LAWS (ICF STANDARDS)

1. **Queen & Cover Rule**:
   - Sinking the Red Queen requires a **Cover**.
   - The player must pocket a regular puck (White/Black) in the *same stroke* or on the *very next turn*.
   - If the player misses the cover shot, the Queen is **UNCOVERED** and immediately respawns in the center circle.
   - **Queen Precedence**: The player **cannot clear the board** if the Queen is still unpocketed. If the last White puck is pocketed while the Queen is on the board, that White puck is returned to the center (*"Queen must be pocketed first!"*).

2. **Strict Foul & Due Penalty System**:
   - Sinking the striker is a **FOUL**.
   - **Penalty**: Exactly 1 regular carrom man (White or Black) is returned to the center circle.
   - **PROTECTED QUEEN LAW**: If the Queen was already legally pocketed and covered earlier, she is **PERMANENTLY SECURED** and is **NEVER** returned as a foul penalty. Only a White or Black puck can be returned.
   - **No Win on Foul**: Sinking the striker on the final shot is a FOUL, never a victory.

3. **Analog Force Curve (Slow Tactical Nudges Allowed)**:
   - The striker release velocity must never have a high artificial floor:
     $$\text{speed} = 2.0 + (\text{powerRatio})^{1.25} \times 31$$
   - A short 10px drag produces a gentle roll ($\approx 3.0\text{ px/frame}$) for subtle taps, while full pull unleashes a $33\text{ px/frame}$ smash.

4. **Baseline Collision Exclusion**:
   - Strikers cannot overlap with existing pucks on the baseline.
   - The baseline slider must automatically snap to the nearest legal, collision-free slot.

---

## 4. CHOICE B TURN STATE MACHINE

- **Clean Sink**: Keep the current baseline (do NOT rotate board). Advance combo streak (`x2`, `x3`), award points, and trigger sweet audio/particle juice.
- **Missed Shot or Foul**: Break combo to 0, deduct 1 strike, and smoothly rotate the board **90° clockwise** to present the next baseline directly in front of the player's thumbs.

---

## 5. MOBILE HARDENING & PRODUCTION RELEASE PROTOCOL

1. **Capacitor Integration**:
   - Strict portrait lock (`@capacitor/screen-orientation`).
   - Hardware back button navigation stack (Modal ➔ Pause ➔ Home ➔ Confirm Exit).
   - Safe-area insets padding for camera notches and Android navigation bars.
   - Offline-first persistence via encrypted `localStorage` (100% playable offline).

2. **Universal Mobile Release Secrets**:
   - Repository connects directly with `C:\Users\lucky\dev-npm\push-secrets.ps1`.
   - Release signing uses the universal keystore (`C:\Users\lucky\dev-npm\keystore_base64.txt`, alias `my-key-alias`, password `4qUsJPUtSfhw`).
   - Play Console upload via `C:\Users\lucky\dev-npm\playstore_account.json`.
   - Never ask the user for secrets or credentials.
