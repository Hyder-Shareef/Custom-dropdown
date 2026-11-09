# Task 21: Custom Interactive Dropdown Menu — Architecture & Implementation Plan

## 1. Project Objective
Build a lightweight, accessible, and responsive custom dropdown menu using **HTML5, CSS3, and Vanilla ES6 JavaScript**.

The dropdown must support three distinct UI states:
1. **Default State**: Initial state displaying the placeholder "Select an option", a downward-facing arrow indicator, and no selected item.
2. **Open State**: The options panel opens directly below the trigger, the arrow rotates 180°, all options are visible, and clicking the trigger again closes the panel.
3. **Selected State**: Clicking an option updates the trigger label, closes the menu immediately, and marks the chosen item as selected (`aria-selected="true"` and visual highlight) upon reopening.

---

## 2. Directory Layout & File Responsibilities

```text
task21/
├── index.html        # Clean HTML5 markup with accessible ARIA combobox semantics
├── style.css         # Minimalist modern styling, transitions, and state classes
├── script.js         # Vanilla ES6 interaction logic (toggle, select, click outside, keyboard)
├── test.js           # Automated headless test suite (JSDOM / Node.js)
├── PLAN.md           # Engineering specification and state transition plan
└── explanation.md    # Beginner-friendly breakdown and concepts guide
```

### Files to Create / Modify
- **`task21/index.html`**: Semantic layout containing a centered card with a label, custom dropdown trigger (`<button>` with `role="combobox"`), downward chevron SVG, and the options list (`<ul role="listbox">`).
- **`task21/style.css`**: Design tokens, container layout, smooth slide/fade transition for the menu, arrow rotation, hover & selected states, and focus outlines.
- **`task21/script.js`**: Pure vanilla JS handling state variables (`isOpen`, `selectedIndex`, `highlightedIndex`), event listeners for click/toggle, outside click detection, and keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Space`, `Escape`).
- **`task21/test.js`**: Automated test script validating all 8 checklist criteria.

---

## 3. Component Architecture & DOM Structure

```html
<div class="dropdown-wrapper">
  <label id="dropdown-label" class="dropdown-label">Choose an Option</label>
  <div class="custom-dropdown" id="dropdown">
    <!-- Trigger Button -->
    <button
      type="button"
      id="dropdown-trigger"
      class="dropdown-trigger"
      aria-haspopup="listbox"
      aria-expanded="false"
      aria-labelledby="dropdown-label dropdown-selected-text"
      aria-controls="dropdown-options"
    >
      <span id="dropdown-selected-text" class="placeholder">Select an option</span>
      <svg class="chevron-icon" aria-hidden="true" viewBox="0 0 20 20">
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </button>

    <!-- Options Panel -->
    <ul
      id="dropdown-options"
      class="dropdown-options"
      role="listbox"
      aria-labelledby="dropdown-label"
      tabindex="-1"
    >
      <li id="opt-0" class="dropdown-option" role="option" aria-selected="false" data-value="Option 1">
        <span class="option-text">Option 1</span>
        <svg class="check-icon" aria-hidden="true" viewBox="0 0 20 20"><path d="..."/></svg>
      </li>
      <!-- Options 2 to 5 -->
    </ul>
  </div>
</div>
```

---

## 4. State Management & Lifecycle

```
                     [Default State]
            Label: "Select an option" (placeholder)
            Panel: Hidden / Collapsed
            Arrow: Facing Down (0deg)
                     │
       Click Trigger │ or Space/Enter
                     ▼
                      [Open State]
            Panel: Visible (.open class)
            Arrow: Rotated (180deg)
            Options: Visible (Option 1 - 5)
            Highlight: Active option or first option
                     │
         ┌───────────┼──────────────────────────┐
         │           │                          │
Click Outside / Esc  │ Click Option / Enter     │ Click Trigger again
         ▼           ▼                          ▼
   [Close Menu]   [Selected State]         [Default State]
   Focus Trigger  Update Label to Option X
                  Mark selected (.selected)
                  Close Panel immediately
```

---

## 5. Interaction & Keyboard Specifications

1. **Mouse / Touch Events**:
   - `trigger.addEventListener('click')`: Toggle open/closed state.
   - `option.addEventListener('click')`: Select clicked option, update text, remove `.placeholder` style, close dropdown, update `aria-selected`.
   - `document.addEventListener('click')`: If click target is outside `.custom-dropdown`, close menu.

2. **Keyboard Events (`keydown`)**:
   - On Trigger:
     - `Space` / `Enter`: Toggle dropdown open/close. If opening, set highlight index to selected index (or 0).
     - `ArrowDown`: Open dropdown and highlight first option.
     - `ArrowUp`: Open dropdown and highlight last option.
   - While Open:
     - `ArrowDown`: Move visual highlight to next option (looping or clamping).
     - `ArrowUp`: Move visual highlight to previous option.
     - `Enter`: Select currently highlighted option, close dropdown, return focus to trigger.
     - `Escape`: Close dropdown without changing selection, return focus to trigger.

---

## 6. Visual Design Specifications
- **Container**: Max width ~320px-360px, responsive, centered on a clean neutral background.
- **Trigger**: 44px-48px touch target height, clean 1px border (`#D1D5DB`), border-radius 8px, background `#FFFFFF`, flexbox between text and chevron.
- **Transitions**:
  - Chevron rotation: `transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)`.
  - Options panel: `opacity`, `transform: translateY(4px) -> translateY(0)`, `transition: 0.18s ease`.
- **States**:
  - **Placeholder**: Subdued text color (`#6B7280`).
  - **Selected Value**: High-contrast text color (`#111827`).
  - **Hover / Active Option**: Soft neutral hover background (`#F3F4F6`).
  - **Selected Option in List**: Highlighted background (`#EFF6FF`), accent text (`#2563EB`), and trailing checkmark.

---

## 7. Verification & Automated Test Plan
`task21/test.js` will simulate DOM interactions using JSDOM:
1. **Initial Render**: Placeholder "Select an option" present, panel closed (`aria-expanded="false"`), no option selected.
2. **Toggle Open**: Clicking trigger adds `.open`, sets `aria-expanded="true"`, makes all 5 options visible.
3. **Toggle Close**: Clicking trigger again closes the panel.
4. **Option Selection**: Clicking "Option 3" updates trigger text to "Option 3", closes panel, and marks Option 3 with `aria-selected="true"`.
5. **Reopening State**: Opening again retains Option 3 as selected/highlighted.
6. **Click Outside**: Opening menu, then clicking document body outside dropdown closes the panel.
7. **Keyboard Navigation**:
   - Pressing `Enter` on trigger opens menu.
   - Pressing `ArrowDown` navigates options.
   - Pressing `Enter` selects active option.
   - Pressing `Escape` closes menu without selection.

