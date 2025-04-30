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

document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("userEmail");
  if (email) {
    const emailSpan = document.getElementById("user-email");
    if (emailSpan) {
      emailSpan.textContent = email;
    }
  }

  // Load the user's items
  fetch(`/user-items/${email}`)
    .then(res => res.json())
    .then(items => {
      const list = document.getElementById("listingContainer");
      list.innerHTML = ""; // Clear loading...

      if (!items.length) {
        list.innerHTML = "<li>No items listed yet.</li>";
        return;
      }

      items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - $${item.price} (${item.type})`;
        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Failed to fetch user items", err);
      document.getElementById("listingContainer").innerHTML =
        "<li>Error loading items.</li>";
    });
});
