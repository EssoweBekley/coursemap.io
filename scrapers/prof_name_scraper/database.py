from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId  # Import ObjectId for type checking
from dotenv import load_dotenv
import os

load_dotenv()
URI = os.getenv("MONGODB_URI")
if not URI:
    raise ValueError("MONGODB_URI environment variable not set.")

class Database:
    def __init__(self, db_name, collection_name):
        self.client = MongoClient(URI, server_api=ServerApi('1'))
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]

    def insert_professor(self, professor_data):
        """Insert professor data and return the string ID instead of ObjectId."""
        try:
            result = self.collection.insert_one(professor_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Database Insert Error: {e}")
            return None

    def find_professor(self, name, school_name):
        """Find professor by name and school, and convert _id to a string for JSON compatibility."""
        try:
            professor = self.collection.find_one({"name": name, "school": school_name})
            if professor:
                professor["_id"] = str(professor["_id"])
            return professor
        except Exception as e:
            print(f"Database Find Error: {e}")
            return None
    
    def find_class(self, course_name):
        """Find class by name and convert _id to a string for JSON compatibility."""
        try:
            class_data = self.collection.find_one({"name": course_name})
            if class_data:
                class_data["_id"] = str(class_data["_id"])
            return class_data
        except Exception as e:
            print(f"Database Find Error: {e}")
            return None