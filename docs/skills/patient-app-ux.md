# Skill: Patient App UX for Cognitive Impairment

## Who This App Is For

The patient app is used by people with **early-stage dementia** — aged 65-85, living at home, able to use a phone but struggling with complex interfaces. They experience:
- Short-term memory loss
- Difficulty with multi-step tasks
- Slower processing speed
- Easily overwhelmed by choices
- Anxiety when confused
- Reduced fine motor control

**Every design decision must account for these realities.**

## Non-Negotiable Design Rules

### Typography
- **Minimum body text: 20px** (no exceptions)
- Minimum secondary text: 18px
- Headings: 28-36px
- Font weight: Regular (400) for body, Bold (700) for headings and key info
- Font: System default (San Francisco on iOS, Roboto on Android) — familiar to users
- Line height: 1.6 minimum (generous spacing)
- Letter spacing: Slightly increased (+0.5px) for readability
- NEVER use italic text (harder to read for older adults)
- NEVER use ALL CAPS for more than 2-3 words (harder to parse)

### Touch Targets
- **Minimum tap target: 56px × 56px** (larger than standard 48px)
- Primary action buttons: 64px height minimum
- Spacing between tap targets: 16px minimum (prevent mis-taps)
- "Done" buttons on task cards: full-width, 64px height
- Emoji/icon buttons (check-in): 72px × 72px

### Colors & Contrast
- **Minimum contrast ratio: 4.5:1** (WCAG AA)
- Prefer 7:1 for critical text (task titles, hints, time)
- NEVER use blue as the only indicator (age-related blue perception decline)
- Avoid pure red for alerts — use warm amber/orange instead (less alarming)
- Background colors: soft, warm, never pure white (#FFFFFF → use #FAFAF8 or warmer)
- NEVER use color alone to convey meaning — always pair with icon/text

### Layout
- **Single column only** — no side-by-side content
- Maximum 2 levels of navigation (2 bottom tabs: Today + Help)
- No hamburger menus, no drawers, no swipe gestures for navigation
- No modals that require finding a close button — use full screens with clear back actions
- Fixed bottom navigation — always visible, never hidden by scrolling
- Content scrolls vertically only — no horizontal scrolling
- Card-based layout with generous padding (24px internal padding, 16px between cards)

### Interactions
- **One action per card** — each task card has exactly one primary button ("Done")
- No long-press interactions (not discoverable, confusing)
- No swipe-to-delete or swipe actions of any kind
- No drag-and-drop
- Tapping "Done" shows an immediate, satisfying visual response (checkmark animation, color change)
- Confirmations only for destructive/irreversible actions (calling emergency number)
- Family contact calls: one tap = immediate call (no confirmation needed)
- No time limits on any screen — user can take as long as they need
- If voice recording: large, obvious microphone button. Tap to start, tap again to stop. Visual feedback during recording (pulsing circle).

### Content & Language
- Short sentences (max 15 words per sentence)
- Simple words (Grade 6 reading level / A2 English level)
- Active voice ("Take your blue pill" not "The blue pill should be taken")
- Always address the person by name ("Maria, it's time for your walk")
- Positive framing ("4 of 7 done! Great work!" not "3 remaining")
- NEVER say: assessment, test, score, grade, fail, wrong, error, decline, symptom
- ALWAYS say: activity, check-in, done, great, wonderful, well done
- Instructions should be specific and concrete: "Your pills are in the kitchen counter pill box, Tuesday section" — not "Take your medication"

### Emotional Safety
- No failure states visible to patient — if they don't complete a task, it just passes, no red marks
- Overdue tasks shown with gentle amber, not red
- Skip buttons always available — nothing is mandatory
- Positive reinforcement on every interaction: "Thank you for sharing!" / "What a wonderful memory!"
- If patient taps "Take Me Home": no judgment, no "Are you lost?" — just silently navigate and alert family
- Brain activities: NEVER score, grade, rank, or evaluate responses. Every response is celebrated.
- Voice notes: "Anything you want to tell your family?" — not "Report how you're feeling"

## Screen Templates

### Task Card Template
```
┌─────────────────────────────────────────┐
│                                         │
│  🕐 9:00 AM                       NOW  │  ← 18px, muted color / 20px bold badge
│                                         │
│  💊 Morning Medication                  │  ← 24px, bold, dark text
│                                         │
│  "Take your blue pill and white pill    │  ← 20px, regular, warm gray
│   with a glass of water. They're in     │     This is the "hint" from caregiver
│   the kitchen counter pill box."        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         ✓  Done                 │   │  ← 64px height, full width
│  └─────────────────────────────────┘   │     Primary color, white text
│                                         │
└─────────────────────────────────────────┘
   24px padding inside card
   16px gap between cards
   8-12px border radius (rounded, soft)
   Subtle shadow (elevation: 2)
```

### Completed Task Card
```
┌─────────────────────────────────────────┐
│                                    ✅   │  ← Green checkmark
│  🕐 9:00 AM                            │
│                                         │
│  💊 Morning Medication                  │  ← Text slightly muted
│                                         │
│  Done at 9:12 AM                        │  ← Completion time, green text
│                                         │
└─────────────────────────────────────────┘
   Slightly faded/muted overall
   No "undo" button (avoid confusion)
   Card is collapsed (hint hidden)
```

### Emoji Button Template (Check-In)
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│          │  │          │  │          │
│    😊    │  │    😐    │  │    😟    │
│          │  │          │  │          │
│   Good   │  │   Okay   │  │ Not great│
│          │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘
   72px × 72px each
   Emoji: 36px
   Label: 16px
   16px gap between
   Selected state: colored border + slight scale up
```

## Time-of-Day Backgrounds

The app background changes subtly based on time:

| Period | Time | Background | Feel |
|---|---|---|---|
| Morning | 6:00 - 11:59 | Warm gradient: soft peach → cream | Gentle, energizing |
| Afternoon | 12:00 - 17:59 | Light gradient: soft blue → white | Bright, active |
| Evening | 18:00 - 21:59 | Warm gradient: soft lavender → dusty rose | Calming, winding down |
| Night | 22:00 - 5:59 | Dark gradient: deep navy → dark purple | Sleep-oriented, minimal |

Transitions are gradual (not abrupt at the hour boundary). Use a 30-minute blend window.

## Animation Guidelines

- Task completion: checkmark draws itself (300ms), card fades to completed state (200ms)
- Progress bar: smooth fill animation (400ms ease-out)
- Screen transitions: simple fade or slide (250ms) — no bouncy or spring animations
- Voice recording: pulsing red circle (gentle, 1 second cycle)
- NEVER use: shaking, bouncing, flashing, spinning, or rapid animations
- All animations should be interruptible (user can tap through)
- Reduce motion: respect system accessibility setting (`prefers-reduced-motion`)

## Offline Behavior

The patient app MUST work without internet for core features:

| Feature | Offline Behavior |
|---|---|
| Today's plan | Cached locally (AsyncStorage). Shows cached data. |
| Task completion | Saved locally, queued for sync when online. Shows "Done" immediately. |
| Help tab contacts | Cached. Phone calls work without internet. |
| "Take Me Home" | Home coordinates cached. Google Maps works offline if maps are cached. Silent alert queued. |
| Daily check-in | Can complete offline. Submission queued. |
| Brain activities | Pre-generated and cached (7 days ahead). |
| Voice notes | Recorded locally. Upload queued. |

Show a subtle offline indicator (small banner at top: "Offline — your data will sync when connected") — not alarming, just informational.
