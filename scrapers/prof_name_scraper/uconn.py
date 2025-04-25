from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
import time
from bs4 import BeautifulSoup
import json
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import database
import sys

def scrape_course(course_name):
    # Set up Firefox options
    options = Options()
    options.add_argument("--headless")  # Run headless for faster execution

    # Initialize the Firefox driver with the service
    driver = webdriver.Firefox(options=options)

    try:
        # Open the course search page
        url = "https://catalog.uconn.edu/course-search/"
        driver.get(url)

        # Enter search term and submit
        driver.find_element(By.ID, "crit-keyword").send_keys(course_name)
        driver.find_element(By.ID, "search-button").click()

        # Wait for the search results to load
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "result")))
        results = driver.find_elements(By.CLASS_NAME, "result")

        instructor_set = set()  # Use a set to store unique instructor names

        for result in results:
            result.click()
            time.sleep(2)  # Wait for the panel to load

            try:
                # Wait for the details panel
                details_panel = WebDriverWait(driver, 10).until(
                    EC.visibility_of_element_located((By.CLASS_NAME, "panel--kind-details"))
                )

                # Extract HTML content
                html_content = details_panel.get_attribute('outerHTML')
                soup = BeautifulSoup(html_content, 'html.parser')

                # Extract instructor name
                instructor_element = soup.find('div', class_='instructor-detail')
                instructor_name = instructor_element.text.strip() if instructor_element else 'N/A'

                # Store only unique instructor names
                if instructor_name != "N/A":
                    instructor_set.add(instructor_name)

            except Exception as e:
                print(f"Error extracting data: {e}")

            finally:
                # Collapse the panel
                result.click()
                time.sleep(1)

        # Convert set to list for JSON storage
        unique_instructors = [{"Instructor": name} for name in instructor_set]

        # Print & save extracted data
        print(unique_instructors)
        with open("output.json", "w", encoding="utf-8") as f:
            json.dump(unique_instructors, f, indent=4)

        # Insert or update the class in the database
        db = database.Database("University_of_Connecticut", "CSE")
        class_data = db.find_class(course_name)

        if class_data:
            # Update the existing class document
            db.collection.update_one(
                {"course_name": course_name},
                {"$set": {"instructors": unique_instructors}}
            )
            print(f"Updated class '{course_name}' with new instructors.")
        else:
            # Insert a new class document
            db.collection.insert_one({
                "course_name": course_name,
                "instructors": unique_instructors
            })
            print(f"Inserted new class '{course_name}' with instructors.")

    finally:
        driver.quit()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: python uconn.py \"course name\"")
        print(f"Example: python uconn.py \"CSE 1010\"")
        sys.exit(1)

    course_name = sys.argv[1]
    scrape_course(course_name)