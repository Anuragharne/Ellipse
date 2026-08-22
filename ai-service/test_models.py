import onnxruntime as ort
import numpy as np
from PIL import Image
import os
import sys

sys.path.append('.')
from inference.detector import GarbageDetector
from inference.classifier import GarbageClassifier

def main():
    print("Initializing models...")
    detector = GarbageDetector("../best.onnx")
    classifier = GarbageClassifier("../best_classifier.onnx")
    
    images = [
        "../test_image.jpg",
        "../detect_image.jpg"
    ]
    
    for img_path in images:
        if not os.path.exists(img_path):
            print(f"Image not found: {img_path}")
            continue
            
        print(f"\n--- Testing {img_path} ---")
        img = Image.open(img_path).convert('RGB')
        
        # 1. Detect
        results = detector.detect(img)
        print(f"Detector output: {len(results)} boxes found.")
        
        if len(results) == 0:
            print("  No garbage detected.")
        else:
            # 2. Classify the best box
            # Sort by confidence
            results.sort(key=lambda x: x['confidence'], reverse=True)
            best = results[0]
            print(f"  Best box: {best['box']} with score {best['confidence']}")
            
            x1, y1, x2, y2 = [int(v) for v in best['box']]
            # Ensure coordinates are within image bounds
            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(img.width, x2)
            y2 = min(img.height, y2)
            
            crop = img.crop((x1, y1, x2, y2))
            
            res = classifier.classify(crop)
            print(f"Classifier output:")
            print(f"  Category: {res['class']} (Confidence: {res['confidence']:.4f})")

if __name__ == "__main__":
    main()
