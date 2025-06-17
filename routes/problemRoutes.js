// File: backend/routes/problemRoutes.js

const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinaryConfig');
const { protect } = require('../middleware/authMiddleware');
const Problem = require('../models/problem');

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    console.error('Error fetching problems:', err);
    res.status(500).json({ message: 'Server error while fetching problems' });
  }
});

// Create a new problem
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, date } = req.body;
    const imageData = req.file ? {
      url: req.file.path,
      public_id: req.file.filename
    } : null;

    const problem = new Problem({
      title,
      description,
      location,
      date,
      image: imageData,
      status: 'pending'
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
