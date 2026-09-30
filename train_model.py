import os
import json
import tensorflow as tf


# =========================
# 1. KONFIGURASI
# =========================

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15

TRAIN_DIR = "dataset/train"
VAL_DIR = "dataset/validation"

MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "plantcare_mango.keras")
CLASS_NAMES_PATH = os.path.join(MODEL_DIR, "class_names.json")


# =========================
# 2. MEMBACA DATASET
# =========================

print("Membaca dataset...")

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

class_names = train_dataset.class_names

print("\nKelas yang digunakan:")
print(class_names)


# =========================
# 3. DATA AUGMENTATION
# =========================

data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.1),
    tf.keras.layers.RandomZoom(0.1),
    tf.keras.layers.RandomContrast(0.1),
])


# =========================
# 4. PREPROCESSING
# =========================

preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input


# =========================
# 5. MODEL MOBILENETV2
# =========================

base_model = tf.keras.applications.MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

# Bekukan MobileNetV2 terlebih dahulu
base_model.trainable = False


# =========================
# 6. MEMBUAT MODEL
# =========================

inputs = tf.keras.Input(shape=(224, 224, 3))

x = data_augmentation(inputs)

x = preprocess_input(x)

x = base_model(x, training=False)

x = tf.keras.layers.GlobalAveragePooling2D()(x)

x = tf.keras.layers.Dense(128, activation="relu")(x)

x = tf.keras.layers.Dropout(0.3)(x)

outputs = tf.keras.layers.Dense(
    len(class_names),
    activation="softmax"
)(x)

model = tf.keras.Model(inputs, outputs)


# =========================
# 7. COMPILE MODEL
# =========================

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)


# =========================
# 8. CALLBACK
# =========================

os.makedirs(MODEL_DIR, exist_ok=True)

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=4,
        restore_best_weights=True
    ),

    tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True
    ),

    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.2,
        patience=2,
        min_lr=0.000001
    )
]


# =========================
# 9. TRAINING
# =========================

print("\nMulai training model...\n")

history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=EPOCHS,
    callbacks=callbacks
)


# =========================
# 10. SIMPAN NAMA KELAS
# =========================

with open(CLASS_NAMES_PATH, "w") as file:
    json.dump(class_names, file, indent=4)


print("\nTraining selesai!")

print(f"Model disimpan di: {MODEL_PATH}")

print(f"Nama kelas disimpan di: {CLASS_NAMES_PATH}")