//create login page that has email and password and when you submit it will send a request to the backend to check if the email and password are correct and if they are correct it will redirect to the home page and if they are not correct it will show an error message
import { useState } from 'react';
import axios from 'axios';
import './login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
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
      const response = await axios.post('/api/auth/login', formData);
        console.log(response.data);
        // Handle successful login (e.g., redirect to home page)
    }
    catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      // Handle login error (e.g., display error message)
    }
    };

    return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>    
        <div>
          <label htmlFor="identifier">Email or Full Name:</label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;   