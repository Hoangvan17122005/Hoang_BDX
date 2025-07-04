// ==== CẤU HÌNH FIREBASE ==== //
const firebaseConfig = {
  apiKey: "AIzaSyCd354ot2XAtjNF_QvlUvryAjj7r8tEdBY",
  authDomain: "doantotnghiep-b5113.firebaseapp.com",
  databaseURL: "https://doantotnghiep-b5113-default-rtdb.firebaseio.com",
  projectId: "doantotnghiep-b5113",
  storageBucket: "doantotnghiep-b5113.appspot.com",
  messagingSenderId: "259513823991",
  appId: "1:259513823991:web:3f2c337c5850d7ce5759f2"
};

firebase.initializeApp(firebaseConfig);

const usersRef = firebase.database().ref("Users");

// ==== ĐĂNG KÝ NGƯỜI DÙNG ==== //
document.querySelector(".form-box.register form").addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.querySelector(".form-box.register input[placeholder='Tên Đăng Nhập']").value.trim().toLowerCase();
  const email = document.querySelector(".form-box.register input[placeholder='Email']").value.trim();
  const password = document.querySelector(".form-box.register input[placeholder='Mật Khẩu']").value.trim();
  const confirmPassword = document.querySelector(".form-box.register input[placeholder='Xác nhận Mật Khẩu']").value.trim();

  if (!username || !email || !password || !confirmPassword) {
    alert("❗ Vui lòng điền đầy đủ thông tin.");
    return;
  }

  if (password !== confirmPassword) {
    alert("❗ Mật khẩu xác nhận không khớp.");
    return;
  }

  const countRef = firebase.database().ref("userCount");

    countRef.transaction(currentCount => {
      return (currentCount || 0) + 1;
    }, function(error, committed, snapshot) {
      if (error || !committed) {
        alert("❌ Đăng ký thất bại. Vui lòng thử lại.");
      } else {
        const index = snapshot.val();
        const newKey = "Nguoi_" + String(index).padStart(2, "0"); // → Nguoi_01, Nguoi_02,...

        usersRef.child(newKey).set({
          username,
          email,
          password
        }, function(error) {
          if (error) {
            alert("❌ Đăng ký thất bại.");
          } else {
            alert("✅ Đăng ký thành công!");
            document.querySelector(".form-box.register form").reset();
          }
        });
      }
    });
});

// ==== ĐĂNG NHẬP NGƯỜI DÙNG ==== //
document.querySelector(".form-box.login form").addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.querySelector(".form-box.login input[placeholder='Tên Đăng Nhập ']").value.trim().toLowerCase();
  const password = document.querySelector(".form-box.login input[placeholder='Mật Khẩu']").value.trim();

  if (!username || !password) {
    alert("❗ Vui lòng điền đầy đủ thông tin.");
    return;
  }

  usersRef.once("value", function (snapshot) {
    let foundUser = null;

    snapshot.forEach(child => {
      const user = child.val();
      if (
        user.username === username ||
        user.email?.toLowerCase() === username
      ) {
        foundUser = user;
      }
    });

    if (foundUser) {
      if (foundUser.password === password) {
        alert("✅ Đăng nhập thành công!");

        // Lưu thông tin đăng nhập
        localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
        updateUserInterface();

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      } else {
        alert("❌ Sai mật khẩu.");
      }
    } else {
      alert("❌ Không tìm thấy tài khoản.");
    }
  });
});

// ==== GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP ==== //
function updateUserInterface() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (user) {
    document.getElementById("userIconContainer").style.display = "block";
    document.getElementById("infoUsername").innerText = user.username;
    document.getElementById("infoEmail").innerText = user.email || "";
    document.getElementById("infoPassword").innerText = user.password;

    document.getElementById("loginForm").style.display = "none";
    document.getElementById("userInfo").style.display = "none";

    document.getElementById("userIcon").onclick = function () {
      const info = document.getElementById("userInfo");
      info.style.display = (info.style.display === "none") ? "block" : "none";
    };
  } else {
    document.getElementById("userIconContainer").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
  }
}

// ==== ĐĂNG XUẤT ==== //
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

// Tự động kiểm tra đăng nhập khi load trang
window.addEventListener("load", updateUserInterface);

// ==== CHUYỂN FORM ĐĂNG NHẬP ↔ ĐĂNG KÝ ==== //
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});
