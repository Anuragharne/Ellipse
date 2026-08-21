def compute_severity(detection_results, classification_results):
    """
    Computes a simplified severity score (0.0 to 1.0) and assigns a logistics tier (1 to 4).
    Based on YOLO detection count + classification types.
    """
    
    # 1. Base score from object count (volume proxy)
    # 1 object = 0.2, 5+ objects = 0.6 max
    count = len(detection_results)
    base_score = min(count * 0.12, 0.6)
    
    # 2. Hazard multiplier based on classification
    # 'hazardous' = massive boost
    # 'non-recyclable' = medium boost
    # 'organic' = small boost
    # 'recyclable' = minimal boost
    
    has_hazardous = False
    hazard_score = 0.0
    
    classes_found = [res["class"] for res in classification_results]
    
    if "hazardous" in classes_found:
        hazard_score = 0.4
        has_hazardous = True
    elif "non-recyclable" in classes_found:
        hazard_score = 0.25
    elif "organic" in classes_found:
        hazard_score = 0.15
    elif "recyclable" in classes_found:
        hazard_score = 0.05
        
    final_score = min(base_score + hazard_score, 1.0)
    
    # Map to tier (1=Critical, 2=High, 3=Medium, 4=Low)
    tier = 4
    if final_score > 0.8 or has_hazardous:
        tier = 1
    elif final_score > 0.6:
        tier = 2
    elif final_score > 0.4:
        tier = 3
        
    return {
        "severityScore": final_score,
        "logisticsTier": tier,
        "hazardFlags": ["HAZARDOUS_MATERIAL"] if has_hazardous else []
    }
