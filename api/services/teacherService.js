const { model: Teacher } = require("../models/teacherModel");

exports.bulkAdd = async arr => {
  try {
    return await Teacher.insertMany(arr);
  } catch (e) {
    throw e;
  }
};

exports.getAllTeachers = async () => {
  try {
    return await Teacher.find({});
  } catch (e) {
    throw e;
  }
};
