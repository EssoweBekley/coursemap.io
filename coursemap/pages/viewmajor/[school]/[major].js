import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CourseFlow from "@/components/Graph"; // Import the CourseFlow component

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
        <section className="text-center mt-8">
            <h1 className="text-2xl font-bold">{major} Courses at {school}</h1>
            
            {/* Render the course flow chart using CourseFlow component */}
            <CourseFlow courses={courses} />
        </section>
    );
}
