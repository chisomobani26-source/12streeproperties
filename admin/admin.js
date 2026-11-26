//====== ADMIN AUTHENTICATION ======//

const adminToken = localStorage.getItem("adminToken");

if (!adminToken) {
  window.location.href = "login.html";
}


// ===============================
// ADMIN FETCH
// ===============================

async function adminFetch(url, options = {}) {

  const token = localStorage.getItem("adminToken");

  if (!token) {
    window.location.href = "login.html";
    return null;
  }

  const response = await fetch(url, {
    ...options,

    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 401) {

    localStorage.removeItem("adminToken");

    alert("Your session has expired. Please log in again.");

    window.location.href = "login.html";

    return null;
  }

  return response;
}


// ===============================
// VERIFY ADMIN SESSION
// ===============================

async function verifyAdminSession() {

  try {

    const response = await adminFetch(
      "http://localhost:3000/admin/me"
    );

    if (!response) return;

    const data = await response.json();

    if (!response.ok) {

      console.error(
        "Admin verification failed:",
        data
      );

      return;
    }

    console.log(
      "Logged-in admin:",
      data
    );

  } catch (error) {

    console.error(
      "Admin session verification error:",
      error
    );

  }
}

verifyAdminSession();


let properties = [];

let editingPropertyId = null;

let removedImages = [];

// ===============================
// ADD PROPERTY ELEMENTS
// ===============================

const addButton =
  document.getElementById("add-property");

const addSection =
  document.getElementById("add-section");

const addForm =
  document.getElementById("add-form");

const addName =
  document.getElementById("add-name");

const addDescription = document.getElementById("add-description")  

const addLocation =
  document.getElementById("add-location");

const addPrice =
  document.getElementById("add-price");

const addType =
  document.getElementById("add-type");

const addStatus =
  document.getElementById("add-status");

const addBedrooms =
  document.getElementById("add-bedrooms");

const addBathrooms =
  document.getElementById("add-bathrooms");

const addParking =
  document.getElementById("add-parking");

const addImage =
  document.getElementById("add-image");


  


// ===============================
// EDIT PROPERTY ELEMENTS
// ===============================

const editSection =
  document.getElementById("edit-section");

const editForm =
  document.getElementById("edit-form");

const editName =
  document.getElementById("edit-name");

const editDescription = document.getElementById("edit-description");

const editLocation =
  document.getElementById("edit-location");

const editPrice =
  document.getElementById("edit-price");

const editType =
  document.getElementById("edit-type");

const editStatus =
  document.getElementById("edit-status");

  const editBedrooms =
  document.getElementById("edit-bedrooms");

const editBathrooms =
  document.getElementById("edit-bathrooms");

const editParking =
  document.getElementById("edit-parking");  

const editImages =
  document.getElementById("edit-images");

const editImagePreview =
  document.getElementById("edit-image-preview");  

// ===============================
// STATISTICS
// ===============================

const totalProperties =
  document.getElementById("total-properties");

const forSale =
  document.getElementById("for-sale");

const forRent =
  document.getElementById("for-rent");


// ===============================
// PROPERTY LIST
// ===============================

const propertyList =
  document.getElementById("admin-property-list");


// ===============================
// LOAD PROPERTIES FROM MONGODB
// ===============================

async function loadProperties() {

  try {

    const response =
      await fetch(
        "http://localhost:3000/properties"
      );

    if (!response.ok) {

      throw new Error(
        "Failed to load properties"
      );

    }

    const data =
      await response.json();

    console.log("Properties from MongoDB:", data);

    properties = data;

    renderProperties();

    updateStats();

  } catch (error) {

    console.error(
      "Error loading properties:",
      error
    );

  }

}


// ===============================
// RENDER PROPERTIES
// ===============================

function renderProperties() {

  propertyList.innerHTML = "";

  properties.forEach(property => {

    const card =
      document.createElement("div");

    card.classList.add(
      "admin-property-card"
    );

    const propertyImages =
      property.images?.length
        ? property.images
        : property.image
          ? [property.image]
          : [];

    const imagesHTML =
      propertyImages
        .map(image => `
          <img
            src="${image}"
            alt="${property.name}"
            class="admin-property-image"
          >
        `)
        .join("");

    card.innerHTML = `
      <div class="admin-property-images">
        ${imagesHTML}
      </div>

      <div class="admin-property-info">

        <h3>${property.name}</h3>

        <p>
            ${property.description}
          </p>

        <p id="location">📍${property.location}</p>

        <p>₦ ${property.price}</p>

        <p>${property.type}</p>

        <p>${property.status}</p>
        
        <p>🛏 ${property.bedrooms}bedroom</p>

        <p>🚿 ${property.bathrooms}bathroom</p>
        
        <p>🚗 ${property.parking}parking lot</p>
        <br/>

        <button
          class="edit-btn"
          data-id="${property.id}"
        >
          Edit
        </button>

        <button
          class="delete-btn"
          data-id="${property.id}"
        >
          Delete
        </button>

      </div>
    `;

    propertyList.appendChild(card);

  });


  // ===============================
  // EDIT BUTTONS
  // ===============================

  const editButtons =
    document.querySelectorAll(".edit-btn");

  editButtons.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const propertyId =
          Number(button.dataset.id);

        editingPropertyId =
          propertyId;

        const property =
          properties.find(property =>
            property.id === propertyId
          );

        if (!property) {
          return;
        }

        // Show edit form
        editSection.style.display =
          "block";

        // Fill existing information
        editName.value =
          property.name || "";

        editDescription.value =
         property.description || "";  

        editLocation.value =
          property.location || "";

        editPrice.value =
          property.price || "";

        editType.value =
          property.type || "";

        editStatus.value =
          property.status || "";

        editBedrooms.value =
          property.bedrooms || "";
        
        editBathrooms.value =
          property.bathrooms || "";
        
        editParking.value =
          property.parking || "";  

          // ===============================
          // SHOW EXISTING IMAGES
          // ===============================
          
          editImagePreview.innerHTML = "";
          
          const propertyImages =
            property.images?.length
              ? property.images
              : property.image
                ? [property.image]
                : [];
          
                propertyImages.forEach(
                  imageUrl => {
                
                    const imageWrapper =
                      document.createElement("div");
                
                    imageWrapper.classList.add(
                      "edit-image-item"
                    );
                
                    imageWrapper.innerHTML = `
                      <img
                        src="${imageUrl}"
                        alt="${property.name}"
                      >
                
                      <button
                        type="button"
                        class="remove-edit-image"
                      >
                        Remove
                      </button>
                    `;
                
                    const removeButton =
                      imageWrapper.querySelector(
                        ".remove-edit-image"
                      );
                
                    removeButton.addEventListener(
                      "click",
                      () => {
                
                        imageWrapper.remove();

                        removedImages.push(imageUrl);
                        
                        console.log(
                          "Image marked for removal:",
                          imageUrl
                        );
                
                        console.log(
                          "Image removed from preview:",
                          imageUrl
                        );
                      }
                    );
                
                    editImagePreview.appendChild(
                      imageWrapper
                    );
                  }
                );

        // Scroll to edit form
        editSection.scrollIntoView({
          behavior: "smooth"
        });

      }
    );

  });


  // ===============================
  // DELETE BUTTONS
  // ===============================

  const deleteButtons =
    document.querySelectorAll(".delete-btn");

  deleteButtons.forEach(button => {

    button.addEventListener(
      "click",
      async () => {

        const propertyId =
          Number(button.dataset.id);

        const confirmDelete =
          confirm(
            "Are you sure you want to delete this property?"
          );

        if (!confirmDelete) {
          return;
        }

        try {

          const response =
            await adminFetch(
              `http://localhost:3000/properties/${propertyId}`,
              {
                method: "DELETE"
              }
            );

          const data =
            await response.json();

          console.log(data);

          if (!response.ok) {
            throw new Error(
              "Failed to delete property"
            );
          }

          await loadProperties();

        } catch (error) {

          console.error(
            "Error deleting property:",
            error
          );

        }

      }
    );

  });

}


