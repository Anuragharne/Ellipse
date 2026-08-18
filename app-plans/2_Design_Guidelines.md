# 2. Design Guidelines — Ellipse Design System

This document defines the complete visual identity for Ellipse. Every screen, component, and interaction across both the Citizen Mobile App and the Authority Web Dashboard must adhere to these specifications.

---

## 1. Brand Foundation

### Color Palette (Gradient 3)

The entire Ellipse brand is built on **Gradient 3** — a progression from electric lime through deep teal to near-black forest green. This gives the app a premium, eco-tech identity that feels modern, authoritative, and clean.

#### Primary Gradient
```
Direction: 135° (top-left to bottom-right)
Stop 1: #E3EF26 (Lime Volt) — 0%
Stop 2: #076653 (Deep Teal) — 50%
Stop 3: #0C342C (Forest Night) — 100%
```

#### Core Color Tokens

| Token Name | Hex | Usage |
|---|---|---|
| `--color-lime` | `#E3EF26` | Primary CTAs, FAB buttons, active states, accent highlights, notification badges |
| `--color-teal` | `#076653` | Secondary surfaces, headers, nav bars, card borders, hover states |
| `--color-forest` | `#0C342C` | App background, card backgrounds, modal overlays |
| `--color-midnight` | `#061F1A` | Deepest background (behind cards), true dark surfaces |
| `--color-lime-muted` | `#B8C41E` | Disabled lime state, secondary text on dark, subtle accents |
| `--color-teal-light` | `#0A8A72` | Links, interactive text, secondary buttons |

#### Neutral Palette (For Text & Surfaces)

| Token Name | Hex | Usage |
|---|---|---|
| `--color-white` | `#FFFFFF` | Primary text on dark backgrounds, headings |
| `--color-gray-100` | `#F0F0F0` | Secondary text, descriptions, timestamps |
| `--color-gray-200` | `#B0B0B0` | Tertiary text, placeholders, disabled text |
| `--color-gray-800` | `#1A1A1A` | Text on lime-colored surfaces (dark text on light accent) |
| `--color-surface` | `#0F3D33` | Card surfaces (slightly lighter than forest for depth) |
| `--color-surface-elevated` | `#134A3E` | Elevated cards, modals, bottom sheets |

#### Semantic Colors (Status & Feedback)

| Token Name | Hex | Usage |
|---|---|---|
| `--color-severity-critical` | `#FF4D4D` | Severity > 0.75, error states, critical alerts |
| `--color-severity-moderate` | `#FF9F43` | Severity 0.50–0.75, warnings |
| `--color-severity-low` | `#FECA57` | Severity 0.25–0.50, info states |
| `--color-resolved` | `#2ED573` | Resolved complaints, success states |
| `--color-info` | `#54A0FF` | Informational badges, links, crew location markers |

---

## 2. Typography

### Font Families
* **Primary (Headings & Body):** `Philosopher` (Google Fonts) — A refined serif with vintage-humanist character. Gives Ellipse a distinctive, premium identity that stands apart from generic sans-serif civic apps.
* **Secondary (Small UI Text):** `Inter` — Used only for captions, badges, overlines, and data labels where serif fonts lose readability at small sizes (< 13px).
* **Monospace (Data/Codes):** `JetBrains Mono` — For complaint IDs, coordinates, and technical data.
* **Fallback Stacks:**
  * Philosopher: `Philosopher, Georgia, 'Times New Roman', serif`
  * Inter: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

> **Note:** Philosopher is available on Google Fonts in two weights: Regular (400) and Bold (700). No SemiBold exists, so the type scale uses only these two weights for the primary font.

### Type Scale (Mobile)

| Style Name | Size | Weight | Font | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| `display` | 32px | 700 (Bold) | Philosopher | 40px | -0.5px | Splash screen title, empty states |
| `h1` | 28px | 700 (Bold) | Philosopher | 36px | -0.3px | Screen titles |
| `h2` | 22px | 700 (Bold) | Philosopher | 28px | 0px | Section headings, card titles |
| `h3` | 18px | 700 (Bold) | Philosopher | 24px | 0px | Sub-headings, modal titles |
| `body-lg` | 16px | 400 (Regular) | Philosopher | 24px | 0.1px | Primary body text, descriptions |
| `body` | 14px | 400 (Regular) | Philosopher | 20px | 0.15px | Secondary body text, list items |
| `caption` | 12px | 400 (Regular) | Inter | 16px | 0.2px | Timestamps, metadata, labels |
| `overline` | 10px | 700 (Bold) | Inter | 14px | 1.5px | Status badges, category labels (ALL CAPS) |
| `button` | 16px | 700 (Bold) | Philosopher | 20px | 0.5px | Button labels (ALL CAPS) |
| `data` | 14px | 500 (Medium) | JetBrains Mono | 18px | 0px | Complaint IDs, coordinates |

