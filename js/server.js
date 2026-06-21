// server.js
require('dotenv').config(); // Loads the .env file
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Allow requests from your frontend
app.use(cors()); 

// Create an endpoint (a URL) for your frontend to call
app.get('/api/get-data', async (req, res) => {
    try {
        const apiKey = process.env.MY_SECRET_API_KEY;
        
        // 1. Check if the frontend sent a specific date
        const requestedDate = req.query.date; 
        
        // 2. Build the NASA URL. If there's a date, attach it. If not, just use the key.
        let targetApiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
        if (requestedDate) {
             targetApiUrl += `&date=${requestedDate}`;
        }
        
        const response = await fetch(targetApiUrl);
        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});