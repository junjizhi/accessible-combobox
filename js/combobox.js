/*
  Adapted from https://www.w3.org/TR/wai-aria-practices-1.1/examples/combobox/aria1.1pattern/js/listbox-combobox.js
  We added a few more properties to the Combobox class:
    - Initial value
    - More callback hooks to make it to extend and implement other behaviors
    - ES6 class syntax
 */

const KeyCode = {
  BACKSPACE: 8,
  TAB: 9,
  RETURN: 13,
  SHIFT: 16,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
};

class Combobox {
  constructor(
    input,
    arrow,
    listbox,
    initialValue,
    items,
    onItemsShown,
    onItemsHidden,
    onSelect,
    onError,
    shouldAutoSelect
  ) {
    this.input = input;
    this.arrow = arrow;
    this.listbox = listbox;
    this.initialValue = initialValue;
    this.items = items;
    this.shouldAutoSelect = shouldAutoSelect || false;
    this.onSelect = onSelect || function () {};
    this.onError = onError || function () {};
    this.onItemsShown = onItemsShown || function () {};
    this.onItemsHidden = onItemsHidden || function () {};
    this.activeIndex = -1;
    this.resultsCount = 0;
    this.shown = false;
    this.hasInlineAutocomplete =
      input.getAttribute("aria-autocomplete") === "both";

    this.setupInput();
    this.setupEvents();
  }

  setupEvents() {
    document.body.addEventListener("click", this.checkHide);
    this.input.addEventListener("keyup", this.checkKey);
    this.input.addEventListener("keydown", this.setActiveItem);
    this.input.addEventListener("focus", this.onFocus);
    this.input.addEventListener("blur", this.checkSelection);
    this.listbox.addEventListener("click", this.clickItem);

    if (this.arrow && this.items.length > 0) {
      this.arrow.addEventListener("click", this.clickArrow);
    }
  }

  setupInput = () => {
    if (this.initialValue) {
      const item = this.items.find(
        (item) => item.innerText.trim() === this.initialValue
      );
      if (item) {
        this.input.setAttribute("value", this.initialValue);
      }
    }
  };

  checkKey = (evt) => {
    const key = evt.which || evt.keyCode;

    switch (key) {
      case KeyCode.ESC:
        evt.preventDefault();
        this.onSelect();
        return;
      case KeyCode.UP:
      case KeyCode.DOWN:
      case KeyCode.RETURN:
      case KeyCode.TAB:
      case KeyCode.SHIFT:
        evt.preventDefault();
        return;
      default:
        this.updateResults(false);
    }

    if (this.hasInlineAutocomplete) {
      switch (key) {
        case KeyCode.BACKSPACE:
          return;
        default:
          this.autocompleteItem();
      }
    }
  };

  updateResults = (shouldShowAll) => {
    const searchString = this.input.value;
    let results = [];

    if (shouldShowAll) {
      results = this.items;
    } else {
      results = this.items.filter((item) =>
        item.innerText.toLowerCase().includes(searchString.toLowerCase())
      );
    }

    this.hideListbox();

    if (results.length) {
      for (let i = 0; i < results.length; i++) {
        const resultItem = document.createElement("li");
        resultItem.setAttribute("role", "option");
        resultItem.setAttribute("id", this.getItemId(i));
        resultItem.innerText = results[i].innerText;
        if (this.shouldAutoSelect && i === 0) {
          resultItem.setAttribute("aria-selected", "true");
          this.activeIndex = 0;
        }
        this.listbox.appendChild(resultItem);
      }
      this.listbox.classList.remove("hidden");
      this.input.setAttribute("aria-expanded", "true");
      this.resultsCount = results.length;
      this.shown = true;
    } else if (searchString) {
      this.onError(this.listbox);
      this.listbox.classList.remove("hidden");
      this.shown = true;
    }

    if (this.shown) {
      this.onItemsShown();
    }
  };

