function addSampleData() {
    const User = require('./models/User');

    User.insertMany([
    {
      firstName: "Alice",
      lastName: "Santos",
      email: "alice.santos@dlsu.edu.ph",
      username: "alice",
      password: "alice123"
    },
    {
      firstName: "Bob",
      lastName: "Reyes",
      email: "bob.reyes@dlsu.edu.ph",
      username: "bob",
      password: "bob123"
    },
    {
      firstName: "Charlie",
      lastName: "Cruz",
      email: "charlie.cruz@dlsu.edu.ph",
      username: "charlie",
      password: "charlie123"
    },
    {
      firstName: "Diane",
      lastName: "Lopez",
      email: "diane.lopez@dlsu.edu.ph",
      username: "diane",
      password: "diane123"
    },
    {
      firstName: "Evan",
      lastName: "Tan",
      email: "evan.tan@dlsu.edu.ph",
      username: "evan",
      password: "evan123"
    },
    {
      firstName: "Admin",
      lastName: "Admin",
      email:"admin@dlsu.edu.ph",
      username: "Admin",
      password: "1234"
    }
    ]).then(function () {
        console.log("Data inserted")
    }).catch(function (error) {
        console.log(error) 
    })
}
module.exports = addSampleData;