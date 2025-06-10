<script> 
document.addEventListener("DOMContentLoaded", function () {
  const filterinput = document.querySelector(".searchfilterformcontainer input");

  const allItems = [...document.querySelectorAll(".w-dyn-item")];

  if (!filterinput || allItems.length === 0) {
    console.warn("Search input or items not found.");
    return;
  }

  if (filterinput) {
  filterinput.placeholder = "Search here";
  filterinput.style.borderRadius = "8px";
  filterinput.style.margin = "0 16px"; // add left and right margin
  filterinput.style.width = "50%";
}


  // Collect all unique data-* attributes from all items
  const filterAttrs = new Set();
  allItems.forEach(el => {
    el.getAttributeNames().forEach(attr => {
      if (attr.startsWith("data-")) {
        filterAttrs.add(attr);
      }
    });
  });

  // Inject CSS for highlight
  const style = document.createElement("style");
  style.textContent = `
    mark {
      background-color: #ffeb3b;
      color: inherit;
      font-weight: bold;
      padding: 0 2px;
      border-radius: 2px;
    }
  `;
  document.head.appendChild(style);

  // Helper to remove existing highlights
  function removeAllHighlights(item) {
    item.querySelectorAll("mark").forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      }
    });
  }

  // Highlight matching text
  function highlightText(element, query) {
    const regex = new RegExp(query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "gi");
    element.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && regex.test(node.textContent)) {
        const span = document.createElement("span");
        span.innerHTML = node.textContent.replace(regex, match => `<mark>${match}</mark>`);
        element.replaceChild(span, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        highlightText(node, query);
      }
    });
  }

  // Main search input listener
  filterinput.addEventListener("input", () => {
    const query = filterinput.value.toLowerCase().trim();

    allItems.forEach(item => {
      removeAllHighlights(item);

      const matches = [...filterAttrs].some(attr => {
        const val = (item.getAttribute(attr) || "").toLowerCase();
        return val.includes(query);
      });

      if (query && matches) {
        item.style.display = "";
        [...item.querySelectorAll("*")].forEach(el => {
          if ((el.textContent || "").toLowerCase().includes(query)) {
            highlightText(el, query);
          }
        });
      } else if (!query) {
        item.style.display = ""; // Show all on empty query
      } else {
        item.style.display = "none";
      }
    });
  });
});
</script>
