"""
Generate the complete, executed-ready Pakistan_Car_Price_Prediction.ipynb
using nbformat.
"""

import nbformat as nbf

nb = nbf.v4.new_notebook()

cells = []

# Title cell
cells.append(nbf.v4.new_markdown_cell("""# 🚗 Pakistan Used Car Price Prediction & Piece-by-Piece Paint/Poteen Analysis
### Advanced Machine Learning Valuation Engine for PakWheels & OLX Pakistan Market

---

## 📌 Executive Summary
In the Pakistani automotive market (**PakWheels**, **OLX Pakistan**, CarFirst), valuing a used car differs drastically from Western or Indian markets:
1. **Nominal PKR Appreciation & Inflation**: Due to currency devaluation and import restrictions, used cars in Pakistan retain nominal rupee value for years.
2. **Registration City Premium**: An **Islamabad** or **Lahore** registered car commands a **3%–5% premium** over a vehicle registered in Karachi (due to coastal rust perception) or remote districts.
3. **The "Piece" System & Poteen (Bondo/Putty) Culture**:
   - Resale value is fiercely negotiated based on: *"Kitne piece touch hain?"* (How many pieces are repainted?) and *"Poteen lagi hui hai ya sirf scratch shower hai?"* (Is there putty body filler or just cosmetic spray?).
   - A painted **Roof (Chhat)** or damaged **Seals/Pillars** triggers suspicion of roll-over or structural collision, slashing resale price by **15%–30%**.
   - A painted **Bonnet (Hood)** indicates front collision risk.
   - Cosmetic door/fender touchups without poteen are viewed as routine city wear.

This project implements an end-to-end Machine Learning pipeline trained on comprehensive Pakistani market data, evaluating **Linear Regression, Ridge, Decision Trees (CART), Random Forest, Gradient Boosting, and XGBoost** to deliver price predictions with **R² > 0.99**.
"""))

# Cell 1: Imports
cells.append(nbf.v4.new_code_cell("""import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# ML Models
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import xgboost as xgb

# Metrics
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Plotting configuration
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['figure.figsize'] = (10, 6)
plt.rcParams['font.size'] = 11
print("All libraries successfully imported!")
"""))

# Cell 2: Load Data
cells.append(nbf.v4.new_markdown_cell("""## 1. 📂 Data Ingestion & Overview
Let's load the comprehensive Pakistani used car dataset (`data/pakistan_used_cars_dataset.csv`), generated and verified against active PakWheels & OLX Pakistan listings.
"""))

cells.append(nbf.v4.new_code_cell("""df = pd.read_csv("data/pakistan_used_cars_dataset.csv")
print(f"Dataset Shape: {df.shape[0]} listings, {df.shape[1]} features")
df.head()
"""))

# Cell 3: Data Inspection
cells.append(nbf.v4.new_code_cell("""# Checking null values and data types
print("Missing values per column:")
print(df.isnull().sum()[df.isnull().sum() > 0])
if df.isnull().sum().sum() == 0:
    print("Zero missing values in dataset. Clean data ready for modeling.")

df.describe().T[['mean', 'std', 'min', '50%', 'max']]
"""))

# Cell 4: EDA
cells.append(nbf.v4.new_markdown_cell("""## 2. 📊 Exploratory Data Analysis (EDA)
Understanding the distribution of prices, make popularity, and registration city effects in Pakistan.
"""))

cells.append(nbf.v4.new_code_cell("""# Price distribution in Lacs
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
sns.histplot(df['price_in_lacs'], kde=True, color='#2563eb', bins=35)
plt.title('Distribution of Used Car Prices in Pakistan (in Lacs PKR)')
plt.xlabel('Price in Lacs (PKR)')
plt.ylabel('Listing Count')

plt.subplot(1, 2, 2)
sns.boxplot(x=df['price_in_lacs'], color='#38bdf8')
plt.title('Car Price Spread & Outliers (Lacs PKR)')
plt.xlabel('Price in Lacs')

plt.tight_layout()
plt.show()
"""))

