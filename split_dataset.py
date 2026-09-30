import os
import shutil
import random

SOURCE_DIR = "dataset/mango"

TRAIN_DIR = "dataset/train"
VAL_DIR = "dataset/validation"
TEST_DIR = "dataset/test"

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15

random.seed(42)

classes = os.listdir(SOURCE_DIR)

for class_name in classes:
    source_class = os.path.join(SOURCE_DIR, class_name)

    if not os.path.isdir(source_class):
        continue

    images = [
        file
        for file in os.listdir(source_class)
        if file.lower().endswith((".jpg", ".jpeg", ".png"))
    ]

    random.shuffle(images)

    total = len(images)

    train_end = int(total * TRAIN_RATIO)
    val_end = train_end + int(total * VAL_RATIO)

    train_images = images[:train_end]
    val_images = images[train_end:val_end]
    test_images = images[val_end:]

    for folder in [TRAIN_DIR, VAL_DIR, TEST_DIR]:
        os.makedirs(
            os.path.join(folder, class_name),
            exist_ok=True
        )

    for image in train_images:
        shutil.copy2(
            os.path.join(source_class, image),
            os.path.join(TRAIN_DIR, class_name, image)
        )

    for image in val_images:
        shutil.copy2(
            os.path.join(source_class, image),
            os.path.join(VAL_DIR, class_name, image)
        )

    for image in test_images:
        shutil.copy2(
            os.path.join(source_class, image),
            os.path.join(TEST_DIR, class_name, image)
        )

    print(
        f"{class_name}: "
        f"train={len(train_images)}, "
        f"validation={len(val_images)}, "
        f"test={len(test_images)}"
    )

print("\nPembagian dataset selesai!")