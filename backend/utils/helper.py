from collections import Counter
from statistics import mean

KNOWLEDGE_BASE = {
    "Apple": {
        "shelf_life": "7-10 days",
        "nutrition": "Fiber, Vitamin C, Potassium",
        "storage_tip": "Store in a cool dry place or refrigerate.",
        "health_tip": "Supports heart health and digestion.",
    },
    "Banana": {
        "shelf_life": "3-5 days",
        "nutrition": "Potassium, Vitamin B6, Manganese",
        "storage_tip": "Keep at room temperature, away from direct sun.",
        "health_tip": "Good for energy and muscle function.",
    },
    "Bellpepper": {
        "shelf_life": "5-7 days",
        "nutrition": "Vitamin C, Vitamin A, Fiber",
        "storage_tip": "Refrigerate in a breathable bag.",
        "health_tip": "Boosts immunity and eye health.",
    },
    "Cucumber": {
        "shelf_life": "4-7 days",
        "nutrition": "Vitamin K, Water, Antioxidants",
        "storage_tip": "Keep refrigerated and dry.",
        "health_tip": "Helps hydration and skin health.",
    },
    "Grape": {
        "shelf_life": "5-7 days",
        "nutrition": "Vitamin C, Vitamin K, Polyphenols",
        "storage_tip": "Refrigerate unwashed and rinse before use.",
        "health_tip": "Supports heart and brain health.",
    },
    "Okra": {
        "shelf_life": "2-4 days",
        "nutrition": "Folate, Fiber, Vitamin C",
        "storage_tip": "Store in paper bag in refrigerator.",
        "health_tip": "Supports gut health and blood sugar balance.",
    },
    "Orange": {
        "shelf_life": "7-14 days",
        "nutrition": "Vitamin C, Fiber, Folate",
        "storage_tip": "Store cool, refrigerate for longer shelf life.",
        "health_tip": "Supports immunity and collagen production.",
    },
    "Potato": {
        "shelf_life": "10-20 days",
        "nutrition": "Carbohydrates, Potassium, Vitamin B6",
        "storage_tip": "Store in dark, dry, cool place.",
        "health_tip": "Provides sustained energy.",
    },
    "Strawberry": {
        "shelf_life": "2-4 days",
        "nutrition": "Vitamin C, Manganese, Antioxidants",
        "storage_tip": "Refrigerate and keep dry until use.",
        "health_tip": "Promotes skin health and immunity.",
    },
    "Tomato": {
        "shelf_life": "4-6 days",
        "nutrition": "Vitamin C, Lycopene, Potassium",
        "storage_tip": "Keep at room temperature; refrigerate when fully ripe.",
        "health_tip": "Supports skin and cardiovascular health.",
    },
}

SPOILED_EATING_RISKS = {
    "Apple": "May cause stomach upset and foodborne illness due to yeast and mold growth.",
    "Banana": "Can trigger nausea, bloating, and diarrhea from microbial spoilage.",
    "Bellpepper": "May contain harmful bacteria and molds that can cause food poisoning.",
    "Cucumber": "Can cause digestive discomfort and possible foodborne infection.",
    "Grape": "May lead to stomach pain, vomiting, or diarrhea if contaminated by molds.",
    "Okra": "Can cause gastrointestinal irritation when spoiled microbes are present.",
    "Orange": "Spoiled citrus may irritate the stomach and cause nausea or vomiting.",
    "Potato": "Rotten potato can be unsafe; consuming it may cause severe stomach upset.",
    "Strawberry": "Moldy berries may trigger stomach issues and allergic reactions in some people.",
    "Tomato": "Spoiled tomatoes may cause food poisoning symptoms like nausea and diarrhea.",
}


def normalize_label(label: str) -> str:
    clean = label.replace("Freah", "Fresh").replace("_", " ").strip()
    return " ".join(clean.split())


def split_label(label: str):
    normalized = normalize_label(label)
    parts = normalized.split(" ", 1)
    if len(parts) == 2:
        status, item = parts[0], parts[1]
    else:
        status, item = "Unknown", normalized
    return status, item


def enrich_prediction(label: str, confidence: float):
    status, item = split_label(label)
    is_spoiled = status.lower() in {"rotten", "spoiled", "bad"}

    info = KNOWLEDGE_BASE.get(
        item,
        {
            "shelf_life": "Unknown",
            "nutrition": "Not available",
            "storage_tip": "Not available",
            "health_tip": "Not available",
        },
    )

    if is_spoiled:
        shelf_life = "0 days"
        eating_risk = SPOILED_EATING_RISKS.get(
            item,
            "May cause food poisoning symptoms such as nausea, vomiting, or diarrhea.",
        )
    else:
        shelf_life = info["shelf_life"]
        eating_risk = ""

    return {
        "label": normalize_label(label),
        "status": status,
        "item": item,
        "confidence": round(confidence, 2),
        "shelf_life": shelf_life,
        "nutrition": info["nutrition"],
        "storage_tip": info["storage_tip"],
        "health_tip": info["health_tip"],
        "eating_risk": eating_risk,
    }


def aggregate_predictions(predictions):
    labels = [p["label"] for p in predictions]

    if len(set(labels)) == 1:
        label_votes = Counter(labels)
        status_votes = Counter(p["status"] for p in predictions)

        winner_label = label_votes.most_common(1)[0][0]
        winner_status = status_votes.most_common(1)[0][0]
        avg_conf = mean(p["confidence"] for p in predictions)

        combined = enrich_prediction(winner_label, avg_conf)
        combined["status"] = winner_status

        return {
            "type": "single",
            "final_result": combined,
            "images": predictions,
            "final_score": round(avg_conf, 2),
        }

    return {
        "type": "multiple",
        "results": predictions,
    }
