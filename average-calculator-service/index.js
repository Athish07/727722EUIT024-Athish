const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port =9876;
const windowSize = 10;
let numbers = []; 

const ACCESS_TOKEN = process.env.ACCESS_TOKEN; 

app.get('/numbers/:numberid', async (req, res) => {
  const numberid = req.params.numberid;
  let apiUrl;


  switch (numberid) {
    case 'f':
      apiUrl = 'http://20.244.56.144/test/fibo';
      break;
    case 'r':
      apiUrl = 'http://20.244.56.144/test/rand';
      break;    
    default:
      return res.status(400).send({ error: 'Invalid number ID' });
  }

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      timeout: 500,
    });

    const newNumbers = response.data.numbers;

    if (!Array.isArray(newNumbers)) {
      return res.status(500).send({ error: 'Invalid response from the third-party API' });
    }

    const windowPrevState = [...numbers];
    numbers = numbers.concat(newNumbers).slice(-windowSize);
    const windowCurrState = [...numbers];
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const avg = numbers.length > 0 ? (sum / numbers.length).toFixed(2) : 0;

    const formattedResponse = {
      result: {
        windowPrevState,
        windowCurrState,
        numbers: newNumbers,
        avg: parseFloat(avg),
      },
    };

    res.send(formattedResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to fetch numbers from the third-party API' });
  }
});

// app.listen(port, () => {
//   console.log(`Average Calculator Microservice listening at http://localhost:${port}`);
// });
