import json
import os
from dotenv import load_dotenv
from pymongo import MongoClient, errors
from pymongo.server_api import ServerApi

database_name = "University_of_Connecticut" # database name for uconn\

load_dotenv()
URI = os.getenv("MONGODB_URI")
if not URI:
    raise ValueError("MONGODB_URI environment variable not set.")

class DatabaseManager:
    """Manages database operations for course data, storing courses in department-specific collections."""

    def __init__(self, db_name=database_name):
        """Initialize the database connection."""
        self.client = None
        try:
            self.client = MongoClient(URI, server_api=ServerApi('1'))
            # Ping the server to confirm a successful connection
            self.client.admin.command('ping')
            print(f"Pinged your deployment. You successfully connected to MongoDB database: '{db_name}'!")
            self.db = self.client[db_name]
        except errors.ConnectionFailure as e:
            print(f"Could not connect to MongoDB: {e}")
            self.client = None
            raise
        except Exception as e:
            print(f"An error occurred during database initialization: {e}")
            self.client = None
            raise

    def insert_courses(self, course_prefix, json_file):
        """Insert course data from a JSON file into a collection named after the course_prefix."""
        if self.client is None or self.db is None: 
            print("Error: Database connection not established.")
            return

        # Determine the collection name based on the course prefix (e.g., "CSE", "ME")
        collection_name = course_prefix.upper()
        target_collection = self.db[collection_name]

        print(f"Attempting to insert data into collection: '{collection_name}' in database '{self.db.name}'")

        courses_to_insert = []
        try:
            with open(json_file, "r", encoding="utf-8") as file:
                data = json.load(file)
                for course in data:
                    course.pop("_id", None)

                    # Defualt values (not sure if ill use later)
                    course.setdefault("x", 0)
                    course.setdefault("y", 0)

                    # Add the course prefix to the course name if 'name' exists
                    if 'name' in course and course['name'] != "N/A":
                        course_number = str(course['name'])
                        course["name"] = f"{collection_name} {course_number}"
                    else:
                        print(f"Warning: Course data missing 'name' or name is N/A: {course}")
                        continue

                    # Ensure credits is a number, default to 0 if not parseable
                    if 'credits' in course:
                        try:
                            credits_num = float(course['credits'])
                            course['credits'] = int(credits_num) if credits_num.is_integer() else credits_num
                        except (ValueError, TypeError):
                            print(f"Warning: Could not parse credits '{course['credits']}' for {course.get('name', 'Unknown')}. Setting to 0.")
                            course['credits'] = 0
                    else:
                        print(f"Warning: Course data missing 'credits' field for {course.get('name', 'Unknown')}. Setting to 0.")
                        course['credits'] = 0

                    courses_to_insert.append(course)

            if courses_to_insert:
                try:
                    target_collection.insert_many(courses_to_insert, ordered=False)
                    print(f"Successfully attempted insertion of {len(courses_to_insert)} courses into collection '{collection_name}'.")
                except errors.BulkWriteError as bwe:
                    print(f"Database Insert Error (Bulk) into '{collection_name}': {len(bwe.details.get('writeErrors', []))} documents failed.")
            else:
                print(f"No valid courses found in {json_file} to prepare for insertion into '{collection_name}'.")

        except FileNotFoundError:
            print(f"Error: JSON file not found at {json_file}")
        except json.JSONDecodeError as e:
            print(f"Error: Failed to parse JSON file {json_file} - {e}")
        except errors.PyMongoError as e:
            print(f"Database Error during insertion preparation or connection: {e}")
        except Exception as e:
            print(f"An unexpected error occurred during insertion processing: {e}")

    def close_connection(self):
        """Close the database connection."""
        if self.client:
            self.client.close()
            print("Database connection closed.")
