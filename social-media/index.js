const express = require('express');
const axios = require('axios'); // Corrected import
require('dotenv').config();

const app = express();
const port = 9877;

const ACCESS_TOKEN = process.env.ACCESS_TOKEN; // Load token from .env file

// Endpoint for handling different social media data requests
app.get('/social/:type/:userid?', async (req, res) => {
  const { type, userid } = req.params; // Destructure 'type' and 'userid' if provided
  let apiUrl;

  // Define routes for different data types, including dynamic route for user posts
  switch (type) {
    case 'posts':
      apiUrl = userid
        ? `http://20.244.56.144/test/users/${userid}/posts` // User-specific posts
        : 'http://20.244.56.144/test/posts'; // All posts
      break;
    case 'comments':
      apiUrl = 'http://20.244.56.144/test/comments';
      break;
    case 'likes':
      apiUrl = 'http://20.244.56.144/test/likes';
      break;
    case 'shares':
      apiUrl = 'http://20.244.56.144/test/shares';
      break;
    case 'users': // New route for fetching users
      apiUrl = 'http://20.244.56.144/test/users';
      break;
    default:
      return res.status(400).send({ error: 'Invalid social media type' });
  }

  try {
    // Fetch data from the corresponding API with the Bearer token
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      timeout: 500, // Set a timeout to prevent long wait times
    });

    const socialData = response.data;

    // Check if the response contains valid data
    if (!socialData || typeof socialData !== 'object') {
      return res.status(500).send({ error: 'Invalid response from the social media API' });
    }

    // Handle 'users' or 'posts/:userid' differently
    if (type === 'users') {
      res.send({
        users: socialData.users,
        meta: {
          requestType: type,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      res.send({
        data: socialData,
        meta: {
          requestType: type,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error fetching social media data:', error.message || error);
    res.status(500).send({ error: 'Failed to fetch social media data from the third-party API' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Social Media Microservice listening at http://localhost:${port}`);
});
