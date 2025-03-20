require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Grid = require('gridfs-stream');

const mongoURI = "mongodb+srv://purvaborade8:RA5FMlWLK4wfAngV@cluster0.rii2m.mongodb.net/clg?retryWrites=true&w=majority&appName=Cluster0"
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
    uploadImages();
});

const imageFolder = path.join(__dirname, 'images'); // Folder where images are stored locally

async function uploadImages() {
    try {
        const files = fs.readdirSync(imageFolder);

        for (const file of files) {
            const filePath = path.join(imageFolder, file);
            const writeStream = gfs.createWriteStream({
                filename: file,
                bucketName: "uploads"
            });

            fs.createReadStream(filePath).pipe(writeStream);

            writeStream.on("close", (file) => {
                console.log(`✅ Uploaded: ${file.filename}`);
            });

            await new Promise(resolve => writeStream.on("finish", resolve));
        }

        console.log("🚀 All images uploaded successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error uploading images:", error);
        mongoose.connection.close();
    }
}
