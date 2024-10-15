import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from "@mui/material";

function ChipComponentUsers({ preSelected, itemArray, updateSelectedArr }) {
  const theme = useTheme();
  const myRef = useRef();
  const [focused, setFocused] = useState(false);
  const [currentInputValue, setCurrentInputValue] = useState("");
  const [filteredItemArray, setFilteredItemArray] = useState(itemArray); // Initialize with full itemArray
  const [selectedItems, setSelectedItems] = useState([]);

  // Sync preSelected with selectedItems whenever preSelected changes
  useEffect(() => {
    if (preSelected) {
      setSelectedItems(preSelected);
    }
  }, [preSelected]);

  const removeSelectedItem = (e, item) => {
    e.preventDefault();
    const updatedItems = selectedItems.filter(selectedItem => selectedItem._id !== item._id);
    setSelectedItems(updatedItems);
    updateSelectedArr(updatedItems);
  };

  const addSelectedItem = (item) => {
    if (!selectedItems.some(selectedItem => selectedItem._id === item._id)) {
      const updatedItems = [...selectedItems, item];
      setSelectedItems(updatedItems);
      updateSelectedArr(updatedItems);
    }
  };

  const handleEnterPressed = (e) => {
    if (e.key === "Enter") {
      const inputValue = e.target.value.toLowerCase();
      const matchedItem = itemArray.find(item =>
        (item.name.toLowerCase().includes(inputValue) && item.name) ||
        (item.phone.includes(inputValue) && !item.name)
      );
      if (matchedItem) {
        addSelectedItem(matchedItem);
      }
      setCurrentInputValue("");
    }
  };

  return (
    <>
      <div
        className={`w-[100%] ${theme.palette.mode === "dark" ? "bg-[#141B2D] border-[1px] border-gray-600" : "bg-white border-[1px] border-gray-300"} overflow rounded-sm px-3 h-auto flex-wrap flex items-center border-1 ${focused ? "border-gray-400" : "border-gray-300"}`}
        onClick={() => {
          myRef.current.focus();
        }}
      >
        {/* Display selected items */}
        {selectedItems.length > 0 && selectedItems.map((item, index) => (
          <div key={index} className='mr-3 my-2 px-2 py-[6px] rounded-xs border-1 border-gray-300 flex items-center justify-center bg-[#2a94f2] text-white'>
            <div className='text-[16px]'>{item.name || item.phone}</div>
            <button className='h-[100%] text-sm pl-1'
              onClick={(e) => {
                removeSelectedItem(e, item);
              }}
            >
              <span className='text-xs ml-2 mr-1'>X</span>
            </button>
          </div>
        ))}
        <div className='relative'>
          <input
            type="text"
            className={`w-40 mr-3 my-2 text-sm py-2 px-2 rounded-sm ${theme.palette.mode === "dark" ? "bg-[#141B2D]" : "bg-white"} border-[1px] border-white`}
            placeholder={`Enter Name or Phone`}
            value={currentInputValue}
            onChange={(e) => {
              setFocused(true);
              setCurrentInputValue(e.target.value);
              setFilteredItemArray(
                itemArray.filter((item) =>
                  (item.name && item.name.toLowerCase().includes(e.target.value.toLowerCase())) ||
                  (item.phone.includes(e.target.value) && !item.name)
                )
              );
            }}
            onKeyUp={handleEnterPressed}
            ref={myRef}
            onFocus={() => {
              setFocused(true);
              // Show the full list on focus if no input value is present
              setFilteredItemArray(itemArray);
            }}
            onBlur={() => {
              setTimeout(() => {
                setFocused(false);
              }, 100);
            }}
            onClick={() => {
              setFocused(true);
              if (!currentInputValue) {
                // Ensure the dropdown is shown even without input value
                setFilteredItemArray(itemArray);
              }
            }}
          />

          {/* Suggestions dropdown */}
          {focused && filteredItemArray.length > 0 && (
            <div className='absolute top-11 z-20'>
              <ul className='bg-white text-gray-900 border-1 border-gray-400 rounded-sm w-60'>
                {filteredItemArray.map((item) => (
                  <li
                    key={item._id}
                    className='pl-3 py-1 hover:bg-gray-200 cursor-pointer'
                    onClick={() => {
                      addSelectedItem(item);
                      setCurrentInputValue("");
                    }}
                  >
                    {/* Display name and phone number */}
                    {item.name && item.phone
                      ? `${item.name} (${item.phone})`
                      : item.phone || item.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ChipComponentUsers;
