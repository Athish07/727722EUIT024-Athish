const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 9877;

const ACCESS_TOKEN = process.env.ACCESS_TOKEN; // Load token from .env file

// Endpoint for handling different social media data requests
app.get('/social/:type/:userid?/:postid?', async (req, res) => {
  const { type, userid, postid } = req.params;
  let apiUrl;

  // Define routes dynamically based on the provided type, user ID, or post ID
  switch (type) {
    case 'posts':
      apiUrl = userid
        ? `http://20.244.56.144/test/users/${userid}/posts`
        : 'http://20.244.56.144/test/posts';
      break;

    case 'comments':
      apiUrl = postid
        ? `http://20.244.56.144/test/posts/${postid}/comments`
        : 'http://20.244.56.144/test/comments'; // Optional handling of post-specific comments
      break;

    case 'likes':
      apiUrl = 'http://20.244.56.144/test/likes';
      break;

    case 'shares':
      apiUrl = 'http://20.244.56.144/test/shares';
      break;

    case 'users':
      apiUrl = 'http://20.244.56.144/test/users';
      break;

    default:
      return res.status(400).send({ error: 'Invalid social media type' });
  }

  try {
    // Fetch data from the API with Bearer token
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      timeout: 500,
    });

    const socialData = response.data;

    // Check if valid response data is returned
    if (!socialData || typeof socialData !== 'object') {
      return res.status(500).send({ error: 'Invalid response from the social media API' });
    }

    // Handle response formatting based on the requested type
    if (type === 'users') {
      res.send({
        users: socialData.users,
        meta: {
          requestType: type,
          timestamp: new Date().toISOString(),
        },
      });
    } else if (type === 'comments' && postid) {
      res.send({
        comments: socialData.comments,
        postId: postid,
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
