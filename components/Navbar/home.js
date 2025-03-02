import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();

    return (
        <div onClick={() => router.push("/")}>
            <h1>
                <a className="text-white text-lg font-bold">coursemap.io</a>
            </h1>
        </div>
    );
}