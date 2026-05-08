//create home page that has course categories and featured courses and enroll button and when you don't have account it will show you the login and register button
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Dex Elearning</h1>
      <p>Explore our course categories and featured courses.</p>
        <div className="course-categories">
            <h2>Course Categories</h2>
            <ul>
                <li>Programming</li>
                <li>Data Science</li>
                <li>Design</li>
                <li>Marketing</li>
            </ul>
        </div>
        <div className="featured-courses">
            <h2>Featured Courses</h2>
            <ul>
                <li>React for Beginners</li>
                <li>Python Data Analysis</li>
                <li>UI/UX Design Principles</li>
                <li>Digital Marketing 101</li>
            </ul>
        </div>
        <div className="enroll-section">
            <h2>Ready to start learning?</h2>
            <p>Enroll in our courses today!</p>
            <Link to="/register" className="enroll-button">Register</Link>
            <Link to="/login" className="enroll-button">Login</Link>
        </div>
    </div>
  );
};

export default Home;