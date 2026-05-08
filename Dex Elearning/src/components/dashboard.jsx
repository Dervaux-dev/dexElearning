import  { useState, useEffect } from 'react';
import axios from 'axios';
import './dashboard.css';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [progress, setProgress] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/api/auth/profile');
                // Adjusting based on your state mapping
                const user = response.data.data.user;
                setUserData(user);
                setEnrolledCourses(user.enrolledCourses || []);
                setProgress(user.progress || []);
            } catch (error) {
                console.error('Error fetching user data:', error.response ? error.response.data : error.message);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>

            {userData && (
                <section className="user-info">
                    <h2>Welcome, {userData.name}</h2>
                    <p>Email: {userData.email}</p>
                </section>
            )}

            <hr />

            <section className="enrolled-courses">
                <h3>Enrolled Courses</h3>
                {enrolledCourses.length > 0 ? (
                    <ul>
                        {enrolledCourses.map((course) => (
                            <li key={course.id}>{course.title}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No courses enrolled yet.</p>
                )}
            </section>

            <hr />

            <section>
                <h3>Your Progress</h3>
                {/* This section uses the 'progress' variable, resolving the ESLint error */}
                {progress.length > 0 ? (
                    progress.map((item, index) => (
                        <div key={index} style={{ marginBottom: '10px' }}>
                            <span>{item.courseName}</span>
                            <div style={{ background: '#eee', width: '100%', height: '10px' }}>
                                <div style={{ 
                                    background: 'green', 
                                    width: `${item.percentage}%`, 
                                    height: '100%' 
                                }}></div>
                            </div>
                            <span>{item.percentage}% Complete</span>
                        </div>
                    ))
                ) : (
                    <p>No progress data found.</p>
                )}
            </section>
        </div>
    );
};

export default Dashboard;