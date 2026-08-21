import onnxruntime as ort
import numpy as np
from PIL import Image

class GarbageClassifier:
    def __init__(self, model_path: str):
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        # Classes based on user specification
        self.classes = ['hazardous', 'non-recyclable', 'organic', 'recyclable']

    def preprocess(self, image: Image.Image):
        # Resize to 224x224
        img = image.convert("RGB").resize((224, 224))
        img_array = np.array(img).astype(np.float32) / 255.0
        
        # ImageNet normalization
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_array = (img_array - mean) / std
        
        # HWC to CHW
        img_array = img_array.transpose(2, 0, 1)
        return np.expand_dims(img_array, axis=0)

    def classify(self, image: Image.Image):
        tensor = self.preprocess(image)
        outputs = self.session.run(None, {self.input_name: tensor})
        
        # outputs[0] shape is [1, 4]
        logits = outputs[0][0]
        
        # Softmax
        exp_preds = np.exp(logits - np.max(logits))
        probs = exp_preds / np.sum(exp_preds)
        
        class_idx = np.argmax(probs)
        return {
            "class": self.classes[class_idx],
            "confidence": float(probs[class_idx])
        }
