import json
import requests

import json
import requests
import sys
from bs4 import BeautifulSoup
from pymongo import MongoClient, errors
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os
load_dotenv()
debug = False
output_dir = "./course_scraper/output"

with open("./config.json", "r") as f:
    config = json.load(f)

def get_course_list_html(course_prefix):
    try:
        url = config["subject_search_url"].format(course_code=course_prefix)
    except KeyError:
        print("Error: 'subject_search_url' key not found in config.json")
        sys.exit(1)
    print(f"Fetching course list from: {url}")

    response = requests.get(url)

    if response.status_code != 200:
        print(f"Error: Failed to retrieve {url} (status code {response.status_code})")
        return None

    html = response.content
    temp_html_file = os.path.join(output_dir, f"{course_prefix.upper()}.html")
    with open(temp_html_file, "wb") as file:
        file.write(html)
    
    return temp_html_file

def parse_html(html_file, course_prefix):
    """Extract course data from the HTML file and save to a JSON file named after the prefix."""
    try:
        with open(html_file, "r", encoding="utf-8") as file:
            soup = BeautifulSoup(file, "html.parser")
    except FileNotFoundError:
        print(f"Error: HTML file not found at {html_file}")
        return None
    except Exception as e:
        print(f"Error reading HTML file {html_file}: {e}")
        return None

    curr_department = course_prefix.upper()
    courses = []

    course_blocks = soup.find_all("div", class_="courseblock")
    if not course_blocks:
        print(f"Warning: No course blocks found in {html_file}.")

    for block in course_blocks:
        # Extract course name (ensure it's just the number part)
        name_element = block.find("span", class_="text detail-code margin--tiny text--semibold text--big")
        name_full = name_element.text.strip() if name_element else "N/A"
        name = name_full.split()[-1].replace(".", "") if name_full != "N/A" and " " in name_full else name_full.replace(".", "")

        # Extract course title
        title_element = block.find("span", class_="text detail-title margin--tiny text--semibold text--big")
        title = title_element.text.strip() if title_element else "N/A"

        # Extract course credits (parse as number)
        credits_element = block.find("span", class_="text detail-hours_html margin--tiny text--semibold text--big")
        credits_text = credits_element.text.strip() if credits_element else "N/A"
        credits = "N/A"
        try:
            credits_cleaned = credits_text.split()[0].replace("(", "").replace(")", "").strip()
            credits_num = float(credits_cleaned)
            credits = int(credits_num) if credits_num.is_integer() else credits_num
        except:
            credits = credits_text  # Keep original text if conversion fails

        # Extract course description
        description_element = block.find("div", class_="courseblockextra noindent")
        description = description_element.text.strip() if description_element else "N/A"
        if description != "N/A":
            description = description.replace("\u00a0", " ").replace("\n", " ").strip()
            if "Prerequisites:" in description:
                description = description.split("Prerequisites:")[0].strip()

        # Extract prerequisites, omitting exclusions by sentence
        prereqs_element = block.find("span", class_="text detail-reqs margin--default")
        prereqs_array = []
        exclusion_text = ""
        if prereqs_element:
            exclusion_text = prereqs_element.get_text(separator=" ", strip=True)
        # ...existing code...
        import re
        excluded_codes = set()
        exclusion_phrases = [
            "not", "may not", "taken out of sequence after passing", "after passing", "after completing"
        ]
        sentences = re.split(r'[.!?]', exclusion_text)
        print("\n--- Debug: Checking exclusion sentences ---")
        for i, sentence in enumerate(sentences):
            s = sentence.lower().replace("\u00a0", " ").strip()
            print(f"Sentence {i+1}: {s}")
            if any(phrase in s for phrase in exclusion_phrases):
                print(f"  -> Exclusion phrase found!")
                found_codes = re.findall(r'(?:[a-zA-Z]{2,}\s*)?\d{4}', s)
                print(f"    Found codes: {found_codes}")
                for fc in found_codes:
                    fc = fc.strip()
                    # Normalize 'or 2050' to 'CSE 2050'
                    if fc.lower().startswith("or "):
                        code_num = fc.split()[1]
                        normalized_code = f"{curr_department} {code_num}"
                        excluded_codes.add(normalized_code.upper())
                    elif " " in fc:
                        excluded_codes.add(fc.upper())
                    else:
                        excluded_codes.add(f"{curr_department} {fc}")
        print(f"Excluded codes: {excluded_codes}\n")

        if prereqs_element:
            course_links = prereqs_element.find_all("a", class_="bubblelink code")
            last_department = None
            for link in course_links:
                code_text = link.get_text(strip=True).replace("\u00a0", " ")
                if " " in code_text:
                    last_department = code_text.split()[0]
                    full_code = code_text
                elif last_department:
                    full_code = f"{last_department} {code_text}"
                else:
                    full_code = f"{curr_department} {code_text}"
                if full_code.upper() not in excluded_codes:
                    print(f"Including prereq: {full_code}")
                    prereqs_array.append(full_code)
                else:
                    print(f"Excluding prereq: {full_code}")

        # Only append if a valid name was found
        if name != "N/A":
            course_data = {
                "name": name,
                "title": title,
                "credits": credits,
                "description": description,
                "prereqs": prereqs_array
            }
            courses.append(course_data)

    # Define the output directory and filename using the prefix
    os.makedirs(output_dir, exist_ok=True)
    output_filename = os.path.join(output_dir, f"{course_prefix.upper()}.json")

    if courses:
        try:
            with open(output_filename, "w", encoding="utf-8") as json_file:
                json.dump(courses, json_file, indent=4, ensure_ascii=False)
            return output_filename
        except IOError as e:
            print(f"Error writing JSON file {output_filename}: {e}")
            return None
        except Exception as e:
            print(f"An unexpected error occurred during JSON writing: {e}")
            return None
    else:
        print("DEBUG: No courses appended, not writing JSON file.")
        return None 

