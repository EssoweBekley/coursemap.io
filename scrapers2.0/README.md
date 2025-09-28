## Course Catalog Scraper

This tool scrapes course information and prerequisites from the UConn online catalog for a given subject prefix.

### Setup
1. Clone the repository and navigate to the project folder.
2. Install dependencies:
	```
	pip install -r requirements.txt
	```
3. (Optional) Create a `.env` file for database integration if needed.

### Usage
Run the scraper for any subject prefix:
```
python course_name.py <prefix>
```
Example:
```
python course_name.py cse
python course_name.py engl
```

### Output
- Scraped data is saved as JSON in `course_scraper/output/<PREFIX>.json`.
- Each entry includes course name, title, credits, description, and filtered prerequisites.

### Notes
- The script automatically handles exclusion phrases in prerequisites.
- For database integration, set up your `.env` file with MongoDB credentials.