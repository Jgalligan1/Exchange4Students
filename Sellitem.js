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

document.getElementById("itemForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const itemId = this.dataset.itemId;
  const formData = new FormData(document.getElementById("itemForm"));
  formData.append("user_id", parseInt(localStorage.getItem("userId")) || 1);  

  const url = itemId
    ? `http://localhost:3000/items/${itemId}`
    : "http://localhost:3000/add-item";

  const method = itemId ? "PUT" : "POST";

  fetch(url, {
    method,
    body: formData,
  })
    .then((res) => res.json())
    .then(() => {
      alert(itemId ? "Item updated!" : "Item posted!");
      closeModal();
      loadItems();
    })
    .catch((err) => console.error("Error:", err));
});


document.querySelector(".delete-button").addEventListener("click", function() {
  const itemId = document.getElementById("itemForm").dataset.itemId;
  if (!itemId) return;

  if (confirm("Are you sure you want to delete this item?")) {
      fetch(`http://localhost:3000/items/${itemId}`, {
          method: "DELETE",
      })
      .then(response => {
          if (!response.ok) throw new Error('Failed to delete item');
          return response.json();
      })
      .then(() => {
          closeModal();
          loadItems();
      })
      .catch(error => console.error("Error:", error));
  }
});

