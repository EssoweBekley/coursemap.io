import MajorSelector from "@/components/MajorSelector";
import NavBar from "@/components/NavBar";

export default function Courses() {

  // This is the coursemap page for this app

  return (

    <div>
      <NavBar />
      <section className="text-center mt-8">
        <h1 className="text-2xl font-bold">Choose Your School!</h1>
      </section>
      <MajorSelector />
    </div>
  );
}