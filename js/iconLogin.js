function updateUserInterface() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (user) {
    const loginNav = document.getElementById("loginNav");
    const userIconContainer = document.getElementById("userIconContainer");
    const infoUsername = document.getElementById("infoUsername");
    const infoEmail = document.getElementById("infoEmail");
    const infoPassword = document.getElementById("infoPassword");
    const userIcon = document.getElementById("userIcon");
    const userInfo = document.getElementById("userInfo");

    // 👉 Ẩn nút "Đăng Nhập"
    if (loginNav) loginNav.style.display = "none";

    // 👉 Hiện icon người dùng
    if (userIconContainer) userIconContainer.style.display = "block";

    // 👉 Gán thông tin người dùng (ưu tiên fullName nếu có)
     if (infoUsername) infoUsername.innerText = user.username|| "Không rõ";
    if (infoEmail) infoEmail.innerText = user.email || "Không rõ";
    if (infoPassword) infoPassword.innerText = user.password || "Không rõ";

    // 👉 Tạo toggle bật/tắt khung thông tin khi click icon
    if (userIcon && userInfo) {
      userIcon.onclick = () => {
        userInfo.style.display = (userInfo.style.display === "none" || userInfo.style.display === "") ? "block" : "none";
      };
    }

    // 👉 BONUS: Nếu có các trường CCCD và region
    const infoCCCD = document.getElementById("infoCCCD");
    const infoRegion = document.getElementById("infoRegion");
    if (infoCCCD) infoCCCD.innerText = user.cccd || "Không rõ";
    if (infoRegion) infoRegion.innerText = user.region || "Không rõ";
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

// Tự động chạy khi trang load xong
window.addEventListener("DOMContentLoaded", updateUserInterface);
