require("dotenv").config();

const dns = require("dns");

dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");


// ===============================
// CLOUDINARY
// ===============================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// ===============================
// MULTER
// ===============================

const upload = multer({
  storage: multer.memoryStorage()
});


// ===============================
// EXPRESS
// ===============================

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// MONGODB
// ===============================

const client = new MongoClient(
  process.env.MONGODB_URI
);

let propertiesCollection;
let adminsCollection;


// ===============================
// VERIFY ADMIN TOKEN
// ===============================

function verifyAdminToken(req, res, next) {

  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {

    return res.status(401).json({
      error: "Access denied. Please log in."
    });

  }

  const token =
    authHeader.split(" ")[1];

  try {

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.admin = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      error: "Invalid or expired token."
    });

  }

}



// ===============================
// CONNECT TO MONGODB
// ===============================

async function connectDB() {

  try {

    await client.connect();

    console.log(
      "MongoDB connected successfully"
    );

    const db =
      client.db("12street");

    propertiesCollection =
      db.collection("properties");

    adminsCollection =
      db.collection("admins");


    // ===============================
    // CHECK LOGGED-IN ADMIN
    // ===============================

    app.get(
      "/admin/me",
      verifyAdminToken,
      async (req, res) => {

        try {

          console.log(
            "JWT ADMIN:",
            req.admin
          );

          const admin =
            await adminsCollection.findOne({
              _id: new ObjectId(
                req.admin.adminId
              )
            });

          if (!admin) {

            return res.status(404).json({
              error: "Admin not found"
            });

          }

          res.json({
            username: admin.username,
            email: admin.email
          });

        } catch (error) {

          console.log(
            "ADMIN ME ERROR:",
            error
          );

          res.status(500).json({
            error: "Failed to verify admin"
          });

        }

      }
    );


    // ===============================
    // ADMIN LOGIN
    // ===============================

    app.post(
      "/admin/login",
      async (req, res) => {

        try {

          const {
            username,
            password
          } = req.body;


          const admin =
            await adminsCollection.findOne({
              username
            });


          if (!admin) {

            return res.status(401).json({
              error:
                "Invalid username or password"
            });

          }


          const passwordMatch =
            await bcrypt.compare(
              password,
              admin.password
            );


          if (!passwordMatch) {

            return res.status(401).json({
              error:
                "Invalid username or password"
            });

          }


          const token =
            jwt.sign(
              {
                adminId: admin._id,
                email: admin.email
              },

              process.env.JWT_SECRET,

              {
                expiresIn: "2h"
              }
            );


          res.json({
            message: "Login successful",
            token
          });

        } catch (error) {

          console.log(
            "Admin login error:",
            error
          );

          res.status(500).json({
            error: "Login failed"
          });

        }

      }
    );


    // ===============================
    // STARTER PROPERTIES
    // ===============================

    const count =
      await propertiesCollection.countDocuments();


    if (count === 0) {

      await propertiesCollection.insertMany(
        properties
      );

      console.log(
        "Properties added to MongoDB"
      );

    }


    // ===============================
    // GET PROPERTIES
    // ===============================

    app.get(
      "/properties",
      async (req, res) => {

        try {

          const properties =
            await propertiesCollection
              .find({})
              .toArray();

          res.json(properties);

        } catch (error) {

          console.log(
            "Error fetching properties:",
            error
          );

          res.status(500).json({
            error:
              "Failed to fetch properties"
          });

        }

      }
    );


    // ===============================
    // ADD PROPERTY
    // ===============================

    app.post(
      "/properties",
      verifyAdminToken,
      upload.array("images", 10),

      async (req, res) => {

        try {

          const newProperty = {

            id: Date.now(),

            name:
              req.body.name,

            location:
              req.body.location,

            description:
              req.body.description,

            price:
              req.body.price,

            type:
              req.body.type,

            status:
              req.body.status,

            bedrooms:
              req.body.bedrooms,

            bathrooms:
              req.body.bathrooms,

            parking:
              req.body.parking,

            images: []

          };


          // ===============================
          // UPLOAD IMAGES
          // ===============================

          for (
            const file of req.files
          ) {

            const result =
              await new Promise(
                (resolve, reject) => {

                  const stream =
                    cloudinary.uploader.upload_stream(

                      {
                        folder:
                          "12street-properties"
                      },

                      (error, result) => {

                        if (error) {

                          reject(error);

                        } else {

                          resolve(result);

                        }

                      }

                    );

                  stream.end(
                    file.buffer
                  );

                }
              );


            newProperty.images.push(
              result.secure_url
            );

          }


          // First image becomes main image
          newProperty.image =
            newProperty.images[0] || null;


          const result =
            await propertiesCollection.insertOne(
              newProperty
            );


          res.status(201).json({

            message:
              "Property added successfully",

            property: {
              ...newProperty,
              _id: result.insertedId
            }

          });

        } catch (error) {

          console.log(
            "Error adding property:",
            error
          );

          res.status(500).json({
            error:
              "Failed to add property"
          });

        }

      }
    );


    // ===============================
    // GET CLOUDINARY PUBLIC ID
    // ===============================

    function getCloudinaryPublicId(
      imageUrl
    ) {

      try {

        const url =
          new URL(imageUrl);

        const parts =
          url.pathname.split("/");

        const uploadIndex =
          parts.indexOf("upload");


        if (uploadIndex === -1) {

          return null;

        }


        // Skip "upload" and version number
        let publicIdParts =
          parts.slice(
            uploadIndex + 2
          );


        let publicId =
          publicIdParts.join("/");


        // Remove file extension
        publicId =
          publicId.replace(
            /\.[^/.]+$/,
            ""
          );


        return publicId;

      } catch (error) {

        console.log(
          "Could not get Cloudinary public ID:",
          error
        );

        return null;

      }

    }


    // ===============================
    // UPDATE PROPERTY
    // ===============================

    app.put(
      "/properties/:id",
      verifyAdminToken,
      upload.array("images", 10),

      async (req, res) => {

        try {

          const propertyId =
            Number(req.params.id);


          const property =
            await propertiesCollection.findOne({
              id: propertyId
            });


          if (!property) {

            return res.status(404).json({
              error:
                "Property not found"
            });

          }


          // ===============================
          // UPDATED PROPERTY
          // ===============================

          const updatedProperty = {

            name:
              req.body.name,

            description:
              req.body.description,

            location:
              req.body.location,

            price:
              req.body.price,

            type:
              req.body.type,

            status:
              req.body.status,

            bedrooms:
              req.body.bedrooms,

            bathrooms:
              req.body.bathrooms,

            parking:
              req.body.parking

          };


          // ===============================
          // REMOVED IMAGES
          // ===============================

          let removedImages =
            req.body.removedImages || [];


          if (
            !Array.isArray(
              removedImages
            )
          ) {

            removedImages =
              [removedImages];

          }


          // ===============================
          // EXISTING IMAGES
          // ===============================

          const oldImages =
            property.images?.length
              ? property.images
              : property.image
                ? [property.image]
                : [];


          // Keep images that were NOT removed
          let remainingImages =
            oldImages.filter(
              imageUrl =>
                !removedImages.includes(
                  imageUrl
                )
            );


          // ===============================
          // DELETE REMOVED CLOUDINARY IMAGES
          // ===============================

          for (
            const imageUrl of removedImages
          ) {

            const publicId =
              getCloudinaryPublicId(
                imageUrl
              );


            if (publicId) {

              try {

                await cloudinary.uploader.destroy(
                  publicId
                );

                console.log(
                  "Removed image:",
                  publicId
                );

              } catch (error) {

                console.log(
                  "Cloudinary deletion error:",
                  error
                );

              }

            }

          }


          // ===============================
          // UPLOAD NEW IMAGES
          // ===============================

          if (
            req.files &&
            req.files.length > 0
          ) {

            const newImages = [];


            for (
              const file of req.files
            ) {

              const result =
                await new Promise(
                  (resolve, reject) => {

                    const stream =
                      cloudinary.uploader.upload_stream(

                        {
                          folder:
                            "12street-properties"
                        },

                        (error, result) => {

                          if (error) {

                            reject(error);

                          } else {

                            resolve(result);

                          }

                        }

                      );


                    stream.end(
                      file.buffer
                    );

                  }
                );


              newImages.push(
                result.secure_url
              );

            }


            remainingImages = [
              ...remainingImages,
              ...newImages
            ];

          }


          // ===============================
          // UPDATE IMAGE FIELDS
          // ===============================

          updatedProperty.images =
            remainingImages;

          updatedProperty.image =
            remainingImages[0] || null;


          // ===============================
          // SAVE TO MONGODB
          // ===============================

          const result =
            await propertiesCollection.updateOne(

              {
                id: propertyId
              },

              {
                $set:
                  updatedProperty
              }

            );


          if (
            result.matchedCount === 0
          ) {

            return res.status(404).json({
              error:
                "Property not found"
            });

          }


          res.json({

            message:
              "Property updated successfully"

          });

        } catch (error) {

          console.log(
            "Error updating property:",
            error
          );

          res.status(500).json({

            error:
              "Failed to update property"

          });

        }

      }
    );


    // ===============================
    // DELETE PROPERTY
    // ===============================

    app.delete(
      "/properties/:id",
      verifyAdminToken,

      async (req, res) => {

        try {

          const propertyId =
            Number(req.params.id);


          const result =
            await propertiesCollection.deleteOne({
              id: propertyId
            });


          if (
            result.deletedCount === 0
          ) {

            return res.status(404).json({
              error:
                "Property not found"
            });

          }


          res.json({

            message:
              "Property deleted successfully"

          });

        } catch (error) {

          console.log(
            "Error deleting property:",
            error
          );

          res.status(500).json({

            error:
              "Failed to delete property"

          });

        }

      }
    );


    // ===============================
    // START SERVER
    // ===============================

    app.listen(
      3000,
      () => {

        console.log(
          "Server running on port 3000"
        );

      }
    );

  } catch (error) {

    console.log(
      "MongoDB connection error:",
      error
    );

  }

}


connectDB();
