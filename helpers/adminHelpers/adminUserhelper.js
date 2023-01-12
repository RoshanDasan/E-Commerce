const user = require("../../models/connection");
const multer = require("multer");
const { response } = require("../../app");

module.exports = {
  //get user
  getUsers: () => {
    return new Promise(async (resolve, reject) => {
      let userDatas = [];
      await user.user
        .find()
        .exec()
        .then((result) => {
          userDatas = result;
        });
      resolve(userDatas);
    });
  },
  //un block user
  UnblockUser: (userID) => {
    return new Promise(async (resolve, reject) => {
      await user.user
        .updateOne({ _id: userID }, { $set: { blocked: false } })
        .then((data) => {
          resolve();
        });
    });
  },
  //    blockuser

  blockUser: (userID) => {
    return new Promise(async (resolve, reject) => {
      await user.user
        .updateOne({ _id: userID }, { $set: { blocked: true } })
        .then((data) => {
          resolve();
        });
    });
  },
};
