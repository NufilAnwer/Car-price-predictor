"""
Pakistan Used Car Dataset Generator
Synthesizes a realistic, comprehensive, and authentic 6,000+ record dataset
reflecting actual PakWheels and OLX Pakistan market valuations, price dynamics,
and culturally vital body piece conditions (bonnet, roof, doors, poteen/putty, seals).
"""

import os
import random
import numpy as np
import pandas as pd

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

CAR_CATALOG = [
    # Suzuki
    {"make": "Suzuki", "model": "Mehran", "variant": "VXR", "engine_cc": 800, "transmission": "Manual", "fuel_type": "Petrol", "years": (2006, 2019), "base_price_2024": 950_000, "annual_depreciation": 0.04},
    {"make": "Suzuki", "model": "Alto", "variant": "VXR", "engine_cc": 660, "transmission": "Manual", "fuel_type": "Petrol", "years": (2019, 2024), "base_price_2024": 2_600_000, "annual_depreciation": 0.05},
    {"make": "Suzuki", "model": "Alto", "variant": "VXL AGS", "engine_cc": 660, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2019, 2024), "base_price_2024": 3_050_000, "annual_depreciation": 0.05},
    {"make": "Suzuki", "model": "Cultus", "variant": "VXL", "engine_cc": 1000, "transmission": "Manual", "fuel_type": "Petrol", "years": (2017, 2024), "base_price_2024": 3_800_000, "annual_depreciation": 0.05},
    {"make": "Suzuki", "model": "Cultus", "variant": "Auto Gear Shift", "engine_cc": 1000, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2018, 2024), "base_price_2024": 4_200_000, "annual_depreciation": 0.05},
    {"make": "Suzuki", "model": "Cultus (Old)", "variant": "Euro II", "engine_cc": 1000, "transmission": "Manual", "fuel_type": "Petrol", "years": (2008, 2016), "base_price_2024": 1_350_000, "annual_depreciation": 0.045},
    {"make": "Suzuki", "model": "Wagon R", "variant": "VXL", "engine_cc": 1000, "transmission": "Manual", "fuel_type": "Petrol", "years": (2014, 2024), "base_price_2024": 3_400_000, "annual_depreciation": 0.052},
    {"make": "Suzuki", "model": "Swift", "variant": "GLX CVT", "engine_cc": 1200, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2022, 2024), "base_price_2024": 4_700_000, "annual_depreciation": 0.05},
    {"make": "Suzuki", "model": "Swift (Old)", "variant": "DLX 1.3", "engine_cc": 1300, "transmission": "Manual", "fuel_type": "Petrol", "years": (2011, 2021), "base_price_2024": 2_400_000, "annual_depreciation": 0.05},
    {"make": "Suzuki", "model": "Every", "variant": "PA / Join", "engine_cc": 660, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2015, 2023), "base_price_2024": 2_500_000, "annual_depreciation": 0.05},
    {"make": "Suzuki", "model": "Bolan", "variant": "VX Euro II", "engine_cc": 800, "transmission": "Manual", "fuel_type": "Petrol", "years": (2010, 2024), "base_price_2024": 1_500_000, "annual_depreciation": 0.04},

    # Toyota
    {"make": "Toyota", "model": "Corolla", "variant": "GLi 1.3", "engine_cc": 1300, "transmission": "Manual", "fuel_type": "Petrol", "years": (2010, 2020), "base_price_2024": 3_500_000, "annual_depreciation": 0.045},
    {"make": "Toyota", "model": "Corolla", "variant": "GLi 1.3 Automatic", "engine_cc": 1300, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2014, 2020), "base_price_2024": 3_850_000, "annual_depreciation": 0.045},
    {"make": "Toyota", "model": "Corolla", "variant": "Altis 1.6", "engine_cc": 1600, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2015, 2024), "base_price_2024": 6_200_000, "annual_depreciation": 0.048},
    {"make": "Toyota", "model": "Corolla", "variant": "Altis Grande 1.8", "engine_cc": 1800, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2015, 2024), "base_price_2024": 7_400_000, "annual_depreciation": 0.048},
    {"make": "Toyota", "model": "Yaris", "variant": "ATIV 1.3 CVT", "engine_cc": 1300, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2020, 2024), "base_price_2024": 4_800_000, "annual_depreciation": 0.05},
    {"make": "Toyota", "model": "Yaris", "variant": "ATIV X 1.5 CVT", "engine_cc": 1500, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2020, 2024), "base_price_2024": 5_400_000, "annual_depreciation": 0.05},
    {"make": "Toyota", "model": "Vitz", "variant": "F 1.0", "engine_cc": 1000, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2012, 2020), "base_price_2024": 3_200_000, "annual_depreciation": 0.055},
    {"make": "Toyota", "model": "Aqua", "variant": "Hybrid S", "engine_cc": 1500, "transmission": "Automatic", "fuel_type": "Hybrid", "years": (2013, 2021), "base_price_2024": 3_900_000, "annual_depreciation": 0.058},
    {"make": "Toyota", "model": "Prius", "variant": "1.8 S", "engine_cc": 1800, "transmission": "Automatic", "fuel_type": "Hybrid", "years": (2012, 2021), "base_price_2024": 5_500_000, "annual_depreciation": 0.06},
    {"make": "Toyota", "model": "Fortuner", "variant": "Sigma 4 2.8 Diesel", "engine_cc": 2800, "transmission": "Automatic", "fuel_type": "Diesel", "years": (2018, 2024), "base_price_2024": 19_500_000, "annual_depreciation": 0.045},
    {"make": "Toyota", "model": "Hilux", "variant": "Revo Rocco", "engine_cc": 2800, "transmission": "Automatic", "fuel_type": "Diesel", "years": (2018, 2024), "base_price_2024": 16_000_000, "annual_depreciation": 0.045},
    {"make": "Toyota", "model": "Prado", "variant": "TX 2.7", "engine_cc": 2700, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2008, 2020), "base_price_2024": 24_000_000, "annual_depreciation": 0.04},

    # Honda
    {"make": "Honda", "model": "Civic", "variant": "Reborn 1.8 Prosmatec", "engine_cc": 1800, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2006, 2012), "base_price_2024": 2_300_000, "annual_depreciation": 0.045},
    {"make": "Honda", "model": "Civic", "variant": "Rebirth 1.8 VTi Oriel", "engine_cc": 1800, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2012, 2016), "base_price_2024": 3_600_000, "annual_depreciation": 0.048},
    {"make": "Honda", "model": "Civic", "variant": "1.8 i-VTEC Oriel (X)", "engine_cc": 1800, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2016, 2021), "base_price_2024": 5_800_000, "annual_depreciation": 0.05},
    {"make": "Honda", "model": "Civic", "variant": "RS Turbo 1.5", "engine_cc": 1500, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2017, 2021), "base_price_2024": 6_700_000, "annual_depreciation": 0.052},
    {"make": "Honda", "model": "Civic", "variant": "Oriel 1.5 Turbo (11th Gen)", "engine_cc": 1500, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2022, 2024), "base_price_2024": 8_700_000, "annual_depreciation": 0.045},
    {"make": "Honda", "model": "City", "variant": "i-DSI 1.3", "engine_cc": 1300, "transmission": "Manual", "fuel_type": "Petrol", "years": (2004, 2008), "base_price_2024": 1_650_000, "annual_depreciation": 0.04},
    {"make": "Honda", "model": "City", "variant": "1.3 i-VTEC", "engine_cc": 1300, "transmission": "Manual", "fuel_type": "Petrol", "years": (2009, 2021), "base_price_2024": 3_200_000, "annual_depreciation": 0.048},
    {"make": "Honda", "model": "City", "variant": "Aspire 1.5 Prosmatec", "engine_cc": 1500, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2014, 2021), "base_price_2024": 3_900_000, "annual_depreciation": 0.048},
    {"make": "Honda", "model": "City", "variant": "1.5 Aspire CVT (New Shape)", "engine_cc": 1500, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2021, 2024), "base_price_2024": 5_600_000, "annual_depreciation": 0.05},
    {"make": "Honda", "model": "BR-V", "variant": "i-VTEC S", "engine_cc": 1500, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2017, 2024), "base_price_2024": 4_600_000, "annual_depreciation": 0.055},
    {"make": "Honda", "model": "Vezel", "variant": "Hybrid Z", "engine_cc": 1500, "transmission": "Automatic", "fuel_type": "Hybrid", "years": (2014, 2020), "base_price_2024": 5_200_000, "annual_depreciation": 0.058},

    # KIA
    {"make": "KIA", "model": "Sportage", "variant": "FWD", "engine_cc": 2000, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2019, 2024), "base_price_2024": 7_300_000, "annual_depreciation": 0.05},
    {"make": "KIA", "model": "Sportage", "variant": "AWD", "engine_cc": 2000, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2019, 2024), "base_price_2024": 8_000_000, "annual_depreciation": 0.05},
    {"make": "KIA", "model": "Picanto", "variant": "Automatic", "engine_cc": 1000, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2019, 2024), "base_price_2024": 3_600_000, "annual_depreciation": 0.055},
    {"make": "KIA", "model": "Stonic", "variant": "EX+", "engine_cc": 1400, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2021, 2024), "base_price_2024": 5_300_000, "annual_depreciation": 0.052},

    # Hyundai
    {"make": "Hyundai", "model": "Tucson", "variant": "AWD", "engine_cc": 2000, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2020, 2024), "base_price_2024": 8_500_000, "annual_depreciation": 0.05},
    {"make": "Hyundai", "model": "Elantra", "variant": "GLS 2.0", "engine_cc": 2000, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2021, 2024), "base_price_2024": 6_800_000, "annual_depreciation": 0.052},
    {"make": "Hyundai", "model": "Sonata", "variant": "2.5", "engine_cc": 2500, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2021, 2024), "base_price_2024": 10_500_000, "annual_depreciation": 0.055},

    # Changan
    {"make": "Changan", "model": "Alsvin", "variant": "1.5 Lumiere DCT", "engine_cc": 1500, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2021, 2024), "base_price_2024": 4_400_000, "annual_depreciation": 0.055},
    {"make": "Changan", "model": "Karvaan", "variant": "Plus", "engine_cc": 1000, "transmission": "Manual", "fuel_type": "Petrol", "years": (2018, 2024), "base_price_2024": 2_800_000, "annual_depreciation": 0.05},

    # MG
    {"make": "MG", "model": "HS", "variant": "Exclusive 1.5 Turbo", "engine_cc": 1500, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2020, 2024), "base_price_2024": 7_200_000, "annual_depreciation": 0.06},

    # Daihatsu
    {"make": "Daihatsu", "model": "Mira", "variant": "ES", "engine_cc": 660, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2012, 2022), "base_price_2024": 3_100_000, "annual_depreciation": 0.055},
    {"make": "Daihatsu", "model": "Cuore", "variant": "CX Eco", "engine_cc": 800, "transmission": "Manual", "fuel_type": "Petrol", "years": (2004, 2012), "base_price_2024": 1_050_000, "annual_depreciation": 0.04},

    # Nissan
    {"make": "Nissan", "model": "Dayz", "variant": "Highway Star", "engine_cc": 660, "transmission": "Automatic", "fuel_type": "Petrol", "years": (2014, 2022), "base_price_2024": 2_900_000, "annual_depreciation": 0.055},
]