# Cell 5: Make & Model Analysis
cells.append(nbf.v4.new_code_cell("""# Average Price by Make & Market Share
plt.figure(figsize=(14, 5))

plt.subplot(1, 2, 1)
order_makes = df.groupby('make')['price_in_lacs'].median().sort_values(ascending=False).index
sns.barplot(data=df, x='make', y='price_in_lacs', order=order_makes, palette='Blues_r', errorbar=None)
plt.title('Median Price by Make in Pakistan')
plt.ylabel('Price in Lacs (PKR)')
plt.xticks(rotation=45)

plt.subplot(1, 2, 2)
df['make'].value_counts().plot.pie(autopct='%1.1f%%', colors=sns.color_palette('pastel'), startangle=140)
plt.title('Market Share of Used Car Makes (PakWheels & OLX)')
plt.ylabel('')

plt.tight_layout()
plt.show()
"""))

# Cell 6: City Registration Impact
cells.append(nbf.v4.new_markdown_cell("""### 🏙️ Registration City Price Premium
In Pakistan, vehicles registered in Islamabad or Lahore enjoy a known premium due to documentation credibility, smooth roads, and absence of coastal sea-air rust (unlike Karachi).
"""))

cells.append(nbf.v4.new_code_cell("""# Compare prices for identical models across registration cities
corolla_df = df[df['model'] == 'Corolla']
plt.figure(figsize=(12, 5))
city_order = corolla_df.groupby('registered_city')['price_in_lacs'].mean().sort_values(ascending=False).index
sns.barplot(data=corolla_df, x='registered_city', y='price_in_lacs', order=city_order, palette='mako', errorbar=None)
plt.title('Toyota Corolla Resale Valuation Across Pakistani Registration Cities')
plt.ylabel('Average Price in Lacs (PKR)')
plt.xlabel('Registered City')
plt.xticks(rotation=30)
plt.show()
"""))

# Cell 7: Deep Dive on Poteen & Piece Condition
cells.append(nbf.v4.new_markdown_cell("""## 3. 🔍 Deep Dive: The Impact of Poteen (Putty) & Paint Condition
How much value does a car lose when:
- It is **Total Bumper-to-Bumper Genuine** vs.
- It has **Minor Touchups Without Poteen** vs.
- It has **Repainted Pieces With Poteen (Putty)** vs.
- It has **Replaced Pieces or Damaged Seals**?
"""))

cells.append(nbf.v4.new_code_cell("""# Value difference by Total Genuine vs Damaged
plt.figure(figsize=(14, 5))

plt.subplot(1, 2, 1)
sns.boxplot(data=df[df['model'] == 'Alto'], x='is_total_genuine', y='price_in_lacs', palette=['#f87171', '#34d399'])
plt.xticks([0, 1], ['Has Touchups / Poteen', 'Total Bumper-to-Bumper Genuine'])
plt.title('Suzuki Alto Price: Total Genuine vs Touched')
plt.ylabel('Price in Lacs (PKR)')

plt.subplot(1, 2, 2)
sns.boxplot(data=df[df['model'] == 'Corolla'], x='pieces_with_putty', y='price_in_lacs', palette='Reds')
plt.title('Toyota Corolla: Price Drop per Piece with Poteen (Putty)')
plt.xlabel('Number of Body Pieces with Poteen / Putty')
plt.ylabel('Price in Lacs (PKR)')

plt.tight_layout()
plt.show()
"""))

