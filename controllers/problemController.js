const Problem = require('../models/problem');

exports.createProblem = async (req, res) => {
    try {
        const { title, description } = req.body;
        const image = req.file ? req.file.filename : null;

        const problem = await Problem.create({
            title,
            description,
            image,
            createdBy: req.user.id
        });

        res.status(201).json(problem);
    } catch (err) {
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