def add_to_db(db, course_prefix, json_file):
    print(f"Ensuring prereqs exist in db...")

    try:
        with open(json_file, "r", encoding="utf-8") as file:
            data = json.load(file)
    except Exception as e:
        print(f"Error loading json: {e}")
        return
    
    seen_prereqs = set()

    for course in data:
        prereqs = course.get("prereqs", [])
        for prereq in prereqs:
            if not isinstance(prereq, str):
                print(f"Unexpected prereq type (skipping): {type(prereq)} - content: {prereq}")
                continue
            if prereq in seen_prereqs:
                continue
            seen_prereqs.add(prereq)
            try:
                prereq_prefix = prereq.split()[0].upper()
                prereq_collection = db[prereq_prefix]
                prereq_collection.update_one(
                    {"name": prereq},
                    {"$setOnInsert": {"name": prereq}},
                    upsert=True
                )
            except Exception as e:
                print(f"Error inserting stub for prereq '{prereq}': {e}")

    print(f"Added {len(seen_prereqs)} prereqs to respective collection.")

    format_db = course_prefix.upper()
    target_collection = db[format_db]

    for course in data:
        full_name = f"{course_prefix.upper()} {course['name']}"
        course["name"] = full_name
        course["x"] = 0
        course["y"] = 0

        prereq_ids = []
        for prereq in course.get("prereqs", []):
            if not isinstance(prereq, str):
                print(f"Unexpected prereq type when resolving IDs (skipping): {type(prereq)} - content: {prereq}")
                continue
            try:
                prereq_prefix = prereq.split()[0].upper()
                coll = db[prereq_prefix]
                doc = coll.find_one({"name": prereq})
                if doc:
                    prereq_ids.append(doc["_id"])
            except Exception as e:
                print(f"Could not resolve prereq '{prereq}': {e}")

        course["prereqs"] = prereq_ids

        try:
            target_collection.update_one(
                {"name": full_name},
                {"$set": course},
                upsert=True
            )
        except Exception as e:
            print(f"Failed to insert course '{full_name}': {e}")
    print(f"Inserted full courses into collection '{course_prefix.upper()}'.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python course_scraper/main.py <course_prefix>")
        sys.exit(1)

    course_prefix = sys.argv[1].upper()
    temp_html_file = get_course_list_html(course_prefix.lower())
    output_json_file = parse_html(temp_html_file, course_prefix)

    if output_json_file:
        URI = os.getenv("MONGODB_URI")
        database_name = os.getenv("UCONN_DB_NAME")
        client = MongoClient(URI, server_api=ServerApi('1'))
        db = client[database_name]
        add_to_db(db, course_prefix, output_json_file)

    if not debug:
        try:
            if os.path.exists(temp_html_file):
                os.remove(temp_html_file)
            if os.path.exists(output_json_file):
                os.remove(output_json_file)
            print("Temp files cleaned up.")
        except Exception as e:
            print(f"Could not delete temp files: {e}")
