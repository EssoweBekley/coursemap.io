import About from "./about";
import Home from "./home";

export default function Navbar() {
    return (
        <nav className="navbar mb-4 shadow-sm px-3 border-bottom">
            <div className="container-fluid">
                <Home className="nav-link active" />
                <About className="nav-link" />
            </div>
        </nav>
    );
}