import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const ASSETS_DIR = path.resolve(ROOT_DIR, 'assets');
const RES_DIR = path.resolve(ROOT_DIR, 'android/app/src/main/res');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// 1. App Icon SVG (512x512)
function generateIconSvg() {
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#2c1438"/>
      <stop offset="55%" stop-color="#140822"/>
      <stop offset="100%" stop-color="#07030c"/>
    </radialGradient>

    <!-- Gold Metallic Gradients -->
    <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff8db"/>
      <stop offset="25%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#d97706"/>
      <stop offset="75%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>

    <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>

    <!-- Board Wood Frame Gradient -->
    <linearGradient id="woodFrame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a2511"/>
      <stop offset="50%" stop-color="#2e1408"/>
      <stop offset="100%" stop-color="#1c0a04"/>
    </linearGradient>

    <!-- Playing Surface Gradient -->
    <radialGradient id="surfaceGrad" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#fff2d6"/>
      <stop offset="70%" stop-color="#ebd1a7"/>
      <stop offset="100%" stop-color="#d8ba8b"/>
    </radialGradient>

    <!-- Ruby Queen Gradient -->
    <radialGradient id="queenGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ff6b8b"/>
      <stop offset="45%" stop-color="#e11d48"/>
      <stop offset="90%" stop-color="#881337"/>
      <stop offset="100%" stop-color="#4c0519"/>
    </radialGradient>

    <!-- Striker Cyan Glow Gradient -->
    <radialGradient id="strikerGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#e0f7fa"/>
      <stop offset="30%" stop-color="#22d3ee"/>
      <stop offset="70%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>

    <!-- Ivory White Puck -->
    <radialGradient id="whitePuck" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>

    <!-- Obsidian Black Puck -->
    <radialGradient id="blackPuck" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </radialGradient>

    <!-- Drop Shadows -->
    <filter id="boardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.85"/>
      <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#f59e0b" flood-opacity="0.25"/>
    </filter>

    <filter id="puckGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.6"/>
    </filter>

    <filter id="strikerGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#00e5ff" flood-opacity="0.75"/>
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Background Base with rounded squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  
  <!-- Outer Gold Laurel Trim -->
  <rect x="10" y="10" width="492" height="492" rx="104" fill="none" stroke="url(#goldRim)" stroke-width="5" opacity="0.85"/>
  <rect x="18" y="18" width="476" height="476" rx="98" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.45"/>

  <!-- Centered Isometric Carrom Board Container -->
  <g transform="translate(256, 256)" filter="url(#boardShadow)">
    <!-- Board Outer Rim (Dark Wood) -->
    <rect x="-170" y="-170" width="340" height="340" rx="36" fill="url(#woodFrame)" stroke="#5c2e17" stroke-width="4"/>
    
    <!-- Wooden Cushion Inner Borders -->
    <rect x="-144" y="-144" width="288" height="288" rx="20" fill="#240f06" stroke="#120703" stroke-width="2"/>

    <!-- Playing Board Surface -->
    <rect x="-132" y="-132" width="264" height="264" rx="12" fill="url(#surfaceGrad)"/>

    <!-- Corner Pockets with Brass Trim -->
    <g>
      <!-- Top-Left -->
      <circle cx="-116" cy="-116" r="21" fill="#110905"/>
      <circle cx="-116" cy="-116" r="21" fill="none" stroke="#b45309" stroke-width="3"/>
      <!-- Top-Right -->
      <circle cx="116" cy="-116" r="21" fill="#110905"/>
      <circle cx="116" cy="-116" r="21" fill="none" stroke="#b45309" stroke-width="3"/>
      <!-- Bottom-Left -->
      <circle cx="-116" cy="116" r="21" fill="#110905"/>
      <circle cx="-116" cy="116" r="21" fill="none" stroke="#b45309" stroke-width="3"/>
      <!-- Bottom-Right -->
      <circle cx="116" cy="116" r="21" fill="#110905"/>
      <circle cx="116" cy="116" r="21" fill="none" stroke="#b45309" stroke-width="3"/>
    </g>

    <!-- Red Baseline System -->
    <g stroke="#b91c1c" stroke-width="1.8" fill="none" opacity="0.85">
      <!-- Outer Square Guideline -->
      <rect x="-92" y="-92" width="184" height="184" rx="6"/>
      <!-- Circle Baselines in corners of guide -->
      <circle cx="-82" cy="-82" r="9" fill="#dc2626" fill-opacity="0.25"/>
      <circle cx="82" cy="-82" r="9" fill="#dc2626" fill-opacity="0.25"/>
      <circle cx="-82" cy="82" r="9" fill="#dc2626" fill-opacity="0.25"/>
      <circle cx="82" cy="82" r="9" fill="#dc2626" fill-opacity="0.25"/>

      <!-- Diagonal Arrow Guides -->
      <line x1="-36" y1="-36" x2="-68" y2="-68"/>
      <line x1="36" y1="-36" x2="68" y2="-68"/>
      <line x1="-36" y1="36" x2="-68" y2="68"/>
      <line x1="36" y1="36" x2="68" y2="68"/>
    </g>

    <!-- Center Mandala Rings -->
    <circle cx="0" cy="0" r="42" fill="none" stroke="#b45309" stroke-width="2" opacity="0.7"/>
    <circle cx="0" cy="0" r="32" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
    <circle cx="0" cy="0" r="16" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>

    <!-- Dynamic Aim Raycast Line -->
    <line x1="-35" y1="82" x2="3" y2="12" stroke="#00e5ff" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 4" opacity="0.85"/>
    <line x1="-35" y1="82" x2="3" y2="12" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.95"/>

    <!-- Carrom Men Surrounding Center -->
    <g filter="url(#puckGlow)">
      <!-- Ivory Pucks -->
      <circle cx="-18" cy="-12" r="13" fill="url(#whitePuck)" stroke="#b45309" stroke-width="1.5"/>
      <circle cx="18" cy="12" r="13" fill="url(#whitePuck)" stroke="#b45309" stroke-width="1.5"/>
      <circle cx="0" cy="-22" r="13" fill="url(#whitePuck)" stroke="#b45309" stroke-width="1.5"/>
      
      <!-- Obsidian Pucks -->
      <circle cx="18" cy="-12" r="13" fill="url(#blackPuck)" stroke="#475569" stroke-width="1.5"/>
      <circle cx="-18" cy="12" r="13" fill="url(#blackPuck)" stroke="#475569" stroke-width="1.5"/>
      <circle cx="0" cy="22" r="13" fill="url(#blackPuck)" stroke="#475569" stroke-width="1.5"/>

      <!-- Center Ruby Queen -->
      <circle cx="0" cy="0" r="14" fill="url(#queenGrad)" stroke="#fbbf24" stroke-width="2"/>
      <circle cx="0" cy="0" r="5" fill="#fef08a"/>
      <!-- Queen Sparkle -->
      <path d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z" fill="#ffffff"/>
    </g>

    <!-- Tournament Cyan Striker positioned on baseline -->
    <g filter="url(#strikerGlow)">
      <circle cx="-35" cy="82" r="23" fill="url(#strikerGrad)" stroke="#ffffff" stroke-width="3.5"/>
      <circle cx="-35" cy="82" r="16" fill="none" stroke="#a5f3fc" stroke-width="2"/>
      <circle cx="-35" cy="82" r="6" fill="#ffffff"/>
      <!-- Impact Burst Light -->
      <circle cx="3" cy="12" r="5" fill="#00e5ff" opacity="0.8"/>
      <circle cx="3" cy="12" r="2.5" fill="#ffffff"/>
    </g>
  </g>

  <!-- Golden Crown / Laurel Peak -->
  <g transform="translate(256, 46)">
    <!-- Crown icon -->
    <path d="M -24 16 L -16 0 L 0 10 L 16 0 L 24 16 Z" fill="url(#goldRim)"/>
    <circle cx="-16" cy="0" r="3" fill="#ffffff"/>
    <circle cx="0" cy="10" r="3" fill="#ffffff"/>
    <circle cx="16" cy="0" r="3" fill="#ffffff"/>
    <circle cx="0" cy="-2" r="3.5" fill="#fde047"/>
  </g>
</svg>`;
}

// 2. Adaptive Icon Foreground (432x432) for Android
function generateAdaptiveForegroundSvg() {
  return `<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gold Metallic Gradients -->
    <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff8db"/>
      <stop offset="30%" stop-color="#f59e0b"/>
      <stop offset="70%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>

    <linearGradient id="woodFrame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a2511"/>
      <stop offset="50%" stop-color="#2e1408"/>
      <stop offset="100%" stop-color="#1c0a04"/>
    </linearGradient>

    <radialGradient id="surfaceGrad" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#fff2d6"/>
      <stop offset="70%" stop-color="#ebd1a7"/>
      <stop offset="100%" stop-color="#d8ba8b"/>
    </radialGradient>

    <radialGradient id="queenGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ff6b8b"/>
      <stop offset="50%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#4c0519"/>
    </radialGradient>

    <radialGradient id="strikerGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#e0f7fa"/>
      <stop offset="30%" stop-color="#22d3ee"/>
      <stop offset="70%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>

    <radialGradient id="whitePuck" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>

    <radialGradient id="blackPuck" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </radialGradient>

    <filter id="foreShadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.8"/>
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#00e5ff" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Centered Safe Zone 260x260 -->
  <g transform="translate(216, 216) scale(0.95)" filter="url(#foreShadow)">
    <!-- Board Outer Rim -->
    <rect x="-135" y="-135" width="270" height="270" rx="30" fill="url(#woodFrame)" stroke="#5c2e17" stroke-width="4"/>
    <rect x="-114" y="-114" width="228" height="228" rx="16" fill="#240f06" stroke="#120703" stroke-width="2"/>
    <rect x="-104" y="-104" width="208" height="208" rx="10" fill="url(#surfaceGrad)"/>

    <!-- Pockets -->
    <circle cx="-92" cy="-92" r="17" fill="#110905" stroke="#b45309" stroke-width="2.5"/>
    <circle cx="92" cy="-92" r="17" fill="#110905" stroke="#b45309" stroke-width="2.5"/>
    <circle cx="-92" cy="92" r="17" fill="#110905" stroke="#b45309" stroke-width="2.5"/>
    <circle cx="92" cy="92" r="17" fill="#110905" stroke="#b45309" stroke-width="2.5"/>

    <!-- Center Pattern -->
    <circle cx="0" cy="0" r="34" fill="none" stroke="#b45309" stroke-width="1.8" opacity="0.7"/>
    <circle cx="0" cy="0" r="13" fill="#fef2f2" stroke="#dc2626" stroke-width="1.8"/>

    <!-- Aim Line -->
    <line x1="-30" y1="65" x2="3" y2="10" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="5 3"/>

    <!-- Pucks Cluster -->
    <circle cx="-14" cy="-10" r="11" fill="url(#whitePuck)" stroke="#b45309" stroke-width="1.2"/>
    <circle cx="14" cy="10" r="11" fill="url(#whitePuck)" stroke="#b45309" stroke-width="1.2"/>
    <circle cx="14" cy="-10" r="11" fill="url(#blackPuck)" stroke="#475569" stroke-width="1.2"/>
    <circle cx="-14" cy="10" r="11" fill="url(#blackPuck)" stroke="#475569" stroke-width="1.2"/>

    <!-- Queen -->
    <circle cx="0" cy="0" r="12" fill="url(#queenGrad)" stroke="#fbbf24" stroke-width="1.8"/>
    <circle cx="0" cy="0" r="4" fill="#fef08a"/>

    <!-- Striker -->
    <circle cx="-30" cy="65" r="19" fill="url(#strikerGrad)" stroke="#ffffff" stroke-width="3"/>
    <circle cx="-30" cy="65" r="5" fill="#ffffff"/>
  </g>
</svg>`;
}

// 3. Adaptive Icon Background (432x432)
function generateAdaptiveBackgroundSvg() {
  return `<svg width="432" height="432" viewBox="0 0 432 432" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#341744"/>
      <stop offset="50%" stop-color="#190a2a"/>
      <stop offset="100%" stop-color="#080310"/>
    </radialGradient>
  </defs>
  <rect width="432" height="432" fill="url(#bgGrad)"/>
  <!-- Subtle decorative mandala rays -->
  <g transform="translate(216, 216)" stroke="#f59e0b" stroke-width="0.8" opacity="0.18">
    <circle r="160" fill="none"/>
    <circle r="120" fill="none" stroke-dasharray="6 4"/>
    <line x1="-180" y1="0" x2="180" y2="0"/>
    <line x1="0" y1="-180" x2="0" y2="180"/>
    <line x1="-127" y1="-127" x2="127" y2="127"/>
    <line x1="-127" y1="127" x2="127" y2="-127"/>
  </g>
</svg>`;
}

// 4. Feature Graphic SVG (1024x500)
function generateFeatureGraphicSvg() {
  return `<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Vignette -->
    <radialGradient id="featBg" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#2c1445"/>
      <stop offset="45%" stop-color="#160824"/>
      <stop offset="100%" stop-color="#08020e"/>
    </radialGradient>

    <!-- Warm Golden Light Burst -->
    <radialGradient id="lightBurst" cx="28%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45"/>
      <stop offset="50%" stop-color="#ec4899" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>

    <!-- 3D Gold Text Gradient -->
    <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="90%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>

    <!-- Board Surface & Pieces -->
    <radialGradient id="surfaceGrad" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#fff4db"/>
      <stop offset="70%" stop-color="#ebcf9f"/>
      <stop offset="100%" stop-color="#d4af78"/>
    </radialGradient>

    <radialGradient id="queenGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ff6b8b"/>
      <stop offset="45%" stop-color="#e11d48"/>
      <stop offset="90%" stop-color="#881337"/>
      <stop offset="100%" stop-color="#4c0519"/>
    </radialGradient>

    <radialGradient id="strikerGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#e0f7fa"/>
      <stop offset="30%" stop-color="#22d3ee"/>
      <stop offset="70%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>

    <radialGradient id="whitePuck" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>

    <radialGradient id="blackPuck" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </radialGradient>

    <!-- Filters -->
    <filter id="glow3d" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000000" flood-opacity="0.9"/>
      <feDropShadow dx="0" dy="0" stdDeviation="22" flood-color="#f59e0b" flood-opacity="0.35"/>
    </filter>

    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="#00e5ff" flood-opacity="0.85"/>
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1024" height="500" fill="url(#featBg)"/>
  <rect width="1024" height="500" fill="url(#lightBurst)"/>

  <!-- Left: Stylized 3D Carrom Board Showcase -->
  <g transform="translate(270, 250) rotate(-7)" filter="url(#glow3d)">
    <!-- Wooden Frame -->
    <rect x="-190" y="-190" width="380" height="380" rx="32" fill="#381a0b" stroke="#5a2c14" stroke-width="5"/>
    <rect x="-162" y="-162" width="324" height="324" rx="18" fill="#200d05" stroke="#120703" stroke-width="2"/>
    <rect x="-150" y="-150" width="300" height="300" rx="10" fill="url(#surfaceGrad)"/>

    <!-- Pockets -->
    <circle cx="-132" cy="-132" r="23" fill="#0d0603" stroke="#b45309" stroke-width="3"/>
    <circle cx="132" cy="-132" r="23" fill="#0d0603" stroke="#b45309" stroke-width="3"/>
    <circle cx="-132" cy="132" r="23" fill="#0d0603" stroke="#b45309" stroke-width="3"/>
    <circle cx="132" cy="132" r="23" fill="#0d0603" stroke="#b45309" stroke-width="3"/>

    <!-- Guidelines -->
    <rect x="-106" y="-106" width="212" height="212" rx="6" fill="none" stroke="#dc2626" stroke-width="2" opacity="0.75"/>
    <circle cx="0" cy="0" r="48" fill="none" stroke="#b45309" stroke-width="2" opacity="0.65"/>
    <circle cx="0" cy="0" r="18" fill="#fef2f2" stroke="#dc2626" stroke-width="2.5"/>

    <!-- Aim Trail -->
    <line x1="-40" y1="95" x2="6" y2="15" stroke="#00e5ff" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 5"/>

    <!-- Pucks in Motion -->
    <circle cx="-20" cy="-15" r="15" fill="url(#whitePuck)" stroke="#b45309" stroke-width="1.8"/>
    <circle cx="20" cy="15" r="15" fill="url(#whitePuck)" stroke="#b45309" stroke-width="1.8"/>
    <circle cx="20" cy="-15" r="15" fill="url(#blackPuck)" stroke="#475569" stroke-width="1.8"/>
    <circle cx="-20" cy="15" r="15" fill="url(#blackPuck)" stroke="#475569" stroke-width="1.8"/>

    <!-- Center Queen -->
    <circle cx="0" cy="0" r="16" fill="url(#queenGrad)" stroke="#fde047" stroke-width="2.5"/>
    <circle cx="0" cy="0" r="6" fill="#fef08a"/>

    <!-- High Powered Striker with Cyan Glow -->
    <g filter="url(#neonGlow)">
      <circle cx="-40" cy="95" r="26" fill="url(#strikerGrad)" stroke="#ffffff" stroke-width="4"/>
      <circle cx="-40" cy="95" r="8" fill="#ffffff"/>
    </g>

    <!-- Dynamic Sparkles -->
    <circle cx="8" cy="12" r="6" fill="#00e5ff"/>
    <circle cx="8" cy="12" r="3" fill="#ffffff"/>
    <circle cx="28" cy="-5" r="3" fill="#fde047"/>
    <circle cx="-15" cy="30" r="3.5" fill="#f43f5e"/>
  </g>

  <!-- Right: Royal Typography & Feature Badges -->
  <g transform="translate(560, 60)">
    <!-- Header Pill Badge -->
    <rect x="0" y="20" width="360" height="34" rx="17" fill="#3b1548" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="180" y="42" fill="#fde047" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="2">
      ★ ROYAL BOARD CHAMPIONSHIP ★
    </text>

    <!-- Main Title "CARROM" -->
    <text x="0" y="125" fill="url(#goldTextGrad)" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" letter-spacing="3" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.85))">
      CARROM
    </text>

    <!-- Main Title "ODYSSEY" -->
    <text x="0" y="185" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="900" letter-spacing="4" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.9))">
      ODYSSEY
    </text>

    <!-- Subtitle -->
    <text x="0" y="222" fill="#cbd5e1" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" letter-spacing="1">
      Authentic ICF Physics • Single Player &amp; 1v1 Table
    </text>

    <!-- 3 Feature Chips -->
    <g transform="translate(0, 248)">
      <!-- Chip 1: 999 Levels -->
      <g transform="translate(0, 0)">
        <rect width="135" height="38" rx="12" fill="#241033" stroke="#ec4899" stroke-width="1.2"/>
        <text x="67" y="24" fill="#fbcfe8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" text-anchor="middle">
          🏆 999 SAGA LVLS
        </text>
      </g>

      <!-- Chip 2: Smart AI -->
      <g transform="translate(145, 0)">
        <rect width="135" height="38" rx="12" fill="#141d38" stroke="#00e5ff" stroke-width="1.2"/>
        <text x="67" y="24" fill="#bae6fd" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" text-anchor="middle">
          🤖 SMART AI BOT
        </text>
      </g>

      <!-- Chip 3: 1v1 Pass & Play -->
      <g transform="translate(290, 0)">
        <rect width="135" height="38" rx="12" fill="#30141a" stroke="#f43f5e" stroke-width="1.2"/>
        <text x="67" y="24" fill="#fecdd3" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" text-anchor="middle">
          👥 1v1 LOCAL
        </text>
      </g>
    </g>

    <!-- Bottom Highlights List -->
    <g transform="translate(0, 312)">
      <!-- Item 1 -->
      <circle cx="8" cy="8" r="4" fill="#f59e0b"/>
      <text x="20" y="13" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">
        Realistic friction, cushion bounce &amp; bank shots
      </text>

      <!-- Item 2 -->
      <circle cx="8" cy="32" r="4" fill="#00e5ff"/>
      <text x="20" y="37" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">
        Upgrade Strikers, Powder Durability &amp; Board Skins
      </text>

      <!-- Item 3 -->
      <circle cx="8" cy="56" r="4" fill="#10b981"/>
      <text x="20" y="61" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600">
        Daily Lucky Fortune Chakra &amp; Trickshot Challenges
      </text>
    </g>
  </g>

  <!-- Ambient Light Sparks across Canvas -->
  <circle cx="120" cy="80" r="2.5" fill="#fde047" opacity="0.6"/>
  <circle cx="480" cy="420" r="3" fill="#ec4899" opacity="0.7"/>
  <circle cx="940" cy="110" r="2" fill="#00e5ff" opacity="0.7"/>
  <circle cx="780" cy="440" r="3.5" fill="#f59e0b" opacity="0.6"/>
