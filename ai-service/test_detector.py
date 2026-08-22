import onnxruntime as ort
import numpy as np
from PIL import Image
from inference.detector import GarbageDetector

def test():
    print("Loading detector...")
    detector = GarbageDetector("../best.onnx")
    
    # Create dummy image
    img = Image.new('RGB', (800, 600), color='white')
    
    print("Running detector...")
    bboxes, scores = detector.detect(img)
    print("Bboxes:", bboxes)
    print("Scores:", scores)

if __name__ == "__main__":
    test()