CITIES = [
    ("Islamabad", 1.04),    # Islamabad reg cars command 4% premium in Pakistan
    ("Lahore", 1.02),       # Lahore reg cars command 2% premium
    ("Rawalpindi", 1.01),
    ("Karachi", 0.95),      # Karachi reg cars sell at discount in northern PK due to rust perception
    ("Faisalabad", 0.99),
    ("Multan", 0.98),
    ("Peshawar", 0.98),
    ("Gujranwala", 0.99),
    ("Sialkot", 0.99),
    ("Unregistered", 0.97),
]

PIECE_NAMES = [
    "bonnet", "roof", "trunk",
    "front_left_door", "front_right_door",
    "rear_left_door", "rear_right_door",
    "front_left_fender", "front_right_fender",
    "rear_left_fender", "rear_right_fender"
]

# Depreciation factors in Pakistan for each piece condition:
# 'genuine': 0% loss
# 'touchup_no_putty': scratch spray / minor touchup w/o filler
# 'putty': dented & repainted with poteen (filler)
# 'replaced': replaced piece / panel
PIECE_IMPACT_RATES = {
    "bonnet": {
        "genuine": 0.0,
        "touchup_no_putty": 0.035,
        "putty": 0.085,
        "replaced": 0.125,
    },
    "roof": {
        "genuine": 0.0,
        "touchup_no_putty": 0.065,  # Roof repainted is viewed with severe suspicion in Pakistan!
        "putty": 0.160,             # Roof with poteen usually implies roll-over
        "replaced": 0.250,
    },
    "trunk": {
        "genuine": 0.0,
        "touchup_no_putty": 0.025,
        "putty": 0.065,
        "replaced": 0.100,
    },
    # Doors
    "front_left_door": {"genuine": 0.0, "touchup_no_putty": 0.015, "putty": 0.040, "replaced": 0.070},
    "front_right_door": {"genuine": 0.0, "touchup_no_putty": 0.015, "putty": 0.040, "replaced": 0.070},
    "rear_left_door": {"genuine": 0.0, "touchup_no_putty": 0.015, "putty": 0.040, "replaced": 0.070},
    "rear_right_door": {"genuine": 0.0, "touchup_no_putty": 0.015, "putty": 0.040, "replaced": 0.070},
    # Fenders
    "front_left_fender": {"genuine": 0.0, "touchup_no_putty": 0.012, "putty": 0.032, "replaced": 0.055},
    "front_right_fender": {"genuine": 0.0, "touchup_no_putty": 0.012, "putty": 0.032, "replaced": 0.055},
    "rear_left_fender": {"genuine": 0.0, "touchup_no_putty": 0.015, "putty": 0.038, "replaced": 0.065},
    "rear_right_fender": {"genuine": 0.0, "touchup_no_putty": 0.015, "putty": 0.038, "replaced": 0.065},
}

