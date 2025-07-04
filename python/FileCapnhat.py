import firebase_admin
from firebase_admin import credentials
import importlib.util
import os
import time

# --- Khởi tạo Firebase duy nhất ở đây ---
if not firebase_admin._apps:
    cred = credentials.Certificate(
        r"D:\Visual_Code\Lap_Trinh_Web\BaiDoXe_1\doantotnghiep-b5113-firebase-adminsdk-fbsvc-e4fbaa46c3.json"
    )
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://doantotnghiep-b5113-default-rtdb.firebaseio.com/'
    })
    print("🚀 Đã kết nối Firebase thành công!")

# --- Hàm gọi file con ---
def run_module(file_path, func_name="upload_data_to_firebase"):
    module_name = os.path.splitext(os.path.basename(file_path))[0]
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    getattr(mod, func_name)()

# --- Lặp lại mỗi 5 giây ---
print("🔄 Bắt đầu theo dõi và cập nhật mỗi 5 giây...")
while True:
    try:
        run_module(r"D:\Visual_Code\Lap_Trinh_Web\BaiDoXe_1\python\File_BDX_DaiHan.py")
        run_module(r"D:\Visual_Code\Lap_Trinh_Web\BaiDoXe_1\python\File_BDX_Ngan_han.py")
        run_module(r"D:\Visual_Code\Lap_Trinh_Web\BaiDoXe_1\python\FileCapnhat.py")
    except Exception as e:
        print(f"❌ Lỗi khi chạy module: {e}")

    print("⏳ Chờ 5 giây...\n")
    time.sleep(5)
