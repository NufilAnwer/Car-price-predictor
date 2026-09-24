"""
Train Machine Learning Models for Pakistani Used Car Price Prediction
Evaluates:
- Linear Regression
- Ridge Regression
- Decision Tree Regressor (CART)
- Random Forest Regressor
- Gradient Boosting Regressor
- XGBoost Regressor

Saves the best pipeline and feature metadata for web prediction.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

PIECE_NAMES = [
    "bonnet", "roof", "trunk",
    "front_left_door", "front_right_door",
    "rear_left_door", "rear_right_door",
    "front_left_fender", "front_right_fender",
    "rear_left_fender", "rear_right_fender"
]

CATEGORICAL_COLS = [
    "make", "model", "variant", "transmission", "fuel_type", "registered_city"
] + PIECE_NAMES

NUMERICAL_COLS = [
    "year", "age", "engine_cc", "mileage_km",
    "pieces_paint_no_putty", "pieces_with_putty", "pieces_replaced",
    "total_pieces_damaged", "seals_intact", "accidental", "is_total_genuine"
]

def load_data():
    df = pd.read_csv("data/pakistan_used_cars_dataset.csv")
    return df

def build_preprocessor():
    categorical_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    numerical_transformer = StandardScaler()

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", categorical_transformer, CATEGORICAL_COLS),
            ("num", numerical_transformer, NUMERICAL_COLS)
        ]
    )
    return preprocessor

def evaluate_models(X_train, X_test, y_train, y_test, preprocessor):
    models = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0),
        "Decision Tree (CART)": DecisionTreeRegressor(max_depth=12, random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=120, max_depth=16, random_state=42, n_jobs=-1),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=150, learning_rate=0.08, max_depth=6, random_state=42),
        "XGBoost Regressor": xgb.XGBRegressor(n_estimators=180, learning_rate=0.06, max_depth=6, random_state=42, n_jobs=-1)
    }

    results = []
    best_model = None
    best_pipe = None
    best_r2 = -float("inf")

    print("\n" + "="*80)
    print(f"{'Model':<24} | {'MAE (PKR)':<14} | {'MAE (Lacs)':<12} | {'RMSE (PKR)':<14} | {'R² Score':<10}")
    print("="*80)

    for name, model in models.items():
        pipe = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", model)
        ])

        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)

        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        mae_lacs = mae / 100_000.0

        print(f"{name:<24} | Rs {mae:>11,.0f} | {mae_lacs:>7.2f} Lacs | Rs {rmse:>11,.0f} | {r2:>8.4f}")

        results.append({
            "model_name": name,
            "mae": mae,
            "mae_lacs": mae_lacs,
            "rmse": rmse,
            "r2": r2,
            "pipeline": pipe
        })

        if r2 > best_r2:
            best_r2 = r2
            best_model = name
            best_pipe = pipe

    print("="*80)
    print(f"--> Best Performing Model: {best_model} with R² = {best_r2:.4f}\n")
    return best_model, best_pipe, results

def extract_market_metadata(df):
    """Generates hierarchy metadata for UI dropdowns and frontend validation."""
    meta = {
        "makes": sorted(df["make"].unique().tolist()),
        "make_models": {},
        "model_details": {},
        "cities": sorted(df["registered_city"].unique().tolist()),
        "transmissions": sorted(df["transmission"].unique().tolist()),
        "fuel_types": sorted(df["fuel_type"].unique().tolist()),
        "min_year": int(df["year"].min()),
        "max_year": int(df["year"].max()),
        "piece_names": PIECE_NAMES,
        "piece_conditions": [
            {"id": "genuine", "label": "Genuine (Original Paint)", "color": "#10b981"},
            {"id": "touchup_no_putty", "label": "Touchup / Shower (No Poteen)", "color": "#f59e0b"},
            {"id": "putty", "label": "Repainted With Poteen / Putty", "color": "#ef4444"},
            {"id": "replaced", "label": "Replaced / Changed Piece", "color": "#8b5cf6"},
        ]
    }

    for make in meta["makes"]:
        make_df = df[df["make"] == make]
        models = sorted(make_df["model"].unique().tolist())
        meta["make_models"][make] = models

    for model in df["model"].unique():
        m_df = df[df["model"] == model]
        sample = m_df.iloc[0]
        meta["model_details"][model] = {
            "make": sample["make"],
            "variants": sorted(m_df["variant"].unique().tolist()),
            "default_engine_cc": int(m_df["engine_cc"].mode()[0]),
            "default_transmission": str(m_df["transmission"].mode()[0]),
            "default_fuel": str(m_df["fuel_type"].mode()[0]),
            "min_year": int(m_df["year"].min()),
            "max_year": int(m_df["year"].max()),
            "avg_price_lacs": round(m_df["price_in_lacs"].mean(), 2)
        }

    return meta

def main():
    print("Loading Pakistani used car dataset...")
    df = load_data()
    print(f"Dataset shape: {df.shape}")

    X = df[CATEGORICAL_COLS + NUMERICAL_COLS]
    y = df["price_pkr"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")

    preprocessor = build_preprocessor()
    best_model_name, best_pipeline, results = evaluate_models(X_train, X_test, y_train, y_test, preprocessor)

    # Save model and metadata
    os.makedirs("models", exist_ok=True)
    model_save_path = "models/pak_car_price_model.joblib"
    joblib.dump(best_pipeline, model_save_path)
    print(f"Saved best model pipeline ({best_model_name}) to: {model_save_path}")

    # Save metadata for web application
    meta = extract_market_metadata(df)
    meta_path = "models/market_metadata.json"
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Saved market metadata to: {meta_path}")

    # Save performance summary
    summary_path = "models/model_benchmark_summary.json"
    clean_summary = [{
        "model": r["model_name"],
        "mae_pkr": round(r["mae"], 2),
        "mae_lacs": round(r["mae_lacs"], 2),
        "rmse_pkr": round(r["rmse"], 2),
        "r2_score": round(r["r2"], 4)
    } for r in results]
    with open(summary_path, "w") as f:
        json.dump(clean_summary, f, indent=2)
    print(f"Saved benchmark summary to: {summary_path}")

if __name__ == "__main__":
    main()
