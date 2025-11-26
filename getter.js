import express from 'express';
import cors from 'cors'; // Import the cors middleware
import { getUrls, unsafeNewUrl } from './proxyUtils.js';
import { run_proxy } from './Scramjet-App/src/index.js'

const app = express();
const PORT = 8080;

// ===============================================
// ROBUST CORS CONFIGURATION
// Allow all origins for all requests.
app.use(cors()); 

// ===============================================

app.get('/geturls', async (req, res) => {
    try {
        const urls = await getUrls(5000);
        console.log(urls);
        // Ensure you always return the result, even if it's an empty array
        res.json(urls || []);
    } catch (error) {
        // Log the error for server-side debugging
        console.error("Error in /geturls:", error);
        // Return a 500 status to the client
        res.status(500).send("Error fetching URLs");
    }
});

app.get('/bad/:url', async (req, res) => {
    try {
        const encodedUrl = req.params.url;
        console.log(encodedUrl)
        const urls = await getUrls(5000); 
        console.log("Original URLs array:", urls);
        const urlIndex = urls.indexOf(encodedUrl);
        if (urlIndex > -1) {
            urls.splice(urlIndex, 1);
            const newUnsafeUrls = await unsafeNewUrl(5000, 1);
            urls.push(newUnsafeUrls.urls[0]);
        }
        console.log("Modified URLs array:", urls);
        res.json(urls);
    } catch (error) {
        console.error("Error in /bad/:url:", error);
        res.status(500).send("Error processing bad URL");
    }
});

app.get('/', (req, res) => {
    res.send('yo');
});

function startServer() {
    app.listen(PORT, () => {
        console.log(`Express server is running on http://localhost:${PORT}`);
        run_proxy();
        console.log("Express start");
    });
}

startServer();

process.on('SIGINT', () => {
    console.log("\n tunnels will be disconnected. Express server is also shutting down.");
    process.exit(0);
});