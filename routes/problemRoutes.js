// File: backend/routes/problemRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Problem = require('../models/problem');
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');

// Setup multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching problems' });
  }
});

// Create a new problem with image upload
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, date } = req.body;
    
    let imageData = {};
    
    if (req.file) {
      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        folder: 'community-reporter'
      });

      imageData = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    }

    const problem = new Problem({
      title,
      description,
      location,
      date,
      image: imageData
    });

    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    console.error('Error creating problem:', err);
    res.status(500).json({ message: 'Error creating problem' });
  }
});

// Vote on a problem
router.post('/:id/vote', protect, async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { $inc: { votes: 1 } },
      { new: true }
    );
    
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ success: true, votes: problem.votes });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ message: 'Error adding vote' });
  }
});

// Update problem status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ success: true, problem });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: 'Error updating status' });
  }
});

module.exports = router;
