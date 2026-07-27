# Dataset (Member 1)

Target classes: **bottle, can, bag, wrapper** — beach/coastal litter context.

## Sources

The dataset is constructed by combining 5 Roboflow / YOLOv8 formatted sources:

| Source Dataset Package | Role / Description | Format |
|---|---|---|
| `TACO- Object Detection.v5-raw-images-alltrash.yolov8` | Base dataset — raw trash annotations in context | YOLOv8 |
| `beach-garbage-detection.v21i.yolov8` | Coastal & beach garbage detection imagery | YOLOv8 |
| `ecotide.v1-ecotide.yolov8` | EcoTide dataset for beach & marine litter detection | YOLOv8 |
| `beach litter.v1i.yolov8` | Dedicated beach litter imagery | YOLOv8 |
| `aluminum can.v10i.yolov8` | Focused aluminum beverage can detection set | YOLOv8 |

## Workflow

1. Download and import all 5 dataset sources into a consolidated Roboflow workspace.
2. Use Roboflow's class-remap tool to collapse fine-grained labels (e.g., "Clear plastic bottle", "Drink can", "Garbage bag", "Crisp packet") into the four target classes: **bottle, can, bag, wrapper**.
3. Check class balance across the merged set — backfill any underrepresented class (e.g. using `aluminum can.v10i.yolov8` to reinforce beverage cans) before exporting.
4. Export in **YOLOv8 format** (Roboflow handles the train/val/test split) directly into `yolo_format/`.

## Folders (gitignored — see root `.gitignore`)

```
dataset/
├── raw/          # source images/annotations as downloaded from the 5 dataset packages
├── merged/       # after combining all 5 dataset sources, before remap
└── yolo_format/  # final exported dataset, ready for ai-service training
```

These folders aren't committed to git (too large) — document where the merged dataset is hosted (e.g. a shared Drive link or Roboflow project URL) for the team here once it's ready.
