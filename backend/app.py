import os
import json

import numpy as np
import tensorflow as tf

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image


# =========================
# 1. KONFIGURASI
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "plantcare_mango_finetuned.keras"
)

CLASS_NAMES_PATH = os.path.join(
    BASE_DIR,
    "model",
    "class_names.json"
)

IMG_SIZE = (224, 224)


# =========================
# 2. MEMBUAT FLASK APP
# =========================

app = Flask(__name__)

CORS(app)


# =========================
# 3. MEMUAT MODEL
# =========================

print("Memuat model PlantCare AI...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

with open(CLASS_NAMES_PATH, "r") as file:
    class_names = json.load(file)

print("Model berhasil dimuat!")
print("Kelas:", class_names)


# =========================
# 4. ROUTE HOME
# =========================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "PlantCare AI API aktif!",
        "model": "MobileNetV2 Fine-Tuned",
        "classes": class_names
    })


# =========================
# 5. ROUTE PREDIKSI
# =========================

@app.route("/predict", methods=["POST"])
def predict():
    print("\n--- REQUEST PREDICT ---")
    print("Files:", request.files)
    print("Form:", request.form)

    if "image" not in request.files:
        return jsonify({
            "success": False,
            "error": "Tidak ada file image yang diterima Flask."
        }), 400

    file = request.files["image"]

    print("Filename:", file.filename)
    print("Content type:", file.content_type)

    if file.filename == "":
        return jsonify({
            "success": False,
            "error": "Nama file gambar kosong."
        }), 400

    file = request.files["image"]

    # Cek nama file
    if file.filename == "":
        return jsonify({
            "error": "Nama file gambar kosong."
        }), 400

    try:

        # =========================
        # BUKA GAMBAR
        # =========================

        image = Image.open(file)

        # Ubah menjadi RGB
        image = image.convert("RGB")

        # Resize sesuai input model
        image = image.resize(IMG_SIZE)

        # Ubah menjadi array
        image_array = np.array(image)

        # Tambahkan batch dimension
        image_array = np.expand_dims(
            image_array,
            axis=0
        )


        # =========================
        # PREDIKSI
        # =========================

        predictions = model.predict(
            image_array,
            verbose=0
        )

        predicted_index = int(
            np.argmax(predictions[0])
        )

        predicted_class = class_names[
            predicted_index
        ]

        confidence = float(
            predictions[0][predicted_index]
        )


        # =========================
        # RESPONSE
        # =========================

        return jsonify({

            "success": True,

            "prediction": predicted_class,

            "confidence": round(
                confidence * 100,
                2
            )

        })


    except Exception as error:

        return jsonify({

            "success": False,

            "error": str(error)

        }), 500


# =========================
# 6. MENJALANKAN SERVER
# =========================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )