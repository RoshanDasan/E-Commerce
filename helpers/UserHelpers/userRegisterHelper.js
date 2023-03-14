const user = require("../../models/connection");
const bcrypt = require("bcrypt");


module.exports = {
  //sign up
  doSignUp: (userData) => {
  
    return new Promise(async (resolve, reject) => {
      try {
        let email = userData.email;
        let existingUser = await user.user.findOne({ email });
        if(existingUser) {
           resolve({ status: false });
        } else {
          let hashedPassword = await bcrypt.hash(userData.password, 10);
          let data = new user.user({
            username: userData.username,
            Password: hashedPassword,
            email: userData.email,
            phonenumber: userData.phonenumber,
          });

          await data.save().then((data) => {
            resolve({ status: true });
          });
        }
      } catch (err) {
        throw err;
      }
    });
  },

  //login

  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let users = await user.user.findOne({ email: userData.email });
        if (users) {
          if (users.blocked == false) {
            await bcrypt
              .compare(userData.password, users.Password)
              .then((status) => {
                if (status) {
                  let userName = users.username;
                  let id = users._id;
                  // response.status
                  resolve({ response, loggedinstatus: true, userName, id });
                } else {
                  resolve({ loggedinstatus: false });
                }
              });
          } else {
            resolve({ blockedStatus: true });
          }
        } else {
          resolve({ loggedinstatus: false });
        }
      } catch (err) {
        console.log(err);
      }
    });
  },

  // get user details for otp login

  getUser:(number)=>
  {
    let response = {}
    return new Promise(async (resolve, reject) => {
      await user.user.findOne({phonenumber:number}).then((result)=>
      {
        if(result)
        {
          let userName = result.username
          let id = result._id
          resolve({ response, loggedinstatus: true, userName, id });
        }
      })
    })

  },

  // password update in forgett password
  doUpdatePassword: (body) => {
    return new Promise(async (resolve, reject) => {
      let users = await user.user.findOne({ email: body.email });

      if (users) {
        let hashedPassword = await bcrypt.hash(body.password, 10);

        await user.user
          .updateOne(
            { email: body.email },
            { $set: { Password: hashedPassword } }
          )
          .then((result) => {
            resolve({ update: true });
          });
      } else {
        resolve({ update: false });
      }
    });
  },

  //reset password

  verifyPassword: (userData, userId) => {
    return new Promise(async (resolve, reject) => {
      let users = await user.user.findOne({ _id: userId });
      await bcrypt
        .compare(userData.password, users.Password)
        .then(async (status) => {
          if (status) {
            let hashedPassword = await bcrypt.hash(userData.password2, 10);
            await user.user
              .updateOne(
                { _id: userId },
                {
                  $set: {
                    Password: hashedPassword,
                  },
                }
              )
              .then((response) => {
                resolve(response);
              });
          } else {
            resolve(false);
          }
        });
    });
  },

  // update phone number in profile page

  UpdateNumber: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      await user.user
        .updateOne(
          { _id: userId },
          {
            $set: { phonenumber: data.newNumber },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  // accessing user details
  getUserDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      await user.user.findById({ _id: userId }).then((user) => {
        resolve(user);
      });
    });
  },
};
