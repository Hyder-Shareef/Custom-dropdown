const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('=== Running Task 21 Tests ===\n');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
const scriptSource = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');

// 1. Structure Verification
console.log('Test 1: Verifying HTML & CSS structure...');
assert(html.includes('class="dropdown"'), 'index.html must have .dropdown');
assert(html.includes('class="dropdown-trigger"'), 'index.html must have .dropdown-trigger');
assert(html.includes('Select an option'), 'index.html must contain placeholder text');
for (let i = 1; i <= 5; i++) {
  assert(html.includes(`Option ${i}`), `index.html must contain Option ${i}`);
}
assert(css.includes('.dropdown.open'), 'style.css must have open state');
assert(css.includes('.dropdown-option.selected'), 'style.css must have selected state');
assert(css.includes('rotate(180deg)'), 'style.css must rotate arrow on open');
console.log('✔ Test 1 Passed: Structure and selectors verified.\n');

// 2. DOM Mock & Script Execution
function createMockElement(tagName, classNames = [], dataset = {}) {
  const classes = new Set(classNames);
  const attrs = {};
  const listeners = {};

  const element = {
    tagName,
    dataset: { ...dataset },
    textContent: '',
    children: [],
    classList: {
      add: (...c) => c.forEach((cls) => classes.add(cls)),
      remove: (...c) => c.forEach((cls) => classes.delete(cls)),
      contains: (cls) => classes.has(cls),
      toggle: (cls, force) => {
        if (typeof force === 'boolean') {
          if (force) classes.add(cls);
          else classes.delete(cls);
          return force;
        }
        if (classes.has(cls)) {
          classes.delete(cls);
          return false;
        }
        classes.add(cls);
        return true;
      }
    },
    setAttribute: (k, v) => {
      attrs[k] = String(v);
    },
    getAttribute: (k) => attrs[k] || null,
    addEventListener: (event, handler) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    },
    dispatchEvent: (event) => {
      if (listeners[event.type]) {
        listeners[event.type].forEach((h) => h(event));
      }
    },
    click: () => {
      element.dispatchEvent({ type: 'click', target: element });
    },
    focus: () => {
      element.focused = true;
    },
    scrollIntoView: () => {},
    querySelector: (sel) => {
      if (sel === '.dropdown-trigger') return mockTrigger;
      if (sel === '.selected-text') return mockTriggerText;
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel === '.dropdown-option') return mockOptions;
      return [];
    },
    contains: (target) => {
      if (target === element) return true;
      return element.children.includes(target);
    }
  };

  return element;
}

const mockTrigger = createMockElement('BUTTON', ['dropdown-trigger']);
mockTrigger.setAttribute('aria-expanded', 'false');

const mockTriggerText = createMockElement('SPAN', ['selected-text', 'placeholder']);
mockTriggerText.textContent = 'Select an option';

const mockOptions = [1, 2, 3, 4, 5].map((num) => {
  const opt = createMockElement('LI', ['dropdown-option'], { value: `Option ${num}` });
  opt.textContent = `Option ${num}`;
  opt.setAttribute('aria-selected', 'false');
  return opt;
});

const mockDropdown = createMockElement('DIV', ['dropdown']);
mockDropdown.children = [mockTrigger, mockTriggerText, ...mockOptions];

const docListeners = {};
const mockDocument = {
  querySelector: (sel) => {
    if (sel === '.dropdown') return mockDropdown;
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel === '.dropdown-option') return mockOptions;
    return [];
  },
  addEventListener: (event, handler) => {
    docListeners[event] = docListeners[event] || [];
    docListeners[event].push(handler);
  },
  dispatchEvent: (event) => {
    if (docListeners[event.type]) {
      docListeners[event.type].forEach((h) => h(event));
    }
  }
};

const sandbox = {
  document: mockDocument,
  Array,
  console
};

vm.createContext(sandbox);
vm.runInContext(scriptSource, sandbox);

