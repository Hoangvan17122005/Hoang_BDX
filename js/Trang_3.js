
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
let dsRFID_DaTraCuu = []; 

//  TRA CỨU DỮ LIỆU QUA FLASK
function traCuu() {
  const rfid = document.getElementById("rfidInput").value.trim();
  if (!rfid) return alert("⚠️ Vui lòng nhập mã thẻ RFID");

  resetInfo();
  document.getElementById("loading").style.display = "block";

  fetch("http://127.0.0.1:5000/tra_cuu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ so_tra_cuu: rfid })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === "success") {
        console.log("✅ Server xử lý:", data.message);
        alert("✅ Tra cứu thành công!");
        
  
        if (!dsRFID_DaTraCuu.includes(rfid)) {
          dsRFID_DaTraCuu.push(rfid);

          // xóa RFID 
          setTimeout(() => {
            console.log("🗑️ Tự động xóa RFID sau 20s:", rfid);
            xoa1RFID(rfid);
          }, 20000);
        }

        setTimeout(() => docFirebase(rfid), 1000);
      } else {
        alert("❌ Lỗi Server: " + data.message);
        document.getElementById("loading").style.display = "none";
      }
    })
    .catch(err => {
      console.error("🚫 Lỗi khi kết nối Flask:", err);
      alert("🚫 Không thể kết nối đến server Flask.");
      document.getElementById("loading").style.display = "none";
    });
}



// Đọc Firebase
function docFirebase(rfid, retries = 10) {
  console.log("🔍 Đang truy vấn Firebase với RFID:", rfid); 
  console.log("📂 Đang truy cập đường dẫn Firebase:", "Ma_nguoi/" + rfid);
  const ref = db.ref("Ma_nguoi/" + rfid);

  ref.once("value").then((snapshot) => {
    const data = snapshot.val();
    console.log("📦 Dữ liệu từ Firebase:", data);

    if (!data && retries > 0) {
      console.warn("⏳ Dữ liệu chưa sẵn sàng, thử lại...");
      setTimeout(() => docFirebase(rfid, retries - 1), 500);
      return;
    }

    document.getElementById("loading").style.display = "none";

    if (!data) {
      console.log("⚠️ Không tìm thấy dữ liệu trong Firebase cho RFID:", rfid);
      anThongTin();  
      return;
    }

    hienThiDuLieu(data);  
  }).catch((err) => {
    console.error("🚫 Lỗi khi đọc Firebase:", err);
    document.getElementById("loading").style.display = "none";
    alert("❌ Lỗi khi truy vấn dữ liệu từ Firebase.");
  });
}




