import Navbar from "@/components/Navbar";
import MajorSelector from "@/components/Selector";
import { useRouter } from 'next/router';

export default function Page() {
    const router = useRouter();

    const handleCreate = () => {
        router.push('/createmap');
    }
    return (

        // NavBar import
        <div>
            <Navbar />
            <h1 className="text-bold text-white-1000 text-2xl">
                Welcome to CourseMap.io!
            </h1>
            <MajorSelector />
            <button onClick={handleCreate}> Create your own CourseMap</button>
        </div>
    )
}