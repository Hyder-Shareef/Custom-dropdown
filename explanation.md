# Task 21: Custom Interactive Dropdown Menu — Explanation & Guide

## 1. Overview
The Custom Interactive Dropdown Menu demonstrates how to build an accessible, stateful, and responsive dropdown component using pure **HTML5, CSS3, and Vanilla JavaScript** without any external libraries or frameworks.

---

## 2. The Three Required States

### State 1: Default State
- **Trigger Display**: Shows the placeholder text `"Select an option"` with a light gray text color (`#94a3b8`).
- **Arrow Indicator**: The SVG chevron points downwards (`0deg`).
- **Options Panel**: Hidden with `opacity: 0`, `visibility: hidden`, and `transform: translateY(-8px)`.
- **Selection**: `selectedValue = null`; no option has `.selected` or `aria-selected="true"`.
- **ARIA**: `aria-expanded="false"`.

### State 2: Open State
- **Trigger**: Highlighted with an active blue border and focus ring (`box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18)`).
- **Arrow Rotation**: Rotates smoothly `180deg` using CSS transition (`transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)`).
- **Options Panel**: Positioned directly below the trigger using `position: absolute; top: calc(100% + 6px)`, smoothly animated to `opacity: 1` and `transform: translateY(0)`.
- **Active Highlight**: If an option was previously selected, it is pre-highlighted; otherwise, the first option is highlighted for immediate keyboard navigation.

### State 3: Selected State
- **Selection Update**: Clicking an option immediately updates `selectedValue` in JavaScript state.
- **Trigger Update**: Replaces placeholder with the selected text (e.g. `"Option 3"`), removes the `.placeholder` class, and adds `.has-selection` for bolder text.
- **Panel Close**: Closes the dropdown panel immediately.
- **Reopening**: When reopened, the chosen item retains the `.selected` class (subtle blue background, blue text, and visible checkmark icon) and receives the keyboard `.highlighted` state.

---

## 3. JavaScript Architecture & Functions

| Function | Responsibility |
| :--- | :--- |
| `toggleDropdown()` | Checks `isOpen` state and calls either `openDropdown()` or `closeDropdown()`. |
| `openDropdown()` | Adds `.open` to container, sets `aria-expanded="true"` on trigger, and sets initial highlight index. |
| `closeDropdown()` | Removes `.open`, sets `aria-expanded="false"`, clears highlight, and refocuses trigger. |
| `selectOption(optionElement)` | Updates state, trigger label, status display, and ARIA attributes before closing the dropdown. |
| `handleOutsideClick(event)` | Detects document clicks. If the click occurred outside `#dropdown`, closes the menu. |
| `handleKeyDown(event)` | Manages keyboard accessibility for `Enter`, `Space`, `ArrowUp`, `ArrowDown`, `Escape`, and `Tab`. |

---

## 4. Accessibility & Keyboard Navigation (WAI-ARIA)

- **WAI-ARIA Pattern**: Built according to the **W3C Combobox with Listbox Popup** design pattern:
  - Trigger: `<button role="combobox" aria-haspopup="listbox" aria-expanded="false/true" aria-controls="dropdown-options">`
  - Menu: `<ul role="listbox" aria-labelledby="dropdown-label" tabindex="-1">`
  - Items: `<li role="option" aria-selected="false/true" data-value="...">`
- **Keyboard Shortcuts**:
  - `Enter` / `Space` on trigger: Toggles menu open/closed.
  - `ArrowDown`: Moves active highlight down to the next option (wraps to start).
  - `ArrowUp`: Moves active highlight up to the previous option (wraps to end).
  - `Enter` while open: Confirms selection of highlighted option and closes menu.
  - `Escape`: Closes the menu without changing selection, returning focus to the trigger.
  - `Tab`: Closes the menu naturally as user tabs to the next document element.

---

## 5. How to Run & Verify

1. **Open in Browser**:
   Open `task21/index.html` directly in any modern browser.
2. **Run Automated Test Suite**:
   ```bash
   node task21/test.js
   ```
   Verifies all 8 functional and accessibility requirements.

