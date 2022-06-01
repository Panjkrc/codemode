const passport = require("passport");
const { generateHash, checkUser } = require("@/helpers/security");
const User = require("@/database/models/user");
const { requireAuthenticated } = require("@/helpers/auth");
const { v4: uuidv4 } = require("uuid");
const InviteLink = require("@/database/models/invite_link");
const Mongoose = require("mongoose");
const Company = require("@/database/models/company.js");
const Comment = require("@/database/models/comment.js");
const Idea = require("@/database/models/idea.js");

module.exports = (router) => {
	router.post(
		"/account/change-password",
		requireAuthenticated,
		async (req, res) => {
			const { oldPass, newPass1, newPass2 } = req.body;
			if (!oldPass || !newPass1 || !newPass2) {
				return res
					.status(401)
					.send(JSON.stringify({ message: "you_didnt_fill_all_fields" }));
			}
			if (newPass1 !== newPass2) {
				return res
					.status(401)
					.send(JSON.stringify({ message: "passwords_dont_match" }));
			}

			if (newPass1.length < 6) {
				return res.status(401).send(
					JSON.stringify({
						message: "password_must_be_at_least_6_chars_long",
					})
				);
			}
			if (newPass1.length > 128) {
				return res.status(401).send(
					JSON.stringify({
						message: "password_must_be_shorter_than_128_chars",
					})
				);
			}

			let user = await User.findOne({
				email: Mongoose.sanitizeFilter(req.user.email),
			}).exec();
			if (!user)
				return res.status(500).send({ message: "password_change_fail" });

			try {
				let match = await checkUser(oldPass, req.user.password);
				if (!match)
					return res.status(401).send({ message: "old_password_wrong" });
			} catch (error) {
				console.log(error);
				return res.status(500).send({ message: "password_change_fail" });
			}

			try {
				let hash = await generateHash(newPass1);
				user.password = hash;
				await user.save();
				return res.send({ message: "password_change_sucess" });
			} catch (error) {
				console.log(error);
				return res.status(500).send({ message: "password_change_fail" });
			}
		}
	);

	router.post(
		"/account/change-email",
		requireAuthenticated,
		async (req, res) => {
			const { newEmail } = req.body;
			if (!newEmail) {
				return res
					.status(401)
					.send(JSON.stringify({ message: "you_didnt_fill_all_fields" }));
			}

			try {
				let user = await User.findOne({
					email: Mongoose.sanitizeFilter(req.user.email),
				}).exec();
				if (!user)
					return res.status(401).send({ message: "email_change_fail" });
				user.email = newEmail;
				await user.save();
				return res.send({ message: "email_change_sucess", email: newEmail });
			} catch (error) {
				console.log(error);
				return res.status(500).send({ message: "something_went_wrong" });
			}
		}
	);

	router.post(
		"/account/change-username",
		requireAuthenticated,
		async (req, res) => {
			const { newUsername } = req.body;
			if (!newUsername) {
				return res
					.status(401)
					.send(JSON.stringify({ message: "you_didnt_fill_all_fields" }));
			}

			try {
				let user = await User.findOne({
					email: Mongoose.sanitizeFilter(req.user.email),
				}).exec();
				if (!user)
					return res.status(401).send({ message: "username_change_fail" });
				user.username = newUsername;
				await user.save();
				return res.send({
					message: "username_change_sucess",
					username: newUsername,
				});
			} catch (error) {
				console.log(error);
				return res.status(500).send({ message: "something_went_wrong" });
			}
		}
	);

	router.get("/invite-link", async (req, res) => {
		let inviteLink = new InviteLink({ id: uuidv4() });
		await inviteLink.save();
		return res.send({ inviteLink: { id: inviteLink.id, _id: inviteLink._id } });
	});

	router.post("/check-invite", async (req, res, next) => {
		const { id } = req.body;
		let inviteLink = await InviteLink.findOne({ id });
		let company = await Company.findById(inviteLink.company_id).select(
			"name _id"
		);
		if (!inviteLink) return next({ message: "invite_not_found" });
		if ((inviteLink.usages >= inviteLink.max_usages) && inviteLink.max_usages != -1) return next({ message: "Invite link is invalid", status: 500 });
		return res.send({ message: "invite_link_found", data: { company } });
	});

	router.get('/user', requireAuthenticated, async (req, res, next) => {
		const id = req.query.id;


		try {
			let user = await User.findOne({ 'account.company_id': req.user.account.company_id, _id: id }).select('-password');
			if (!user) next({ status: 404, message: 'User with that ID does not exist' });

			let post_count = await Idea.find({ created_by: id }).countDocuments();
			let comment_count = await Comment.find({ created_by: id }).countDocuments();

			user.post_count = post_count;
			user.comment_count = comment_count;

			res.status(200).send({
				user
			});

		} catch (error) {
			console.log(error);
			return res.status(500).send({ message: error });
		}
	});


	return router;
};
