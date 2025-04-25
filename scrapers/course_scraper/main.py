import json
import requests
import sys
import parser
import os
from database import DatabaseManager

# Load the configuration JSON
with open("./course_scraper/config.json", "r") as f:
    config = json.load(f)

def get_course_list_html(course_prefix):
    # Build the URL from config and prefix
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

    # Save the HTML content to a file for parsing
    html = response.content
    temp_html_file = f"{course_prefix}.html"
    with open(temp_html_file, "wb") as file:
        file.write(html)
    
    return temp_html_file


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python course_scraper/main.py <course_prefix>")
        sys.exit(1)

    course_prefix = sys.argv[1] 
    temp_html_file = get_course_list_html(course_prefix.lower()) 

    output_json_file = None
    if temp_html_file: 
        try:
            # Parse the downloaded HTML, passing the prefix
            output_json_file = parser.extract_course_data(temp_html_file, course_prefix) 
            
            if output_json_file:
                print(f"Successfully parsed data and saved to {output_json_file}")
                try:
                    db_manager = DatabaseManager()
                    db_manager.insert_courses(course_prefix, output_json_file) 
                    db_manager.close_connection()
                    
                    # delete the JSON file after successful insertion (comment to keep the JSON file)
                    if os.path.exists(output_json_file):
                       try:
                           os.remove(output_json_file)
                           print(f"Temporary JSON file {output_json_file} deleted.")
                       except OSError as e:
                           print(f"Error deleting JSON file {output_json_file}: {e}")

                except Exception as db_e:
                    print(f"Database operation failed: {db_e}")

            else:
                 print(f"Parsing failed or no data extracted for {course_prefix.upper()}. No data to insert.")

        except Exception as parse_e:
             print(f"Error during parsing step: {parse_e}")
        finally:
            # Delete the temporary HTML file 
            if os.path.exists(temp_html_file):
                try:
                    os.remove(temp_html_file)
                    print(f"Temporary HTML file {temp_html_file} deleted.")
                except OSError as e:
                    print(f"Error deleting temporary HTML file {temp_html_file}: {e}")
    else:
        print(f"Could not retrieve or save course list HTML for {course_prefix.upper()}. Aborting.")
        sys.exit(1)
