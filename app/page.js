export default function Home() {
  return (
    <main>
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
      
      <section className="text-center mt-8">


        <h1 className="text-2xl font-bold">Welcome to Course Map</h1>
        <p className="mt-2">Navigate via the taskbar to see the course flowcharts.</p>
        <p className="mt-2">This is a work in progress!</p>
      </section>
    </main>
  );
}
