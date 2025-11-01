import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Endpoint to fetch API data
app.get('/fetch-banana-api', async (req, res) => {
    try {
        const apiUrl = 'https://marcconrad.com/uob/banana/api.php?out=json&base64=no';
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Send back the parsed response
        res.json({
            question: data.question,
            solution: data.solution
        });
    } catch (error) {
        console.error('Error fetching API:', error);
        res.status(500).json({ error: 'Failed to fetch API data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});