import argparse
from pathlib import Path

import torch
from torch import nn
from torch.optim import Adam
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms


def get_args():
    parser = argparse.ArgumentParser(description="Train MobileNetV2 for freshness detection")
    parser.add_argument("--data-dir", type=str, required=True, help="Path to dataset root")
    parser.add_argument("--epochs", type=int, default=55, help="Training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument(
        "--output",
        type=str,
        default=str(Path(__file__).resolve().parent / "model.pth"),
        help="Output .pth file",
    )
    return parser.parse_args()


def build_transforms():
    train_tf = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(10),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )

    val_tf = transforms.Compose(
        [
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ]
    )

    return train_tf, val_tf


def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss = 0.0
    total_correct = 0
    total_samples = 0

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            total_loss += loss.item() * images.size(0)
            preds = outputs.argmax(dim=1)
            total_correct += (preds == labels).sum().item()
            total_samples += images.size(0)

    return total_loss / total_samples, total_correct / total_samples


def main():
    args = get_args()

    if not torch.cuda.is_available():
        raise RuntimeError("CUDA GPU is required. This script runs in GPU-only mode.")

    device = "cuda"
    train_tf, val_tf = build_transforms()

    base_dataset = datasets.ImageFolder(args.data_dir)
    train_size = int(0.8 * len(base_dataset))
    val_size = len(base_dataset) - train_size

    train_subset, val_subset = random_split(
        base_dataset,
        [train_size, val_size],
        generator=torch.Generator().manual_seed(42),
    )

    # Keep one dataset split for indexing and wrap each split with proper transforms.
    train_dataset = datasets.ImageFolder(args.data_dir, transform=train_tf)
    val_dataset = datasets.ImageFolder(args.data_dir, transform=val_tf)
    train_dataset.samples = [base_dataset.samples[i] for i in train_subset.indices]
    train_dataset.imgs = train_dataset.samples
    train_dataset.targets = [base_dataset.targets[i] for i in train_subset.indices]

    val_dataset.samples = [base_dataset.samples[i] for i in val_subset.indices]
    val_dataset.imgs = val_dataset.samples
    val_dataset.targets = [base_dataset.targets[i] for i in val_subset.indices]

    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=4, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4, pin_memory=True)

    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, len(train_dataset.classes))
    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = Adam(model.parameters(), lr=args.lr)

    best_val_acc = 0.0
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Training on GPU with {args.epochs} epochs")
    print(f"Classes: {len(train_dataset.classes)}")

    for epoch in range(args.epochs):
        model.train()
        running_loss = 0.0
        running_correct = 0
        running_total = 0

        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            preds = outputs.argmax(dim=1)
            running_correct += (preds == labels).sum().item()
            running_total += images.size(0)

        train_loss = running_loss / running_total
        train_acc = running_correct / running_total

        val_loss, val_acc = evaluate(model, val_loader, criterion, device)

        print(
            f"Epoch [{epoch + 1}/{args.epochs}] "
            f"Train Loss: {train_loss:.4f} Train Acc: {train_acc:.4f} "
            f"Val Loss: {val_loss:.4f} Val Acc: {val_acc:.4f}"
        )

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "class_names": train_dataset.classes,
                    "val_acc": val_acc,
                },
                output_path,
            )
            print(f"Saved best model to {output_path} with val_acc={val_acc:.4f}")

    print(f"Training completed. Best validation accuracy: {best_val_acc:.4f}")


if __name__ == "__main__":
    main()
