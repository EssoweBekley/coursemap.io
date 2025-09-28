import { useRouter } from "next/router";

export default function About() {
    const router = useRouter()

    return (
        <div className="nav-link"onClick={() => router.push("/about")}>
            <h1 className="">
                <a>about</a>
            </h1>
        </div>
    );
}