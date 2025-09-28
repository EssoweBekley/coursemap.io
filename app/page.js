import NavBar from "@/components/NavBar";

export default function Home() {
  
  // This is the home page for this app
  
  return (
    <main>
      <NavBar />
      <section className="text-center mt-8">
        <h1 className="text-2xl font-bold">Welcome to Course Map</h1>
        <p className="mt-2">Navigate via the taskbar to see the course flowcharts.</p>
        <p className="mt-2">This is a work in progress!</p>
      </section>
    </main>
  );
}