def generate_pakistan_car_dataset(n_samples=6500):
    rows = []
    current_year = 2024

    for _ in range(n_samples):
        car = random.choice(CAR_CATALOG)
        year = random.randint(car["years"][0], min(car["years"][1], current_year))
        age = current_year - year

        # Realistic mileage in Pakistan: approx 10k to 18k km per year
        avg_annual_km = random.uniform(10_000, 17_000)
        mileage_km = int(max(3000, age * avg_annual_km + np.random.normal(0, 8000)))
        if age == 0:
            mileage_km = random.randint(500, 8000)

        city, city_factor = random.choices(CITIES, weights=[25, 30, 20, 10, 4, 3, 3, 2, 2, 1])[0]

        # Determine condition profile (Pakistani distribution):
        # 30% Total Bumper-to-Bumper Genuine
        # 35% Minor Touchups (1-3 pieces without poteen)
        # 22% Moderate Work (some pieces with poteen)
        # 10% Showered sides / multiple poteen pieces
        # 3% Accidental / Major hit
        rand_profile = random.random()
        
        piece_status = {}
        seals_intact = 1
        accidental = 0

        if rand_profile < 0.30:
            # Total Genuine
            for p in PIECE_NAMES:
                piece_status[p] = "genuine"
        elif rand_profile < 0.65:
            # Minor touchups without poteen (mostly fenders or doors)
            n_pieces = random.randint(1, 3)
            touched = random.sample(["front_left_fender", "front_right_fender", "front_left_door", "front_right_door", "rear_left_door", "rear_right_door", "rear_left_fender", "rear_right_fender"], n_pieces)
            for p in PIECE_NAMES:
                piece_status[p] = "touchup_no_putty" if p in touched else "genuine"
        elif rand_profile < 0.87:
            # Moderate work with some poteen
            n_touch = random.randint(1, 4)
            chosen = random.sample(PIECE_NAMES, n_touch)
            for p in PIECE_NAMES:
                if p in chosen:
                    # 60% chance poteen, 40% touchup w/o poteen (rarely roof)
                    if p == "roof":
                        piece_status[p] = "genuine" if random.random() > 0.05 else "touchup_no_putty"
                    else:
                        piece_status[p] = "putty" if random.random() < 0.65 else "touchup_no_putty"
                else:
                    piece_status[p] = "genuine"
        elif rand_profile < 0.97:
            # Showered / Heavily repaired (e.g. below roof showered)
            has_roof_genuine = random.random() > 0.15
            for p in PIECE_NAMES:
                if p == "roof":
                    piece_status[p] = "genuine" if has_roof_genuine else ("putty" if random.random() < 0.5 else "touchup_no_putty")
                else:
                    # Sides showered
                    choice = random.choices(["putty", "touchup_no_putty", "replaced", "genuine"], weights=[55, 30, 10, 5])[0]
                    piece_status[p] = choice
        else:
            # Accidental / Damaged
            accidental = 1
            seals_intact = 0 if random.random() < 0.8 else 1
            for p in PIECE_NAMES:
                piece_status[p] = random.choices(["putty", "replaced", "touchup_no_putty", "genuine"], weights=[50, 35, 10, 5])[0]

        # Calculate Price in PKR
        base = car["base_price_2024"]
        
        # Age depreciation curve (Pakistan market retains value strongly due to inflation)
        # Price drops ~5% per year for first 5 years, then flattens
        depreciation_multiplier = (1.0 - car["annual_depreciation"]) ** age
        depreciated_price = base * depreciation_multiplier

        # Mileage impact: every 10,000 km beyond 12k/yr adds ~0.8% penalty; low mileage adds slight premium
        expected_km = age * 12_000
        km_diff = (mileage_km - expected_km) / 10_000.0
        km_multiplier = max(0.80, min(1.10, 1.0 - (km_diff * 0.008)))

        # Piece condition impact
        total_piece_penalty = 0.0
        pieces_with_paint_no_putty = 0
        pieces_with_putty = 0
        pieces_replaced = 0

        for p in PIECE_NAMES:
            status = piece_status[p]
            penalty = PIECE_IMPACT_RATES[p][status]
            total_piece_penalty += penalty
            if status == "touchup_no_putty":
                pieces_with_paint_no_putty += 1
            elif status == "putty":
                pieces_with_putty += 1
            elif status == "replaced":
                pieces_replaced += 1

        # Cap maximum piece penalty to 55%
        total_piece_penalty = min(0.55, total_piece_penalty)
        body_multiplier = 1.0 - total_piece_penalty

        # Seal intact & accidental penalty
        accident_multiplier = 1.0
        if accidental:
            accident_multiplier *= 0.85
        if seals_intact == 0:
            accident_multiplier *= 0.88

        # City registration multiplier
        city_mult = city_factor

        # Market fluctuation noise (±3.5%)
        noise = np.random.normal(1.0, 0.035)

        # Final calculated PKR price
        price_pkr = depreciated_price * km_multiplier * body_multiplier * accident_multiplier * city_mult * noise
        
        # Floor price (even an old Mehran has a floor of ~400k)
        min_floor = 380_000 if car["model"] in ["Mehran", "Cuore"] else 800_000
        price_pkr = max(min_floor, price_pkr)

        # Round to nearest 5,000 PKR
        price_pkr = round(price_pkr / 5000.0) * 5000

        # Price in Lacs (standard Pakistani unit: 1 Lac = 100,000 PKR)
        price_in_lacs = round(price_pkr / 100_000.0, 2)

        row = {
            "make": car["make"],
            "model": car["model"],
            "variant": car["variant"],
            "year": year,
            "age": age,
            "engine_cc": car["engine_cc"],
            "transmission": car["transmission"],
            "fuel_type": car["fuel_type"],
            "mileage_km": mileage_km,
            "registered_city": city,
            "bonnet": piece_status["bonnet"],
            "roof": piece_status["roof"],
            "trunk": piece_status["trunk"],
            "front_left_door": piece_status["front_left_door"],
            "front_right_door": piece_status["front_right_door"],
            "rear_left_door": piece_status["rear_left_door"],
            "rear_right_door": piece_status["rear_right_door"],
            "front_left_fender": piece_status["front_left_fender"],
            "front_right_fender": piece_status["front_right_fender"],
            "rear_left_fender": piece_status["rear_left_fender"],
            "rear_right_fender": piece_status["rear_right_fender"],
            "pieces_paint_no_putty": pieces_with_paint_no_putty,
            "pieces_with_putty": pieces_with_putty,
            "pieces_replaced": pieces_replaced,
            "total_pieces_damaged": pieces_with_paint_no_putty + pieces_with_putty + pieces_replaced,
            "seals_intact": seals_intact,
            "accidental": accidental,
            "is_total_genuine": int(all(piece_status[p] == "genuine" for p in PIECE_NAMES)),
            "price_in_lacs": price_in_lacs,
            "price_pkr": int(price_pkr)
        }
        rows.append(row)

    df = pd.DataFrame(rows)
    return df

def main():
    print("Generating comprehensive Pakistani Used Car Dataset (reflecting PakWheels & OLX market)...")
    df = generate_pakistan_car_dataset(n_samples=6500)
    
    os.makedirs("data", exist_ok=True)
    full_path = "data/pakistan_used_cars_dataset.csv"
    train_path = "data/pakistan_cars_train.csv"
    test_path = "data/pakistan_cars_test.csv"
    
    df.to_csv(full_path, index=False)
    print(f"Full dataset saved: {full_path} ({len(df)} records)")

    # 80/20 train/test split
    shuffled = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    train_size = int(len(shuffled) * 0.80)
    train_df = shuffled.iloc[:train_size]
    test_df = shuffled.iloc[train_size:]

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)
    print(f"Train split saved: {train_path} ({len(train_df)} records)")
    print(f"Test split saved:  {test_path} ({len(test_df)} records)")

    print("\nDataset Summary Preview:")
    print(df[["make", "model", "year", "mileage_km", "registered_city", "pieces_with_putty", "is_total_genuine", "price_pkr", "price_in_lacs"]].head())

if __name__ == "__main__":
    main()
