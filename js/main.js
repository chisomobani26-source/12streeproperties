let properties = [];

const propertyStatus = document.getElementById("status");
const propertyType = document.getElementById("property-type");

fetch("http://localhost:3000/properties")
  .then(response => response.json())
  .then(data => {

    properties = data;

    console.log("Properties received:", properties);

    // run the property/search code here

    const propertyTitle =
  document.getElementById("property-title");

if (propertyTitle) {

  const params =
    new URLSearchParams(window.location.search);

  const propertyId =
    Number(params.get("id"));

  const property =
    properties.find(item => item.id === propertyId);

  const notFound =
    document.getElementById("not-found");

  

  if (!property) {

    if (notFound) {
      notFound.style.display = "block";
    }

  } else {

    propertyTitle.textContent =
      property.name;


    const propertyLocation =
      document.getElementById("property-base");

    propertyLocation.textContent =
      `📍 ${property.location}`;


    const price =
      document.getElementById("property-price");

    price.textContent =
      `₦ ${property.price}`;


    const about =
      document.getElementById("about-property");

    about.textContent =
      property.description;


    const bedrooms =
      document.getElementById("bedroom-number");

    bedrooms.textContent =
      `🛏 ${property.bedrooms} Bedroom`;


    const bathrooms =
      document.getElementById("bathroom-number");

    bathrooms.textContent =
      `🚿 ${property.bathrooms} Bathroom`;


    const park =
      document.getElementById("park-number");

    park.textContent =
      `🚗 ${property.parking} Park`;


      // ===============================
      // PROPERTY IMAGE GALLERY
      // ===============================
      
      const image =
        document.getElementById("display");
      
      const gallery =
        document.getElementById("property-gallery");
      
      
      // Make sure the elements exist
      if (image && gallery) {
      
        // Get all property images
        const propertyImages =
          property.images?.length
            ? property.images
            : property.image
              ? [property.image]
              : [];
      
      
        // Set the first image as the main image
        if (propertyImages.length > 0) {
      
          image.src =
            propertyImages[0];
      
          image.alt =
            property.name;
      
        }
      
      
        // Clear old thumbnails
        gallery.innerHTML = "";
      
      
        // Create thumbnails
        propertyImages.forEach(
          (imageUrl, index) => {
      
            const thumbnail =
              document.createElement("img");
      
      
            thumbnail.src =
              imageUrl;
      
            thumbnail.alt =
              property.name;
      
      
            thumbnail.classList.add(
              "gallery-thumbnail"
            );
      
      
            // Mark first image as active
            if (index === 0) {
      
              thumbnail.classList.add(
                "active"
              );
      
            }
      
      
            // Change main image when clicked
            thumbnail.addEventListener(
              "click",
              () => {
      
                image.src =
                  imageUrl;
      
      
                // Remove active
                // from all thumbnails
                document
                  .querySelectorAll(
                    ".gallery-thumbnail"
                  )
                  .forEach(item => {
      
                    item.classList.remove(
                      "active"
                    );
      
                  });
      
      
                // Add active to
                // clicked thumbnail
                thumbnail.classList.add(
                  "active"
                );
      
              }
            );
      
      
            gallery.appendChild(
              thumbnail
            );
      
          }
        );
      
      }

  }

}

  // ========================================
// SEARCH
// ========================================

const searchInput = document.getElementById("input");
const searchBtn = document.getElementById("search-button");
const propertyContainer = document.getElementById("property-container");
const noResults = document.getElementById("no-results");

if (searchBtn && propertyContainer && searchInput){

  function performSearch() {

    const searchValue = searchInput.value
      .toLowerCase()
      .trim();

    propertyContainer.innerHTML = "";

    if (noResults) {
      noResults.style.display = "none";
    }

    if (searchValue === "") {
      if (noResults) {
        noResults.textContent = "Please enter a location or property name.";
        noResults.style.display = "block";
      }
      return;
    }

    const results = properties.filter(property => {

      const location = property.location?.toLowerCase() || "";
      const name = property.name?.toLowerCase() || "";
      const type = property.type?.toLowerCase() || "";

      return (
        location.includes(searchValue) ||
        name.includes(searchValue) ||
        type.includes(searchValue)
      );

    });

    if (results.length === 0) {

      if (noResults) {
        noResults.textContent = "Result Not Found";
        noResults.style.display = "block";
      }

      return;
    }

    results.forEach(property => {

      const card = document.createElement("article");

      card.classList.add("property-card");

      card.innerHTML = `
        <div class="property-image">

          <img
            src="${property.image || property.images?.[0] || ""}"
            alt="${property.name}"
          >

          <span class="property-tag">
            ${property.status || ""}
          </span>

        </div>

        <div class="property-info">

          <p class="location">
            📍 ${property.location}
          </p>

          <h3>${property.name}</h3>

          <p class="property-description">
            ${property.description || ""}
          </p>

          <div class="property-details">
            <span>🛏 ${property.bedrooms || 0} Beds</span>
            <span>🚿 ${property.bathrooms || 0} Baths</span>
            <span>🚗 ${property.parking || 0} Parking</span>
          </div>

          <div class="property-bottom">

            <strong>₦ ${property.price}</strong>

            <a href="property-details.html?id=${property.id}">
              View Property
            </a>

          </div>

        </div>
      `;

      propertyContainer.appendChild(card);

    });

  }

  searchBtn.addEventListener("click", performSearch);

  searchInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
      performSearch();
    }

  });

}
  });