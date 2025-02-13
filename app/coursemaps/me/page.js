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

      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-white text-lg font-bold">coursemap.io</h1>
          <ul className="flex space-x-4">
            <li><a href="home" className="text-white hover:text-gray-300">Home</a></li>
            <li><a href="coursemaps" className="text-white hover:text-gray-300">CourseMaps</a></li>
            <li><a href="contact" className="text-white hover:text-gray-300">Contact</a></li>
            <li><a href="about" className="text-white hover:text-gray-300">About</a></li>
          </ul>
        </div>
      </nav>




      <h1>{courseData.major} Course Map</h1>
      <CourseFlow courses={courseData.courses} />
    </div>
  );
}
