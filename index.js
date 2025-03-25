require('dotenv').config(); // Load environment variables first

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const PORT = 3001;

// MongoDB Connection
const mongoURI = "mongodb+srv://purvaborade8:RA5FMlWLK4wfAngV@cluster0.rii2m.mongodb.net/clg?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// Middleware
app.use(cors()); // Enable CORS
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


// MongoDB Schema (Temporary, No Model Needed)
const ImageSchema = new mongoose.Schema({
    name: String,
    url: String,  // Store image URLs
    type: String  // Category: naac, republic-day, mvm, ncc
});
const Image = mongoose.model('Image', ImageSchema, 'clg.images'); // Use existing collection

// API to Get Images by Category
app.get('/api/images', async (req, res) => {
    try {
        // Detailed connection checking
        if (!mongoose.connection || mongoose.connection.readyState !== 1) {
            return res.status(500).json({ 
                error: "MongoDB not connected", 
                readyState: mongoose.connection ? mongoose.connection.readyState : "no connection" 
            });
        }
        
        const db = mongoose.connection.db;
        const galleries = await db.collection('galleries').find().toArray();
        console.log("Data retrieved:", galleries);
        res.json(galleries);
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ 
            error: "Failed to fetch images", 
            message: error.message,
            stack: error.stack 
        });
    }
});

// Serve Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'public', 'templates/gallery/gallery.html')));



app.get("/api/pages", (req, res) => {
    const editablePages = [
        { name: "Alumni Page", path: "/templates/alumni/alumni.html" },
        { name: "Principle Desk", path: "/templates/aboutus/principle.html" },
        { name: "Institute", path: "/templates/aboutus/institute.html" },
        { name: "Management", path: "/templates/aboutus/management.html" },
        { name: "Autonomy", path: "/templates/autonomy/autonomy.html" },
        { name: "Autonomy", path: "/templates/autonomy/autonomy.html" },
        { name: "Events", path: "/templates/events/event.html" },
        { name: "Composition", path: "/templates/iqac/composition.html" },
        { name: "Feedbacks", path: "/templates/iqac/feedback.html" },
        { name: "Meetings", path: "/templates/iqac/meeting.html" },
        { name: "Objective", path: "/templates/iqac/objective.html" },
        { name: "Library", path: "/templates/library/library.html" },
        { name: "NAAC", path: "/templates/naac/naac.html" },
        { name: "NEP", path: "/templates/nep/nep.html" },
        { name: "NAAC", path: "/templates/iqac/naac.html" },
        { name: "NIRF", path: "/templates/nirf/nirf.html" },
        { name: "Research", path: "/templates/researcj/researcj.html" },
        { name: "Scholarship", path: "/templates/sholarship/scholar.html" },


        // Add more pages here as you create them
        // Example: { name: "Home Page", path: "/templates/home/home.html" }
    ];
    
    res.json(editablePages);
});

// Route to save page content
app.post("/api/save", async (req, res) => {
    try {
        const { path: pagePath, content } = req.body;

        // Validate input
        if (!pagePath || !content) {
            return res.status(400).json({ 
                message: "Page path and content are required" 
            });
        }

        // Construct full file path (ensure it's within public directory)
        const fullPath = path.join(__dirname, 'public', pagePath);

        // Ensure directory exists
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        // Write file
        await fs.writeFile(fullPath, content, 'utf8');

        res.json({ 
            message: "Page saved successfully",
            path: pagePath 
        });

    } catch (error) {
        console.error("Save error:", error);
        res.status(500).json({ 
            message: "Error saving page", 
            error: error.message 
        });
    }
});

// Admin page route
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
