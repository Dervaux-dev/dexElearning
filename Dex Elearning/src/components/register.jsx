//import to create register form
import  { useState } from 'react';
import axios from 'axios';
import './register.css';


const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: ''
  });

    const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/register', formData);
      console.log(response.data);
      // Handle successful registration (e.g., redirect to login page)
    }
    catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      // Handle registration error (e.g., display error message)
    }
    };

    return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullname">Full Name:</label>
          <input
            type="text"
            id="fullname"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            required
            />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
            <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                />
        </div>
        <div>
            <label htmlFor="password">Password:</label>
            <input
                type="password"
                id="password"   
                name="password" 
                value={formData.password}
                onChange={handleChange}
                required
                />
        </div>
        <p>if you already has account </p>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
