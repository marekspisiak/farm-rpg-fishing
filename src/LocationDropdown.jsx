import React, { useEffect, useState } from "react";
import Select from "react-select";

const Dropdown = ({ handleChange }) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://buddy.farm/page-data/fishing/page-data.json"
        );
        const json = await response.json();
        const fetchedOptions = json.result.data.farmrpg.locations.map(
          (loc) => ({
            value: loc.id,
            label: loc.name,
            image: `https://farmrpg.com${loc.image}`,
          })
        );
        setOptions(fetchedOptions);
      } catch (error) {
        console.error("Failed to fetch locations", error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

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

  const formatOptionLabel = ({ value, label, image }) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img src={image} alt={label} style={{ width: 30, marginRight: 10 }} />
      {label}
    </div>
  );

  return (
    <Select
      options={options}
      isLoading={isLoading}
      styles={customStyles}
      formatOptionLabel={formatOptionLabel}
      onChange={handleChange}
      placeholder="Select a location"
    />
  );
};

export default Dropdown;
