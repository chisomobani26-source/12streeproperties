require("dotenv").config();

const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

async function createAdmin() {
  try {
    await client.connect();

    console.log("MongoDB connected");

    const db = client.db("12street");

    const adminsCollection = db.collection("admins");

    // Admin details
    const email = "admin@12streetproperty.com";
    const password = "admin123";

    // Check if admin already exists
    const existingAdmin =
    await adminsCollection.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    // Hash the password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    // Save admin
    await adminsCollection.insertOne({
        email,
        password: hashedPassword
    });

    console.log("Admin created successfully");

  } catch (error) {

    console.log("Error creating admin:", error);

  } finally {

    await client.close();

  }
}

createAdmin();