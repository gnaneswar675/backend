const Problem = require('../models/problem');
const cloudinary = require('../config/CloudinaryConfig');

exports.createProblem = async (req, res) => {
    try {
        const { title, description, location, date, imageUrl, imagePublicId } = req.body;

        const problem = await Problem.create({
            title,
            description,
            location,
            date,
            image: {
                url: imageUrl,
                public_id: imagePublicId
            },
            createdBy: req.user.id
        });

        res.status(201).json(problem);
    } catch (err) {
        console.error('Error creating problem:', err);
        res.status(500).json({ message: 'Error creating problem' });
    }
};

exports.getProblems = async (req, res) => {
    try {
        const problems = await Problem.find().populate('createdBy', 'username');
        res.json(problems);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching problems' });
    }
};

exports.voteProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        problem.votes += 1;
        await problem.save();

        res.json({ message: 'Vote added', votes: problem.votes });
    } catch (err) {
        res.status(500).json({ message: 'Error voting' });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const problem = await Problem.findById(req.params.id);

        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        problem.status = status;
        await problem.save();

        res.json({ message: 'Status updated successfully', problem });
    } catch (err) {
        res.status(500).json({ message: 'Error updating status' });
    }
};