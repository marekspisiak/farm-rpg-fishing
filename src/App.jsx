import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import LocationDropdown from "./LocationDropdown";
import FishDropdown from "./FishDropdown";
import { useEffect } from "react";
import Strategy from "./Strategy";

function App() {
  const [locationName, setLocationName] = useState("");
  const [selectionData, setSelectionData] = useState(null);
  const [maxInv, setMaxInv] = useState(null);

  const [fishCategories, setFishCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedFIsh, setSelectedFish] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [desiredAmount, setDesiredAmount] = useState(0);

  const [inputText, setInputText] = useState("");
  const [inputData, setInputData] = useState([]);

  const [netAmount, setNetAmount] = useState(null);
  const [catchAmount, setCatchAmount] = useState(15);

  const handleCopy = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text); // Aktualizácia stavu s textom z clipboardu
    } catch (err) {
      console.error(
        "Niečo sa pokazilo pri kopírovaní textu z clipboardu.",
        err
      );
    }
  };

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

  const handleLocationChange = (option) => {
    setSelectionData(null);
    setLocationName(option.label);
    console.log("Selected location:", option.label);
  };

  const handleSelectionChange = (data) => {
    setSelectionData(data);
    console.log("Selected data:", data);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    console.log("Selected data:", category);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  useEffect(() => {
    parseText();
  }, [inputText]);

  const parseText = () => {
    const lines = inputText.split(/\r\n|\n|\r/);
    let items = [];
    let foundNonGoldFish = false;

    // Iterating over the lines to find relevant data
    lines.forEach((line, index) => {
      // Start processing after finding "Non-Gold Fish"
      if (line.includes("Non-Gold Fish")) {
        foundNonGoldFish = true;
      } else if (foundNonGoldFish) {
        if (line.startsWith("lock_fill") || line.startsWith("unlock_fill")) {
          // Check if the next line contains the quantity information
          const nextLine = lines[index + 1];
          if (nextLine && nextLine.includes("/")) {
            const quantityMatch = nextLine.match(/(\d+) \/ (\d+)/);
            if (quantityMatch) {
              items.push({
                name: line.replace(/(lock_fill|unlock_fill)\s*/, "").trim(),
                quantity: parseInt(quantityMatch[1], 10),
                max: parseInt(quantityMatch[2], 10),
                locked: line.startsWith("lock_fill"),
              });
            }
          }
        }
      }
    });

    setInputData(items);
  };

  console.log(netAmount);

  return (
    <div className="px-3 gap-2 flex flex-col items-start bg-slate-100 relative min-h-screen">
      <h1 className="self-center text-3xl py-4 -mb-2 w-full text-center bg-slate-200 sticky top-0 z-50 ">
        Fishing predicter
      </h1>
      <LocationDropdown handleChange={handleLocationChange} />
      <h2>Select a Fish to Catch</h2>
      <FishDropdown
        locationName={locationName}
        handleSelectionChange={handleSelectionChange}
        handleCategoryChangeParent={handleCategoryChange}
      />
      <label>
        Use nets:{" "}
        <input
          type="number"
          onChange={(e) => {
            setNetAmount(e.target.value);
          }}
        ></input>
      </label>
      <label>
        Catch amount:{" "}
        <input
          type="number"
          defaultValue={catchAmount}
          onChange={(e) => {
            setCatchAmount(e.target.value);
          }}
        ></input>
      </label>
      <label>
        Desired amount:{" "}
        <input
          type="number"
          onChange={(e) => {
            setDesiredAmount(e.target.value);
          }}
        ></input>
      </label>
      <label>
        Should keep:{" "}
        <input
          type="number"
          defaultValue={inputData[0]?.max}
          onChange={(e) => {
            setMaxInv(e.target.value);
          }}
        ></input>
      </label>
      {/* <textarea
        className="border-2 border-red-500 resize-none overflow-hidden"
        value={inputText}
        onChange={handleInputChange}
        rows="1"
        cols="4"
        placeholder="Paste your text here..."
      /> */}
      <button
        onClick={handleCopy}
        className="border-2 border-green-400 rounded bg-green-200 p-1 uppercase text-gray-700"
      >
        get data
      </button>
      <Strategy
        allFish={fishCategories[selectedCategory]}
        desiredFish={selectionData}
        desiredAmount={desiredAmount}
        maxInv={maxInv ?? inputData[0]?.max}
        inputData={inputData}
        useNets={netAmount}
        catchAmount={catchAmount}
      />
    </div>
  );
}

export default App;
