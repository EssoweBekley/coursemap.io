import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState([]); // stores [{school, majors, classes}, ...]
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes");
        const data = await response.json();
        setData(data);

        // If you want to default select first major:
        if (data.length > 0 && data[0].majors.length > 0) {
          setSelectedMajor(data[0].majors[0]);
        }
      } catch (error) {
        console.error("Failed to fetch schools:", error);
      }
    };
    fetchClasses();
  }, []);

  // Find classes for the selected major:
  const getClassesForSelectedMajor = () => {
    for (const school of data) {
      if (school.majors.includes(selectedMajor)) {
        // Return classes for that major (assuming classes belong to school)
        return school.classes;
      }
    }
    return [];
  };

  const handleMajorSelection = (e) => {
    setSelectedMajor(e.target.value);
    setSelectedClass(""); // reset class when major changes
  };

  const handleClassSelection = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleAddCourse = () => {
    alert(`Add course: Major=${selectedMajor}, Class=${selectedClass}`);
  };

  const classesForMajor = getClassesForSelectedMajor();

  return (
    <div>
      <h1>Create Map</h1>

      <div>
        <label>
          Major:
          <select
            onChange={handleMajorSelection}
            value={selectedMajor}
            className="p-2 border border-gray-300 rounded-md text-black mb-4"
          >
            {data
              .flatMap((school) => school.majors)
              .map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div>
        <label>
          Class:
          <select
            onChange={handleClassSelection}
            value={selectedClass}
            className="p-2 border border-gray-300 rounded-md text-black mb-4"
          >
            <option value="" disabled>
              Select a class
            </option>
            {classesForMajor.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button onClick={handleAddCourse} disabled={!selectedMajor || !selectedClass}>
        Add Course
      </button>
    </div>
  );
}
