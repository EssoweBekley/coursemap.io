import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from "@/components/Navbar";
import MajorSelector from "@/components/Selector/selector";
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();

    const handleCreate = () => {
        router.push('/createmap');
    }

    return (
        <div>
            <Navbar />
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card mb-4 shadow">
                            <div className="card-body text-center">
                                <h1 className="display-4 mb-3">Welcome to CourseMap.io!</h1>
                                <MajorSelector />
                                <button className="btn btn-lg btn-secondary mt-4" onClick={handleCreate}>
                                    Create your own CourseMap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
