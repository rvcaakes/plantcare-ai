import tensorflow as tf

IMG_SIZE = (224, 224)

BATCH_SIZE = 32

TRAIN_DIR = "dataset/train"

VAL_DIR = "dataset/validation"

TEST_DIR = "dataset/test"


train_dataset = tf.keras.utils.image_dataset_from_directory(
    TRAIN_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True
)

validation_dataset = tf.keras.utils.image_dataset_from_directory(
    VAL_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)

test_dataset = tf.keras.utils.image_dataset_from_directory(
    TEST_DIR,
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=False
)


print("\nNama kelas:")
print(train_dataset.class_names)


# Data augmentation untuk training
data_augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.1),
    tf.keras.layers.RandomZoom(0.1),
    tf.keras.layers.RandomContrast(0.1),
])


print("\nData augmentation berhasil dibuat!")

print("\nDataset berhasil dibaca TensorFlow!")