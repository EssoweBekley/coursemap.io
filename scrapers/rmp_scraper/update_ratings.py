from datetime import datetime, timezone
import requests
from bs4 import BeautifulSoup
import database

def get_professor_page(rmp_id):
    """Fetch the professor's RateMyProfessors page."""
    full_url = f"https://www.ratemyprofessors.com/professor/{rmp_id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
    }

    print(f"Fetching professor's page: {full_url}...")
    response = requests.get(full_url, headers=headers, timeout=10)
    if response.status_code == 200:
        return response.text, full_url
    print(f"Failed to fetch page. Status code: {response.status_code}")
    return None, None

def extract_rating(soup):
    """Extract the professor's latest rating from RMP."""
    print("Extracting rating value...")
    rating_value = soup.find("div", class_="RatingValue__Numerator-qw8sqy-2 duhvlP")
    return rating_value.text.strip() if rating_value else "N/A"

def update_professor_rating(professor_name, school_name):
    """Find professor by name and school, fetch new rating, and update MongoDB."""
    formatted_school_name = school_name.replace(" ", "_")  # Replacing spaces with underscores
    db = database.Database(formatted_school_name, "professors")  # Use formatted school name as the database
    professor = db.collection.find_one({"name": professor_name, "school": school_name})

    if not professor:
        print(f"Erro: Professor '{professor_name}' not found in database for {school_name}.")
        return

    rmp_id = professor["rmp_id"]  # Using RMP ID as MongoDB _id
    html, full_url = get_professor_page(rmp_id)

    if html:
        soup = BeautifulSoup(html, "lxml")
        new_rating = extract_rating(soup)

        if new_rating != "N/A":
            update_query = {
                "$set": {
                    "latest_rating": new_rating,
                    "rmp_url": full_url,
                    "last_updated": datetime.now(timezone.utc)
                },
                "$push": {
                    "rating_history": {"date": datetime.now(timezone.utc), "rating": new_rating}
                }
            }

            # unset manual_search if it exists
            if "manual_search" in professor:
                update_query["$unset"] = {"manual_search": ""}

            db.collection.update_one(
                {"rmp_id": rmp_id},
                update_query
            )
            print(f"Success: Updated {professor_name} (ID: {rmp_id}) → New Rating: {new_rating}")
        else:
            print(f"Error: Could not extract rating for {professor_name}")
    else:
        print(f"Error: Failed to retrieve page for {professor_name}")
