// ✅ CẤU HÌNH FIREBASE
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
const db = firebase.database();

function chuyenDoiNgay(ngayGui) {
  const regex = /^(\d+)-Thg(\d+)-(\d+)$/;
  const match = ngayGui.match(regex);
  if (!match) return ngayGui;
  let ngay = match[1].padStart(2, '0');
  let thang = match[2].padStart(2, '0');
  let nam = Number(match[3]) + 2000;
  return `${ngay}-${thang}-${nam}`;
}

function taoTimestamp(ngayGui, gioGui) {
  const ngayChuan = chuyenDoiNgay(ngayGui);
  const parts = ngayChuan.split("-");
  if (parts.length !== 3) return Date.now();
  const [ngay, thang, nam] = parts.map(Number);
  const [gio, phut, giay = 0] = gioGui.split(":").map(Number);
  return new Date(nam, thang - 1, ngay, gio, phut, giay).getTime();
}

function tinhTien(timestampGui) {
  const giaCoDinh = 10000, giaTheoGio = 5000, giaQuaDem = 50000;
  const now = Date.now();
  const gioGui = new Date(Number(timestampGui));
  let tongMs = Math.max(0, now - timestampGui);
  const tongGio = Math.ceil(tongMs / (1000 * 60 * 60));
  const demGui = new Date(gioGui.getFullYear(), gioGui.getMonth(), gioGui.getDate());
  const demHienTai = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), new Date(now).getDate());
  let soDem = Math.floor((demHienTai - demGui) / (1000 * 60 * 60 * 24));
  let tienGio = (soDem >= 1) ? (24 - gioGui.getHours()) * giaTheoGio : tongGio * giaTheoGio;
  const tienQuaDem = soDem * giaQuaDem;
  return {
    tongTien: giaCoDinh + tienGio + tienQuaDem,
    tienCoDinh: giaCoDinh,
    tienGio,
    tienQuaDem,
    tongGio,
    soDem
  };
}

document.addEventListener("DOMContentLoaded", function () {
  // Ready khi DOM load
});

// ✅ Thanh toán
function pay(method) {
  const qrSection = document.getElementById("qrSection");
  const successMessage = document.getElementById("successMessage");
  const audio = document.getElementById("successAudio");

  if (method === "qr") {
    qrSection.classList.remove("hidden");
    setTimeout(() => {
      qrSection.classList.add("hidden");
      successMessage.classList.remove("hidden");
      audio.play();
    }, 3000);
  } else {
    successMessage.classList.remove("hidden");
    audio.play();
  }
}

// ✅ Kiểm tra thông tin thanh toán từ RFID
function checkAmount() {
  const rfid = document.getElementById("rfidInput").value.trim();
  const amountDisplay = document.getElementById("amountDisplay");
  const lastUpdated = document.getElementById("lastUpdated");
  const errorMsg = document.getElementById("errorMsg");
  const loading = document.getElementById("loading");
  const balanceDisplay = document.getElementById("balanceDisplay");

  if (!rfid) {
    errorMsg.textContent = "⚠️ Vui lòng nhập mã RFID!";
    amountDisplay.textContent = "0 VND";
    balanceDisplay.textContent = "-- VND";
    lastUpdated.textContent = "";
    return;
  }

  loading.style.display = "block";
  errorMsg.textContent = "";
  amountDisplay.textContent = "...";
  balanceDisplay.textContent = "...";
  lastUpdated.textContent = "";

  const ref = db.ref("Ma_nguoi/" + rfid);

  ref.once("value", (snapshot) => {
    loading.style.display = "none";
    const data = snapshot.val();

    if (data) {
      const { NgayGui = "", GioGui = "", so_du = 0 } = data;
      let timestamp = Number(data.timestamp);
      const tsFromDate = (NgayGui && GioGui) ? taoTimestamp(NgayGui, GioGui) : Date.now();
      if (isNaN(timestamp) || timestamp > Date.now()) {
        timestamp = tsFromDate;
        ref.update({ timestamp: tsFromDate });
      }

      const kq = tinhTien(timestamp);
      amountDisplay.textContent = kq.tongTien.toLocaleString() + " VND";
      balanceDisplay.textContent = Number(so_du).toLocaleString("vi-VN") + " VND";

      const now = new Date();
      lastUpdated.textContent = "⏱️ Dữ liệu cập nhật lúc: " + now.toLocaleString("vi-VN");

      // Lưu tạm biến
      window.tongTien = kq.tongTien;
    } else {
      errorMsg.textContent = "❌ Không tìm thấy RFID trong hệ thống.";
      amountDisplay.textContent = "0 VND";
      balanceDisplay.textContent = "-- VND";
    }
  }).catch((error) => {
    console.error("Firebase Error:", error);
    loading.style.display = "none";
    errorMsg.textContent = "❌ Đã xảy ra lỗi khi truy vấn dữ liệu.";
    amountDisplay.textContent = "0 VND";
    balanceDisplay.textContent = "-- VND";
  });
}

// ✅ Hiện/ẩn khung nạp tiền
function toggleRecharge() {
  const box = document.getElementById("rechargeBox");
  box.classList.toggle("hidden");
}



