# Accessible Combobox (WAI-ARIA v1.2)

This repo implements a WAI-ARIA v1.2 compliant combobox with a listbox and a dropdown button.

## Demo

![accessible combobox demo gif](https://user-images.githubusercontent.com/2715151/96359280-03a79d80-10df-11eb-909b-be8eed0ee6b8.gif)


## Why ARIA v1.2, not v1.1?

Quote from [the ARIA site](https://www.w3.org/TR/wai-aria-1.2/#combobox):

> The Guidance for combobox has changed significantly in ARIA 1.2 due to problems with implementation of the previous patterns. Authors and developers of User Agents, Assistive Technologies, and Conformance Checkers are advised to review this section carefully to understand the changes.

[ARIA Wiki](https://github.com/w3c/aria/wiki/Resolving-ARIA-1.1-Combobox-Issues) also has detailed explanations of the version issues.

__Essentially, if a combobox implementation follows ARIA v1.1 specs, it would have poor
screen reader support__.

The major differences between v1.1 and v1.2 include:
- `role="combobox"` is on a wrapper `<div>`(v.1.1) or `<input>`(v.1.2)
- `aria-owns` (v.1.1) vs. `aria-controls` (v1.2)

As a result, it is important to get these details right to make your combobox accessible.

## Usage

HTML:

```html
<input id="cb1-input"
    type="text"
    role="combobox"
    aria-label="Enter a state"
    aria-autocomplete="both"
    aria-expanded="false"
    aria-controls="lb1"
    aria-haspopup="listbox"
    />
<button type="button"
      id="cb1-button"
      aria-label="open state list"
      tabindex="-1"> ▼
</button>

<ul id="lb1"
    role="listbox"
    aria-label="States">
</ul>

<!-- Hidden options list -->
<ul id="listbox-options" class="hidden">
  <li id="lb1-al" class="hidden">
    Alabama
  </li>
  <li id="lb1-ak" class="hidden">
    Alaska
  </li>
  <!-- ... -->
</ul>
```

Notes:

- You can wrap the input and the button in a div like in `example.js` if you want to put them in the same CSS class.
- The two `ul` don't have to be placed next to the input or button. You can place them anywhere in the HTML.

Javascript:

```javascript
new Combobox(
  document.getElementById("cb1-input"),
  document.getElementById("cb1-button"),
  document.getElementById("lb1"),
  "Alabama",
  Array.from(document.querySelectorAll("#listbox-options > li")),
  function () {
    console.log("Showing items");
  },
  function () {
    console.log("Hiding items");
  },
  function () {
    console.log("Changing an item");
  },
  function () {
    console.log("An Error happens");
  }
);
```

For more details, check out `index.html` and `example.js`.

## Explanations
When workinng the ARIA v1.1 combobox, I found a few problems with [their reference implementation](https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html).
This repo is an improved version of accessible combobox implementation with ARIA v1.2 compliance.

In particular, I added a few properties to the Combobox class:
  - Initial value
  - More callback hooks to make it to extend and implement other behaviors
  - ES6 class syntax

For more details, please check out [my blog](https://blog.junjizhi.com/).

### HTMl elements structure assumptions

The class requires the `input`, `button` and `ul` elements to have the correct `aria-*` attributes.

TODO:

- [ ] handle all ARIA related attributes in Javascript (in the Combobox constructor function).


### Client side search

Search happens totally in the client side / browser. When user enters a search term, the script
matches the results with the term and renders the list. I do it this way because __[ARIA v1.2 specs](https://www.w3.org/TR/wai-aria-practices-1.2/#combobox)
require updating `aria-selected` attributes of the options, and pointing `aria-activedescendent` to the selected option__. Because
these things are tightly coupled, using Javascript to rebuild the popup HTML with total control makes more sense to me, instead of assuming any HTML attributes.

The search requires a hidden list of available
options rendered in the HTML. In practice, the options list likely comes from the server side. It also makes it easy to work with existing framework (e.g., Rails or Phoenix) where the views are
usually server side rendered.

## Other libraries

If you are looking an accessible combobox in React, check out [Reach UI Combobox](https://reach.tech/combobox/).