### Type Scale (Web Dashboard)
Scale up by ~20% for desktop readability: `display: 40px`, `h1: 32px`, `h2: 26px`, `body-lg: 18px`, `body: 16px`, `caption: 13px`. Same font assignments apply.

### Font Color Rules (Dark Theme)

| Context | Color Token | Font | Example |
|---|---|---|---|
| Headings & primary text | `--color-white` (#FFFFFF) | Philosopher Bold | Screen titles, card titles |
| Body text & descriptions | `--color-gray-100` (#F0F0F0) | Philosopher Regular | Paragraphs, descriptions |
| Secondary info & metadata | `--color-gray-200` (#B0B0B0) | Inter Regular | Timestamps, distances |
| Interactive text & links | `--color-teal-light` (#0A8A72) | Philosopher Regular | "View Details", "Why this score?" |
| Accent text & highlights | `--color-lime` (#E3EF26) | Philosopher Bold | Credit counts, active tab labels |
| Text on lime surfaces | `--color-gray-800` (#1A1A1A) | Philosopher Bold | Button labels on lime buttons |

---

## 3. Spacing & Layout System

### Base Unit: 4px

All spacing values are multiples of 4px to maintain visual rhythm.

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 4px | Inline icon gaps, tight padding |
| `--space-sm` | 8px | Between related elements, icon-to-text gap |
| `--space-md` | 16px | Card inner padding, between form fields |
| `--space-lg` | 24px | Section spacing, screen edge padding |
| `--space-xl` | 32px | Between major sections |
| `--space-2xl` | 48px | Top/bottom screen padding, hero spacing |

### Mobile Screen Layout
* **Safe area padding:** 16px horizontal, respect system notch/status bar.
* **Card padding:** 16px all sides.
* **Card gap (in lists):** 12px.
* **Bottom navigation bar height:** 64px.
* **FAB size:** 64px diameter, positioned 24px from bottom-right (or bottom-center on Home).

### Web Dashboard Layout
* **Sidebar width:** 260px (collapsed: 72px).
* **Content max-width:** 1440px, centered.
* **Card padding:** 24px.
* **Grid:** 12-column grid with 24px gutters.

---

## 4. Component Styling

### Buttons

#### Primary Button (Lime CTA)
```css
background: #E3EF26;
color: #1A1A1A;
border-radius: 12px;
padding: 16px 24px;
font: 600 16px/20px Inter;
letter-spacing: 0.5px;
text-transform: uppercase;
box-shadow: 0 4px 16px rgba(227, 239, 38, 0.25);
transition: all 0.2s ease;
```
* **Hover/Press:** `background: #B8C41E; transform: scale(0.98);`
* **Disabled:** `background: #3A4A2A; color: #666; box-shadow: none;`

#### Secondary Button (Outline)
```css
background: transparent;
color: #E3EF26;
border: 1.5px solid #E3EF26;
border-radius: 12px;
padding: 16px 24px;
```
* **Hover/Press:** `background: rgba(227, 239, 38, 0.08);`

#### Danger Button (Destructive Actions)
```css
background: #FF4D4D;
color: #FFFFFF;
border-radius: 12px;
```

### Cards

#### Standard Card
```css
background: #0F3D33;
border: 1px solid rgba(7, 102, 83, 0.4);
border-radius: 16px;
padding: 16px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
```

#### Elevated Card (Modals, Bottom Sheets)
```css
background: #134A3E;
border: 1px solid rgba(227, 239, 38, 0.1);
border-radius: 20px;
padding: 24px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
```

#### Glass Card (Special — Splash, Success screens)
```css
background: rgba(7, 102, 83, 0.25);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border: 1px solid rgba(227, 239, 38, 0.15);
border-radius: 20px;
```

### Input Fields

```css
background: #061F1A;
border: 1.5px solid #076653;
border-radius: 12px;
padding: 14px 16px;
color: #FFFFFF;
font: 400 16px/24px Inter;
caret-color: #E3EF26;
```
* **Focus:** `border-color: #E3EF26; box-shadow: 0 0 0 3px rgba(227, 239, 38, 0.15);`
* **Error:** `border-color: #FF4D4D; box-shadow: 0 0 0 3px rgba(255, 77, 77, 0.15);`
* **Placeholder:** `color: #B0B0B0;`

### Status Badges

```css
/* Base badge styling */
border-radius: 8px;
padding: 4px 10px;
font: 600 10px/14px Inter;
letter-spacing: 1.5px;
text-transform: uppercase;
```

| Status | Background | Text Color |
|---|---|---|
| LOGGED | `rgba(84, 160, 255, 0.15)` | `#54A0FF` |
| AI_TRIAGED | `rgba(227, 239, 38, 0.15)` | `#E3EF26` |
| DISPATCHED | `rgba(255, 159, 67, 0.15)` | `#FF9F43` |
| RESOLVED | `rgba(46, 213, 115, 0.15)` | `#2ED573` |
| DUPLICATE | `rgba(176, 176, 176, 0.15)` | `#B0B0B0` |

### Navigation Bar (Mobile — Bottom Tabs)

```css
background: #061F1A;
border-top: 1px solid rgba(7, 102, 83, 0.3);
height: 64px;
padding-bottom: env(safe-area-inset-bottom);
```
* **Active tab icon/label:** `color: #E3EF26;`
* **Inactive tab icon/label:** `color: #B0B0B0;`

### Sidebar (Web Dashboard)

```css
background: #061F1A;
border-right: 1px solid rgba(7, 102, 83, 0.3);
width: 260px;
```
* **Active item:** `background: rgba(227, 239, 38, 0.08); color: #E3EF26; border-left: 3px solid #E3EF26;`
* **Inactive item:** `color: #B0B0B0;`
* **Hover:** `background: rgba(7, 102, 83, 0.2);`

---

## 5. Iconography

* **Icon Library:** Lucide Icons (React Native: `lucide-react-native`, Web: `lucide-react`). Consistent line-style icons across both platforms.
* **Icon Sizes:**
  * Small (inline): 16px
  * Default: 20px
  * Medium (nav/buttons): 24px
  * Large (feature/empty state): 48px
* **Icon Color:** Follows text color rules. Active icons use `--color-lime`. Inactive/secondary icons use `--color-gray-200`.

---

## 6. Animations & Micro-Interactions

### Transition Defaults
```css
/* Standard transition for all interactive elements */
transition-duration: 200ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

### Specific Animations

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Splash logo | Gradient shimmer sweep (left to right) | 1.5s | ease-in-out, loop once |
| Screen transitions | Slide from right (iOS) / Fade (Android) | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| FAB press | Scale down to 0.92, then back | 150ms | ease-out |
| Bottom sheet appear | Slide up from bottom | 350ms | spring(damping: 20) |
| Status badge update | Subtle scale pulse (1.0 → 1.1 → 1.0) | 400ms | ease-in-out |
| Success checkmark | Draw-on SVG path animation | 600ms | ease-out |
| Map pin appear | Drop in with bounce | 500ms | spring(damping: 15) |
| Skeleton loader | Gradient shimmer (dark → lighter → dark) | 1.5s | linear, loop |
| Pull to refresh | Lime spinner rotation | continuous | linear |
| Card press (mobile) | Scale to 0.97, opacity to 0.8 | 100ms | ease-out |
| Toast notification | Slide in from top, auto-dismiss | 300ms in, 3s hold, 300ms out | ease-in-out |

### Loading States
* **Skeleton screens** over spinner wheels. Every screen that loads data shows a skeleton placeholder matching the layout shape.
* **Skeleton color:** `background: #0F3D33;` with a shimmer gradient of `#134A3E → #1A5C4C → #134A3E`.

---

## 7. Map Styling (Mapbox Dark Theme)

Both mobile and web use a custom Mapbox style to match the dark theme:

### Custom Map Style Overrides
```json
{
  "background-color": "#061F1A",
  "water-color": "#0C342C",
  "land-color": "#0F3D33",
  "road-primary": "#134A3E",
  "road-secondary": "#0F3D33",
  "road-label": "#B0B0B0",
  "building-fill": "#0C342C",
  "poi-label": "#B0B0B0"
}
```

### Complaint Pin Design
* **Shape:** Rounded pin with category icon inside.
* **Border:** 2px solid matching severity color.
* **Inner icon:** White, 16px.
* **Glow effect:** Subtle radial shadow in the severity color (8px blur).
* **Selected state:** Pin scales to 1.3x with a lime ring animation.

---

## 8. Responsive Behavior

### Mobile
* All layouts are single-column.
* Bottom sheet is the primary progressive-disclosure pattern.
* Minimum touch target: 44x44px (Apple HIG) / 48x48dp (Material).

### Web Dashboard
* **≥ 1440px:** Full sidebar (260px) + map (70%) + right panel (30%).
* **1024–1439px:** Collapsed sidebar (72px, icon-only) + map + panel.
* **< 1024px:** No sidebar, hamburger menu. Map and panel stack vertically.

---

## 9. Accessibility

* **Contrast Ratios (WCAG AA minimum):**
  * White text (`#FFFFFF`) on Forest (`#0C342C`) = **12.6:1** ✅
  * White text on Surface (`#0F3D33`) = **10.8:1** ✅
  * Dark text (`#1A1A1A`) on Lime (`#E3EF26`) = **11.2:1** ✅
  * Gray-200 (`#B0B0B0`) on Forest (`#0C342C`) = **6.4:1** ✅
* **Focus indicators:** 3px lime (`#E3EF26`) outline with 2px offset on all interactive elements.
* **Screen reader labels:** Every icon-only button must have an `accessibilityLabel` (mobile) or `aria-label` (web).
* **Reduced motion:** Respect `prefers-reduced-motion`. Disable all non-essential animations. Keep functional transitions (screen changes) but reduce to instant/fade.
