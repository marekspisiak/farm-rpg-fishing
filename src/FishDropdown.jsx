import React, { useEffect, useState } from "react";
import Select from "react-select";

const FishDropdown = ({
  locationName,
  handleCategoryChangeParent,
  handleSelectionChange,
}) => {
  const [fishCategories, setFishCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryTypes, setCategoryTypes] = useState([]);

  useEffect(() => {
    if (!locationName) return;

    const formattedLocationName = locationName
      .toLowerCase()
      .replace(/\s+/g, "-");
    const url = `https://buddy.farm/page-data/l/${formattedLocationName}/page-data.json`;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(url);
        const json = await response.json();
        // Keep dropRates separate and sort items by rate within each category

        const categoryTypes =
          json.result.data.farmrpg.locations[0].dropRates.map((val) => {
            return { manualFishing: val.manualFishing, runecube: val.runecube };
          });

        setCategoryTypes(categoryTypes);

        console.log(json.result.data.farmrpg.locations[0].dropRates);
        const dropRates = json.result.data.farmrpg.locations[0].dropRates.map(
          (rate) => {
            return rate.items.sort((a, b) => a.rate - b.rate);
          }
        );
        setFishCategories(dropRates);
      } catch (error) {
        console.error("Failed to fetch fish data", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [locationName]);

  const handleCategoryChange = (event) => {
    handleCategoryChangeParent(event.target.value, 10);
    setSelectedCategory(parseInt(event.target.value, 10));
  };

  const formatOptionLabel = ({ value, label, image, rate }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        src={`https://farmrpg.com${image}`}
        alt={label}
        style={{ width: 30, marginRight: 10 }}
      />
      {label} - Rate: {(100 / rate).toFixed(3)}%
    </div>
  );

  if (!locationName) {
    return <p>Please select a location first.</p>;
  }

  if (isLoading) {
    return <p>Loading fishes...</p>;
  }

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      borderBottom: "1px dotted pink",
      color: state.isSelected ? "red" : "blue",
      padding: 20,
      display: "flex",
      alignItems: "center",
    }),
    control: (provided) => ({
      ...provided,
      marginTop: "1em",
    }),
  };

  console.log(fishCategories);
  console.log(categoryTypes);

  return (
    <div>
      <div>
        {categoryTypes.map((data, index) => (
          <label key={index} className="p-1 border-x-2 ">
            <input
              type="radio"
              name="category"
              value={index}
              onChange={handleCategoryChange}
              checked={selectedCategory === index}
            />
            <span>
              manual: {data.manualFishing ? "T" : "F"} / cube:{" "}
              {data.runecube ? "T" : "F"}
            </span>
          </label>
        ))}
      </div>
      <div>
        {fishCategories.length > 0 && (
          <Select
            options={fishCategories[selectedCategory].map((fish) => ({
              value: fish.item.name,
              label: fish.item.name,
              image: fish.item.image,
              rate: fish.rate,
            }))}
            formatOptionLabel={formatOptionLabel}
            placeholder="Select a fish"
            styles={customStyles}
            onChange={handleSelectionChange}
          />
        )}
      </div>
    </div>
  );
};

export default FishDropdown;