// ===============================
// UPDATE STATISTICS
// ===============================

function updateStats() {

  totalProperties.textContent =
    properties.length;


  const saleProperties =
    properties.filter(property => {

      return property.status === "For Sale";

    });


  forSale.textContent =
    saleProperties.length;


  const rentProperties =
    properties.filter(property => {

      return property.status === "For Rent";

    });


  forRent.textContent =
    rentProperties.length;

}


// ===============================
// SHOW ADD PROPERTY FORM
// ===============================

addButton.addEventListener(
  "click",
  () => {

    addSection.style.display =
      "block";

  }
);


// ===============================
// ADD PROPERTY
// ===============================

addForm.addEventListener("submit", async event => {

  event.preventDefault();

  // Get the selected image files
  const imageFiles = Array.from(addImage.files);

  if (imageFiles.length === 0) {
    alert("Please select at least one image.");
    return;
  }

  // Create FormData
  const formData = new FormData();

  // Add property information
  formData.append("name", addName.value.trim());
  formData.append("description", addDescription.value.trim())

  formData.append(
    "location", 
     addLocation.value.trim()
  );

  formData.append(
    "price", 
     addPrice.value.trim()
  );

  formData.append(
    "type", 
     addType.value
  );

  formData.append(
    "status", 
    addStatus.value
  );

  formData.append(
    "bedrooms", 
     addBedrooms.value.trim()
  );

  formData.append(
    "bathrooms", 
     addBathrooms.value.trim()
  );

  formData.append(
    "parking", 
     addParking.value.trim()
  );

  // Add every image
  imageFiles.forEach(file => {
    formData.append("images", file);
  });

  try {

    const response = await adminFetch(
      "http://localhost:3000/properties",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    console.log("Server response:", data);

    if (!response.ok) {
      throw new Error(data.error || "Failed to add property");
    }

    alert("Property added successfully!");

    // Reload properties from MongoDB
    await loadProperties();

    // Clear the form
    addForm.reset();

    // Hide the add section
    addSection.style.display = "none";

  } catch (error) {

    console.error("Error adding property:", error);

    alert("Failed to add property.");

  }

});

// ===============================
// LOAD EVERYTHING WHEN PAGE OPENS
// ===============================

loadProperties();

// ===============================
// EDIT PROPERTY
// ===============================

editForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    if (!editingPropertyId) {
      return;
    }

    const formData = new FormData();

    formData.append(
      "name",
      editName.value.trim()
    );

    formData.append("description",
      editDescription.value.trim()
    );

    formData.append(
      "location",
      editLocation.value.trim()
    );

    formData.append(
      "price",
      editPrice.value.trim()
    );

    formData.append(
      "type",
      editType.value
    );

    formData.append(
      "status",
      editStatus.value
    );

    formData.append(
      "bedrooms",
      editBedrooms.value.trim()
    )


    formData.append(
      "bathrooms",
      editBathrooms.value.trim()
    );

    formData.append(
      "parking",
       editParking.value.trim()
    );

    // Send removed images
    removedImages.forEach(imageUrl => {
      formData.append(
        "removedImages",
        imageUrl
      );
    });

    // Send newly selected images
    const imageFiles =
      Array.from(editImages.files);

    imageFiles.forEach(file => {
      formData.append(
        "images",
        file
      );
    });

    try {

      const response =
        await adminFetch(
          `http://localhost:3000/properties/${editingPropertyId}`,
          {
            method: "PUT",
            body: formData
          }
        );

      const data =
        await response.json();

      console.log(data);

      if (!response.ok) {
        throw new Error(
          data.error ||
          "Failed to update property"
        );
      }

      alert(
        "Property updated successfully!"
      );

      await loadProperties();

      editForm.reset();

      editImagePreview.innerHTML = "";

      removedImages = [];

      editSection.style.display = "none";

      editingPropertyId = null;

      removedImages = [];

    } catch (error) {

      console.error(
        "Error updating property:",
        error
      );

      alert(
        "Failed to update property."
      );

    }

  }
);


// ===============================
// LOGOUT
// ===============================

const logoutButton =
  document.getElementById("logout-btn");

logoutButton.addEventListener("click", () => {

  // Remove JWT token
  localStorage.removeItem("adminToken");

  // Send admin back to login
  window.location.href = "login.html";

});
