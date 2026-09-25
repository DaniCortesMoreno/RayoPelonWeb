---
name: Galáctico Volt
colors:
  surface: '#110e32'
  surface-dim: '#110e32'
  surface-bright: '#38355b'
  surface-container-lowest: '#0c082d'
  surface-container-low: '#1a173b'
  surface-container: '#1e1b3f'
  surface-container-high: '#28254a'
  surface-container-highest: '#333056'
  on-surface: '#e4dfff'
  on-surface-variant: '#c3c7c6'
  inverse-surface: '#e4dfff'
  inverse-on-surface: '#2f2c51'
  outline: '#8d9191'
  outline-variant: '#434847'
  surface-tint: '#c4c7c6'
  primary: '#f7f9f8'
  on-primary: '#2d3131'
  primary-container: '#dadddc'
  on-primary-container: '#5d6161'
  inverse-primary: '#5b5f5f'
  secondary: '#f9bc52'
  on-secondary: '#432c00'
  secondary-container: '#bc8720'
  on-secondary-container: '#3a2600'
  tertiary: '#fff7f6'
  on-tertiary: '#690004'
  tertiary-container: '#ffd2cc'
  on-tertiary-container: '#af342c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e0e3e2'
  primary-fixed-dim: '#c4c7c6'
  on-primary-fixed: '#181c1c'
  on-primary-fixed-variant: '#444747'
  secondary-fixed: '#ffdeac'
  secondary-fixed-dim: '#f9bc52'
  on-secondary-fixed: '#281900'
  on-secondary-fixed-variant: '#604100'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#8b1916'
  background: '#110e32'
  on-background: '#e4dfff'
  surface-variant: '#333056'
typography:
  display-hero:
    fontFamily: Oswald
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 68px
    letterSpacing: 0.02em
  display-hero-mobile:
    fontFamily: Oswald
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Oswald
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: 0.04em
  headline-lg-mobile:
    fontFamily: Oswald
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: 0.04em
  headline-md:
    fontFamily: Oswald
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: 0.05em
  headline-sm:
    fontFamily: Oswald
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.05em
  body-lg:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-badge:
    fontFamily: Oswald
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.1em
  label-stats:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-micro:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system translates the competitive drive, electric pace, and raw prestige of modern 7-a-side grassroots football into a championship-grade digital experience. Tailored for dynamic match reports, tactical lineups, real-time statistics, and player identity cards, the aesthetic balances the luxury of European football galas with the aggressive, adrenaline-fueled presentation of EA FC Ultimate Team.

The interface merges high-contrast dark visual foundations with refined glassmorphism, dynamic angularity, and metallic edge treatments. The atmosphere is nocturnal, focused, and electrifying: deep carbon and midnight tones ground the canvas, while luminous bone-white typography and concentrated metallic gold edge glints pull attention immediately to tactical metrics, match momentum, and player performance.

## Colors

The palette is engineered for high-stakes night matches and competitive prestige:

- **Primary (`#DADDDC` - Bone Chalk):** High-impact structural clarity used for primary text, primary scorelines, and dominant callouts. Offers intense contrast over nocturnal backdrops without the stark harshness of pure `#FFFFFF`.
- **Secondary Accent (`#A67406` - Trophy Gold):** Employed for elite tier badges, dynamic ratings, active match borders, and championship metrics. Use with subtle linear gradients ranging to `#E5B842` for metallic card bevels and luminous hairline outlines.
- **Tertiary Accent (`#78080A` - Blood Burgundy):** The energetic club signature. Used for live indicators, high-intensity telemetry, penalty markers, urgent game moments, and primary interactive action states.
- **Deep Midnight Neutral (`#0E0A2F` - Deep Pitch Navy):** The structural core. Drives canvas surfaces, tactical backings, and backdrop blurs. Paired with `#070518` for canvas depths and `#161244` for elevated interactive surfaces.
- **Tactical Utility Gradients:** Reserve 45-degree sweeps from `#A67406` to `#E5B842` for gold metallic trims, and `#78080A` to `#B31217` for live match aggression.

## Typography

Typography establishes an imposing stadium presence:

- **Display & Headlines (Oswald):** Condensed, athletic, and punchy. All headlines should render in uppercase with subtle letter-spacing to mirror stadium scoreboards and broadcast typography.
- **Body & Match Commentary (Space Grotesk):** Modern, sharp, and structured with geometric balance. Ensures flawless readability across rosters, injury updates, and tactical briefings.
- **Metrics, Match Clock & Telemetry (JetBrains Mono):** Monospaced, highly technical, and precise. Used for minute tickers (e.g., `43'`, `+3'`), player ratings, card statistics (PAC, DRI, SHO, DEF), and match odds to eliminate visual jitter during real-time value changes.

