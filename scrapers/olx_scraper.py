"""
OLX Pakistan Used Car Scraper
Extracts live car listings from OLX Pakistan (olx.com.pk) including images,
direct ad links, mileage, city, price, and body condition details.
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

KNOWN_CITIES = [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Gujranwala", "Sialkot", "Quetta", "Sargodha"
]

def parse_olx_price(price_str: str) -> float:
    """Parses OLX price string like 'Rs 2,850,000' or '28.5 Lacs'."""
    if not price_str:
        return None
    cleaned = price_str.lower().replace("rs", "").replace("pkr", "").replace(",", "").strip()
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

def parse_body_condition(text: str):
    """Parses OLX text for Pakistani car condition nuances."""
    desc = (text or "").lower()
    condition = {piece: "genuine" for piece in PIECE_NAMES}
    condition["seals_intact"] = 1
    condition["accidental"] = 0

    if any(k in desc for k in ["bumper to bumper genuine", "total genuine", "100% original", "all original", "scratchless"]):
        return condition

    if any(k in desc for k in ["seal pack", "all seals intact", "genuine seals", "seal to seal"]):
        condition["seals_intact"] = 1
    elif any(k in desc for k in ["seal damage", "seals damaged", "seal repair"]):
        condition["seals_intact"] = 0
        condition["accidental"] = 1

    if any(k in desc for k in ["accidental", "major hit", "pillar repaired"]):
        condition["accidental"] = 1

    has_poteen_overall = any(k in desc for k in ["poteen", "poutine", "putty", "potine", "dent"])

    if "below roof showered" in desc or "showered below roof" in desc or "side shower" in desc or "sides showered" in desc:
        status = "putty" if has_poteen_overall else "touchup_no_putty"
        for p in PIECE_NAMES:
            if p not in ["roof", "bonnet", "trunk"]:
                condition[p] = status

    piece_aliases = {
        "bonnet": ["bonnet", "hood"],
        "roof": ["roof", "chhat"],
        "trunk": ["trunk", "diggi", "boot"],
        "front_left_door": ["front left door", "driver door"],
        "front_right_door": ["front right door", "front passenger door"],
        "rear_left_door": ["rear left door", "back left door"],
        "rear_right_door": ["rear right door", "back right door"],
        "front_left_fender": ["front left fender"],
        "front_right_fender": ["front right fender"],
        "rear_left_fender": ["rear left fender"],
        "rear_right_fender": ["rear right fender"],
    }

    for piece, aliases in piece_aliases.items():
        for alias in aliases:
            pattern = rf"{alias}[^.,\n]*?(shower|paint|touchup|poteen|putty|replaced|spray)"
            match = re.search(pattern, desc)
            if match:
                matched_str = match.group(0)
                if "replace" in matched_str:
                    condition[piece] = "replaced"
                elif any(x in matched_str for x in ["poteen", "putty", "poutine"]):
                    condition[piece] = "putty"
                elif has_poteen_overall and ("shower" in matched_str or "paint" in matched_str):
                    condition[piece] = "putty"
                else:
                    condition[piece] = "touchup_no_putty"
                break

    return condition

def scrape_olx_page(page_num=1, query=""):
    """Scrapes an OLX Pakistan cars listing page."""
    if query:
        url = f"https://www.olx.com.pk/cars_c84/q-{query}?page={page_num}"
    else:
        url = f"https://www.olx.com.pk/cars_c84?page={page_num}"
        
    logging.info(f"Fetching OLX Pakistan: {url}")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=12)
        if resp.status_code != 200:
            logging.warning(f"OLX returned status code {resp.status_code}")
            return []
    except Exception as e:
        logging.error(f"Error scraping OLX page {page_num}: {e}")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    listings = []
    
    articles = soup.find_all("article")
    for art in articles:
        try:
            text = art.get_text(separator=" ").strip()
            if "Rs" not in text and "PKR" not in text:
                continue

            # Direct link & image
            link_tag = art.select_one("a")
            href = link_tag.get("href", "") if link_tag else ""
            ad_url = f"https://www.olx.com.pk{href}" if href.startswith("/") else href

            img_tag = art.select_one("img")
            img_url = ""
            if img_tag:
                img_url = img_tag.get("src") or img_tag.get("data-src") or ""

            # Price extraction
            price_match = re.search(r"Rs\s*([\d,]+(\.\d+)?\s*(Crore|Lacs|Lakh)?)", text, re.IGNORECASE)
            price_text = price_match.group(0) if price_match else ""
            price = parse_olx_price(price_text)

            # Year extraction
            year_match = re.search(r"\b(19\d\d|20\d\d)\b", text)
            year = int(year_match.group(1)) if year_match else 2020

            # Mileage
            km_match = re.search(r"([\d,]+)\s*km", text, re.IGNORECASE)
            mileage = int(km_match.group(1).replace(",", "")) if km_match else 55000

            # City
            city = "Lahore"
            for c in KNOWN_CITIES:
                if c.lower() in text.lower():
                    city = c
                    break

            # Make & Model
            make = "Toyota"
            for mk in KNOWN_MAKES:
                if mk.lower() in text.lower():
                    make = mk
                    break

            # Model heuristic
            model = "Corolla"
            for m in ["Corolla", "Civic", "City", "Alto", "Cultus", "Mehran", "Swift", "Wagon R", "Yaris", "Sportage", "Tucson", "Vitz", "Mira", "Prado", "Fortuner", "Hilux", "Alsvin", "HS"]:
                if m.lower() in text.lower():
                    model = m
                    break

            body_cond = parse_body_condition(text)
            
            # Putty / touchup counts
            putty_count = sum(1 for p in PIECE_NAMES if body_cond[p] == "putty")
            touchup_count = sum(1 for p in PIECE_NAMES if body_cond[p] == "touchup_no_putty")
            replaced_count = sum(1 for p in PIECE_NAMES if body_cond[p] == "replaced")

            price_in_lacs = round(price / 100_000.0, 2) if price else None

            # Clean title
            lines = [l.strip() for l in text.splitlines() if l.strip()]
            title = f"{make} {model} {year}"
            for line in lines:
                if any(m.lower() in line.lower() for m in [make, model]) and len(line) < 70:
                    title = line
                    break

            item = {
                "source": "OLX Pakistan",
                "title": title,
                "make": make,
                "model": model,
                "year": year,
                "price_pkr": price,
                "price_in_lacs": price_in_lacs,
                "price_formatted": price_text,
                "mileage_km": mileage,
                "registered_city": city,
                "fuel_type": "Petrol" if "diesel" not in text.lower() else "Diesel",
                "engine_cc": 1300,
                "transmission": "Automatic" if any(x in text.lower() for x in ["auto", "automatic", "cvt"]) else "Manual",
                "inspection_score": None,
                "image_url": img_url,
                "url": ad_url,
                "description": text[:200],
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
            logging.debug(f"Failed to parse OLX article: {ex}")
            continue

    return listings

def scrape_olx(num_pages=3, query="", delay_range=(1.2, 2.5)):
    """Scrapes multiple pages of OLX."""
    all_data = []
    for page in range(1, num_pages + 1):
        data = scrape_olx_page(page, query=query)
        all_data.extend(data)
        time.sleep(random.uniform(*delay_range))
    df = pd.DataFrame(all_data)
    logging.info(f"Scraped {len(df)} listings from OLX Pakistan.")
    return df

if __name__ == "__main__":
    df = scrape_olx(num_pages=2)
    if not df.empty:
        df.to_csv("data/olx_scraped.csv", index=False)
        print(f"Collected {len(df)} records from OLX Pakistan.")
