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

