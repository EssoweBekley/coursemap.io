import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();

    return (
        <div className="nav-link" onClick={() => router.push("/")}>
            <h1>
                <a>CourseMap.io</a>
            </h1>
        </div>
    );
}