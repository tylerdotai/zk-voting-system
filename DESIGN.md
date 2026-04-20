# ZK Voting System — Design Language
# Fort Worth DAO Brand Alignment

**Source:** [fwtx.city](https://fwtx.city) + [constitution.fwtx.city](https://constitution.fwtx.city)  
**Context:** HackFW 2026 demo — Fort Worth DAO onchain Rob's Rules voting  
**Status:** Applied to ZK Voting System frontend (v1.0)

---

## Brand Positioning

**FWTX DAO** — Fort Worth's municipal DAO evangelizing digital sovereignty and property rights.  
The ZK Voting System is a civic governance tool for this DAO: onchain, transparent, professional.

The design should feel: **professional, civic, trustworthy** — not crypto-flashy or NFT-punky.  
This is government-adjacent infrastructure, not a consumer DeFi app.

---

## Color Palette

### Primary — Civic Blue
```
--fw-blue:       #1e3a5f   /* Deep navy — authority, trust, civic */
--fw-blue-light: #2d5a8a   /* Hover state */
--fw-blue-pale:  #e8f0f8   /* Section backgrounds */
```

### Accent — Fort Worth Orange
```
--fw-orange:     #ff6b00   /* Energy, action, CTA buttons */
--fw-orange-dark: #e55d00  /* Hover state */
```

### Neutrals
```
--fw-dark:        #1a1a1a   /* Primary text, headers */
--fw-gray:        #6b7280   /* Secondary text, labels */
--fw-light:       #f9fafb   /* Page background */
--fw-border:      #e5e7eb   /* Card borders, dividers */
--fw-white:       #ffffff   /* Cards, panels */
```

### Semantic — Proposal States
```
--state-created:  #9ca3af   /* Gray — Awaiting second */
--state-seconded: #f59e0b   /* Amber — Ready for voting */
--state-voting:   #22c55e   /* Green — Active voting */
--state-passed:   #10b981   /* Teal — Passed */
--state-failed:   #ef4444   /* Red — Failed */
```

---

## Typography

**Font Stack:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Scale:**
| Element | Size | Weight |
|---------|------|--------|
| Page title | 1.5rem | 700 |
| Proposal description | 1.5–1.75rem | 700 |
| Section header | 0.8rem | 600 uppercase |
| Body text | 1rem | 400 |
| Vote count (large) | 4–5rem | 800 |
| Button label | 1.1rem | 700 uppercase |

**Principles:**
- Large enough for back-of-room readability (60-person demo)
- High contrast — dark text on white, never gray-on-gray
- Bold headlines, regular weight body

---

## Layout & Spacing

### Grid System
- Max content width: `1200px` centered
- Card padding: `1.5rem`
- Gap between cards: `1rem`
- Section margin: `2rem`

### Cards
- Background: `#ffffff`
- Border: `2px solid var(--fw-border)`
- Border-radius: `12px`
- Hover: border transitions to `--fw-orange` with subtle shadow

### Header Bar
- Background: `--fw-dark` (#1a1a1a)
- White text, full-width
- Optional network badge (Sepolia indicator)

### Two-Column Layout (Chair Dashboard)
- Left: Proposal list + create form (scrollable)
- Right: Detail panel (sticky, shows selected proposal)
- Breakpoint: single column on mobile

---

## UI Components

### State Badges
Pill-shaped, all-caps, white text on colored background:
```css
.state-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  color: #fff;
}
```

### Buttons — Primary (Call to Action)
```css
background: var(--fw-orange);
color: #fff;
padding: 1.25rem 2rem;
font-size: 1.1rem;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.03em;
border-radius: 10px;
border: none;
cursor: pointer;
```
- Hover: darken to `--fw-orange-dark`, lift `translateY(-1px)`
- Disabled: `opacity: 0.4; cursor: not-allowed`

### Buttons — Secondary
```css
background: var(--fw-dark);
color: #fff;
/* Same sizing as primary */
```

### Vote Count Cells (Large Display)
Three-column grid, each cell:
```css
background: var(--fw-light);
border-radius: 12px;
padding: 1.5rem;
text-align: center;
```
- Count number: 4–5rem, font-weight 800
- Label: 1rem, uppercase, letter-spacing

### Progress Bar (Parliamentary State)
Horizontal step indicator:
```css
.progress-step {
  flex: 1;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.75rem 0;
  border-top: 4px solid var(--fw-border);
}
/* Active: --fw-orange border | Done: --state-passed border */
```

---

## Motion & Transitions

- Hover transitions: `0.15s` ease
- Button lift on hover: `translateY(-1px)` or `-2px`
- Toast fade: `opacity 0→1`, `0.3s`
- No jarring animations — this is civic infrastructure

---

## PWA / Offline

- Background: white (`#ffffff`) — lighter loads better on projection
- Service worker: network-first strategy
- Manifest: `display: standalone`, theme color `#1a1a1a`

---

## What to Avoid

- ❌ Emoji in UI — text labels only
- ❌ Dark backgrounds for main content — light theme for projector readability
- ❌ Flashy crypto aesthetics — no neon, no gradient crypto logos
- ❌ Decorative complexity — clean, focused, readable
- ❌ Small text — minimum 1rem body, 1.5rem+ for key content

---

## CSS Custom Properties (Single Source of Truth)

```css
:root {
  --fw-blue:       #1e3a5f;
  --fw-orange:     #ff6b00;
  --fw-dark:       #1a1a1a;
  --fw-gray:       #6b7280;
  --fw-light:      #f9fafb;
  --fw-border:     #e5e7eb;
  --state-created:  #9ca3af;
  --state-seconded: #f59e0b;
  --state-voting:  #22c55e;
  --state-passed:  #10b981;
  --state-failed:  #ef4444;
}
```

---

## Reference Sites

- **FWTX DAO:** https://fwtx.city
- **Constitution/Whitepaper:** https://constitution.fwtx.city
- **HackFW:** https://hack.fwtx.city (April 2–May 2, 2026)

---

## Applied To

- `frontend/rob-rules.html` — Chair dashboard (v1.0 applied)
- `frontend/index.html` — Voter portal (v1.0 applied)