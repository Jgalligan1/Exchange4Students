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
