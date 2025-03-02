import clientPromise from "@/backend/lib/mongodb"; // Ensure the correct path

export default async function handler(req, res) {
    try {
        const { school, major } = req.query; // Get parameters from URL

        if (!school || !major) {
            return res.status(400).json({ error: "Missing school or major parameter" });
        }

        const client = await clientPromise;
        const db = client.db(school); // Dynamically select the school database
        const collection = db.collection(major); // Dynamically select the major collection

        const courses = await collection.find({}).toArray(); // Fetch courses from the major collection

        res.status(200).json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
