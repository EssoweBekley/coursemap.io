import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MajorSelector() {
    const router = useRouter();
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState("");
    const [majors, setMajors] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState("");

    useEffect(() => {
        const fetchSchools = async () => {
            try {
                const response = await fetch("/api/selector");
                const data = await response.json();
                setSchools(data);
            } catch (error) {
                console.error("Failed to fetch schools:", error);
            }
        };
        fetchSchools();
    }, []);

    const handleSchoolSelect = (event) => {
        const schoolName = event.target.value;
        setSelectedSchool(schoolName);

        // Find the corresponding majors and update state
        const school = schools.find(s => s.school === schoolName);
        setMajors(school ? school.majors : []);
    };

    const handleMajorSelect = (event) => {
        setSelectedMajor(event.target.value);
    };

    const handleSubmit = () => {
        if (selectedSchool && selectedMajor) {
            router.push(`/viewmajor/${selectedSchool}/${selectedMajor}`);
        }
    };

    return (
        <div className="flex flex-col items-center mt-8">
            <label className="text-lg font-semibold mb-2">Select Your School:</label>
            <select
                onChange={handleSchoolSelect}
                value={selectedSchool}
                className="p-2 border border-gray-300 rounded-md text-black mb-4"
            >
                <option value="" disabled>Select a school</option>
                {schools.map((school) => (
                    <option key={school.school} value={school.school}>
                        {school.school}
                    </option>
                ))}
            </select>

            <label className="text-lg font-semibold mb-2">Select Your Major:</label>
            <select
                onChange={handleMajorSelect}
                value={selectedMajor}
                className="p-2 border border-gray-300 rounded-md text-black mb-4"
                disabled={!selectedSchool} // Disable if no school is selected
            >
                <option value="" disabled>Select a major</option>
                {majors.map((major) => (
                    <option key={major} value={major}>
                        {major}
                    </option>
                ))}
            </select>

            <button
                onClick={handleSubmit}
                className="mt-4 p-2 bg-blue-500 text-white rounded-md"
                disabled={!selectedSchool || !selectedMajor} // Disable if selections are missing
            >
                Submit
            </button>
        </div>
    );
}
