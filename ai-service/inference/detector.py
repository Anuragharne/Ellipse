import onnxruntime as ort
import numpy as np
from PIL import Image
import cv2

class GarbageDetector:
    def __init__(self, model_path: str):
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        self.input_shape = self.session.get_inputs()[0].shape
        self.input_size = (self.input_shape[2], self.input_shape[3]) # 640x640

    def preprocess(self, image: Image.Image):
        # Resize with padding to maintain aspect ratio
        img = np.array(image.convert("RGB"))
        h, w = img.shape[:2]
        
        scale = min(self.input_size[0] / h, self.input_size[1] / w)
        new_h, new_w = int(h * scale), int(w * scale)
        
        resized = cv2.resize(img, (new_w, new_h))
        
        # Pad to 640x640
        padded = np.full((self.input_size[0], self.input_size[1], 3), 114, dtype=np.uint8)
        padded[(self.input_size[0] - new_h) // 2: (self.input_size[0] + new_h) // 2, 
               (self.input_size[1] - new_w) // 2: (self.input_size[1] + new_w) // 2] = resized
               
        # HWC to CHW, scale to 0-1
        tensor = padded.transpose(2, 0, 1).astype(np.float32) / 255.0
        return np.expand_dims(tensor, axis=0), scale, (self.input_size[0] - new_h) // 2, (self.input_size[1] - new_w) // 2

    def postprocess(self, output, scale, pad_h, pad_w, conf_threshold=0.25, iou_threshold=0.45):
        # output is [1, 5, 8400] -> [x, y, w, h, conf]
        predictions = output[0].T # [8400, 5]
        
        # Filter by confidence
        scores = predictions[:, 4]
        mask = scores > conf_threshold
        predictions = predictions[mask]
        
        if len(predictions) == 0:
            return []
            
        # Convert to x1, y1, x2, y2
        boxes = np.zeros_like(predictions[:, :4])
        boxes[:, 0] = predictions[:, 0] - predictions[:, 2] / 2
        boxes[:, 1] = predictions[:, 1] - predictions[:, 3] / 2
        boxes[:, 2] = predictions[:, 0] + predictions[:, 2] / 2
        boxes[:, 3] = predictions[:, 1] + predictions[:, 3] / 2
        
        # Adjust for padding and scale
        boxes[:, 0] = (boxes[:, 0] - pad_w) / scale
        boxes[:, 1] = (boxes[:, 1] - pad_h) / scale
        boxes[:, 2] = (boxes[:, 2] - pad_w) / scale
        boxes[:, 3] = (boxes[:, 3] - pad_h) / scale
        
        # NMS
        indices = cv2.dnn.NMSBoxes(
            boxes.tolist(), 
            predictions[:, 4].tolist(), 
            conf_threshold, 
            iou_threshold
        )
        
        results = []
        for i in indices:
            idx = i if isinstance(i, int) else i[0]
            box = boxes[idx].tolist()
            score = float(predictions[idx, 4])
            results.append({
                "box": box,
                "confidence": score
            })
            
        return results

    def detect(self, image: Image.Image):
        tensor, scale, pad_h, pad_w = self.preprocess(image)
        outputs = self.session.run(None, {self.input_name: tensor})
        return self.postprocess(outputs[0], scale, pad_h, pad_w)
