// Firebase cấu hình
const firebaseConfig = {
  apiKey: "AIzaSyCd354ot2XAtjNF_QvlUvryAjj7r8tEdBY",
  authDomain: "doantotnghiep-b5113.firebaseapp.com",
  databaseURL: "https://doantotnghiep-b5113-default-rtdb.firebaseio.com",
  projectId: "doantotnghiep-b5113",
  storageBucket: "doantotnghiep-b5113.appspot.com",
  messagingSenderId: "259513823991",
  appId: "1:259513823991:web:3f2c337c5850d7ce5759f2"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Hiển thị dữ liệu  bãi đỗ xe ngắn hạn
function showData(data) {
  const container = document.getElementById("firebaseData");
  const totalDisplay = document.getElementById("totalCount");
  const alertSound = document.getElementById("fullAlert");

  container.innerHTML = "";
  let totalVehicles = 0;

  for (let bai in data) {
    const baiData = data[bai];
    const soLuong = baiData.So_Luong ?? 0;
    const toiDa = baiData.Toi_Da ?? 0;
    const conTrong = toiDa - soLuong;
    const percent = Math.min(100, Math.round((soLuong / toiDa) * 100));
    totalVehicles += soLuong;

    const isFull = conTrong <= 0;

    // Cảnh báo âm thanh nếu đầy
    if (isFull) alertSound.play();

    const div = document.createElement("div");
    div.className = "lot";
    div.innerHTML = `
      <h2>${bai}</h2>
      <p class="info">Đang có <strong>${soLuong}</strong> / ${toiDa} xe</p>
      <p class="status ${isFull ? 'full' : 'available'}">
        ${isFull ? "Bãi đã đầy!" : `Còn ${conTrong} chỗ trống`}
      </p>
      <div class="progress-bar">
        <div class="progress-bar-inner" style="width: ${percent}%; background-color: ${
      percent >= 100 ? "red" : percent >= 70 ? "orange" : "green"
    };"></div>
      </div>
    `;
    container.appendChild(div);
  }

  totalDisplay.innerText = `🚗 Tổng số xe hiện tại của bãi ngắn hạn: ${totalVehicles}`;
}

// Tải dữ liệu
db.ref("BDX_Ngan_Han").on("value", (snapshot) => {
  const data = snapshot.val();
  if (data) {
    showData(data);
    updateLastUpdatedTime();
    applyFilter(); // Áp dụng lọc ngay khi có dữ liệu
  } else {
    document.getElementById("firebaseData").innerHTML = "<p>Không có dữ liệu.</p>";
  }
});

// Lọc dữ liệu theo tên và trạng thái
function applyFilter() {
  const searchText = document.getElementById('searchBox').value.toLowerCase();
  const selectedStatus = document.getElementById('filterStatus').value;
  const lots = document.querySelectorAll('.lot');

  lots.forEach(lot => {
    const title = lot.querySelector('h2').innerText.toLowerCase();
    const status = lot.querySelector('.status').innerText.toLowerCase();

    const matchName = title.includes(searchText);
    const matchStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'available' && status.includes('còn')) ||
      (selectedStatus === 'full' && status.includes('đầy'));

    lot.style.display = (matchName && matchStatus) ? 'block' : 'none';
  });
}

// Cập nhật thời gian
function updateLastUpdatedTime() {
  const now = new Date();
  const formatted = now.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  document.getElementById("lastUpdated").innerText = `⏱️ Dữ liệu cập nhật lúc: ${formatted}`;
}

// Cập nhật thời gian hiển thị mỗi 5 phút
setInterval(updateLastUpdatedTime, 5 * 60 * 1000);




// Hiển thị dữ liệu bãi đỗ xe dài hạn
function showLongTermData(data) {
  const container = document.getElementById("longTermData");
  const totalDisplay = document.getElementById("totalCountlong");
  const alertSound = document.getElementById("fullAlertLong");

  container.innerHTML = "";
  let totalVehicles = 0;

  for (let tang in data) {
    const tangData = data[tang];
    const soLuong = tangData.So_Luong ?? 0;
    const toiDa = tangData.Toi_Da ?? 0;
    const conTrong = toiDa - soLuong;
    const percent = Math.min(100, Math.round((soLuong / toiDa) * 100));
    totalVehicles += soLuong;

    const isFull = conTrong <= 0;
    if (isFull) alertSound.play();

    const div = document.createElement("div");
    div.className = "lot";
    div.innerHTML = `
      <h2>${tang}</h2>
      <p class="info">Đang có <strong>${soLuong}</strong> / ${toiDa} xe</p>
      <p class="status ${isFull ? 'full' : 'available'}">
        ${isFull ? "Tầng đã đầy!" : `Còn ${conTrong} chỗ trống`}
      </p>
      <div class="progress-bar">
        <div class="progress-bar-inner" style="width: ${percent}%; background-color: ${
      percent >= 100 ? "red" : percent >= 70 ? "orange" : "green"
    };"></div>
      </div>
    `;
    container.appendChild(div);
  }
  totalDisplay.innerText = `🚗 Tổng số xe hiện tại của bãi dài hạn: ${totalVehicles}`;
}

// Lọc dữ liệu dài hạn
function applyLongTermFilter() {
  const searchText = document.getElementById('searchBoxLong').value.toLowerCase();
  const selectedStatus = document.getElementById('filterStatusLong').value;
  const lots = document.querySelectorAll('#longTermData .lot');

  lots.forEach(lot => {
    const title = lot.querySelector('h2').innerText.toLowerCase();
    const status = lot.querySelector('.status').innerText.toLowerCase();

    const matchName = title.includes(searchText);
    const matchStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'available' && status.includes('còn')) ||
      (selectedStatus === 'full' && status.includes('đầy'));

    lot.style.display = (matchName && matchStatus) ? 'block' : 'none';
  });
}

// Cập nhật dữ liệu bãi dài hạn
db.ref("BDX_Dai_Han").on("value", (snapshot) => {
  const data = snapshot.val();
  if (data) {
    showLongTermData(data);
    updateLastUpdatedTimeLong();
    applyLongTermFilter();
  } else {
    document.getElementById("longTermData").innerHTML = "<p>Không có dữ liệu dài hạn.</p>";
  }
});

// Cập nhật thời gian hiển thị dữ liệu dài hạn
function updateLastUpdatedTimeLong() {
  const now = new Date();
  const formatted = now.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Cập nhật mỗi 5 phút
setInterval(updateLastUpdatedTimeLong, 5 * 60 * 1000);
