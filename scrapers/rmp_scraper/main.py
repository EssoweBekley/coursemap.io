import os # Add this import statement
import database
from scrape_new import scrape_professor
from update_ratings import update_professor_rating

def main(professor_name, school_name):
    """Main function to update professor rating."""
    db = database.Database("University_of_Connecticut", "professors")
    professor = db.find_professor_rmp_id(professor_name, school_name)  # Pass both professor_name and school_name

    if professor:
        print(f"Professor '{professor_name}' found in database. Updating rating...")
        update_professor_rating(professor_name, school_name)
    else:
        print(f"Professor '{professor_name}' not found in database. Scraping new data...")
        scrape_professor(professor_name, school_name)

if __name__ == "__main__":
    args = os.sys.argv
    if len(args) != 3:
        print("Usage: python main.py <professor_name> <school_name>")
    else:
        PROFESSOR_NAME = args[1]
        SCHOOL_NAME = args[2]
        main(PROFESSOR_NAME, SCHOOL_NAME)