</svg>`;
}

// 5. Splash Screen SVG (1280x1920)
function generateSplashSvg(width = 1280, height = 1920) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 1280 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="splashBg" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#2a1239"/>
      <stop offset="50%" stop-color="#140822"/>
      <stop offset="100%" stop-color="#07030c"/>
    </radialGradient>

    <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="90%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>

    <radialGradient id="queenGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ff6b8b"/>
      <stop offset="45%" stop-color="#e11d48"/>
      <stop offset="90%" stop-color="#881337"/>
      <stop offset="100%" stop-color="#4c0519"/>
    </radialGradient>

    <radialGradient id="strikerGrad" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#e0f7fa"/>
      <stop offset="30%" stop-color="#22d3ee"/>
      <stop offset="70%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>

    <radialGradient id="whitePuck" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>

    <radialGradient id="blackPuck" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </radialGradient>

    <filter id="splashGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="20" stdDeviation="30" flood-color="#000000" flood-opacity="0.9"/>
      <feDropShadow dx="0" dy="0" stdDeviation="25" flood-color="#f59e0b" flood-opacity="0.4"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#splashBg)"/>

  <!-- Center Artwork Emblem -->
  <g transform="translate(${width / 2}, ${height / 2 - 80})" filter="url(#splashGlow)">
    <!-- Aura Ring -->
    <circle r="190" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="10 8" opacity="0.45"/>
    <circle r="160" fill="none" stroke="#ec4899" stroke-width="1.5" opacity="0.3"/>

    <!-- Carrom Board Icon Centerpiece -->
    <rect x="-110" y="-110" width="220" height="220" rx="36" fill="#3b1a0e" stroke="#6b341c" stroke-width="4"/>
    <rect x="-92" y="-92" width="184" height="184" rx="16" fill="#fdf0d5" stroke="#240f06" stroke-width="2"/>

    <!-- Pockets -->
    <circle cx="-76" cy="-76" r="14" fill="#0d0603" stroke="#b45309" stroke-width="2"/>
    <circle cx="76" cy="-76" r="14" fill="#0d0603" stroke="#b45309" stroke-width="2"/>
    <circle cx="-76" cy="76" r="14" fill="#0d0603" stroke="#b45309" stroke-width="2"/>
    <circle cx="76" cy="76" r="14" fill="#0d0603" stroke="#b45309" stroke-width="2"/>

    <!-- Mandala & Queen -->
    <circle cx="0" cy="0" r="30" fill="none" stroke="#b45309" stroke-width="1.8"/>
    <circle cx="-14" cy="-10" r="10" fill="url(#whitePuck)"/>
    <circle cx="14" cy="10" r="10" fill="url(#whitePuck)"/>
    <circle cx="14" cy="-10" r="10" fill="url(#blackPuck)"/>
    <circle cx="-14" cy="10" r="10" fill="url(#blackPuck)"/>
    <circle cx="0" cy="0" r="11" fill="url(#queenGrad)" stroke="#fde047" stroke-width="2"/>

    <!-- Striker on baseline -->
    <circle cx="-25" cy="55" r="16" fill="url(#strikerGrad)" stroke="#ffffff" stroke-width="2.5"/>
    <line x1="-25" y1="55" x2="0" y2="8" stroke="#00e5ff" stroke-width="2.5" stroke-dasharray="4 3"/>
  </g>

  <!-- Title & Subtitle Below Emblem -->
  <g transform="translate(${width / 2}, ${height / 2 + 180})" text-anchor="middle">
    <text y="0" fill="url(#goldTextGrad)" font-family="system-ui, -apple-system, sans-serif" font-size="64" font-weight="900" letter-spacing="4" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.8))">
      CARROM
    </text>
    <text y="60" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="900" letter-spacing="6" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.85))">
      ODYSSEY
    </text>
    <text y="105" fill="#f59e0b" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" letter-spacing="2">
      ROYAL BOARD CHAMPIONSHIP
    </text>
    <text y="140" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" letter-spacing="1">
      Authentic ICF Tournament Physics
    </text>
  </g>
</svg>`;
}

