# BookVerse — Figma Design Tokens

This document maps code values to Figma design properties.
Import these into Figma as styles/components for perfect sync.

## 🎨 Color Tokens

### Background Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#1a1410` | Main background |
| `--bg-light` | `#2a2118` | Sidebar, panels |
| `--paper-sepia` | `#f1e8d5` | Book page (default) |
| `--paper-day` | `#f8f4eb` | Book page (day mode) |
| `--paper-night` | `#1a1a1a` | Book page (night mode) |
| `--paper-dark` | `#0d0d0d` | Book page (dark mode) |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--ui-text` | `#f5efe6` | UI text (sidebar, toolbar) |
| `--ui-muted` | `rgba(245,239,230,0.5)` | Secondary UI text |
| `--text` | `#2c1810` | Book page text |
| `--text-muted` | `#6b5b4e` | Page numbers, chapter labels |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--accent` | `#8b4513` | Primary accent (brown) |
| `--accent-light` | `#c4956a` | Light accent (gold) |

### Highlight Colors
| Name | RGBA | Usage |
|------|------|-------|
| Yellow | `rgba(255,230,100,0.35)` | Primary highlight |
| Green | `rgba(100,220,120,0.3)` | Secondary highlight |
| Blue | `rgba(100,180,255,0.3)` | Tertiary highlight |
| Pink | `rgba(255,120,160,0.3)` | Quaternary highlight |

---

## 📐 Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Page Padding | `50px` | Inside book pages |
| Sidebar Width | `320px` | Left panel |
| Settings Width | `300px` | Right panel |
| Book Width | `580px` | Book container |
| Book Height | `780px` | Book container |

---

## 🔤 Typography Tokens

### Font Families
| Token | Font Stack | Usage |
|-------|-----------|-------|
| `--font-serif` | EB Garamond, Cormorant Garamond, serif | Book body text |
| `--font-display` | Playfair Display, serif | Titles, headings |
| `--font-ui` | Inter, sans-serif | UI elements |

### Font Sizes
| Token | Value | Usage |
|-------|-------|-------|
| Body text | `18px` | Default reading size |
| Chapter title | `32px` | Chapter headings |
| Page number | `11px` | Page numbers |
| Chapter label | `10px` | Header chapter name |
| Drop cap | `72px` | First letter of chapter |

### Line Heights
| Name | Value | Usage |
|------|-------|-------|
| Compact | `1.6` | Dense reading |
| Normal | `1.9` | Default reading |
| Relaxed | `2.2` | Comfortable reading |
| Spacious | `2.5` | Very spaced out |

---

## 📦 Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Book pages | `0 4px 4px 0` | Right page |
| Left page | `4px 0 0 4px` | Left page |
| Buttons | `8px` | All UI buttons |
| Cards | `10px` | Book items, panels |
| Modals | `14px` | Go-to-page, PDF import |
| Tooltips | `6px` | Tooltips |

---

## 🎭 Shadow Tokens

| Name | Value | Usage |
|------|-------|-------|
| Page shadow | `2px 2px 15px rgba(0,0,0,0.2)` | Book pages |
| Book shadow | `blur(15px) rgba(0,0,0,0.4)` | Under book |
| Card shadow | `2px 2px 8px rgba(0,0,0,0.3)` | Book thumbnails |
| Popup shadow | `0 8px 30px rgba(0,0,0,0.4)` | Selection popup |
| Modal shadow | `0 12px 40px rgba(0,0,0,0.5)` | Dictionary popup |

---

## 🎬 Animation Tokens

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| Page turn | `0.6s` | `cubic-bezier(0.23,1,0.32,1)` | Book rotation |
| Panel slide | `0.4s` | `cubic-bezier(0.23,1,0.32,1)` | Sidebar/settings |
| Popup appear | `0.2s` | `ease` | Selection popup |
| Fade in | `0.5s` | `ease` | Page content |
| Hover transition | `0.2-0.3s` | `ease` | Buttons, cards |

---

## 📱 Component Specs (for Figma)

### Book Page
- Width: 580px
- Height: 780px
- Padding: 50px
- Background: Paper color
- Border radius: 0 4px 4px 0 (right), 4px 0 0 4px (left)
- Shadow: 2px 2px 15px rgba(0,0,0,0.2)

### Toolbar Button
- Width: 36px
- Height: 36px
- Border radius: 8px
- Background: rgba(245,239,230,0.08)
- Border: 1px solid rgba(245,239,230,0.08)
- Font size: 16px

### Book Item (Sidebar)
- Height: ~80px (auto)
- Thumbnail: 44x62px
- Border radius: 10px
- Padding: 12px
- Active indicator: 3px wide, accent-light color

### Settings Panel
- Width: 300px
- Theme buttons: 50px height
- Font buttons: padding 12px 16px
- Spacing buttons: flex layout, 10px padding

### PDF Import Modal
- Width: 560px
- Border radius: 16px
- Drop zone padding: 50px 30px
- Border: 2px dashed