// 3. Test Default State
console.log('Test 2: Verifying Default State...');
assert.strictEqual(mockTriggerText.textContent, 'Select an option');
assert.strictEqual(mockTriggerText.classList.contains('placeholder'), true);
assert.strictEqual(mockTrigger.getAttribute('aria-expanded'), 'false');
assert.strictEqual(mockDropdown.classList.contains('open'), false);
console.log('✔ Test 2 Passed: Default state verified.\n');

// 4. Test Open State
console.log('Test 3: Testing Open State...');
mockTrigger.click();
assert.strictEqual(mockDropdown.classList.contains('open'), true);
assert.strictEqual(mockTrigger.getAttribute('aria-expanded'), 'true');
assert.strictEqual(mockOptions[0].classList.contains('highlighted'), true);
console.log('✔ Test 3 Passed: Open state verified.\n');

// 5. Test Toggle Close
console.log('Test 4: Testing Toggle Close...');
mockTrigger.click();
assert.strictEqual(mockDropdown.classList.contains('open'), false);
assert.strictEqual(mockTrigger.getAttribute('aria-expanded'), 'false');
console.log('✔ Test 4 Passed: Toggle close verified.\n');

// 6. Test Option Selection
console.log('Test 5: Testing Option Selection (Option 3)...');
mockTrigger.click(); // open
mockOptions[2].click(); // select Option 3
assert.strictEqual(mockDropdown.classList.contains('open'), false);
assert.strictEqual(mockTriggerText.textContent, 'Option 3');
assert.strictEqual(mockTriggerText.classList.contains('placeholder'), false);
assert.strictEqual(mockOptions[2].classList.contains('selected'), true);
assert.strictEqual(mockOptions[2].getAttribute('aria-selected'), 'true');
assert.strictEqual(mockOptions[0].classList.contains('selected'), false);
console.log('✔ Test 5 Passed: Option selection verified.\n');

// 7. Test Reopening retains selection
console.log('Test 6: Testing Reopening retains highlight...');
mockTrigger.click();
assert.strictEqual(mockOptions[2].classList.contains('highlighted'), true);
assert.strictEqual(mockOptions[2].classList.contains('selected'), true);
mockTrigger.click(); // close
console.log('✔ Test 6 Passed: Reopening highlights selected option.\n');

// 8. Test Click Outside
console.log('Test 7: Testing Click Outside...');
mockTrigger.click(); // open
assert.strictEqual(mockDropdown.classList.contains('open'), true);
const outsideEl = createMockElement('DIV');
mockDocument.dispatchEvent({ type: 'click', target: outsideEl });
assert.strictEqual(mockDropdown.classList.contains('open'), false);
console.log('✔ Test 7 Passed: Outside click closes dropdown.\n');

// 9. Test Keyboard Navigation
console.log('Test 8: Testing Keyboard Navigation...');
// Enter to open
mockDocument.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault: () => {} });
assert.strictEqual(mockDropdown.classList.contains('open'), true);
assert.strictEqual(mockOptions[2].classList.contains('highlighted'), true);

// ArrowDown to move to Option 4 (index 3)
mockDocument.dispatchEvent({ type: 'keydown', key: 'ArrowDown', preventDefault: () => {} });
assert.strictEqual(mockOptions[3].classList.contains('highlighted'), true);

// Enter to select Option 4
mockDocument.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault: () => {} });
assert.strictEqual(mockDropdown.classList.contains('open'), false);
assert.strictEqual(mockTriggerText.textContent, 'Option 4');
assert.strictEqual(mockOptions[3].classList.contains('selected'), true);

// Escape to close
mockDocument.dispatchEvent({ type: 'keydown', key: ' ', preventDefault: () => {} });
assert.strictEqual(mockDropdown.classList.contains('open'), true);
mockDocument.dispatchEvent({ type: 'keydown', key: 'Escape', preventDefault: () => {} });
assert.strictEqual(mockDropdown.classList.contains('open'), false);
console.log('✔ Test 8 Passed: Keyboard navigation verified.\n');

console.log('All Task 21 tests passed successfully!');
