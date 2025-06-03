<script>
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".w-form, #search-form");
  const input = document.querySelector("input[name='query']");
  const originalList = document.querySelector(".w-dyn-list");
  const allItems = originalList?.querySelectorAll(".w-dyn-item") || [];
  const searchResults = document.querySelector(".searchresults");
  const searchConfigDiv = document.querySelector("#search-config");
  const submitButton = form?.querySelector("input[type='submit'], button[type='submit']");

  if (submitButton) {
    submitButton.style.display = "none";
  }

  if (!form || !input || !originalList || !searchResults || !searchConfigDiv) {
    console.warn("Search components not found.");
    return;
  }

  input.style.borderRadius = "8px";
  form.removeAttribute("action");
  form.setAttribute("action", "#");

  const paginationType = searchConfigDiv.getAttribute("data-pagination-type")?.toLowerCase() || "none";
  const itemsPerPage = parseInt(searchConfigDiv.getAttribute("data-items-per-page"), 10) || 10;
  const searchBarType = searchConfigDiv.getAttribute("data-search-bar");

  let currentPage = 1;
  let matchedClones = [];

  // Inject CSS styles dynamically
  const style = document.createElement("style");
  style.textContent = `
    mark {
      background-color: #ffeb3b;
      color: inherit;
      font-weight: bold;
      padding: 0 2px;
      border-radius: 2px;
    }
    .pagination-container {
      clear: both;
      text-align: center;
      margin-top: 10px;
    }
    .pagination-nav button,
    .load-more-btn {
      margin: 0 5px;
      padding: 5px 10px;
      cursor: pointer;
      border: 1px solid #ccc;
      background: white;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }
    .pagination-nav button:hover:not(:disabled),
    .load-more-btn:hover {
      background-color: #eee;
    }
    .pagination-nav button:disabled {
      opacity: 0.6;
      cursor: default;
    }
    .load-more-btn {
      margin-top: 10px;
      padding: 8px 15px;
      cursor: pointer;
    }
    



  `;
  document.head.appendChild(style);

  // Show/hide search bar icon logic
  if (searchBarType === "Icon") {
    form.style.display = "none";
    const iconContainer = document.querySelector(".searchiconcontainer");
    if (!iconContainer) {
      console.error("'.searchiconcontainer' element not found.");
      return;
    }
    iconContainer.style.cursor = "pointer";
    iconContainer.style.display = "";

    iconContainer.addEventListener("click", () => {
      form.style.display = "";
      iconContainer.style.display = "none";
      input.focus();
    });
  } else {
    form.style.display = "";
    const iconContainer = document.querySelector(".searchiconcontainer");
    if (iconContainer) iconContainer.style.display = "none";
  }

  // Text highlighting function
  function highlightText(element, query) {
    const regex = new RegExp(`(${query})`, "gi");
    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && regex.test(node.textContent)) {
        const span = document.createElement("span");
        span.innerHTML = node.textContent.replace(regex, "<mark>$1</mark>");
        element.replaceChild(span, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        highlightText(node, query);
      }
    });
  }

  // Render results with pagination buttons after the items
  function render(page = 1) {
    searchResults.innerHTML = "";
    currentPage = page;

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = matchedClones.slice(start, end).map(item => item.cloneNode(true));

    // Append all items first
    pageItems.forEach(item => {
      searchResults.appendChild(item);
    });

    if (matchedClones.length === 0) {
      const msg = document.createElement("div");
      msg.textContent = "No results found.";
      searchResults.appendChild(msg);
      return;
    }

    // Create pagination container
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "pagination-container";

    if (paginationType === "load-more" && end < matchedClones.length) {
      const btn = document.createElement("button");
      btn.textContent = "Load more";
      btn.className = "load-more-btn";
      btn.onclick = () => render(currentPage + 1);
      paginationContainer.appendChild(btn);
    }

    if (paginationType === "numbered") {
      const totalPages = Math.ceil(matchedClones.length / itemsPerPage);
      if (totalPages > 1) {
        const nav = document.createElement("div");
        nav.className = "pagination-nav";

        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement("button");
          btn.textContent = i;
          if (i === page) btn.disabled = true;
          btn.onclick = () => render(i);
          nav.appendChild(btn);
        }
        paginationContainer.appendChild(nav);
      }
    }

    // Append pagination container after all items if it has buttons
    if (paginationContainer.children.length > 0) {
      searchResults.appendChild(paginationContainer);
    }
  }

  // Input event - live search
  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    matchedClones = [];

    if (!query) {
      originalList.style.display = "block";
      searchResults.innerHTML = "";
      return;
    }

    originalList.style.display = "none";

    allItems.forEach((item) => {
      const match = [...item.querySelectorAll("*")].some((el) =>
        (el.textContent || "").toLowerCase().includes(query)
      );
      if (match) {
        const clone = item.cloneNode(true);
        [...clone.querySelectorAll("*")].forEach((el) => {
          if ((el.textContent || "").toLowerCase().includes(query)) {
            highlightText(el, query);
          }
        });
        matchedClones.push(clone);
      }
    });

    currentPage = 1;
    render(currentPage);
  });
});
</script>
