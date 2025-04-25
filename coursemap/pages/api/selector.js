import clientPromise from "@/backend/lib/mongodb"; // Ensure the correct path

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const adminDb = client.db().admin();

        const databases = await adminDb.listDatabases();

        let result = [];
        for (const db of databases.databases) {
            if (db.name === "admin" || db.name === "local") continue; // Ignore system DBs
            
            const database = client.db(db.name);
            const collections = await database.listCollections().toArray();

            result.push({
                school: db.name,
                majors: collections.map(col => col.name),
            });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching databases and collections:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}