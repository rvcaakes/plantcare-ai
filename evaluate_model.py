import json
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt


# =========================
# 1. KONFIGURASI
# =========================

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

TEST_DIR = "dataset/test"
MODEL_PATH = "model/plantcare_mango_finetuned.keras"
CLASS_NAMES_PATH = "model/class_names.json"


# =========================
# 2. MEMUAT MODEL
# =========================

print("Memuat model...")

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_NAMES_PATH, "r") as file:
    class_names = json.load(file)

print("Model berhasil dimuat!")
print("Kelas:", class_names)


# =========================
# 3. MEMUAT DATA TEST
# =========================

print("\nMembaca dataset test...")

test_dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

print("Dataset test berhasil dibaca!")


# =========================
# 4. EVALUASI MODEL
# =========================

print("\nMelakukan evaluasi model...\n")

test_loss, test_accuracy = model.evaluate(
    test_dataset,
    verbose=1
)

print("\n==============================")
print("HASIL EVALUASI MODEL")
print("==============================")

print(f"Test Loss     : {test_loss:.4f}")
print(f"Test Accuracy : {test_accuracy:.4f}")
print(f"Akurasi       : {test_accuracy * 100:.2f}%")


# =========================
# 5. PREDIKSI DATA TEST
# =========================

print("\nMembuat prediksi...")

y_true = []
y_pred = []

for images, labels in test_dataset:

    predictions = model.predict(
        images,
        verbose=0
    )

    predicted_classes = np.argmax(
        predictions,
        axis=1
    )

    y_true.extend(labels.numpy())
    y_pred.extend(predicted_classes)


# =========================
# 6. CLASSIFICATION REPORT
# =========================

print("\n==============================")
print("CLASSIFICATION REPORT")
print("==============================\n")

report = classification_report(
    y_true,
    y_pred,
    target_names=class_names,
    zero_division=0
)

print(report)


# =========================
# 7. CONFUSION MATRIX
# =========================

print("Membuat confusion matrix...")

cm = confusion_matrix(
    y_true,
    y_pred
)

disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=class_names
)

fig, ax = plt.subplots(
    figsize=(10, 8)
)

disp.plot(
    ax=ax,
    xticks_rotation=45,
    colorbar=False
)

plt.title("Confusion Matrix - PlantCare AI")
plt.tight_layout()

plt.savefig(
    "model/confusion_matrix.png",
    dpi=150
)

plt.close()

print("\nConfusion matrix berhasil disimpan!")
print("Lokasi: model/confusion_matrix.png")