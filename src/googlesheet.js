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
    <div className="page-container">
      <h1> Available Rentals</h1>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search by address..."
          value={filterAddress}
          onChange={(e) => setFilterAddress(e.target.value)}
          className="searchbar" // Apply the searchBarStyle here
        />
      </div>

      {/*price sliders for max and min price plus buttons to beds and baths filter*/}
      <div className="filter">
        <label style={{ fontWeight: "bold" }}>Min Price:</label>
        <input
          type="number"
          min="0"
          max="1000000"
          step="1000"
          value={minPrice}
          onChange={handlePriceChange(setMinPrice)}
          className="filter-button"
        />
        <label style={{ fontWeight: "bold" }}>Max Price:</label>
        <input
          type="number"
          min="0"
          max="1000000"
          step="1000"
          value={maxPrice}
          onChange={handlePriceChange(setMaxPrice)}
          className="filter-button"
        />
        <label style={{ fontWeight: "bold" }}>Bedrooms:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={bedrooms}
          onChange={handlePriceChange(setBedrooms)}
          className="filter-button"
        />
        <label style={{ fontWeight: "bold" }}>Bathrooms:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={bathrooms}
          onChange={handlePriceChange(setBathrooms)}
          className="filter-button"
        />
      </div>

      <div className="card-container">
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
            <div key={index} className="card">
              <h4 className="title">{title}</h4>

              <a href={property_link} target="_blank" rel="noopener noreferrer">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="A detailed description of the opener content"
                    className="image"
                  />
                )}
              </a>

              <div className="text-container">
                <h3 className="price">{price}</h3>
                <h2 className="address">{address}</h2>
                <h5 className="bedroom">
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
                <h6 className="description">{description}</h6>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoogleSheetData;
