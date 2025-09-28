import clientPromise from "@/backend/lib/mongodb";

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db("University_of_Connecticut"); // or use process.env.UCONN_DB_NAME

        const collections = await db.listCollections().toArray();

        const result = [];

        for (const col of collections) {
            if (col.name === "professors") continue; // Ignore professors collection
            
            const collection = db.collection(col.name);
            const courses = await collection.find({}, { projection: { _id: 1, name: 1, title: 1 } }).toArray();

            result.push({
                prefix: col.name,
                courses: courses.map(c => ({
                    _id: c._id,
                    name: c.name,
                    title: c.title,
                })),
            });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching prefixes and courses:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
