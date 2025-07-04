import os
import sys
import time
import datetime
import pandas as pd
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db


app = Flask(__name__)
CORS(app)  # truy cập từ  port khác

FIREBASE_CRED_PATH = r"D:\Visual_Code\Lap_Trinh_Web\BaiDoXe_1\doantotnghiep-b5113-firebase-adminsdk-fbsvc-e4fbaa46c3.json"
CSV_PATH = r"D:\Visual_Code\Lap_Trinh_Web\BaiDoXe_1\Access\Tra_Cuu.csv"

# khởi tạo firebase nhéeeee
if not firebase_admin._apps:
    if not os.path.exists(FIREBASE_CRED_PATH):
        print(f"❌ Không tìm thấy file chứng thực Firebase: {FIREBASE_CRED_PATH}")
        sys.exit(1)
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://doantotnghiep-b5113-default-rtdb.firebaseio.com'
    })

#  chuyển đổi ngày từ định dạng dd/mm/yyyy -> dd-ThgMM-yy
def convert_date(date_str):
    try:
        dt = datetime.datetime.strptime(date_str.strip(), "%d/%m/%Y")
        return f"{dt.day:02d}-Thg{dt.month}-{str(dt.year)[2:]}"
    except:
        return ""

# ✅ Hàm chuyển đổi giờ từ SA/CH -> HH:MM:SS
def convert_time(time_str):
    try:
        time_str = time_str.strip().replace("SA", "AM").replace("CH", "PM").replace(".", ":")
        return datetime.datetime.strptime(time_str, "%I:%M:%S %p").strftime("%H:%M:%S")
    except Exception as e:
        print(f"❌ Lỗi convert_time: {e}")
        return ""

# ✅ Hàm xử lý và upload dữ liệu từ CSV lên Firebase
def upload_one_record(target_id):
    if not os.path.exists(CSV_PATH):
        print(f"❌ Không tìm thấy file CSV: {CSV_PATH}")
        return False

    try:
        with open(CSV_PATH, encoding="utf-8") as f:
            lines = f.readlines()

        # xóa bỏ dòng trống và dòng gạch 
        data_lines = [line.strip() for line in lines if line.strip() and not all(c in "-|" or c.isspace() for c in line)]

        rows = []
        for line in data_lines:
            line_clean = line.strip().lstrip('\ufeff').strip('|')
            parts = [p.strip() for p in line_clean.split('|')]
            if len(parts) >= 6:
                rows.append(parts)

        if not rows:
            print("⚠️ Không có dữ liệu hợp lệ.")
            return False

        header = rows[0]
        data = rows[1:]
        df = pd.DataFrame(data, columns=header)
        df.columns = df.columns.str.strip()
        df = df.dropna(how='all')

        # Tra cứu
        df_target = df[df["So_TraCuu"].astype(str).str.strip() == str(target_id).strip()]
        if df_target.empty:
            print(f"❌ Không tìm thấy ID: {target_id}")
            return False

        row = df_target.iloc[0]
        firebase_data = {
            "BX_Xe": str(row.get("BX_Xe", "")).strip(),
            "RFID": int(str(row.get("RFID", "0")).strip()) if str(row.get("RFID", "0")).strip().isdigit() else 0,
            "NgayGui": convert_date(str(row.get("NgayGui", ""))),
            "GioGui": convert_time(str(row.get("GioGui", ""))),
            "NgayTra": convert_date(str(row.get("NgayTra", ""))),
            "GioTra": convert_time(str(row.get("GioTra", ""))),
        }

        ref = db.reference("Ma_nguoi")
        ref.child(target_id).set(firebase_data)
        print(f"✅ Đã gửi dữ liệu ID {target_id} lên Firebase: {firebase_data}")

        # # Xoá 
        # time.sleep(15)
        # ref.child(target_id).delete()
        # print(f"🗑️ Đã xóa dữ liệu ID {target_id} khỏi Firebase sau 10 giây.")
        return True
    except Exception as e:
        print(f"❌ Lỗi xử lý CSV hoặc Firebase: {e}")
        return False


@app.route('/')
def home():
    return "✅ Hello từ Flask!"

@app.route("/form_tra_cuu", methods=["GET"])
def form_tra_cuu():
    return render_template("feature.html")  


@app.route("/tra_cuu", methods=["POST"])
def api_tra_cuu():
    data = request.get_json()
    print("📥 Dữ liệu nhận từ client:", data)
    so_tra_cuu = data.get("so_tra_cuu")

    if not so_tra_cuu:
        return jsonify({"status": "error", "message": "Thiếu số tra cứu"}), 400

    if upload_one_record(so_tra_cuu):
        return jsonify({"status": "success", "message": f"Đã xử lý {so_tra_cuu}"}), 200
    else:
        return jsonify({"status": "error", "message": f"Không tìm thấy ID {so_tra_cuu}"}), 404

@app.route("/xoa_rfid", methods=["POST"])
def xoa_rfid():
    try:
        data = request.get_json()
        rfid = data.get("rfid")
        if not rfid:
            return jsonify({"status": "error", "message": "Không có RFID để xoá"})
        db.reference(f"Ma_nguoi/{rfid}").delete()
        print(f"🗑️ Đã xoá RFID {rfid}")
        return jsonify({"status": "success", "message": f"Đã xoá RFID {rfid}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# 🏁 Chạy Flask server
if __name__ == "__main__":
    if len(sys.argv) == 2:
        upload_one_record(sys.argv[1])
    else:
        app.run(host='0.0.0.0', port=5000, debug=True)


