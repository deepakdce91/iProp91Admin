import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from "@mui/material";

function ChipComponent({ disabled, preSelected = [], itemArray, updateSelectedArr }) {
  const theme = useTheme();
  const myRef = useRef();
  const [focused, setFocused] = useState(false);
  const [currentInputValue, setCurrentInputValue] = useState("");
  const [filteredItemArray, setFilteredItemArray] = useState(itemArray);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    // Initialize selectedItems with preSelected
    if (preSelected.length > 0) {
      setSelectedItems(preSelected);
    }
  }, [preSelected]);

  const removeSelectedItem = (e, item) => {
    e.preventDefault();
    const updatedItems = selectedItems.filter(
      (selectedItem) => selectedItem.toLowerCase() !== item.toLowerCase()
    );
    setSelectedItems(updatedItems);
    updateSelectedArr(updatedItems);
  };

  const addSelectedItem = (item) => {
    if (!selectedItems.includes(item)) {
      const updatedItems = [...selectedItems, item];
      setSelectedItems(updatedItems);
      updateSelectedArr(updatedItems);
    }
  };

  const handleEnterPressed = (e) => {
    if (e.key === "Enter") {
      const inputValue = e.target.value.toLowerCase();
      if (itemArray.map((item) => item.toLowerCase()).includes(inputValue)) {
        addSelectedItem(inputValue);
      }
      setCurrentInputValue("");
    }
  };

  return (
    <>
      <div
        className={`w-[100%] ${
          theme.palette.mode === "dark"
            ? "bg-[#141B2D] border-[1px] border-gray-600"
            : "bg-white border-[1px] border-gray-300"
        } overflow rounded-sm px-3 h-auto flex-wrap flex items-center border-1 ${
          focused ? "border-gray-400" : "border-gray-300"
        }`}
        onClick={() => {
          myRef.current.focus();
        }}
      >
        {/* Display selected items */}
        {selectedItems.length > 0 &&
          selectedItems.map((item, index) => (
            <div
              key={index}
              className="mr-3 my-2 px-2 py-[6px] rounded-xs border-1 border-gray-300 flex items-center justify-center bg-[#2a94f2] text-white"
            >
              <div className="text-[16px]">{item}</div>
              <button
                className="h-[100%] text-sm pl-1"
                onClick={(e) => {
                  removeSelectedItem(e, item);
                }}
              >
                <span className="text-xs ml-2 mr-1">X</span>
              </button>
            </div>
          ))}

        <div className="relative">
          <input
            autoComplete="off"
            type="text"
            className={`w-40 mr-3 my-2 text-sm py-2 px-2 rounded-sm ${
              theme.palette.mode === "dark" ? "bg-[#141B2D]" : "bg-white"
            } border-[1px] border-white`}
            placeholder={`Enter Project`}
            value={currentInputValue}
            onChange={(e) => {
              setCurrentInputValue(e.target.value);
              setFilteredItemArray(
                itemArray.filter((item) =>
                  item.toLowerCase().includes(e.target.value.toLowerCase())
                )
              );
            }}
            onKeyUp={handleEnterPressed}
            ref={myRef}
            onFocus={() => {
              setFocused(true);
              setFilteredItemArray(itemArray); // show all items on focus
            }}
            onBlur={() => {
              setTimeout(() => {
                setFocused(false);
              }, 100);
            }}
            onClick={() => {
              setFocused(true);
              setFilteredItemArray(itemArray); // show all items on click
            }}
            disabled={disabled}
          />

          {/* Suggestions dropdown */}
          {focused === true && filteredItemArray.length > 0 && (
            <div className="absolute top-11 z-20">
              <ul className="bg-white text-gray-900 border-1 border-gray-400 rounded-sm w-40">
                {filteredItemArray.map(
                  (item) =>
                    !selectedItems.includes(item) && (
                      <li
                        key={item}
                        className="pl-3 py-1 hover:bg-gray-200"
                        onClick={() => {
                          addSelectedItem(item);
                          setCurrentInputValue("");
                        }}
                      >
                        {item}
                      </li>
                    )
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChipComponent;
