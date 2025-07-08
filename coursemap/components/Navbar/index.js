import Contact from "./contact";
import Home from "./home";

export default function Navbar() {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                    <Home />
                    <Contact />
            </div>
        </nav>
    );
}