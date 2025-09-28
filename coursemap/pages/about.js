import Navbar from "@/components/Navbar";

const About = () => {
    return (
        <div>
                <Navbar />
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh', padding: '2rem' }}>
                <div className="card shadow-lg p-4" style={{ maxWidth: '600px', width: '100%', background: 'rgba(255,255,255,0.85)' }}>
                    <h1 className="text-center mb-3">About CourseMap</h1>
                    <p className="lead text-center">CourseMap is a tool to help you visualize and plan your learning journey.</p>
                    <hr />
                    <p className="text-center">You can visualize a flowchart of certain course codes or departments, and even make your own course maps by mixing different courses to see prerequisites.</p>
                </div>
                <div className="text-muted mt-3 small text-center" style={{ maxWidth: '600px' }}>
                    <strong>Disclaimer:</strong> The course graph is not 100% accurate. Some prerequisites shown may be recommended rather than strictly required. Always consult your official degree plan and advisor.
                </div>
            </div>
        </div>
    );
};

export default About;