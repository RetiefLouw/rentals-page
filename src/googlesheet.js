import React, { useEffect, useState } from "react";
import "./App.css"; // Import the CSS file


const GoogleSheetData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterAddress, setFilterAddress] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000); // Set an initial maximum price
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const sheetId = "1BbkuXudQN0XXlS_7gFy3SwkVVgZeH8YoMuK5xbmVfuk"; // Replace with your Google Sheet ID
      const apiKey = process.env.REACT_APP_GOOGLE_SHEETS_API_KEY; // API key from environment variables
      const range = "hub!A1:N38";
      console.log("API Key:", apiKey);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result.values || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const rows = data.slice(1); // The remaining rows contain the actual data

  const handlePriceChange = (setter) => (e) => {
    // Remove leading zeros and ensure valid number
    const value = e.target.value.replace(/^0+/, "") || "0";
    setter(value);
  };

  const filteredRows = rows.filter((row) => {
    const title = row[4]?.toLowerCase() || "";
    const address = row[5]?.toLowerCase() || "";
    const priceString = row[2] && typeof row[2] === "string" ? row[2] : "";
    const cleanedPriceString = priceString.replace(/[^0-9]/g, ""); // Remove non-numeric characters including currency symbol and spaces
    const price = parseInt(cleanedPriceString, 10) || 0; // Parse the cleaned string

    const beds = parseInt(row[6]) || 0;
    const baths = parseInt(row[7]) || 0;

    const searchText = filterAddress.toLowerCase();

    return (
      (title.includes(searchText) || address.includes(searchText)) &&
      price >= minPrice &&
      price <= maxPrice &&
      beds >= bedrooms &&
      baths >= bathrooms
    );
  });

  return (
    <div style={pageContainerStyle}>
      <h1> Available Rentals</h1>
      <div style={searchBarContainerStyle}>
        <input
          type="text"
          placeholder="Search by address..."
          value={filterAddress}
          onChange={(e) => setFilterAddress(e.target.value)}
          style={searchbarStyle} // Apply the searchBarStyle here
        />
      </div>

      {/*price sliders for max and min price plus buttons to beds and baths filter*/}
      <div style={filterStyle}>
        <label style={{ fontWeight: "bold" }}>Min Price:</label>
        <input
          type="number"
          min="0"
          max="1000000"
          step="1000"
          value={minPrice}
          onChange={handlePriceChange(setMinPrice)}
          style={filterbuttonStyle}
        />
        <label style={{ fontWeight: "bold" }}>Max Price:</label>
        <input
          type="number"
          min="0"
          max="1000000"
          step="1000"
          value={maxPrice}
          onChange={handlePriceChange(setMaxPrice)}
          style={filterbuttonStyle}
        />
        <label style={{ fontWeight: "bold" }}>Bedrooms:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={bedrooms}
          onChange={handlePriceChange(setBedrooms)}
          style={filterbuttonStyle}
        />
        <label style={{ fontWeight: "bold" }}>Bathrooms:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={bathrooms}
          onChange={handlePriceChange(setBathrooms)}
          style={filterbuttonStyle}
        />
      </div>

      <div style={cardContainerStyle}>
        {filteredRows.map((row, index) => {
          const imageUrl = row[1];
          const price = row[2];
          const property_link = row[0];
          const title = row[4];
          const address = row[5];
          const bedrooms = row[6];
          const bathrooms = row[7];
          const cars = row[8];
          const size = row[10];
          const description = row[12];
          return (
            <div key={index} style={cardStyle}>
              <h4 style={titleStyle}>{title}</h4>

              {/* {imageUrl && (
                  <img src={imageUrl} alt={`Image ${index}`} style={imageStyle} />
                )} */}

              <a href={property_link} target="_blank" rel="noopener noreferrer">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={`an example of a alt text for something ${index}`}
                    style={imageStyle}
                  />
                )}
              </a>

              <div style={textContainerStyle}>
                <h3 style={priceStyle}>{price}</h3>
                <h2 style={addressStyle}>{address}</h2>
                <h5 style={bedroomStyle}>
                  Beds: {bedrooms}
                  <span style={{ margin: "0 10px" }}> | </span>{" "}
                  {/* Separator */}
                  Baths: {bathrooms}
                  <span style={{ margin: "0 10px" }}> | </span>{" "}
                  {/* Separator */}
                  Cars: {cars}
                  <span style={{ margin: "0 10px" }}> | </span>{" "}
                  {/* Separator */}
                  Size: {size}
                </h5>
                <h6 style={descriptionStyle}>{description}</h6>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const pageContainerStyle = {
  padding: "50px", // Space between the cards and the edges of the page
  boxSizing: "border-box", // Ensure padding is included in the width calculation
  overflow: "hidden", // Prevent overflow
  maxWidth: "100vw", // Ensure the container does not exceed the viewport width
  margin: "0 auto", // Center the container

  "@media (maxWidth: 1200px)": {
    padding: "30px",
    margin: "0 auto",
  },
  "@media (maxWidth: 768px)": {
    padding: "20px", // Further adjust padding for small screens
    //margin: '0 10px', // Adjust margin for small screens
    margin: "0 auto",
  },
  "@media (maxWidth: 480px)": {
    padding: "10px", // Minimal padding for very small screens
    //margin: '0 5px', // Adjust margin for very small screens
    margin: "0 auto",
  },
};

const cardContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)", // Always 4 columns
  gap: "20px", // Space between cards
  justifyContent: "center", // Center grid items
  maxWidth: "100%", // Ensure container does not exceed page width
  padding: "20px", // Padding to ensure cards don't touch the edges
  backgroundColor: "white", // White background for the container
  borderRadius: "15px", // Rounded corners for the container
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Gradient shadow effect

  "@media (maxWidth: 1200px)": {
    gridTemplateColumns: "repeat(2, 1fr)", // 3 columns on medium screens
    gap: "15px",
  },
  "@media (maxWidth: 768px)": {
    gridTemplateColumns: "1fr", // 2 columns on smaller screens
    gap: "15px",
    cardHeight: "300px",
  },
  "@media (maxWidth: 480px)": {
    gridTemplateColumns: "1fr", // 2 columns on smaller screens
    gap: "15px",
    cardHeight: "200px",
  },
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "15px", // Slightly reduce the border radius for a more subtle effect
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.4)", // Softer shadow for a more elegant look
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  maxWidth: "400px",
  backgroundColor: "white", // Change background to white for better contrast
  transition: "box-shadow 0.3s ease, transform 0.3s ease", // Smooth transition for hover effect
  ":hover": {
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.6)", // Enhanced shadow on hover
    transform: "scale(1.05)", // Slightly enlarge the card on hover
  },
};