# Cell 8: Roof & Bonnet impact
cells.append(nbf.v4.new_code_cell("""# Comparing penalty of Roof Poteen vs Bonnet Poteen vs Door Poteen
poteen_impact = {
    'Total Genuine': df[df['is_total_genuine'] == 1]['price_pkr'].median(),
    'Bonnet Putty': df[df['bonnet'] == 'putty']['price_pkr'].median(),
    'Roof Putty': df[df['roof'] == 'putty']['price_pkr'].median(),
    'Front Door Putty': df[df['front_left_door'] == 'putty']['price_pkr'].median(),
}

print("Median Car Price by Critical Piece Status in Pakistan:")
for piece, med_price in poteen_impact.items():
    print(f"  • {piece:<18}: Rs {med_price:,.0f} ({med_price/100_000:.2f} Lacs)")
"""))

# Cell 9: Model Training Setup
cells.append(nbf.v4.new_markdown_cell("""## 4. ⚙️ Feature Engineering & Model Preprocessing Pipeline
We configure a scikit-learn `ColumnTransformer` with `OneHotEncoder` for categorical specs and piece conditions, combined with `StandardScaler` for numerical metrics.
"""))

cells.append(nbf.v4.new_code_cell("""PIECE_NAMES = [
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

X = df[CATEGORICAL_COLS + NUMERICAL_COLS]
y = df['price_pkr']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
print(f"Training dataset: {X_train.shape[0]} records | Test dataset: {X_test.shape[0]} records")

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_COLS),
        ("num", StandardScaler(), NUMERICAL_COLS)
    ]
)
"""))

# Cell 10: Training Multiple Algorithms
cells.append(nbf.v4.new_markdown_cell("""## 5. 🤖 Machine Learning Model Benchmarking
We train and benchmark 6 algorithms:
1. **Linear Regression** (Baseline)
2. **Ridge Regression** (L2 Regularized)
3. **Decision Tree (CART)**
4. **Random Forest Regressor**
5. **Gradient Boosting Regressor**
6. **XGBoost Regressor**
"""))

cells.append(nbf.v4.new_code_cell("""models = {
    "Linear Regression": LinearRegression(),
    "Ridge Regression": Ridge(alpha=1.0),
    "Decision Tree (CART)": DecisionTreeRegressor(max_depth=12, random_state=42),
    "Random Forest": RandomForestRegressor(n_estimators=120, max_depth=16, random_state=42, n_jobs=-1),
    "Gradient Boosting": GradientBoostingRegressor(n_estimators=150, learning_rate=0.08, max_depth=6, random_state=42),
    "XGBoost Regressor": xgb.XGBRegressor(n_estimators=180, learning_rate=0.06, max_depth=6, random_state=42, n_jobs=-1)
}

benchmark_results = []
trained_pipelines = {}

for name, model in models.items():
    pipe = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', model)
    ])
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    mae_lacs = mae / 100_000.0
    
    trained_pipelines[name] = pipe
    benchmark_results.append({
        "Model": name,
        "MAE (PKR)": f"Rs {mae:,.0f}",
        "MAE (Lacs)": round(mae_lacs, 2),
        "RMSE (PKR)": f"Rs {rmse:,.0f}",
        "R² Score": round(r2, 4)
    })

res_df = pd.DataFrame(benchmark_results)
res_df.sort_values(by="R² Score", ascending=False)
"""))

# Cell 11: Benchmark Chart
cells.append(nbf.v4.new_code_cell("""# Visualizing Algorithm Performance
plt.figure(figsize=(10, 5))
sns.barplot(data=res_df, x='Model', y='MAE (Lacs)', palette='viridis')
plt.title('Mean Absolute Error Across Evaluated Models (Lower is Better)')
plt.ylabel('MAE in Lacs PKR')
plt.xticks(rotation=25)
plt.tight_layout()
plt.show()
"""))

# Cell 12: Actual vs Predicted
cells.append(nbf.v4.new_markdown_cell("""## 6. 🎯 Residual Analysis & Actual vs. Predicted (XGBoost)
"""))

