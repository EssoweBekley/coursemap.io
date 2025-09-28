import { useState, useEffect } from "react";
import { useRouter } from "next/router";

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
        <form className="mt-4">
            <div className="mb-3">
                <label className="form-label fw-bold">Select Your School:</label>
                <select
                    onChange={handleSchoolSelect}
                    value={selectedSchool}
                    className="form-select"
                >
                    <option value="" disabled>Select a school</option>
                    {Array.isArray(schools) && schools.map((school) => (
                        <option key={school.school} value={school.school}>
                            {school.school}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Select Your Major:</label>
                <select
                    onChange={handleMajorSelect}
                    value={selectedMajor}
                    className="form-select"
                    disabled={!selectedSchool}
                >
                    <option value="" disabled>Select a major</option>
                    {majors.map((major) => (
                        <option key={major} value={major}>
                            {major}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-lg btn-light w-100"
                disabled={!selectedSchool || !selectedMajor}
            >
                Submit
            </button>
        </form>
    );
}