const imageStyle = {
  width: "100%", // Make images responsive to card width
  height: "250px", // Fixed height for all images
  objectFit: "cover", // Ensure image covers the area without distortion
  borderRadius: "5px", // Optional: add rounded corners to images
};

const textContainerStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
};

const priceStyle = {
  margin: "10px 0 5px 0", // Adjust margin as needed
  fontSize: "20px",
  color: "#B22222",
  textAlign: "right", // Align text to the left
};

const titleStyle = {
  margin: "5px 0 10px 0", // Adjust margin as needed
  textAlign: "center",
  fontSize: "16px",
  lineHeight: "1.2", // Adjust line height for better spacing between lines
  maxHeight: "2.4em", // Allow for exactly 2 lines of text
  minHeight: "2.4em",
  overflow: "hidden", // Hide overflowed text
  whiteSpace: "normal", // Allow text to wrap to the next line
  display: "-webkit-box", // Required for line-clamp
  WebkitBoxOrient: "vertical", // Required for line-clamp
  WebkitLineClamp: 2, // Limit to 2 lines
};

const addressStyle = {
  margin: "0 0 5px 0", // Adjust margin as needed
  fontSize: "14px",
  textAlign: "left", // Align text to the left
  color: "#333",
};

const bedroomStyle = {
  margin: "5px 0", // Adjust margin as needed
  textAlign: "left", // Center-align the text
  fontSize: "14px",
  color: "#333", // Example green color
  display: "flex", // Use flexbox to align items on the same line
  justifyContent: "left", // Center-align items horizontally
};

const descriptionStyle = {
  margin: "0 0 5px 0", // Adjust margin as needed
  fontSize: "14px",
  textAlign: "left", // Align text to the left
  color: "#333",
  fontWeight: "480",
};

const searchBarContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "25px",
};

const searchbarStyle = {
  padding: "15px 20px",
  width: "70%", // Adjust the width as needed
  height: "20px",
  borderRadius: "25px", // Fully rounded corners
  border: "1px solid #555", // Light gray border
  outline: "none", // Remove default outline
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle shadow effect
};

const filterStyle = {
  display: "flex",
  gap: "18px", // Space between items
  marginBottom: "25px",
  justifyContent: "center",
  flexWrap: "wrap", // Wrap items to next line if necessary
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",

  // Responsive adjustments
  "@media (maxWidth: 1200px)": {
    gap: "16px", // Adjust gap size on medium screens if needed
  },
  "@media (maxWidth: 768px)": {
    gap: "14px", // Adjust gap size on smaller screens
  },
  "@media (maxWidth: 480px)": {
    gap: "10px", // Further adjust gap size on very small screens
  },
};

const filterbuttonStyle = {
  padding: "8px 16px",
  width: "75px", // Adjust the width as needed
  borderRadius: "10px", // Higher value makes the button rounder
  border: "1px solid #555", // Dark gray border to match the search bar
  outline: "none", // Remove default outline on focus
  textAlign: "left",
};

export default GoogleSheetData;
