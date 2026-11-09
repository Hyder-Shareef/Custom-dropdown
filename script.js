const dropdown = document.querySelector('.dropdown');
const trigger = dropdown.querySelector('.dropdown-trigger');
const triggerText = dropdown.querySelector('.selected-text');
const options = Array.from(dropdown.querySelectorAll('.dropdown-option'));

let isOpen = false;
let selectedValue = null;
let highlightedIndex = -1;

const updateHighlight = () => {
  options.forEach((option, index) => {
    option.classList.toggle('highlighted', index === highlightedIndex);
  });
};

const openDropdown = () => {
  isOpen = true;
  dropdown.classList.add('open');
  trigger.setAttribute('aria-expanded', 'true');

  const selectedIndex = options.findIndex((option) => option.dataset.value === selectedValue);
  highlightedIndex = selectedIndex >= 0 ? selectedIndex : 0;
  updateHighlight();
};

const closeDropdown = () => {
  isOpen = false;
  dropdown.classList.remove('open');
  trigger.setAttribute('aria-expanded', 'false');
  highlightedIndex = -1;
  updateHighlight();
};

const toggleDropdown = () => {
  if (isOpen) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const selectOption = (option) => {
  if (!option) return;

  selectedValue = option.dataset.value;
  triggerText.textContent = selectedValue;
  triggerText.classList.remove('placeholder');
  dropdown.classList.add('has-selection');

  options.forEach((opt) => {
    const isSelected = opt === option;
    opt.classList.toggle('selected', isSelected);
    opt.setAttribute('aria-selected', isSelected);
  });

  closeDropdown();
  trigger.focus();
};

const handleOutsideClick = (event) => {
  if (isOpen && !dropdown.contains(event.target)) {
    closeDropdown();
  }
};

trigger.addEventListener('click', toggleDropdown);

options.forEach((option) => {
  option.addEventListener('click', () => selectOption(option));
});

document.addEventListener('click', handleOutsideClick);

document.addEventListener('keydown', (event) => {
  if (!isOpen) {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      openDropdown();
      if (event.key === 'ArrowUp') {
        highlightedIndex = options.length - 1;
        updateHighlight();
      }
    }
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    closeDropdown();
    trigger.focus();
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    highlightedIndex = (highlightedIndex + 1) % options.length;
    updateHighlight();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    highlightedIndex = (highlightedIndex - 1 + options.length) % options.length;
    updateHighlight();
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    selectOption(options[highlightedIndex]);
  } else if (event.key === 'Tab') {
    closeDropdown();
  }
});
