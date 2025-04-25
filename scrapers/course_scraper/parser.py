from bs4 import BeautifulSoup
import json
import os

def extract_course_data(html_file, course_prefix):
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

        # Extract prerequisites
        prereqs_element = block.find("span", class_="text detail-reqs margin--default")
        prereqs_array = []
        if prereqs_element:
            course_links = prereqs_element.find_all("a", class_="bubblelink code")
            last_department = None
            for link in course_links:
                code_text = link.get_text(strip=True).replace("\u00a0", " ")
                if " " in code_text:
                    last_department = code_text.split()[0]
                    prereqs_array.append(code_text)
                elif last_department:
                    prereqs_array.append(f"{last_department} {code_text}")
                else:
                    prereqs_array.append(f"{curr_department} {code_text}")

        # Only append if a valid name and title were found
        if name != "N/A" and title != "N/A":
            courses.append({
                "name": name,
                "title": title,
                "credits": credits, 
                "description": description,
                "prereqs": prereqs_array
            })
        else:
            print(f"Skipping block due to missing name or title: Name='{name}', Title='{title}'")

    # Define the output directory and filename using the prefix
    output_dir = "./course_scraper/output"
    os.makedirs(output_dir, exist_ok=True)
    output_filename = os.path.join(output_dir, f"{course_prefix.lower()}.json")

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