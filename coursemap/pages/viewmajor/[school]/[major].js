import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CourseFlow from "@/components/Graph"; // Import the CourseFlow component
import Navbar from "@/components/Navbar";

export default function ViewMajor() {
    const router = useRouter();
    const { school, major } = router.query; // Get school and major from URL

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!school || !major) return;

        const fetchCourses = async () => {
            try {
                // Fetch course data with prerequisites (updated API or query)
                const response = await fetch(`/api/viewmajor?school=${school}&major=${major}`);
                const data = await response.json();
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [school, major]);

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div>
                <Navbar />
                <h2 className="text-center">{major} Courses at {school}</h2>
            </div>
            <div className="border-success" style={{ flex: 1 }}>
                {/* Render the course flow chart using CourseFlow component */}
                <CourseFlow courses={courses} />
            </div>
            <div className="alert alert-warning mt-3" role="alert">
                <strong>Disclaimer:</strong> The course graph is not 100% accurate. Some prerequisites shown may be recommended rather than strictly required. Always consult your official degree plan and advisor.
            </div>
        </div>
    );
}
