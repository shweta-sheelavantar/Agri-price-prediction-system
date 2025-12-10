"""
Model Monitoring Service
Tracks model performance, accuracy, and predictions
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, List
import os

logger = logging.getLogger(__name__)

class ModelMonitor:
    def __init__(self):
        self.predictions_log = []
        self.accuracy_history = {
            "price": [],
            "yield": [],
            "risk": []
        }
        self.performance_metrics = {}
        
    def log_prediction(self, model_type: str, input_data: Dict[str, Any], 
                      prediction: Dict[str, Any]):
        """Log a prediction for monitoring"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "model_type": model_type,
            "input": input_data,
            "prediction": prediction,
            "prediction_id": f"{model_type}_{len(self.predictions_log)}"
        }
        
        self.predictions_log.append(log_entry)
        
        # Keep only last 1000 predictions
        if len(self.predictions_log) > 1000:
            self.predictions_log = self.predictions_log[-1000:]
        
        logger.info(f"Logged {model_type} prediction: {log_entry['prediction_id']}")
    
    def update_accuracy(self, model_type: str, accuracy: float):
        """Update model accuracy metrics"""
        accuracy_entry = {
            "timestamp": datetime.now().isoformat(),
            "accuracy": accuracy
        }
        
        if model_type not in self.accuracy_history:
            self.accuracy_history[model_type] = []
        
        self.accuracy_history[model_type].append(accuracy_entry)
        
        # Keep only last 100 accuracy measurements
        if len(self.accuracy_history[model_type]) > 100:
            self.accuracy_history[model_type] = self.accuracy_history[model_type][-100:]
    
    def get_model_performance(self, model_type: str) -> Dict[str, Any]:
        """Get performance metrics for a model"""
        if model_type not in self.accuracy_history:
            return {"error": "Model type not found"}
        
        accuracies = [entry["accuracy"] for entry in self.accuracy_history[model_type]]
        
        if not accuracies:
            return {"error": "No accuracy data available"}
        
        return {
            "current_accuracy": accuracies[-1],
            "average_accuracy": sum(accuracies) / len(accuracies),
            "min_accuracy": min(accuracies),
            "max_accuracy": max(accuracies),
            "accuracy_trend": "improving" if len(accuracies) > 1 and accuracies[-1] > accuracies[-2] else "stable",
            "total_predictions": len([p for p in self.predictions_log if p["model_type"] == model_type]),
            "last_updated": self.accuracy_history[model_type][-1]["timestamp"] if accuracies else None
        }
    
    def get_prediction_stats(self) -> Dict[str, Any]:
        """Get overall prediction statistics"""
        total_predictions = len(self.predictions_log)
        
        if total_predictions == 0:
            return {"total_predictions": 0}
        
        # Count by model type
        model_counts = {}
        for pred in self.predictions_log:
            model_type = pred["model_type"]
            model_counts[model_type] = model_counts.get(model_type, 0) + 1
        
        # Recent predictions (last 24 hours)
        recent_predictions = [
            p for p in self.predictions_log 
            if (datetime.now() - datetime.fromisoformat(p["timestamp"])).days < 1
        ]
        
        return {
            "total_predictions": total_predictions,
            "predictions_by_model": model_counts,
            "recent_predictions_24h": len(recent_predictions),
            "average_predictions_per_day": total_predictions / max(1, 
                (datetime.now() - datetime.fromisoformat(self.predictions_log[0]["timestamp"])).days
            ) if self.predictions_log else 0
        }
    
    def detect_model_drift(self, model_type: str, threshold: float = 0.05) -> Dict[str, Any]:
        """Detect if model performance is drifting"""
        if model_type not in self.accuracy_history:
            return {"drift_detected": False, "reason": "No data available"}
        
        accuracies = [entry["accuracy"] for entry in self.accuracy_history[model_type]]
        
        if len(accuracies) < 10:
            return {"drift_detected": False, "reason": "Insufficient data"}
        
        # Compare recent accuracy with historical average
        recent_accuracy = sum(accuracies[-5:]) / 5  # Last 5 measurements
        historical_accuracy = sum(accuracies[:-5]) / len(accuracies[:-5])
        
        drift = abs(recent_accuracy - historical_accuracy)
        
        return {
            "drift_detected": drift > threshold,
            "drift_magnitude": drift,
            "recent_accuracy": recent_accuracy,
            "historical_accuracy": historical_accuracy,
            "threshold": threshold,
            "recommendation": "Retrain model" if drift > threshold else "Continue monitoring"
        }
    
    def export_metrics(self, filepath: str = None) -> str:
        """Export monitoring metrics to JSON file"""
        if filepath is None:
            filepath = f"model_metrics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        metrics = {
            "export_timestamp": datetime.now().isoformat(),
            "accuracy_history": self.accuracy_history,
            "prediction_stats": self.get_prediction_stats(),
            "performance_summary": {
                model_type: self.get_model_performance(model_type)
                for model_type in self.accuracy_history.keys()
            }
        }
        
        try:
            with open(filepath, 'w') as f:
                json.dump(metrics, f, indent=2)
            
            logger.info(f"Metrics exported to {filepath}")
            return filepath
        
        except Exception as e:
            logger.error(f"Failed to export metrics: {str(e)}")
            raise
    
    def get_alerts(self) -> List[Dict[str, Any]]:
        """Get performance alerts"""
        alerts = []
        
        for model_type in self.accuracy_history.keys():
            # Check for drift
            drift_info = self.detect_model_drift(model_type)
            if drift_info["drift_detected"]:
                alerts.append({
                    "type": "model_drift",
                    "model": model_type,
                    "severity": "high" if drift_info["drift_magnitude"] > 0.1 else "medium",
                    "message": f"Model drift detected for {model_type}",
                    "details": drift_info
                })
            
            # Check for low accuracy
            performance = self.get_model_performance(model_type)
            if "current_accuracy" in performance and performance["current_accuracy"] < 0.7:
                alerts.append({
                    "type": "low_accuracy",
                    "model": model_type,
                    "severity": "high",
                    "message": f"Low accuracy detected for {model_type}",
                    "details": performance
                })
        
        return alerts