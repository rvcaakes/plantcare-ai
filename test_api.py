import glob
import requests

# Ambil satu gambar dari dataset test
image_path = glob.glob("dataset/test/Anthracnose/*")[0]

print("Gambar yang dites:")
print(image_path)

with open(image_path, "rb") as image_file:
    response = requests.post(
        "http://127.0.0.1:5000/predict",
        files={"image": image_file}
    )

print("\nStatus:")
print(response.status_code)

print("\nHasil prediksi:")
print(response.json())