


window.addEventListener("load", function () {
  new Combobox(
    document.getElementById("cb1-input"),
    document.getElementById("cb1-button"),
    document.getElementById("lb1"),
    // Initial selected option
    "California",
    // Get the options from the hidden list.
    // The HTML elements could be rendered from the server side. You could use CSS to hide them when the page loads.
    Array.from(document.querySelectorAll("#listbox-options > li")),
    // Callback hooks. They are useful if you are building cascading comboboxes,
    // or coordinating the interactions among multiple components
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
});