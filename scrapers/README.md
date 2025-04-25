# RateMyProfessor Course Scraper - Automated data collection from RateMyProfessor.com

A Python-based web scraping tool that automates the collection of course and professor ratings data from RateMyProfessor.com. The scraper provides structured data extraction with support for handling authentication, pagination, and rate limiting.

The scraper uses Selenium WebDriver for browser automation and handles dynamic content loading, making it reliable for extracting data from modern web applications. It includes features for both initial data collection and updating existing records, with built-in error handling and retry mechanisms.

## Repository Structure
```
.
├── config.json                 # Configuration settings for the scraper
├── course_list.py             # Module for managing course data
├── rmp_scraper/              
│   ├── database.py            # Database operations and schema management
│   ├── main.py               # Entry point and core scraping logic
│   ├── scrape_new.py         # New data collection functionality
│   └── update_ratings.py      # Update existing ratings functionality
└── requirements.txt           # Python package dependencies
```

## Usage Instructions
### Prerequisites
- Python 3.8 or higher
- Chrome browser installed
- MongoDB database (for data storage)

Required Python packages:
```
selenium>=4.30.0
pymongo
requests
beautifulsoup4
trio
```

### Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/rmp-scraper.git
cd rmp-scraper
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure the database connection:
Edit `config.json` with your MongoDB connection details:
```json
{
  "mongodb_uri": "mongodb://localhost:27017",
  "database": "rmp_data"
}
```

### Quick Start
1. Initialize the scraper:
```python
from rmp_scraper.main import RMPScraper

scraper = RMPScraper()
scraper.initialize()
```

2. Start collecting data:
```python
scraper.run()
```

### More Detailed Examples
1. Collecting data for specific schools:
```python
scraper = RMPScraper()
scraper.set_schools(['University of Washington', 'Stanford University'])
scraper.run()
```

2. Updating existing ratings:
```python
from rmp_scraper.update_ratings import update_ratings

update_ratings(days_old=30)  # Update ratings older than 30 days
```

### Troubleshooting
Common issues and solutions:

1. Selenium WebDriver Connection Issues
- Error: "WebDriver not found"
  - Solution: Ensure Chrome is installed and ChromeDriver is in your PATH
  - Check ChromeDriver version matches your Chrome version

2. MongoDB Connection Issues
- Error: "MongoDB connection failed"
  - Solution: Verify MongoDB is running
  - Check connection string in config.json
  - Ensure network connectivity to MongoDB server

3. Rate Limiting
- Error: "Too many requests"
  - Solution: Adjust delay settings in config.json
  - Use proxy rotation if available
  - Implement exponential backoff

## Data Flow
The scraper follows a sequential data collection and processing pipeline:

```ascii
[Web Browser] -> [Selenium WebDriver] -> [Data Extraction] -> [Data Processing] -> [MongoDB Storage]
     |                    |                     |                    |                    |
     v                    v                     v                    v                    v
Page Load            DOM Access           Raw HTML/JSON        Structured Data      Persistent Storage
```

Component interactions:
- Selenium WebDriver manages browser automation and page navigation
- Data extraction module parses HTML content using BeautifulSoup4
- Processing pipeline validates and normalizes extracted data
- MongoDB storage handles data persistence with atomic operations
- Rate limiting and retry logic manages request flow
- Error handling ensures graceful failure recovery