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
  
      let details = `
      <p><strong>Type:</strong> ${item.type}</p>
      <p><strong>Name:</strong> ${item.name}</p>
      ${item.description ? `<p><strong>Description:</strong> ${item.description}</p>` : ''}
      ${item.course_number ? `<p><strong>Course:</strong> ${item.course_number}</p>` : ''}
      ${item.edition ? `<p><strong>Edition:</strong> ${item.edition}</p>` : ''}
      ${item.model ? `<p><strong>Model:</strong> ${item.model}</p>` : ''}
      ${item.color ? `<p><strong>Color:</strong> ${item.color}</p>` : ''}
      ${item.size ? `<p><strong>Size:</strong> ${item.size}</p>` : ''}
      ${item.dimension ? `<p><strong>Dimension:</strong> ${item.dimension}</p>` : ''}
      ${item.weight ? `<p><strong>Weight:</strong> ${item.weight} lbs</p>` : ''}
      <p><strong>Price:</strong> $${item.price}</p>
      <p><em><strong>Sold by:</strong> ${item.seller_name || 'Unknown'}</em></p>
    `;
    
    if (item.image_url) {
      details += `<img src="${item.image_url}" style="max-width: 100px;"><br>`;
    }
    
    details += `<button onclick="addToCart(${item.id})">Add to Cart</button>`;
    
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

function toggleDropdown() {
  const menu = document.getElementById("dropdownMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

window.addEventListener("click", function (e) {
  const menu = document.getElementById("dropdownMenu");
  const profileImage = document.querySelector(".profile-image");
  if (!profileImage.contains(e.target) && !menu.contains(e.target)) {
    menu.style.display = "none";
  }
});

function addToCart(itemId) {
  fetch("http://localhost:3000/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: 1, // Using user_id = 1 for testing before its synced properly to login
      item_id: itemId,
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to add to cart");
      return response.json();
    })
    .then((data) => {
      alert("Item added to cart!");
    })
    .catch((error) => {
      console.error("Add to cart failed:", error);
    });
}
