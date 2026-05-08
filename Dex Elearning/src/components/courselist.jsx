//create course list page that fetches courses from the backend and displays them in a list with course title, description, and instructor name and when you click on a course it will take you to the course detail page
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './courselist.css';

const CourseList = () => {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('/api/courses');
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error.response ? error.response.data : error.message);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className="courselist-container">
            <h1>Course List</h1>
            {courses.length > 0 ? ( 
                <ul className="course-list">
                    {courses.map((course) => (
                        <li key={course.id} className="course-item">
                            <Link to={`/courses/${course.id}`} className="course-link"> 
                                <h2>{course.title}</h2>
                                <p>{course.description}</p>
                                <p>Instructor: {course.instructor.name}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-courses">No courses available.</p>
            )}  
        </div>
    );
};

export default CourseList;