//create coursedetail page that has course title, description, instructor name, and enroll button and when you click the enroll button it will send a request to the backend to enroll the user in the course
import {useState, useEffect} from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './coursedetail.css';

const CourseDetail = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`/api/courses/${id}`); 
                setCourse(response.data);
            } catch (error) {
                console.error('Error fetching course details:', error.response ? error.response.data : error.message);
            }
        };
        fetchCourse();
    }
    , [id]);

    const handleEnroll = async () => {
        try {
            await axios.post(`/api/courses/${id}/enroll`); 
            alert('Enrolled successfully!');
        } catch (error) {
            console.error('Error enrolling in course:', error.response ? error.response.data : error.message);
            alert('Failed to enroll in course.');
        }
    };

    if (!course) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="coursedetail-container">
            <h1>{course.title}</h1>
            <p className="description">{course.description}</p>
            <p className="instructor">Instructor: {course.instructor.name}</p>
            <button className="enroll-btn" onClick={handleEnroll}>Enroll</button>
        </div>
    );
};

export default CourseDetail;