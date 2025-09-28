import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import Navbar from '@/components/Navbar';
import CourseFlow from "@/components/Graph";

export default function Page() {
  // Helper to get all prereq IDs recursively for a course
  const getAllPrereqIds = (course, allCoursesMap) => {
    const visited = new Set();
    const stack = [course];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || visited.has(current._id)) continue;
      visited.add(current._id);
      if (current.prereqs && Array.isArray(current.prereqs)) {
        current.prereqs.forEach(prereqId => {
          const prereqCourse = allCoursesMap.get(prereqId.toString());
          if (prereqCourse && !visited.has(prereqCourse._id)) {
            stack.push(prereqCourse);
          }
        });
      }
    }
    return visited;
  };

  // Remove course and its prereqs
  const handleRemoveCourse = (courseId) => {
    // Build a map for fast lookup
    const allCoursesMap = new Map(customCourses.map(c => [c._id.toString(), c]));
    const course = allCoursesMap.get(courseId);
    if (!course) return;
    const idsToRemove = getAllPrereqIds(course, allCoursesMap);
    setCustomCourses(prev => prev.filter(c => !idsToRemove.has(c._id.toString())));
  };
  const [data, setData] = useState([]); // stores [{school, majors, courses}, ...]
  const [selectedMajor, setSelectedMajor] = useState("");
  const selectedCourses = data.find(d => d.prefix === selectedMajor)?.courses || [];

  const [customCourses, setCustomCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // When major changes, auto-select first course
  useEffect(() => {
    if (selectedCourses.length > 0) {
      setSelectedCourseId(selectedCourses[0]._id);
    } else {
      setSelectedCourseId("");
    }
  }, [selectedMajor, data]);

  // Helper to avoid duplicate courses by _id
  const mergeCourses = (existing, incoming) => {
    const map = new Map(existing.map(c => [c._id, c]));
    incoming.forEach(c => map.set(c._id, c));
    return Array.from(map.values());
  };

  const handleAddCourse = async () => {
    const course = selectedCourses.find(c => c._id === selectedCourseId);
    if (course) {
      // Fetch full course + prereqs from new API
      try {
        const response = await fetch(`/api/getClass?major=${selectedMajor}&classCode=${course.name}`);
        const data = await response.json();
        const allCourses = data.allCourses || [];
        setCustomCourses(prev => mergeCourses(prev, allCourses));
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      }
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch("/api/classes");
        const data = await response.json();
        setData(data);
        if (data.length > 0) {
          setSelectedMajor(data[0].prefix);
        }
      } catch (error) {
        console.error("Failed to fetch schools:", error);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div>
      <Navbar />
      <h2 className="px-3 text-center">Create Your Custom Map</h2>
      <div className="row mt-4 px-3">
        <div className="col-md-4 px-3">
          <div>
            <label>
              Major:{" "}
              <select
                value={selectedMajor}
                onChange={e => setSelectedMajor(e.target.value)}
                className="form-select mb-2"
              >
                {data.map((d) => (
                  <option key={d.prefix} value={d.prefix}>
                    {d.prefix}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label>
              Class:{" "}
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="form-select mb-2"
              >
                {selectedCourses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} {course.title && `– ${course.title}`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="btn btn-primary mb-3" onClick={handleAddCourse}>Add Course</button>

          <h2>Added Courses:</h2>
          <div className="d-flex flex-column gap-2 overflow-auto" style={{maxHeight: '70vh'}}>
            {customCourses.map(c => (
              <div key={c._id} className="card text-center mb-2" style={{minWidth: '180px'}}>
                <div className="card-body p-2">
                  <span className="card-title fw-bold">{c.name}</span>
                  <div className="card-text small">{c.title && `– ${c.title}`}</div>
                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => handleRemoveCourse(c._id.toString())}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-8">
          <div className="width-100 height-6 border border-primary p-3">
            <h2>Map</h2>
            <CourseFlow courses={customCourses} />
          </div>
        </div>
      </div>
    <div className="alert alert-warning mt-3" role="alert">
      <strong>Disclaimer:</strong> The course graph is not 100% accurate. Some prerequisites shown may be recommended rather than strictly required. Always consult your official degree plan and advisor.
    </div>
    </div>
  );
}