const Problem = require("@/database/models/problem.js");
const User = require("@/database/models/user.js");
const { requireAuthenticated, requireAdmin } = require("@/helpers/auth.js");
const Mongoose = require("mongoose");

module.exports = (router) => {
	router.post("/problem", requireAdmin, async (req, res) => {

		let user = await User.findOne({ _id: req.user._id });
		console.log("user", user);

		const { title, content, has_deadline, deadline, prize } = req.body.data;

		let problem = new Problem({
			title,
			content,
			has_deadline,
			deadline,
			prize,
			created_by: user._id,
			company: Mongoose.Types.ObjectId(user.account.company_id)

		});

		problem.save((err, problem) => {
			if (err) {
				res.status(500).json({
					success: false,
					message: "Error creating problem",
				});
			} else {
				res.send({
					success: true,
					message: "Problem created",
					data: problem,
				});
			}
		});
	});

	router.get("/problems", requireAuthenticated, async (req, res) => {
		let user = await User.findOne({ _id: req.user._id });

		let problems = await Problem.find({ company: Mongoose.Types.ObjectId(user.account.company_id) }).populate("created_by", "username", User);

		problems = problems.map((problem) => {
			if (problem.likes.includes(user._id)) {
				problem.liked = true;
			} else {
				problem.liked = false;
			}
			return problem;
		});


		res.send({
			success: true,
			data: problems,
		});
	});


	router.get("/problem", requireAuthenticated, async (req, res) => {

		const _id = req.query.id;
		let problem = await Problem.findOne({ _id: Mongoose.Types.ObjectId(_id) }).populate("created_by", "username", User);

		problem.liked = problem.likes.includes(req.user._id);

		res.send({
			success: true,
			problem
		});
	});

	router.post("/like-problem", requireAuthenticated, async (req, res) => {

		const { id: _id, state } = req.body;

		let problem = await Problem.findOne({ _id: Mongoose.Types.ObjectId(_id) });

		if (state == 1) {
			if (!problem.likes.includes(req.user._id)) {
				problem.likes.push(req.user._id);
			}
		} else {
			if (problem.likes.includes(req.user._id)) {
				problem.likes.splice(problem.likes.indexOf(req.user._id), 1);
			}
		}

		await problem.save();

		res.send({
			success: true,
			likes: problem.likes.length,
		});
	});

	return router;
};
