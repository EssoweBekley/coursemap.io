import Navbar from "@/components/Navbar";
import MajorSelector from "@/components/Selector";

export default function Page() {
    return (

        // NavBar import
        <div>
            <Navbar />
            <h1 className="text-bold text-white-1000 text-2xl">
                Welcome to CourseMap.io!
            </h1>
            <MajorSelector />
        </div>
    )
}