// 6. Multi-density Android Mipmaps Generation
async function generateMipmaps() {
  const densities = [
    { name: 'mipmap-mdpi', iconSize: 48, foreSize: 108 },
    { name: 'mipmap-hdpi', iconSize: 72, foreSize: 162 },
    { name: 'mipmap-xhdpi', iconSize: 96, foreSize: 216 },
    { name: 'mipmap-xxhdpi', iconSize: 144, foreSize: 324 },
    { name: 'mipmap-xxxhdpi', iconSize: 192, foreSize: 432 },
  ];

  const iconSvg = generateIconSvg();
  const foreSvg = generateAdaptiveForegroundSvg();
  const backSvg = generateAdaptiveBackgroundSvg();

  for (const d of densities) {
    const dir = path.join(RES_DIR, d.name);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // ic_launcher.png (Square)
    await sharp(Buffer.from(iconSvg))
      .resize(d.iconSize, d.iconSize)
      .png({ quality: 100 })
      .toFile(path.join(dir, 'ic_launcher.png'));

    // ic_launcher_round.png (Circular mask)
    const circleSvg = `<svg width="${d.iconSize}" height="${d.iconSize}"><circle cx="${d.iconSize/2}" cy="${d.iconSize/2}" r="${d.iconSize/2}" fill="#ffffff"/></svg>`;
    await sharp(Buffer.from(iconSvg))
      .resize(d.iconSize, d.iconSize)
      .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
      .png({ quality: 100 })
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png
    await sharp(Buffer.from(foreSvg))
      .resize(d.foreSize, d.foreSize)
      .png({ quality: 100 })
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
  }

  // Adaptive icon background in mipmap-anydpi-v26 or drawable
  const anydpiDir = path.join(RES_DIR, 'mipmap-anydpi-v26');
  if (!fs.existsSync(anydpiDir)) fs.mkdirSync(anydpiDir, { recursive: true });

  await sharp(Buffer.from(backSvg))
    .resize(432, 432)
    .png({ quality: 100 })
    .toFile(path.join(RES_DIR, 'mipmap-xxxhdpi', 'ic_launcher_background.png'));

  // Ensure adaptive icon XML definitions
  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf8');
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf8');

  console.log('✅ Generated Android mipmaps and adaptive XML icons.');
}

