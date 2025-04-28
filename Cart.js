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

// Replace with the actual logged-in user's ID if available
const userId = 1;

window.onload = function () {
  fetch(`http://localhost:3000/cart/${userId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load cart");
      return res.json();
    })
    .then((items) => {
      displayCartItems(items);
    })
    .catch((err) => {
      console.error(err);
      document.querySelector(".cart-container").innerHTML += "<p>Failed to load cart items.</p>";
    });
};

function displayCartItems(items) {
  const itemsContainer = document.querySelector(".cart-items"); // ONLY selecting .cart-items
  itemsContainer.innerHTML = ""; // Clear old items if there are any

  if (items.length === 0) {
    itemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  items.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.innerHTML = `
      <h3>${item.name}</h3>
      <p><strong>Type:</strong> ${item.type}</p>
      <p><strong>Description:</strong> ${item.description}</p>
      <p><strong>Price:</strong> $${item.price}</p>
    `;
    itemsContainer.appendChild(itemDiv);
  });
}

function clearCart() {
  fetch(`http://localhost:3000/cart/${userId}`, {
    method: 'DELETE',
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to clear cart');
      return res.json();
    })
    .then((data) => {
      console.log(data.message);
      displayCartItems([]); // Refresh page: show empty cart immediately
    })
    .catch((err) => {
      console.error(err);
      alert("Failed to clear cart. Try again.");
    });
}



