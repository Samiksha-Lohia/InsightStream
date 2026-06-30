import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Document from './models/Document.js';
import connectDb from './config/db.js';

dotenv.config();

const inspect = async () => {
  await connectDb();
  
  const total = await Document.countDocuments();
  console.log(`Total documents in database: ${total}`);

  const documents = await Document.find().sort({ createdAt: -1 }).limit(10);
  documents.forEach((doc, idx) => {
    console.log(`\n--- Document [${idx + 1}] ---`);
    console.log(`ID: ${doc._id}`);
    console.log(`Status: ${doc.status}`);
    console.log(`Content Snippet: ${doc.content.slice(0, 100)}...`);
    console.log(`Has Insights: ${doc.insights ? 'YES' : 'NO'}`);
    if (doc.insights) {
      console.log(`Insights Snippet: ${doc.insights.slice(0, 100)}...`);
    }
  });

  await mongoose.disconnect();
  process.exit(0);
};

inspect();
