"use strict";
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { model: User } = require("./userModel");
const { model: Teacher } = require("./teacherModel");

const historySchema = new Schema({
	date: {
		type: Date,
		required: true,
		default: Date.now()
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true
	},
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Teacher,
		required: true
	},
	course: {
		type: String,
		required: true
	},
	courseName: {
		type: String,
		required: true
	},
	assignment: {
		type: String,
		required: true
	},
	assignmentName: {
		type: String,
		required: true
	},
	editType: {
		type: String,
		enum: ["Dates", "Extension"],
		required: true
	},
	oldUnlock: {
		type: Date
	},
	oldDue: {
		type: Date
	},
	oldLock: {
		type: Date
	},
	newUnlock: {
		type: Date
	},
	newDue: {
		type: Date
	},
	newLock: {
		type: Date
	},
	overrideNumber: {
		type: String
	},
	students: {
		type: [String]
	},
	extensionDate: {
		type: Date
	},
	extensionUnlockDate: {
		type: Date
	}
});

exports.model = mongoose.model("History", historySchema);
