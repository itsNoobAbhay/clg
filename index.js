require('dotenv').config(); // Load environment variables first

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

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
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection not established");
        }
        
        const collection = db.collection('galleries');
        if (!collection) {
            throw new Error("Collection not found");
        }
        
        const galleries = await collection.find().toArray();
        console.log("Galleries data:", galleries);
        
        if (!galleries || !Array.isArray(galleries)) {
            return res.json([]);  // Return empty array instead of null/undefined
        }
        
        res.json(galleries);
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ error: "Failed to fetch images", message: error.message });
    }
});

// Serve Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'public', 'templates/gallery/gallery.html')));

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
