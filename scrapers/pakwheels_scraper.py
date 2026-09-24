"""
PakWheels Used Car Scraper
Extracts live used car listings from PakWheels.com including specs,
images, links, inspection scores, and parsed body piece condition.
"""

import re
import time
import random
import logging
import requests
from bs4 import BeautifulSoup
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

PIECE_NAMES = [
    "bonnet", "roof", "trunk",
    "front_left_door", "front_right_door",
    "rear_left_door", "rear_right_door",
    "front_left_fender", "front_right_fender",
    "rear_left_fender", "rear_right_fender"
]

KNOWN_MAKES = [
    "Toyota", "Suzuki", "Honda", "KIA", "Hyundai", "Changan",
    "Daihatsu", "Nissan", "MG", "Haval", "Audi", "BMW",
    "Mercedes", "Proton", "DFSK", "Chery", "Peugeot", "FAW"
]

def parse_price(price_str: str) -> float:
    """Convert PakWheels price string (e.g. 'PKR 35.5 lacs' or 'PKR 1.25 crore') to PKR integer."""
    if not price_str or "call" in price_str.lower():
        return None
    cleaned = price_str.lower().replace("pkr", "").replace(",", "").strip()
    try:
        if "crore" in cleaned:
            val = float(re.findall(r"[\d.]+", cleaned)[0])
            return val * 10_000_000
        elif "lac" in cleaned or "lakh" in cleaned:
            val = float(re.findall(r"[\d.]+", cleaned)[0])
            return val * 100_000
        else:
            nums = re.findall(r"\d+", cleaned)
            if nums:
                return float("".join(nums))
    except Exception:
        return None
    return None

def parse_body_condition_from_text(description: str):
    """
    Parse Pakistani car seller description for paint condition, poteen, touchups, and seals.
    Pakistani lingo: 'bumper to bumper genuine', 'touchup without poteen', 'showered', 'poteen on bonnet', etc.
    """
    desc = (description or "").lower()
    
    condition = {piece: "genuine" for piece in PIECE_NAMES}
    condition["seals_intact"] = 1
    condition["accidental"] = 0
    
    # Check for total genuine / bumper to bumper
    is_total_genuine = any(phrase in desc for phrase in [
        "bumper to bumper genuine", "total genuine", "100% genuine", "all genuine", 
        "seal to seal genuine", "scratchless genuine", "original paint"
    ])
    
    if is_total_genuine:
        return condition

    if any(p in desc for p in ["seal damage", "seals damaged", "seal repair", "non-genuine seals"]):
        condition["seals_intact"] = 0
        condition["accidental"] = 1
    
    if any(p in desc for p in ["accidental", "major accident", "pillar damaged", "apron damaged"]):
        condition["accidental"] = 1

    showered_sides = any(p in desc for p in ["showered below roof", "below roof showered", "sides showered", "side shower"])
    if showered_sides:
        has_putty = any(p in desc for p in ["poteen", "poutine", "putty", "potine"])
        side_status = "putty" if has_putty else "touchup_no_putty"
        for p in PIECE_NAMES:
            if p not in ["roof", "bonnet", "trunk"]:
                condition[p] = side_status

    keywords_mapping = {
        "bonnet": ["bonnet", "hood"],
        "roof": ["roof", "chhat", "chat"],
        "trunk": ["trunk", "boot", "diggi", "diki"],
        "front_left_door": ["front left door", "driver door"],
        "front_right_door": ["front right door", "passenger door"],
        "rear_left_door": ["rear left door", "back left door"],
        "rear_right_door": ["rear right door", "back right door"],
        "front_left_fender": ["front left fender"],
        "front_right_fender": ["front right fender"],
        "rear_left_fender": ["rear left fender"],
        "rear_right_fender": ["rear right fender"],
    }
    
    has_poteen_global = any(p in desc for p in ["poteen", "poutine", "putty", "potine", "dent repair"])

    for piece, aliases in keywords_mapping.items():
        for alias in aliases:
            pattern = rf"{alias}[^.,\n]*?(painted|showered|touchup|touch up|touch|poteen|putty|replaced|spray)"
            match = re.search(pattern, desc)
            if match:
                matched_text = match.group(0)
                if "replaced" in matched_text or "change" in matched_text:
                    condition[piece] = "replaced"
                elif any(x in matched_text for x in ["poteen", "putty", "poutine"]):
                    condition[piece] = "putty"
                elif has_poteen_global and ("shower" in matched_text or "paint" in matched_text):
                    condition[piece] = "putty"
                else:
                    condition[piece] = "touchup_no_putty"
                break
                
    return condition

