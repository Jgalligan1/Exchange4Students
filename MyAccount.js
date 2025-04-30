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
  const userId = localStorage.getItem("userId");

  // ✅ Display email
  const emailDisplay = document.getElementById("user-email");
  if (email && emailDisplay) {
    emailDisplay.textContent = email;
  }

  // ✅ Load name from backend
  fetch(`/get-name/${email}`)
    .then((res) => res.json())
    .then((data) => {
      const nameSpan = document.getElementById("user-name");
      if (nameSpan && data.name) {
        nameSpan.textContent = data.name;
      }
    })
    .catch((err) => {
      console.error("Failed to load name", err);
    });

  // ✅ Load user listings
  fetch(`/user-items/${email}`)
    .then((res) => res.json())
    .then((items) => {
      const list = document.getElementById("listingContainer");
      list.innerHTML = ""; // Clear loading...

      if (!items.length) {
        list.innerHTML = "<li>No items listed yet.</li>";
        return;
      }

      items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - $${item.price} (${item.type})`;
        list.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Failed to fetch user items", err);
      document.getElementById("listingContainer").innerHTML =
        "<li>Error loading items.</li>";
    });

  // ✅ Update name handler
  const saveBtn = document.getElementById("save-name");
  const nameSpan = document.getElementById("user-name");
  const nameInput = document.getElementById("name-input");

  if (saveBtn && nameInput && nameSpan) {
    saveBtn.addEventListener("click", () => {
      const newName = nameInput.value.trim();
      if (!newName) return alert("Please enter a name");

      fetch("/update-name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: newName }),
      })
        .then((res) => res.json())
        .then((data) => {
          nameSpan.textContent = newName;
          alert("Name updated successfully!");
        })
        .catch((err) => {
          console.error("Failed to update name", err);
          alert("Name update failed.");
        });
    });
  }
});
