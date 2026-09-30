import os
import json
import tensorflow as tf


# =========================
# 1. KONFIGURASI
# =========================

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 8

TRAIN_DIR = "dataset/train"
VAL_DIR = "dataset/validation"

MODEL_PATH = "model/plantcare_mango.keras"
FINETUNED_MODEL_PATH = "model/plantcare_mango_finetuned.keras"
CLASS_NAMES_PATH = "model/class_names.json"


# =========================
# 2. MEMUAT MODEL LAMA
# =========================

print("Memuat model baseline...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("Model berhasil dimuat!")


# =========================
# 3. MEMUAT DATASET
# =========================

print("\nMembaca dataset...")

train_dataset = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    seed=42
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    VAL_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

print("\nDataset berhasil dibaca!")


# =========================
# 4. CARI MOBILE NET V2
# =========================

print("\nMencari MobileNetV2...")

base_model = None

for layer in model.layers:
    if "mobilenetv2" in layer.name.lower():
        base_model = layer
        break

if base_model is None:
    raise ValueError("MobileNetV2 tidak ditemukan di dalam model!")

print(f"Base model ditemukan: {base_model.name}")


# =========================
# 5. MEMBUKA SEBAGIAN LAYER
# =========================

print("\nMengatur layer untuk fine-tuning...")

base_model.trainable = True

# Awalnya semua layer dibekukan
for layer in base_model.layers:
    layer.trainable = False


# Buka 30 layer terakhir
fine_tune_layers = 30

for layer in base_model.layers[-fine_tune_layers:]:
    # Batch Normalization tetap dibekukan
    if not isinstance(
        layer,
        tf.keras.layers.BatchNormalization
    ):
        layer.trainable = True


print(
    f"{fine_tune_layers} layer terakhir dibuka "
    "untuk fine-tuning."
)


# =========================
# 6. COMPILE ULANG
# =========================

print("\nCompile ulang model...")

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.00001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)


# =========================
# 7. CALLBACK
# =========================

callbacks = [

    tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=3,
        restore_best_weights=True
    ),

    tf.keras.callbacks.ModelCheckpoint(
        FINETUNED_MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True
    ),

    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.2,
        patience=2,
        min_lr=0.0000001
    )
]


# =========================
# 8. FINE-TUNING
# =========================

print("\n==============================")
print("MULAI FINE-TUNING")
print("==============================\n")

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=EPOCHS,
    callbacks=callbacks
)


# =========================
# 9. SIMPAN NAMA KELAS
# =========================

with open(CLASS_NAMES_PATH, "w") as file:
    json.dump(
        train_dataset.class_names,
        file,
        indent=4
    )


print("\n==============================")
print("FINE-TUNING SELESAI")
print("==============================")

print(
    f"Model disimpan di: "
    f"{FINETUNED_MODEL_PATH}"
)