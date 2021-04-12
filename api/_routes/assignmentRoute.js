const express = require("express");
const router = express.Router();
const axios = require("axios");
const historyService = require("../_services/historyService");
const middleWare = require("../_middleware");
const { applyMiddleware } = require("../_utils");

applyMiddleware(middleWare, router);

router.route("/").get(async (req, res) => {
	const { apiKey: access_token, course } = req.query;
	try {
		const results = await axios({
			method: "GET",
			url: `https://icademymiddleeast.instructure.com/api/v1/courses/${course}/assignments`,
			headers: {
				Accept: "application/json+canvas-string-ids"
			},
			params: {
				access_token,
				per_page: 100,
				include: ["overrides", "observed_users"],
				order_by: "position"
			}
		});
		const regex = /([A-Za-z\s])/;
		const assignments = [];
		const extraCredit = [];
		results.data.forEach(assignment => {
			const index = assignment.name.indexOf("Extra Credit");
			const index2 = assignment.name.indexOf("Bonus");
			if (
				!regex.test(assignment.name.charAt(0)) &&
				assignment.published === true &&
				index === -1 &&
				index2 === -1
			) {
				assignments.push(assignment);
			}
			if (assignment.published === true && (index !== -1 || index2 !== -1)) {
				extraCredit.push(assignment);
			}
		});
		if (results.data.length === 100) {
			let currentPage = 2;
			async function apiPagination() {
				const assignmentRes = await axios({
					method: "GET",
					url: `https://icademymiddleeast.instructure.com/api/v1/courses/${course}/assignments`,
					headers: {
						Accept: "application/json+canvas-string-ids"
					},
					params: {
						access_token,
						per_page: 100,
						include: ["overrides", "observed_users"],
						order_by: "position",
						page: currentPage
					}
				});
				assignmentRes.data.forEach(assignment => {
					const index =
						assignment.name.indexOf("Extra Credit") ||
						assignment.name.indexOf("Bonus");
					if (
						!regex.test(assignment.name.charAt(0)) &&
						assignment.published === true &&
						index === -1
					) {
						assignments.push(assignment);
					}
					if (assignment.published === true && index !== -1) {
						extraCredit.push(assignment);
					}
				});
				if (assignmentRes.data.length === 100) {
					currentPage += 1;
					await apiPagination();
				}
			}
			await apiPagination();
		}

		assignments.sort((x, y) => x.name.localeCompare(y.name));
		res.status(200).json({
			assignments,
			extraCredit
		});
	} catch (e) {
		res.status(400).send(e);
	}
});

// Update assignment dates
router.route("/").put(async (req, res) => {
	const {
		apiKey: access_token,
		assignment,
		course,
		teacher,
		user,
		courseName
	} = req.body.data;
	try {
		const result = await axios({
			method: "PUT",
			url: `https://icademymiddleeast.instructure.com/api/v1/courses/${course}/assignments/${assignment.id}`,
			params: {
				access_token
			},
			data: {
				assignment: {
					due_at: assignment.due_at,
					lock_at: assignment.lock_at,
					unlock_at: assignment.unlock_at
				}
			}
		});
		const assignHistory = {
			date: Date.now(),
			user,
			course,
			courseName,
			teacher,
			assignment: assignment.id,
			assignmentName: assignment.name,
			editType: "Dates",
			oldUnlock: assignment.old_unlock_at,
			oldDue: assignment.old_due_at,
			oldLock: assignment.old_lock_at,
			newUnlock: assignment.unlock_at,
			newDue: assignment.due_at,
			newLock: assignment.lock_at
		};
		const tracker = await historyService.saveHistory(assignHistory);

		res.status(201).json({
			data: {
				tracker
			}
		});
	} catch (e) {
		res.status(401).send(e);
		console.error(e);
	}
});

// Add extension for students
router.route("/").post(async (req, res) => {
	const {
		apiKey: access_token,
		course,
		assignment,
		students,
		extension,
		user,
		teacher,
		courseName,
		extensionStart: unlock_at
	} = req.body.data;
	const title = `Course Extension Date - ${Date.now()}`;
	const studentInts = [];
	students.forEach(student => {
		const intId = parseInt(student);
		studentInts.push(intId);
	});
	try {
		const apiResults = await axios({
			method: "POST",
			url: `https://icademymiddleeast.instructure.com/api/v1/courses/${course}/assignments/${assignment.id}/overrides`,
			params: {
				access_token
			},
			data: {
				assignment_override: {
					student_ids: students,
					title,
					due_at: extension,
					lock_at: extension,
					unlock_at
				}
			}
		});
		const overrideHistory = {
			date: Date.now(),
			user,
			course,
			courseName,
			teacher,
			assignment: assignment.id,
			assignmentName: assignment.name,
			editType: "Extension",
			overrideNumber: apiResults.id,
			studentIds: studentInts,
			extensionDate: extension,
			extensionUnlockDate: unlock_at
		};
		const tracker = await historyService.saveHistory(overrideHistory);
		res.status(201).json({
			data: {
				tracker
			}
		});
	} catch (e) {
		res.status(401).send(e);
		console.log(e);
	}
});

exports.router = router;
