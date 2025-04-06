let allItems = [];
let filteredItems = [];
let currentPage = 0;
const itemsPerPage = 5;

fetch("http://localhost:3000/items")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then((data) => {
    allItems = data;
    filteredItems = [...allItems];
    displayItems();
  })
  .catch((error) => {
    console.error("Error loading data:", error);
    document.getElementById("itemsContainer").innerHTML =
      "<p>Failed to load items.</p>";
  });


function displayItems() {
  const container = document.getElementById("itemsContainer");
  container.innerHTML = "";

  if (filteredItems.length === 0) {
    container.innerHTML = "<p>No items found.</p>";
    updatePagination();
    return;
  }

  const start = currentPage * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = filteredItems.slice(start, end);

  paginatedItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");

    let details = "";

    if (item.type) details += `<h3>Type: ${item.type}</h3>`;
    if (item.name) details += `<h4>Name: ${item.name}</h4>`;
    if (item.description) details += `<p>Description: ${item.description}</p>`;
    if (item.courseNumber) details += `<p>Course: ${item.courseNumber}</p>`;
    if (item.edition) details += `<p>Edition: ${item.edition}</p>`;
    if (item.model) details += `<p>Model: ${item.model}</p>`;
    if (item.color) details += `<p>Color: ${item.color}</p>`;
    if (item.size) details += `<p>Size: ${item.size}</p>`;
    if (item.dimension) details += `<p>Dimension: ${item.dimension}</p>`;
    if (item.weight) details += `<p>Weight: ${item.weight} lbs</p>`;

    details += `<p><strong>Price:</strong> $${item.price}</p>`;
    itemDiv.innerHTML = details;
    container.appendChild(itemDiv);
  });

  updatePagination();
}

function searchItems() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const selectedType = document.getElementById("typeFilter").value;

  filteredItems = allItems.filter((item) => {
    const matchesQuery = Object.values(item).some((value) => {
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(query);
    });

    const matchesType = selectedType === "all" || item.type === selectedType;

    return matchesQuery && matchesType;
  });

  currentPage = 0;
  displayItems();
}


function updatePagination() {
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  document.getElementById("prevBtn").disabled = currentPage === 0;
  document.getElementById("nextBtn").disabled = currentPage >= totalPages - 1;
  document.getElementById("pageInfo").textContent = `Page ${
    currentPage + 1
  } of ${totalPages}`;
}

function nextPage() {
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  if (currentPage < totalPages - 1) {
    currentPage++;
    displayItems();
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    displayItems();
  }
}
