# Course Scraper

This project scrapes course data from the [University of Connecticut Course Catalog](https://catalog.uconn.edu/directory-of-courses/) and loads it into MongoDB. It is designed to be part of a larger pipeline that also collects professor names and RateMyProfessor data.

---

## How It Works (Step by Step)

### 1. Download the raw HTML

* The script builds a catalog URL for a subject prefix (e.g. `PHIL`) using `config.json`.
* It requests the page with `requests.get()` and writes the raw HTML to `./course_scraper/output/PHIL.html`.
* Keeping the HTML file around makes debugging easier (you can re-parse it without hitting the network again).

### 2. Parse course information

* Uses BeautifulSoup to find every `div.courseblock` on the page.
* Extracts:

  * **Course code** (e.g. `PHIL 2100`)
  * **Title**
  * **Credits** (tries to cast to number, otherwise keeps raw text)
  * **Description** (with “Prerequisites:” text stripped out)
  * **Prerequisites** from links inside `span.text.detail-reqs`

    * If the link text has only a number (e.g. `1102`), the script uses the **last seen department prefix** to reconstruct it → `PHIL 1102`.
* The parsed courses are written to `./course_scraper/output/PHIL.json`.

### 3. Insert prerequisites (stub pass)

* Before inserting full course data, the script loops over every prerequisite string.
* For each, it ensures there’s at least a **stub document** in MongoDB:

  ```json
  { "name": "PHIL 1101" }
  ```
* This guarantees that every prereq has a Mongo `_id`, even if the actual course hasn’t been scraped yet.

### 4. Insert courses (main pass)

* For each parsed course:

  * Adds the prefix to the course name (e.g. `"2100"` → `"PHIL 2100"`).
  * Adds default layout coordinates (`"x": 0, "y": 0`), this is for the old graph display.
  * Looks up each prereq string in MongoDB and replaces it with the referenced document’s `_id`.
  * Upserts the full course into the collection for that prefix (e.g. `db["PHIL"]`).

### 5. Cleanup

* If `debug = True` (default), it leaves the HTML/JSON files in `output/`.
* If `debug = False`, it deletes them after inserting into the database.

---

## Design Decisions and Quirks

* **Two-pass prereq system**
  I first insert stub docs for all prerequisites, then resolve them into `_id` references when inserting the actual course. This ensures a connected graph structure and avoids dangling text references.

* **Resilient prereq parsing**
  Since the catalog sometimes lists prereqs without department codes, I added a heuristic that carries forward the last department prefix. This prevents prereqs from being lost or mismatched.

* **Upserts instead of inserts**
  Using `update_one(..., upsert=True)` means:

  * Running the scraper multiple times won’t create duplicates.
  * If course data changes in the catalog, rerunning updates the existing doc.

* **Debug mode**
  By default, the script doesn’t clean up temporary files. This makes it easier to inspect raw HTML or parsed JSON if parsing fails.

* **Flexible config**
  The course catalog URL is stored in `config.json`, so the script isn’t hardcoded to a single institution’s site structure.

* **Defaults for visualization**
  Every course gets `x: 0, y: 0`, anticipating use in graph visualizations of course relationships.

---

## Example Data

**Course document:**

```json
{
  "name": "PHIL 2100",
  "title": "Modern Philosophy",
  "credits": 3,
  "description": "Study of key philosophers from Descartes to Kant.",
  "prereqs": [
    { "$oid": "64fabc..." },
    { "$oid": "64fdef..." }
  ],
  "x": 0,
  "y": 0
}
```

**Stub document:**

```json
{
  "name": "PHIL 1101"
}
```

---

## Running the Script

```bash
python course_scraper/main.py PHIL
```

This will:

1. Fetch and save the HTML catalog page.
2. Parse courses and prereqs.
3. Insert/update documents into MongoDB.

---