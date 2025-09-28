import clientPromise from "@/backend/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    try {
        const { major, classCode } = req.query;

        if (!major ) {
            return res.status(400).json({ error: "Missing school or major parameter" });
        }
        
        const client = await clientPromise;

        console.log(major)
        console.log(classCode)

        const db = client.db("University_of_Connecticut");
        const collection = db.collection(major);
        // Find documents matching the classCode
        const courses = await collection.find({ name: classCode }).toArray();

        // Recursive function to gather all prereqs
        async function getAllPrereqs(initialCourses, db, major) {
            const allCoursesMap = new Map();
            const queue = [...initialCourses];
            const checkedIds = new Set(queue.map(c => c._id.toString()));
            const collections = await db.listCollections().toArray();

            while (queue.length > 0) {
                const course = queue.shift();
                allCoursesMap.set(course._id.toString(), course);
                if (course.prereqs && Array.isArray(course.prereqs)) {
                    // Convert prereq IDs to ObjectId
                    const prereqObjIds = course.prereqs.map(id => {
                        try {
                            return typeof id === 'string' ? new ObjectId(id) : id;
                        } catch {
                            return id;
                        }
                    });
                    // Find prereqs not already checked
                    const newIds = prereqObjIds.filter(id => !checkedIds.has(id.toString()));
                    if (newIds.length > 0) {
                        // Search all collections for these prereqs
                        for (const col of collections) {
                            const searchCollection = db.collection(col.name);
                            const found = await searchCollection.find({ _id: { $in: newIds } }).toArray();
                            for (const foundCourse of found) {
                                if (!checkedIds.has(foundCourse._id.toString())) {
                                    queue.push(foundCourse);
                                    checkedIds.add(foundCourse._id.toString());
                                }
                            }
                        }
                    }
                }
            }
            return Array.from(allCoursesMap.values());
        }

        // Get all courses recursively
        const allCourses = await getAllPrereqs(courses, db, major);
        // Separate requested and extra
        const requestedIds = new Set(courses.map(c => c._id.toString()));
        const extraCourses = allCourses.filter(c => !requestedIds.has(c._id.toString()));

        // Return both arrays for clarity
        res.status(200).json({
            requestedCourses: courses,
            extraPrereqs: extraCourses,
            allCourses: allCourses
        });

    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}