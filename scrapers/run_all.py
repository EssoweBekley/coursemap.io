import subprocess
import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    print("Error: MONGODB_URI environment variable not set.")
    sys.exit(1)

# --- Config ---
SCHOOL_NAME = "University of Connecticut"
COURSE_PREFIXES = ["PHIL"] # Add more prefixes as needed
# --- End Config ---

# Ensure the script can find the modules
sys.path.append(os.path.dirname(__file__))

def run_script(script_path, args):
    """Helper function to run a Python script as a subprocess."""
    command = [sys.executable, script_path] + args
    print(f"\nRunning: {' '.join(command)}")
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True, env=os.environ)
        print("Output:\n", result.stdout)
        if result.stderr:
            print("Error Output:\n", result.stderr)
        print(f"Successfully ran {script_path} with args: {args}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running {script_path} with args: {args}")
        print("Return code:", e.returncode)
        print("Output:\n", e.stdout)
        print("Error Output:\n", e.stderr)
        return False
    except FileNotFoundError:
        print(f"Error: Script not found at {script_path}")
        return False

def get_courses_from_db(db_name, collections):
    """Fetches all course names from specified collections."""
    client = MongoClient(MONGODB_URI)
    db = client[db_name]
    course_names = []
    for coll_name in collections:
        if coll_name in db.list_collection_names():
            collection = db[coll_name]
            # Assuming course documents have a 'name' field like "CSE 1010"
            for course in collection.find({}, {"name": 1, "_id": 0}):
                if "name" in course:
                    course_names.append(course["name"])
        else:
            print(f"Warning: Collection {coll_name} not found in database {db_name}.")
    client.close()
    return list(set(course_names)) # Return unique names

def get_professors_from_db(db_name, course_collections):
    """Fetches unique instructor names from course documents."""
    client = MongoClient(MONGODB_URI)
    db = client[db_name]
    professor_names = set()
    for coll_name in course_collections:
         if coll_name in db.list_collection_names():
            collection = db[coll_name]

            for course in collection.find({"instructors": {"$exists": True}}, {"instructors": 1, "_id": 0}):
                 if "instructors" in course and isinstance(course["instructors"], list):
                    for instructor_info in course["instructors"]:
                        if isinstance(instructor_info, dict) and "Instructor" in instructor_info:
                            professor_names.add(instructor_info["Instructor"])
                        elif isinstance(instructor_info, str):
                             professor_names.add(instructor_info)

         else:
            print(f"Warning: Collection {coll_name} not found for professor lookup.")

    # Also check the dedicated 'professors' collection from rmp_scraper
    if "professors" in db.list_collection_names():
        prof_collection = db["professors"]
        for prof in prof_collection.find({}, {"name": 1, "_id": 0}):
             if "name" in prof:
                professor_names.add(prof["name"])

    client.close()
    return list(professor_names)


# 1. Run Course Scraper for each prefix
print("--- Starting Course Scraper ---")
for prefix in COURSE_PREFIXES:
    run_script("course_scraper/main.py", [prefix])

# 2. Run Professor Name Scraper for each course found
print("\n--- Starting Professor Name Scraper ---")
# Fetch course names directly from the database collections created by course_scraper
course_names_to_scrape = get_courses_from_db(SCHOOL_NAME.replace(" ", "_"), COURSE_PREFIXES)
if not course_names_to_scrape:
     print("No course names found in the database. Skipping Professor Name Scraper.")
else:
    print(f"Found {len(course_names_to_scrape)} courses to scrape professors for.")
    for course_name in course_names_to_scrape:
        # prof_name_scraper expects the course name as an argument
        run_script("prof_name_scraper/main.py", [course_name])

# 3. Run RMP Scraper for each unique professor found
print("\n--- Starting RMP Scraper ---")

professors_to_scrape = get_professors_from_db(SCHOOL_NAME.replace(" ", "_"), COURSE_PREFIXES)
if not professors_to_scrape:
    print("No professor names found in the database. Skipping RMP Scraper.")
else:
    print(f"Found {len(professors_to_scrape)} unique professors to scrape/update ratings for.")
    for prof_name in professors_to_scrape:
        run_script("rmp_scraper/main.py", [prof_name, SCHOOL_NAME])

print("\n--- All scraping tasks finished ---")
