import time
from datetime import datetime, timezone
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import database
from update_ratings import update_professor_rating

def initialize_driver():
    """Initialize the headless Firefox WebDriver."""
    options = Options()
    options.add_argument("--headless")  # Run in headless mode for faster execution
    driver = webdriver.Firefox(options=options)
    return driver

def search_professor(driver, link, professor_name, school_name, db):
    """Search for a professor on RateMyProfessors, handle 'Show More', and add to DB if missing."""
    print(f"🔍 Searching for professor: {professor_name} at {school_name}...")
    driver.get(link)

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "Search__DebouncedSearchInput-sc-10lefvq-1"))
    )

    prof_box = driver.find_element(By.CLASS_NAME, "Search__DebouncedSearchInput-sc-10lefvq-1")
    prof_box.send_keys(professor_name)
    prof_box.send_keys('\ue007')  # Press Enter

    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CLASS_NAME, "CardSchool__School-sc-19lmz2k-1"))
    )

    max_show_more_clicks = 3
    show_more_clicks = 0

    while show_more_clicks < max_show_more_clicks:
        soup = BeautifulSoup(driver.page_source, "lxml")
        school_div = find_school_div(soup, school_name)

        if school_div:
            print(f"✅ Found professor {professor_name}!")
            return driver.page_source  # Stop searching if found

        try:
            show_more_button = driver.find_element(By.CLASS_NAME, "Buttons__Button-sc-19xdot-1 PaginationButton__StyledPaginationButton-txi1dr-1 joxzkC")
            show_more_button.click()
            show_more_clicks += 1
            print(f"🔄 Clicked 'Show More' ({show_more_clicks}/{max_show_more_clicks})...")
            time.sleep(2)
        except:
            print("⚠️ 'Show More' button not found, stopping search.")
            break

    print(f"❌ Professor '{professor_name}' not found. Marking for manual review.")

    if not db.collection.find_one({"name": professor_name, "school": school_name}):
        db.collection.insert_one({
            "rmp_id": None,
            "name": professor_name,
            "school": school_name,
            "rmp_url": None,
            "latest_rating": None,
            "rating_history": [],
            "last_updated": datetime.now(timezone.utc),
            "manual_search": True
        })
        print(f"✅ Added {professor_name} to database for manual review.")

    return None  # Indicate professor was not found

def find_school_div(soup, school_name):
    """Find the professor entry for the correct school"""
    return soup.find("div", class_="CardSchool__School-sc-19lmz2k-1 bjvHvb", string=school_name)

def find_parent_a_tag(school_div):
    """Get the professor link from search results"""
    return school_div.find_parent("a", class_="TeacherCard__StyledTeacherCard-syjs0d-0 eerjaA")

def extract_rmp_id(href):
    """Extract RateMyProfessors ID from the URL"""
    return href.split('/')[-1]

def scrape_professor(professor_name, school_name):
    """Main function to scrape professor data and store it in MongoDB"""
    link = "https://www.ratemyprofessors.com/search"
    driver = initialize_driver()
    db = database.Database("University_of_Connecticut", "professors")

    try:
        html = search_professor(driver, link, professor_name, school_name, db)

        if html:
            soup = BeautifulSoup(html, "lxml")
            school_div = find_school_div(soup, school_name)

            if school_div:
                parent_a_tag = find_parent_a_tag(school_div)
                if parent_a_tag:
                    href = parent_a_tag['href']
                    rmp_id = extract_rmp_id(href)
                    rmp_url = f"https://www.ratemyprofessors.com{href}"

                    professor_data = {
                        "rmp_id": rmp_id,
                        "name": professor_name,
                        "school": school_name,
                        "rmp_url": rmp_url,
                        "latest_rating": None,  # To be updated later
                        "rating_history": [],
                        "last_updated": datetime.now(timezone.utc)
                    }

                    # ✅ Save professor without rating first
                    if not db.collection.find_one({"_id": rmp_id}):
                        db.insert_professor(professor_data)
                        print(f"✅ Inserted professor {professor_name} (ID: {rmp_id}) into DB.")
                    else:
                        print(f"🔄 Professor {professor_name} already exists in DB.")

                    # ✅ Now call update_ratings.py to get the rating
                    print(f"🔄 Fetching latest rating for {professor_name}...")
                    update_professor_rating(professor_name, school_name)

                else:
                    print(f"❌ No professor page found for {professor_name} at {school_name}.")
            else:
                print(f"❌ {school_name} not found in search results for {professor_name}.")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        driver.quit()
