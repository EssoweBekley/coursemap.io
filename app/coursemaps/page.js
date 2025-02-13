import MajorSelector from "@/components/MajorSelector";

export default function Courses() {

  // This is the

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



      <h1>Choose Your Major</h1>
      <MajorSelector />
    </div>
  );
}