// 7. Multi-density Splash Screens
async function generateSplashScreens() {
  const splashLevels = [
    { dir: 'drawable-port-mdpi', w: 320, h: 480 },
    { dir: 'drawable-port-hdpi', w: 480, h: 800 },
    { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
    { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
    { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
    { dir: 'drawable-land-mdpi', w: 480, h: 320 },
    { dir: 'drawable-land-hdpi', w: 800, h: 480 },
    { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
    { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
    { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 },
  ];

  const splashSvg = generateSplashSvg(1280, 1920);
  const splashBuffer = Buffer.from(splashSvg);

  for (const s of splashLevels) {
    const dir = path.join(RES_DIR, s.dir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await sharp(splashBuffer)
      .resize(s.w, s.h, { fit: 'cover' })
      .png({ quality: 100 })
      .toFile(path.join(dir, 'splash.png'));
  }

  // Base drawable fallback
  const baseDrawable = path.join(RES_DIR, 'drawable');
  if (!fs.existsSync(baseDrawable)) fs.mkdirSync(baseDrawable, { recursive: true });
  await sharp(splashBuffer)
    .resize(480, 800, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile(path.join(baseDrawable, 'splash.png'));

  console.log('✅ Generated all portrait and landscape splash screens.');
}

// Main Execution
async function main() {
  console.log('🚀 Starting Carrom Odyssey Production Asset Pipeline...');

  // 1. Google Play Store 512x512 Icon
  console.log('1. Rendering Google Play Store 512x512 Icon...');
  const iconSvg = generateIconSvg();
  const storeIconPath = path.join(ASSETS_DIR, 'playstore_icon_512.png');
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(storeIconPath);

  // Also root level copy for convenience
  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(ROOT_DIR, 'playstore_icon_512.png'));

  // 2. Google Play Store 1024x500 Feature Graphic
  console.log('2. Rendering Google Play Store 1024x500 Feature Graphic...');
  const featureSvg = generateFeatureGraphicSvg();
  const storeFeaturePath = path.join(ASSETS_DIR, 'playstore_feature_1024x500.png');
  await sharp(Buffer.from(featureSvg))
    .resize(1024, 500)
    .png({ quality: 100 })
    .toFile(storeFeaturePath);

  // Also root level copy
  await sharp(Buffer.from(featureSvg))
    .resize(1024, 500)
    .png({ quality: 100 })
    .toFile(path.join(ROOT_DIR, 'playstore_feature_1024x500.png'));

  // 3. PWA Web Icons in public/
  const publicDir = path.join(ROOT_DIR, 'public');
  if (fs.existsSync(publicDir)) {
    await sharp(Buffer.from(iconSvg)).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
    await sharp(Buffer.from(iconSvg)).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
    await sharp(Buffer.from(iconSvg)).resize(64, 64).png().toFile(path.join(publicDir, 'favicon.png'));
  }

  // 4. Android Mipmap Icons
  console.log('3. Generating Android Mipmap Icons...');
  await generateMipmaps();

  // 5. Android Splash Screens
  console.log('4. Generating Android Splash Screens...');
  await generateSplashScreens();

  console.log('✨ All Production Assets Generated Successfully!');
  console.log(`📁 Store Icon: ${storeIconPath}`);
  console.log(`📁 Store Feature Graphic: ${storeFeaturePath}`);
}

main().catch(err => {
  console.error('❌ Asset generation failed:', err);
  process.exit(1);
});