  setActiveItem = (evt) => {
    const key = evt.which || evt.keyCode;
    let activeIndex = this.activeIndex;

    if (key === KeyCode.ESC) {
      this.reset();
      return;
    }

    if (this.resultsCount < 1) {
      if (
        this.hasInlineAutocomplete &&
        (key === KeyCode.DOWN || key === KeyCode.UP)
      ) {
        this.updateResults(true);
      } else {
        return;
      }
    }

    const prevActive = this.getItemAt(activeIndex);
    let activeItem;

    switch (key) {
      case KeyCode.UP:
        if (activeIndex <= 0) {
          activeIndex = this.resultsCount - 1;
        } else {
          activeIndex--;
        }
        break;
      case KeyCode.DOWN:
        if (activeIndex === -1 || activeIndex >= this.resultsCount - 1) {
          activeIndex = 0;
        } else {
          activeIndex++;
        }
        break;
      case KeyCode.RETURN:
        activeItem = this.getItemAt(activeIndex);
        this.selectItem(activeItem);
        return;
      case KeyCode.TAB:
        this.checkSelection();
        this.hideListbox();
        return;
      default:
        return;
    }

    evt.preventDefault();

    activeItem = this.getItemAt(activeIndex);
    this.activeIndex = activeIndex;

    if (prevActive) {
      prevActive.setAttribute("aria-selected", "false");
    }

    if (activeItem) {
      this.input.setAttribute(
        "aria-activedescendant",
        this.getItemId(activeIndex)
      );
      this.input.setAttribute("aria-controls", this.listbox.id);
      activeItem.setAttribute("aria-selected", "true");
      if (this.hasInlineAutocomplete) {
        this.input.value = activeItem.innerText;
      }
    } else {
      this.input.removeAttribute("aria-activedescendant");
      this.input.removeAttribute("aria-controls");
    }
  };

  getItemId = (index) => {
    return this.listbox.id + "-" + "result-item-" + index;
  };

  getItemAt = (index) => {
    return document.getElementById(this.getItemId(index));
  };

  clickItem = (evt) => {
    if (evt.target && evt.target.nodeName == "LI") {
      this.selectItem(evt.target);
    }
  };

  clickArrow = (evt) => {
    if (this.shown) {
      this.hideListbox();
      const label = this.arrow.getAttribute("aria-label");
      this.arrow.setAttribute("aria-label", label.replace("Hide", "Show"));
    } else {
      const label = this.arrow.getAttribute("aria-label");
      this.arrow.setAttribute("aria-label", label.replace("Show", "Hide"));
      this.input.focus();
    }
    evt.preventDefault();
  };

  selectItem = (item) => {
    if (item) {
      this.input.value = item.innerText;
      this.hideListbox();
      this.onSelect(item);
    }
  };

  onFocus = () => {
    this.listbox.classList.add("focus");
    this.updateResults(true);
  };

  checkHide = (evt) => {
    if (
      evt.target === this.input ||
      evt.target === this.arrow ||
      this.input.contains(evt.target)
    ) {
      evt.preventDefault();
      return;
    }
    this.hideListbox();
  };

  hideListbox = () => {
    if (this.shown) {
      this.shown = false;
      this.onItemsHidden();
    }

    this.activeIndex = -1;
    this.listbox.innerHTML = "";
    this.listbox.classList.add("hidden");
    this.input.setAttribute("aria-expanded", "false");
    this.resultsCount = 0;
    this.input.removeAttribute("aria-activedescendant");
    this.input.removeAttribute("aria-controls");
  };

  checkSelection = () => {
    if (this.activeIndex < 0) {
      return;
    }
    const activeItem = this.getItemAt(this.activeIndex);
    this.selectItem(activeItem);
  };

  autocompleteItem = () => {
    const autocompletedItem = this.listbox.querySelector(
      `[aria-selected="true"]`
    );
    const inputText = this.input.value;

    if (!autocompletedItem || !inputText) {
      return;
    }

    const autocomplete = autocompletedItem.innerText;
    if (inputText !== autocomplete) {
      this.input.value = autocomplete;
      this.input.setSelectionRange(inputText.length, autocomplete.length);
    }
  };

  reset = () => {
    this.hideListbox();
    setTimeout(() => {
      // On Firefox, input does not get cleared here unless wrapped in
      // a setTimeout
      this.input.value = "";
    }, 1);
    this.input.removeAttribute("value");
    this.input.disabled = false;
  };

  disable = () => {
    this.input.disabled = true;
  };
}

if (!window) { // Simple check if it's browser environment
  exports.Combobox = Combobox;
}
