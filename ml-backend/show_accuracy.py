"""
Show ML Model Accuracy Report
Run: python show_accuracy.py
"""

import os
import sys
from pathlib import Path
import joblib

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

def show_accuracy():
    """Display model accuracy in a formatted report"""
    
    print("\n" + "="*70)
    print("           🌾 AGRIFRIEND ML MODEL ACCURACY REPORT 🌾")
    print("="*70)
    
    # Check for trained models
    model_dir = Path(__file__).parent / "models" / "trained"
    saved_dir = Path(__file__).parent / "models" / "saved"
    
    # Load training summary if exists
    summary_path = model_dir / "training_summary.pkl"
    
    if summary_path.exists():
        summary = joblib.load(summary_path)
        
        print(f"\n📊 Model Type: LSTM + XGBoost Hybrid Ensemble")
        print(f"📁 Models Directory: {model_dir}")
        print("-"*70)
        
        # Count successful models
        successful = {k: v for k, v in summary.items() if 'error' not in v}
        failed = {k: v for k, v in summary.items() if 'error' in v}
        
        print(f"\n✅ Successfully Trained Models: {len(successful)}")
        if failed:
            print(f"❌ Failed Models: {len(failed)}")
        
        # Calculate overall accuracy
        if successful:
            avg_accuracy = sum(m.get('accuracy', 0) for m in successful.values()) / len(successful)
            avg_mae = sum(m.get('mae', 0) for m in successful.values()) / len(successful)
            
            print(f"\n📈 OVERALL PERFORMANCE")
            print("-"*70)
            print(f"   Average Accuracy: {avg_accuracy:.2f}%")
            print(f"   Average MAE: ₹{avg_mae:.2f}/quintal")
        
        # Show individual model performance
        print(f"\n📋 COMMODITY-WISE PERFORMANCE")
        print("-"*70)
        print(f"{'Commodity':<15} {'MAE (₹)':<12} {'R² Score':<12} {'Accuracy':<12} {'Status'}")
        print("-"*70)
        
        for commodity, metrics in sorted(summary.items()):
            if 'error' in metrics:
                print(f"{commodity.title():<15} {'N/A':<12} {'N/A':<12} {'N/A':<12} ❌ {metrics['error'][:20]}")
            else:
                mae = metrics.get('mae', 0)
                r2 = metrics.get('r2', 0)
                accuracy = metrics.get('accuracy', 0)
                print(f"{commodity.title():<15} {mae:<12.2f} {r2:<12.4f} {accuracy:<12.2f}% ✅")
        
        print("-"*70)
        
    else:
        print("\n⚠️  No training summary found!")
        print("   Run 'python train_models.py' to train models first.")
    
    # Check for saved LSTM+XGBoost models
    if saved_dir.exists():
        saved_models = list(saved_dir.glob("*_xgboost.pkl"))
        lstm_models = list(saved_dir.glob("*_lstm.h5"))
        
        print(f"\n📦 SAVED MODELS")
        print("-"*70)
        print(f"   XGBoost Models: {len(saved_models)}")
        print(f"   LSTM Models: {len(lstm_models)}")
        
        if saved_models:
            print(f"\n   XGBoost models available for:")
            for model in saved_models[:10]:
                commodity = model.stem.replace("_xgboost", "").replace("_", " ").title()
                print(f"   • {commodity}")
            if len(saved_models) > 10:
                print(f"   ... and {len(saved_models) - 10} more")
    
    # Check TensorFlow availability
    print(f"\n🔧 SYSTEM STATUS")
    print("-"*70)
    
    try:
        import tensorflow as tf
        print(f"   TensorFlow: ✅ Available (v{tf.__version__})")
        print(f"   LSTM Models: ✅ Enabled")
    except ImportError:
        print(f"   TensorFlow: ❌ Not Available")
        print(f"   LSTM Models: ⚠️  Disabled (using XGBoost only)")
    
    try:
        import xgboost as xgb
        print(f"   XGBoost: ✅ Available (v{xgb.__version__})")
    except ImportError:
        print(f"   XGBoost: ❌ Not Available")
    
    print("\n" + "="*70)
    print("   Run 'python train_models.py' to retrain models")
    print("   Run 'python test_accuracy.py' for detailed accuracy tests")
    print("="*70 + "\n")

if __name__ == "__main__":
    show_accuracy()
