# Skill: MemoGuard Design System

## Brand Identity

MemoGuard is warm, reassuring, and professional. It feels like a trusted friend, not a hospital. The design should communicate: "We're here to help your family. You're not alone."

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|---|---|---|
| **Teal** (Primary) | `#0D9488` | Primary buttons, links, active states |
| **Teal Light** | `#99F6E4` | Highlights, badges |
| **Teal Dark** | `#0F766E` | Pressed states, headings |

### Semantic Colors

| Name | Hex | Usage |
|---|---|---|
| **Success Green** | `#16A34A` | Task completed, positive indicators |
| **Warm Amber** | `#D97706` | Overdue tasks, gentle attention needed |
| **Soft Red** | `#DC2626` | Emergency only (emergency call button) |
| **Info Blue** | `#2563EB` | Informational badges, links |

### Neutral Colors

| Name | Hex | Usage |
|---|---|---|
| **Text Primary** | `#1C1917` | Headings, important text |
| **Text Secondary** | `#57534E` | Body text, descriptions |
| **Text Muted** | `#A8A29E` | Timestamps, helper text |
| **Background** | `#FAFAF8` | Page background (warm, not pure white) |
| **Card Background** | `#FFFFFF` | Card surfaces |
| **Border** | `#E7E5E4` | Card borders, dividers |
| **Disabled** | `#D6D3D1` | Disabled buttons, inactive elements |

### Category Colors (for task categories)

| Category | Icon | Color | Light BG |
|---|---|---|---|
| Medication | 💊 | `#7C3AED` (Purple) | `#F5F3FF` |
| Nutrition | 🥗 | `#16A34A` (Green) | `#F0FDF4` |
| Physical | 🚶 | `#EA580C` (Orange) | `#FFF7ED` |
| Cognitive | 🧩 | `#2563EB` (Blue) | `#EFF6FF` |
| Social | 💬 | `#DB2777` (Pink) | `#FDF2F8` |
| Health | ❤️ | `#DC2626` (Red) | `#FEF2F2` |

### Time-of-Day Gradients (Patient App)

| Period | Gradient Start | Gradient End |
|---|---|---|
| Morning (6-12) | `#FEF3C7` (warm peach) | `#FAFAF8` (cream) |
| Afternoon (12-18) | `#E0F2FE` (soft sky) | `#FAFAF8` (white) |
| Evening (18-22) | `#EDE9FE` (lavender) | `#FDF2F8` (dusty rose) |
| Night (22-6) | `#1E1B4B` (deep navy) | `#312E81` (dark purple) |

## Typography

### Patient App

| Element | Size | Weight | Color |
|---|---|---|---|
| Time on task card | 18px | Regular (400) | Text Muted |
| Task title | 24px | Bold (700) | Text Primary |
| Hint text | 20px | Regular (400) | Text Secondary |
| "Done" button text | 20px | Bold (700) | White |
| Progress bar text | 18px | Medium (500) | Text Secondary |
| "NOW" badge | 14px | Bold (700) | White on Teal |
| Tab labels | 14px | Medium (500) | Text Secondary / Teal (active) |
| Check-in emoji labels | 16px | Medium (500) | Text Secondary |
| Check-in questions | 24px | Medium (500) | Text Primary |
| Welcome greeting | 28px | Bold (700) | Text Primary |

### Caregiver Apps (Mobile + Web)

| Element | Size | Weight |
|---|---|---|
| Page title | 24px | Bold (700) |
| Section header | 18px | Semibold (600) |
| Card title | 16px | Semibold (600) |
| Body text | 14px (web) / 16px (mobile) | Regular (400) |
| Helper text | 12px (web) / 14px (mobile) | Regular (400) |
| Button text | 14px | Semibold (600) |
| Navigation label | 12px | Medium (500) |
| Input label | 14px | Medium (500) |
| Badge text | 12px | Bold (700) |

### Font Stack
- Mobile: System default (San Francisco iOS, Roboto Android)
- Web: `Inter, system-ui, -apple-system, sans-serif`
- Install Inter via Google Fonts or next/font

## Spacing Scale

Use a consistent 4px base grid:

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Tight gaps, icon-to-text |
| `space-2` | 8px | Between related elements |
| `space-3` | 12px | Between list items |
| `space-4` | 16px | Between cards, section gap |
| `space-5` | 20px | Card internal padding (patient app) |
| `space-6` | 24px | Card internal padding (patient app), section gap |
| `space-8` | 32px | Section separation |
| `space-10` | 40px | Page padding top/bottom |
| `space-12` | 48px | Major section breaks |

### Patient App Specific
- Card internal padding: 24px
- Gap between task cards: 16px
- Tab bar height: 80px (larger than standard 56px)
- Screen horizontal padding: 20px

### Caregiver App Specific
- Card internal padding: 16px (web), 16px (mobile)
- Sidebar width: 240px (web)
- Content max width: 1200px (web)
- Screen horizontal padding: 16px (mobile), 24px (web content area)

