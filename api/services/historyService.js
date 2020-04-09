const { model: History } = require("../models/historyModel");

exports.saveHistory = async (history) => {
  try {
    const newHistory = new History(history);
    return await newHistory.save();
  } catch (e) {
    throw e;
  }
};

exports.bulkCreate = async (historyArr) => {
  try {
    return await History.insertMany(historyArr);
  } catch (e) {
    throw e;
  }
};