function chuyenDoiNgay(ngay) {
  console.log("🧪 Đang chuyển đổi ngày:", ngay); 
  if (/^\d{2}-\d{2}-\d{2}$/.test(ngay)) {
    const [d, m, y] = ngay.split("-");
    return `${d}-${m}-${2000 + Number(y)}`;
  }
  const match = ngay.match(/^(\d+)-Thg(\d+)-(\d+)$/);
  if (!match) {
    console.warn("⚠️ Không khớp định dạng ngày:", ngay);
    return ngay;
  }
  const [_, d, m, y] = match;
  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${2000 + Number(y)}`;
}


function taoTimestamp(ngay, gio) {
  const [d, m, y] = chuyenDoiNgay(ngay).split("-").map(Number);
  const [h = 0, mi = 0, s = 0] = gio.split(":").map(Number);
  return new Date(y, m - 1, d, h, mi, s).getTime();
}

function tinhTien(tgGui) {
  const GIA_CO_DINH = 10000;
  const GIA_GIO = 5000;
  const GIA_QUA_DEM = 50000;

  const now = Date.now();
  const d1 = new Date(tgGui);
  const d2 = new Date();

  const dem = Math.max(0, Math.floor((d2 - new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())) / (1000 * 60 * 60 * 24)));

  let gioGui = 0;
  let soGioTinhTien = 0; 

  if (dem >= 1) {
    gioGui = 24 - d1.getHours();  
  } else {
    const msGui = Math.max(0, now - tgGui);
    gioGui = Math.ceil(msGui / (1000 * 60 * 60));
  }

  let tienGio;
  if (dem < 40) {
    soGioTinhTien = dem * 14; // 24-10h = 14h cố định
    tienGio = soGioTinhTien * GIA_GIO;
  } else {
    soGioTinhTien = (dem >= 1 ? (24 - d1.getHours()) : gioGui); 
    tienGio = soGioTinhTien * GIA_GIO;
  }

  const tienQuaDem = dem * GIA_QUA_DEM;
  const tongTien = GIA_CO_DINH + tienGio + tienQuaDem;

  return {
    tienCoDinh: GIA_CO_DINH,
    tienGio,
    tienQuaDem,
    tongTien,
    tongGio: gioGui,
    soGioTinhTien, 
    soDem: dem
  };
}



// 🔄 RESET THÔNG TIN
function resetInfo() {
  ["plateNumber", "dateSent", "timeSent", "fixedFee", "hourlyFee", "overnightFee", "totalAmount", "hoursParked", "nightsStayed"]
    .forEach(id => document.getElementById(id).textContent = "...");
  anThongTin();
}

function anThongTin() {
  const info = document.getElementById("infoSection");
  info.classList.remove("show");
  info.style.display = "none";

}

// Hiển thị dữ liệu nheeeeeee
function hienThiDuLieu(data) {
  console.log("📌 Dữ liệu hiển thị:", data);
  if (!data) return anThongTin();

  const bienSo = data.BX_Xe || "Không rõ";
  const ngayGui = data.NgayGui || "";
  const gioGui = data.GioGui || "";
  const timestamp = taoTimestamp(ngayGui, gioGui);
  const tien = tinhTien(timestamp);

  let ngayTra = data.NgayTra;
  let gioTra = data.GioTra;

  if (!ngayTra || ngayTra.trim() === "") {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    ngayTra = `${dd}-Thg${mm}-${yy}`;
  }

  if (!gioTra || gioTra.trim() === "") {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    gioTra = `${hh}:${mi}:${ss}`;
  }

  //  Giá gốc
  const GIA_GIO = 5000;
  const GIA_QUA_DEM = 50000;

  document.getElementById("plateNumber").textContent = bienSo;
  document.getElementById("dateSent").textContent = ngayGui;
  document.getElementById("timeSent").textContent = gioGui;

  document.getElementById("fixedFee").textContent = tien.tienCoDinh.toLocaleString("vi-VN") + " VND";

  document.getElementById("hourlyFee").textContent =`${tien.tienGio.toLocaleString("vi-VN")} VND (${GIA_GIO.toLocaleString("vi-VN")} x ${tien.soGioTinhTien} giờ)`;

  document.getElementById("overnightFee").textContent = `${tien.tienQuaDem.toLocaleString("vi-VN")} VND (${GIA_QUA_DEM.toLocaleString("vi-VN")} x ${tien.soDem} đêm)`;

  document.getElementById("totalAmount").textContent = tien.tongTien.toLocaleString("vi-VN") + " VND";

  document.getElementById("hoursParked").textContent = tien.tongGio.toLocaleString("vi-VN") + " giờ";
  document.getElementById("nightsStayed").textContent = tien.soDem.toLocaleString("vi-VN") + " đêm";
  document.getElementById("dateOut").textContent = ngayTra;
  document.getElementById("timeOut").textContent = gioTra;

  const info = document.getElementById("infoSection");
  info.classList.add("show");
  info.style.display = "block";
}

function updateLastUpdatedTimeLong() {
  const now = new Date();
  const formatted = now.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  document.getElementById("lastUpdatedLong").innerText = `⏱️ Cập nhật lúc: ${formatted}`; // ← THÊM
}


//  HÀM XÓA DỮ LIỆU TRA CỨU
function xoaDuLieuTraCuu() {
  if (dsRFID_DaTraCuu.length === 0) {
    alert("⚠️ Không có dữ liệu RFID nào để xoá.");
    return;
  }

  if (!confirm("❗ Bạn có chắc chắn muốn xoá TẤT CẢ dữ liệu tra cứu không?")) return;

  dsRFID_DaTraCuu.forEach((rfid) => {
    xoa1RFID(rfid); // 👉 Gọi hàm xóa từng RFID
  });

  alert("✅ Tất cả dữ liệu tra cứu đã được xoá!");
  dsRFID_DaTraCuu = []; // 🔄 Xoá danh sách sau khi đã xóa Firebase
  document.getElementById("rfidInput").value = "";
  anThongTin();
}


function xoa1RFID(rfid) {
  const ref = db.ref("Ma_nguoi/" + rfid);
  ref.remove()
    .then(() => {
      console.log(`✅ Đã xoá dữ liệu RFID: ${rfid}`);
    })
    .catch((err) => {
      console.error(`❌ Không thể xoá RFID ${rfid}:`, err);
    });
}
