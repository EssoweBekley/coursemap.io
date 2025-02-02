import fs from "fs";
import path from "path";
import CourseFlow from "@/components/CourseFlow";

export default async function CoursePage({ params }) {
  const { major } = params;
  const filePath = path.join(process.cwd(), "data", `${major}.json`);

  let courseData = { major: "Unknown", courses: [] };

  try {
    const jsonData = await fs.promises.readFile(filePath, "utf8");
    courseData = JSON.parse(jsonData);
  } catch (error) {
    console.error("Error loading course data:", error);
  }

  return (
    <div>
      <h1>{courseData.major} Course Map</h1>
      <CourseFlow courses={courseData.courses} />
    </div>
  );
}
  