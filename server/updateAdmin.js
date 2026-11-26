require("dotenv").config();

const { MongoClient } = require("mongodb");

const client = new MongoClient(
  process.env.MONGODB_URI
);

async function updateAdmin() {

  try {

    await client.connect();

    console.log("MongoDB connected");

    const db = client.db("12street");

    const adminsCollection =
      db.collection("admins");

    const result =
      await adminsCollection.updateOne(
        { username: "admin" },
        {
          $set: {
            email: "admin@12streetproperty.com"
          },
          $unset: {
            username: ""
          }
        }
      );

    console.log(
      "Admin updated:",
      result.modifiedCount
    );

  } catch (error) {

    console.log(
      "Error updating admin:",
      error
    );

  } finally {

    await client.close();

  }
}

updateAdmin();