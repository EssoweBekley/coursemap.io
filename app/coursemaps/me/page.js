import fs from "fs";
import path from "path";
import CourseFlow from "@/components/CourseFlow";
import { fileURLToPath } from "url";

export default async function CoursePage() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  console.log("Current Directory:", __dirname);

  // Get the last directory name from __dirname
  const lastDir = path.basename(__dirname);

  // Construct the file path
  const filePath = path.join(process.cwd(), "data", `${lastDir}.json`);
  console.log("File Path:", filePath);

  let courseData = { major: "Unknown", courses: [] };

  // Check if file exists before trying to read it
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return (
      <div>
        <h1>Unknown Course Map</h1>
        <p>The requested course data could not be found.</p>
      </div>
    );
  }

  try {
    const jsonData = await fs.promises.readFile(filePath, "utf8");
    courseData = JSON.parse(jsonData);
    console.log("Successfully loaded course data:", courseData);
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