## Layout & Spacing

Layouts use a 12-column dynamic fluid grid on desktop (collapsing to 6 columns on tablet and 4 columns on mobile). Tactical cards and statistics favor a compact, dense rhythm that maximizes scan efficiency for fast live-match updates.

- **Breakpoints:** Mobile (0–639px), Tablet (640–1023px), Desktop (1024px+), Stadium Display / Widescreen (1440px+).
- **Roster & Player Grids:** Standardize player cards with a tight column gutter (`gutter-mobile` on mobile) to retain card proportions without awkward line breaks.
- **Section Dividers:** Keep vertical stack gaps rigorous using `space-xl` between modular sections, and `space-sm` to `space-md` within card modules.

## Elevation & Depth

Visual depth follows an esports-grade layered translucent paradigm, creating focus through light refraction and hairline metallic boundaries:

- **Level 0 (Pitch Base):** Deep canvas `#070518` layered with subtle 30% diagonal micro-lines or carbon fiber textures.
- **Level 1 (Surface Glass):** `rgba(14, 10, 47, 0.65)` with `backdrop-filter: blur(16px)` and an outer hairline border of `1px solid rgba(218, 221, 220, 0.12)`.
- **Level 2 (Active Match Cards & Modals):** `rgba(22, 18, 68, 0.85)` with `backdrop-filter: blur(24px)`, framed by a dual-layered border: `1px solid rgba(166, 116, 6, 0.45)` with an ambient gold back-glow (`box-shadow: 0 0 24px -4px rgba(166, 116, 6, 0.28), inset 0 1px 0 0 rgba(229, 184, 66, 0.4)`).
- **Level 3 (Clutch / Live Action Elevation):** Burgundy intensity `rgba(120, 8, 10, 0.9)` accented with high-intensity directional glow (`box-shadow: 0 8px 32px 0 rgba(120, 8, 10, 0.45)`).

## Shapes

The shape system emphasizes aggression and speed. Elements utilize chamfered accents and strict tight radii:

- **Standard Radius:** Base elements use `0.25rem` (Soft), maintaining crisp, non-distracting corners that reinforce a sharp, engineered aesthetic.
- **FUT Player Card Cutouts:** Hero player shields and badges use asymmetric angular geometries (e.g., top corners rounded at `0.5rem`, bottom edges sheared at a 45-degree chamfer) to simulate physical league crests and trophy plating.
- **Tactical Indicators:** Status dots, time indicators, and tactical tags maintain rectangular or hexagonal geometric profiles rather than soft pill shapes.

## Components

### Buttons & Interactive Controls
- **Primary Match Button:** Deep burgundy background (`#78080A`) with a top highlight border of `#B31217`, crisp white typography (`#DADDDC`), and an inner glow. Hover triggers an accelerated transition to a metallic gold border (`#A67406`) and a 2px lift.
- **Secondary (Trophy Gold Foil):** Transparent glass fill, framed with a 1.5px border of `#A67406`. Text renders in uppercase Oswald with subtle gold inner text shadow.
- **Ghost Action:** Slate-tinted translucent surface with low-contrast `#DADDDC` iconography and labels.

### FUT / EA FC Inspired Player & Squad Cards
- Rendered as vertical shield cards with clipped bottom corners.
- Background features a dark radial navy gradient bleeding into dark carbon, overlaid with translucent gold watermark stripes.
- **Header:** Big-number overall rating (OVR) in Oswald Bold, player position (e.g., `MCO`, `DC`) underneath, accompanied by the club badge.
- **Body:** Dynamic cut-out player imagery layered over metallic accent ribbons.
- **Footer Telemetry Grid:** 6-metric stat display (PAC, SHO, PAS, DRI, DEF, PHY) set in JetBrains Mono with subtle vertical separator lines.

### Match Score & Clock Banner
- Split module: Home and Away blocks framed in frosted midnight navy, connected by a center blood-burgundy live match minute badge (`LIVE 34'`).
- Score numbers set in 48px Oswald, glowing subtly when points change.

### Data Chips & Tactical Badges
- Compact rectangular chips with 2px corner radii, tinted with 15% opacity of `#A67406` or `#78080A`.
- Framed in a single-pixel glowing hairline border.
- Text rendered in JetBrains Mono uppercase (`label-micro`) for squad numbers, cards (YC/RC), and substitution markers.

### Input Fields & Search Bars
- Dark glass surface (`rgba(14, 10, 47, 0.75)`) with an inset border of `rgba(218, 221, 220, 0.15)`.
- Placeholder text in `#DADDDC` at 40% opacity.
- Focus state instantly ignites an exterior glow of `#A67406` at 50% opacity and shifts the border to pure metallic gold.