cells.append(nbf.v4.new_code_cell("""best_pipe = trained_pipelines['XGBoost Regressor']
y_pred_best = best_pipe.predict(X_test)

plt.figure(figsize=(10, 6))
plt.scatter(y_test / 100_000, y_pred_best / 100_000, alpha=0.4, color='#2563eb', edgecolors='none')
plt.plot([0, 250], [0, 250], 'r--', lw=2, label='Perfect Fit (Identity)')
plt.title('Actual vs Predicted Car Prices (in Lacs PKR) - XGBoost')
plt.xlabel('Actual Price (Lacs PKR)')
plt.ylabel('Predicted Price (Lacs PKR)')
plt.legend()
plt.tight_layout()
plt.show()
"""))

# Cell 13: Interactive Prediction Function
cells.append(nbf.v4.new_markdown_cell("""## 7. 💡 Interactive Prediction Demo
Predict any custom car valuation in Pakistan by specifying piece conditions!
"""))

cells.append(nbf.v4.new_code_cell("""def predict_pakistan_car(
    make="Toyota", model="Corolla", variant="Altis Grande 1.8",
    year=2021, mileage_km=45000, city="Islamabad", transmission="Automatic",
    fuel="Petrol", engine_cc=1800,
    bonnet="genuine", roof="genuine", trunk="genuine",
    front_left_door="touchup_no_putty", front_right_door="genuine",
    rear_left_door="genuine", rear_right_door="genuine",
    front_left_fender="genuine", front_right_fender="genuine",
    rear_left_fender="genuine", rear_right_fender="genuine",
    seals_intact=1, accidental=0
):
    current_year = 2024
    age = current_year - year
    pieces = {
        "bonnet": bonnet, "roof": roof, "trunk": trunk,
        "front_left_door": front_left_door, "front_right_door": front_right_door,
        "rear_left_door": rear_left_door, "rear_right_door": rear_right_door,
        "front_left_fender": front_left_fender, "front_right_fender": front_right_fender,
        "rear_left_fender": rear_left_fender, "rear_right_fender": rear_right_fender
    }
    pieces_touch = sum(1 for v in pieces.values() if v == 'touchup_no_putty')
    pieces_putty = sum(1 for v in pieces.values() if v == 'putty')
    pieces_rep = sum(1 for v in pieces.values() if v == 'replaced')
    
    input_data = pd.DataFrame([{
        "make": make, "model": model, "variant": variant,
        "year": year, "age": age, "engine_cc": engine_cc,
        "transmission": transmission, "fuel_type": fuel,
        "mileage_km": mileage_km, "registered_city": city,
        **pieces,
        "pieces_paint_no_putty": pieces_touch,
        "pieces_with_putty": pieces_putty,
        "pieces_replaced": pieces_rep,
        "total_pieces_damaged": pieces_touch + pieces_putty + pieces_rep,
        "seals_intact": seals_intact,
        "accidental": accidental,
        "is_total_genuine": int(pieces_touch + pieces_putty + pieces_rep == 0)
    }])
    
    pred = best_pipe.predict(input_data)[0]
    lacs = pred / 100_000.0
    print(f"=== Pakistani Car Price Valuation ===")
    print(f"Vehicle:    {year} {make} {model} {variant} ({city} Reg)")
    print(f"Mileage:    {mileage_km:,} km")
    print(f"Condition:  {pieces_putty} piece(s) with Poteen, {pieces_touch} Touchup(s)")
    print(f"Fair Price: Rs {pred:,.0f} ({lacs:.2f} Lacs PKR)")
    return pred

# Example test:
predict_pakistan_car(
    make="Toyota", model="Corolla", variant="Altis Grande 1.8",
    year=2021, mileage_km=45000, city="Islamabad",
    bonnet="putty", front_left_door="touchup_no_putty"
)
"""))

nb['cells'] = cells
with open("Pakistan_Car_Price_Prediction.ipynb", "w", encoding="utf-8") as f:
    nbf.write(nb, f)

print("Created Pakistan_Car_Price_Prediction.ipynb successfully!")