def scrape_pakwheels_page(page_num=1, query=""):
    """Scrapes a single search page from PakWheels."""
    if query:
        url = f"https://www.pakwheels.com/used-cars/search/-/{query}?page={page_num}"
    else:
        url = f"https://www.pakwheels.com/used-cars/search/-/?page={page_num}"
        
    logging.info(f"Fetching PakWheels: {url}")
    try:
        response = requests.get(url, headers=HEADERS, timeout=12)
        if response.status_code != 200:
            logging.warning(f"Status code {response.status_code} received from PakWheels")
            return []
    except Exception as e:
        logging.error(f"Error requesting {url}: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    listings = []

    cards = soup.select("li.classified-listing")
    for card in cards:
        try:
            title_tag = card.select_one("a.car-name")
            if not title_tag:
                continue
            
            raw_title = title_tag.text.strip()
            # Extract inspection score if present (e.g. "8.5/10")
            score_match = re.search(r"(\d+(\.\d+)?)\s*/\s*10", raw_title)
            inspection_score = float(score_match.group(1)) if score_match else None
            
            clean_title = re.sub(r"\d+(\.\d+)?\s*/\s*10", "", raw_title).replace("for Sale", "").strip()
            href = title_tag.get("href", "")
            ad_url = f"https://www.pakwheels.com{href}" if href.startswith("/") else href

            img_tag = card.select_one("img")
            img_url = ""
            if img_tag:
                img_url = img_tag.get("data-original") or img_tag.get("src") or ""
                if not img_url.startswith("http") and not img_url.startswith("//"):
                    img_url = ""
                elif img_url.startswith("//"):
                    img_url = f"https:{img_url}"

            price_tag = card.select_one(".price-details")
            price_text = price_tag.text.strip() if price_tag else ""
            price = parse_price(price_text)
            
            specs_tags = card.select("ul.search-vehicle-info li, ul.search-vehicle-info-2 li")
            specs = [s.text.strip() for s in specs_tags]
            
            city = "Lahore"
            year = None
            mileage = None
            fuel = "Petrol"
            engine_cc = None
            transmission = "Automatic"

            for spec in specs:
                if re.match(r"^\d{4}$", spec):
                    year = int(spec)
                elif "km" in spec.lower():
                    km_str = re.sub(r"[^\d]", "", spec)
                    if km_str:
                        mileage = int(km_str)
                elif spec.lower() in ["petrol", "diesel", "hybrid", "cng", "electric"]:
                    fuel = spec.capitalize()
                elif "cc" in spec.lower():
                    cc_str = re.sub(r"[^\d]", "", spec)
                    if cc_str:
                        engine_cc = int(cc_str)
                elif spec.lower() in ["manual", "automatic", "cvt"]:
                    transmission = spec.capitalize()
                elif len(spec) > 2 and not any(c.isdigit() for c in spec) and spec not in ["Manual", "Automatic", "Petrol", "Diesel", "Hybrid"]:
                    city = spec

            # Fallback for year from title if not in specs
            if not year:
                year_match = re.search(r"\b(19\d\d|20\d\d)\b", clean_title)
                if year_match:
                    year = int(year_match.group(1))

            # Description snippet
            desc_tag = card.select_one(".search-vehicle-description, .ad-description, .description")
            desc_text = desc_tag.text.strip() if desc_tag else ""
            
            full_text = f"{clean_title} {desc_text}"
            body_cond = parse_body_condition_from_text(full_text)
            
            # Determine make and model
            make = "Toyota"
            for km in KNOWN_MAKES:
                if km.lower() in clean_title.lower():
                    make = km
                    break

            title_words = clean_title.split()
            model = "Corolla"
            for i, w in enumerate(title_words):
                if w.lower() == make.lower() and i + 1 < len(title_words):
                    model = title_words[i+1]
                    break

            # Calculate price in Lacs
            price_in_lacs = round(price / 100_000.0, 2) if price else None

            # Count pieces with issues
            putty_count = sum(1 for p in PIECE_NAMES if body_cond[p] == "putty")
            touchup_count = sum(1 for p in PIECE_NAMES if body_cond[p] == "touchup_no_putty")
            replaced_count = sum(1 for p in PIECE_NAMES if body_cond[p] == "replaced")

            item = {
                "source": "PakWheels",
                "title": clean_title,
                "make": make,
                "model": model,
                "year": year or 2020,
                "price_pkr": price,
                "price_in_lacs": price_in_lacs,
                "price_formatted": price_text,
                "mileage_km": mileage or 50000,
                "registered_city": city,
                "fuel_type": fuel,
                "engine_cc": engine_cc or 1300,
                "transmission": transmission,
                "inspection_score": inspection_score,
                "image_url": img_url,
                "url": ad_url,
                "description": desc_text,
                "pieces_with_putty": putty_count,
                "pieces_paint_no_putty": touchup_count,
                "pieces_replaced": replaced_count,
                "total_pieces_damaged": putty_count + touchup_count + replaced_count,
                "is_total_genuine": int(putty_count + touchup_count + replaced_count == 0),
                **body_cond
            }
            if price and price > 150_000:
                listings.append(item)
        except Exception as ex:
            logging.debug(f"Failed to parse PakWheels card: {ex}")
            continue

    return listings

def scrape_pakwheels(num_pages=3, query="", delay_range=(1.0, 2.5)):
    """Scrapes multiple pages of PakWheels with polite delays."""
    all_data = []
    for page in range(1, num_pages + 1):
        data = scrape_pakwheels_page(page, query=query)
        all_data.extend(data)
        time.sleep(random.uniform(*delay_range))
    df = pd.DataFrame(all_data)
    logging.info(f"Scraped {len(df)} listings from PakWheels.")
    return df

if __name__ == "__main__":
    df = scrape_pakwheels(num_pages=2)
    if not df.empty:
        df.to_csv("data/pakwheels_scraped.csv", index=False)
        print(f"Saved {len(df)} records from PakWheels to data/pakwheels_scraped.csv")
    else:
        print("No records scraped.")
