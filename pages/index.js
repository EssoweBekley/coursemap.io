import Navbar from "@/components/Navbar";
import MajorSelector from "@/components/Selector";
import IconSideNav from '@/components/Navbar/IconSideNav';

export default function Page() {
    return (

        // NavBar import
        <div>
            <IconSideNav/>
            <Navbar />
            <h1 className="text-bold text-white-1000 text-2xl">
                Welcome to CourseMap.io!
            </h1>
            <MajorSelector />
        </div>
    )
}