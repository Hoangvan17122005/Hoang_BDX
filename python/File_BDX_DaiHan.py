# File: FileCD_BDX_Dai_Han.py

import pandas as pd
from firebase_admin import db
import os

# --- Cấu hình đường dẫn ---
csv_path = r"D:\Visual_Code\Lap_Trinh_Web\BaiDoXe_1\Access\BDX_Dai_Han.csv"
print("✅ CSV file tồn tại?", os.path.exists(csv_path))

def upload_data_to_firebase():
    print("🚀 Bắt đầu upload BDX_Dai_Han...")

    # --- Đọc và xử lý CSV dạng bảng 'vẽ tay' ---
    with open(csv_path, encoding="utf-8") as f:
        lines = f.readlines()

    # Loại bỏ dòng trống và dòng toàn gạch
    data_lines = [line.strip() for line in lines if line.strip() and not all(c in "-|" or c.isspace() for c in line)]

    print(f"📄 Đã đọc {len(data_lines)} dòng dữ liệu sau khi lọc.")

    # Phân tách dòng thành các cột
    rows = []
    for line in data_lines:
        line_clean = line.strip().lstrip('\ufeff').strip('|')
        parts = [p.strip() for p in line_clean.split('|')]
        if len(parts) >= 4:  # STT, Tang_Xe, So_Luong, Toi_Da
            rows.append(parts)

    if not rows:
        raise ValueError("⚠️ Không có dòng dữ liệu hợp lệ sau khi phân tích!")

    header = rows[0]
    data = rows[1:]

    # Tạo DataFrame
    df = pd.DataFrame(data, columns=header)
    print("🧾 Dữ liệu sau khi tạo DataFrame:")
    print(df)

    # Chuyển kiểu dữ liệu các cột số
    df["So_Luong"] = df["So_Luong"].astype(int)
    df["Toi_Da"] = df["Toi_Da"].astype(int)

    # --- Đẩy lên Firebase ---
    ref = db.reference("BDX_Dai_Han")

    for _, row in df.iterrows():
        tang_key = row["Tang_Xe"]
        tang_data = {
            "So_Luong": row["So_Luong"],
            "Toi_Da": row["Toi_Da"]
        }
        ref.child(tang_key).set(tang_data)

    print("✅ Dữ liệu đã được đồng bộ lên Firebase theo dạng BDX_Dai_Han > Tang_X.")