## Border Radius

| Element | Radius |
|---|---|
| Task cards (patient) | 16px |
| Cards (caregiver) | 12px |
| Buttons | 12px |
| Inputs | 8px |
| Badges | 9999px (pill) |
| Avatar | 9999px (circle) |
| Bottom sheet (mobile) | 20px top-left, 20px top-right |

## Shadows

| Level | Usage | CSS |
|---|---|---|
| **Card** | All content cards | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` |
| **Elevated** | Modals, dropdowns | `0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)` |
| **Header** | Sticky headers | `0 1px 2px rgba(0,0,0,0.05)` |

Patient app uses softer shadows (reduce visual noise).

## Component Patterns

### Patient App — Task Card States

```
UPCOMING (default):
- White card background
- Full opacity
- "Done" button visible (Primary Teal)

NOW (next upcoming task):
- White card background
- "NOW" badge (Teal background, white text, top-right)
- Subtle teal left border (3px)
- "Done" button prominent

OVERDUE:
- Light amber background (#FFFBEB)
- Warm amber left border (3px)
- "Done" button still available
- No alarming red, no exclamation marks

COMPLETED:
- Light gray background (#F5F5F4)
- Reduced opacity (0.7)
- Green checkmark replacing "Done" button
- Hint text hidden (card collapsed)
- Completion time shown: "Done at 9:12 AM" (Success Green)
```

### Caregiver Web — Dashboard Card

```
┌────────────────────────────────┐
│  CARD TITLE               →   │  ← 16px semibold, muted arrow for "view more"
│  ─────────────────────────────│  ← 1px border, Border color
│                                │
│  Content area                  │  ← 16px padding
│                                │
│  Status or summary text        │  ← 14px, Text Secondary
│                                │
└────────────────────────────────┘
   Background: Card Background (#FFFFFF)
   Border: 1px solid Border (#E7E5E4)
   Radius: 12px
   Shadow: Card level
   Padding: 16px (web), 16px (mobile)
```

### Buttons

| Type | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary | Teal `#0D9488` | White | None | Main actions, "Done", "Save", "Send" |
| Secondary | Transparent | Teal | 1px Teal | Secondary actions, "Edit", "Cancel" |
| Danger | Transparent | Soft Red | 1px Soft Red | Delete actions (with confirmation) |
| Ghost | Transparent | Text Secondary | None | Tertiary actions, "Skip" |
| Patient Primary | Teal `#0D9488` | White | None | "Done" button — 64px height |
| Emergency | Soft Red `#DC2626` | White | None | Emergency call button only |

### Input Fields

```
┌──────────────────────────────────┐
│  Label                           │  ← 14px, Medium, Text Secondary
│  ┌──────────────────────────────┐│
│  │ Placeholder text             ││  ← 14px (web) / 16px (mobile)
│  └──────────────────────────────┘│     Border: 1px Border color
│  Helper text                     │     Focus: 2px Teal border
│                                  │     Error: 2px Soft Red border
└──────────────────────────────────┘     Radius: 8px, Padding: 12px
```

## Icons

- Patient app: Emoji icons (💊 🥗 🚶 🧩 💬 ❤️ 🏠 📞 🎤) — universally understood, no library needed
- Caregiver apps: Lucide React (`lucide-react`) — clean, consistent line icons
- Icon size: 20px (caregiver), 24-28px (patient)
- Always pair icons with text labels (never icon-only buttons, especially patient app)

## Responsive Breakpoints (Web)

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, no sidebar |
| Tablet | 640-1024px | Sidebar collapsed, 1-2 columns |
| Desktop | > 1024px | Sidebar visible, 2-column grid |

Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

## Dark Mode

NOT for MVP. The patient app should always be light mode (familiar, high contrast). Caregiver apps may add dark mode post-launch.

## Accessibility (Beyond Patient App)

Even caregiver apps should follow:
- All interactive elements focusable and keyboard navigable (web)
- ARIA labels on icon-only buttons
- Focus indicators visible (2px Teal outline)
- Form validation messages connected to inputs via `aria-describedby`
- Color never as sole indicator (always pair with text/icon)
- Loading states announced to screen readers (`aria-live="polite"`)

## Tailwind Config (Web)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
        },
        surface: {
          background: '#FAFAF8',
          card: '#FFFFFF',
          border: '#E7E5E4',
        },
        text: {
          primary: '#1C1917',
          secondary: '#57534E',
          muted: '#A8A29E',
        },
        status: {
          success: '#16A34A',
          amber: '#D97706',
          danger: '#DC2626',
          info: '#2563EB',
        },
        category: {
          medication: '#7C3AED',
          nutrition: '#16A34A',
          physical: '#EA580C',
          cognitive: '#2563EB',
          social: '#DB2777',
          health: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        'card-patient': '16px',
        button: '12px',
        input: '8px',
        pill: '9999px',
      },
    },
  },
};
```
