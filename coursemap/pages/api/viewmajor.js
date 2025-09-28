import clientPromise from "@/backend/lib/mongodb";

export default async function handler(req, res) {
    try {
        const { school, major } = req.query; // Get parameters from URL

        if (!school || !major) {
            return res.status(400).json({ error: "Missing school or major parameter" });
        }

        const client = await clientPromise;
        const db = client.db(school); // select the school database
        console.log(major)
        const collection = db.collection(major); // select the major collection

        const courses = await collection.find({}).toArray(); // Fetch courses from the major collection

        // Gather all prereq IDs from all courses
        const prereqIds = new Set();
        courses.forEach(course => {
            if (course.prereqs && Array.isArray(course.prereqs)) {
                course.prereqs.forEach(prereq => prereqIds.add(prereq));
            }
        });

        // Find which prereqs are missing from the current major
        const courseIds = new Set(courses.map(c => c._id));
        const missingPrereqs = Array.from(prereqIds).filter(id => !courseIds.has(id));

        // Search other collections for missing prereqs
        let extraCourses = [];
        if (missingPrereqs.length > 0) {
            const collections = await db.listCollections().toArray();
            for (const col of collections) {
                if (col.name === major) continue; // skip current major
                const otherCollection = db.collection(col.name);
                const found = await otherCollection.find({ _id: { $in: missingPrereqs } }).toArray();
                extraCourses = extraCourses.concat(found);
            }
        }

        // Return all courses, including extra prereqs from other collections
        res.status(200).json([...courses, ...extraCourses]);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
