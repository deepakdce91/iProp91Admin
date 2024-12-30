import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@mui/material";
import { toast } from "react-toastify";

const superAdminData = {
  _id: "IPA008",
  profilePicture: "",
  name: "Super Admin",
  phone: "----------",
  admin: "true",
};

function ChipComponentUsers({
  propertyOwnerId,
  preSelected,
  itemArray,
  projectUsers,
  updateSelectedArr,
}) {
  const theme = useTheme();
  const myRef = useRef();
  const dropdownRef = useRef();
  const [focused, setFocused] = useState(false);
  const [currentInputValue, setCurrentInputValue] = useState("");
  const [filteredProjectUsers, setFilteredProjectUsers] = useState(
    projectUsers || []
  );
  const [selectedItems, setSelectedItems] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    if (!propertyOwnerId) {
      if (preSelected) {
        setSelectedItems(preSelected);
      }
    }
  }, [preSelected]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !myRef.current.contains(event.target)
      ) {
        setFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const removeSelectedItem = (e, item) => {
    e.preventDefault();
    const updatedItems = selectedItems.filter(
      (selectedItem) => selectedItem._id !== item._id
    );
    setSelectedItems(updatedItems);
    updateSelectedArr(updatedItems);
  };

  const addSelectedItem = (item) => {
    if (!selectedItems.some((selectedItem) => selectedItem._id === item._id)) {
      const updatedItems = [...selectedItems, item];
      setSelectedItems(updatedItems);
      updateSelectedArr(updatedItems);
      setHighlightedIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // If an item is highlighted in dropdown, select it
      if (highlightedIndex >= 0 && filteredProjectUsers.length > 0) {
        addSelectedItem(filteredProjectUsers[highlightedIndex]);
        setCurrentInputValue("");
        setHighlightedIndex(-1);
        return;
      }

      // If no item is highlighted but there's input, check if it matches a user ID
      if (currentInputValue.trim()) {
        // First check in itemArray (all users) - now case insensitive
        const userById = itemArray.find(
          (item) =>
            item._id.toLowerCase() === currentInputValue.trim().toLowerCase()
        );
        if (userById) {
          addSelectedItem(userById);
          setCurrentInputValue("");
          setHighlightedIndex(-1);
        } else {
          // Show error toast if user not found
          toast.error("User not found");
        }
      }
    } else if (e.key === "ArrowDown" && filteredProjectUsers.length > 0) {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredProjectUsers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp" && filteredProjectUsers.length > 0) {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Escape") {
      setFocused(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentInputValue(value);
    setHighlightedIndex(-1);

    // Filter only from projectUsers for dropdown suggestions
    const filtered = projectUsers
      ? projectUsers.filter(
          (item) =>
            (item.name &&
              item.name.toLowerCase().includes(value.toLowerCase())) ||
            (item.phone && item.phone.includes(value))
        )
      : [];

    setFilteredProjectUsers(filtered);
  };

  useEffect(() => {

    const getProjUsers = async () => {
      if (itemArray && propertyOwnerId) {
        const ownerUser = await itemArray.find(
          (item) => item._id === propertyOwnerId
        );
        setSelectedItems([superAdminData,ownerUser]);
        updateSelectedArr([superAdminData,ownerUser]);
      }
    };

    getProjUsers();
  }, []);

  return (
    <div className="relative w-full">
      <div
        className={`w-full ${
          theme.palette.mode === "dark"
            ? "bg-[#141B2D] border-gray-600"
            : "bg-white border-gray-300"
        } rounded-md border transition-all duration-200 px-3 min-h-[48px] flex flex-wrap items-center gap-2 ${
          focused ? "border-blue-500 ring-2 ring-blue-100" : ""
        }`}
        onClick={() => myRef.current.focus()}
      >
        {selectedItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-md text-sm transition-all hover:bg-blue-600"
          >
            <span>{item.name || item.phone}</span>
            <span className="text-xs opacity-75">({item._id})</span>
            <button
              onClick={(e) => removeSelectedItem(e, item)}
              className="ml-1 hover:bg-blue-600 rounded-full p-1 transition-colors"
            >
              ×
            </button>
          </div>
        ))}

        <input
          ref={myRef}
          type="text"
          autoComplete="off"
          className={`flex-1 min-w-[120px] py-2 outline-none text-sm ${
            theme.palette.mode === "dark"
              ? "bg-[#141B2D] text-white"
              : "bg-white text-gray-900"
          }`}
          placeholder="Search project users or enter exact User ID"
          value={currentInputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setFocused(true);
            setFilteredProjectUsers(projectUsers || []);
          }}
        />
      </div>

      {focused && filteredProjectUsers.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-auto rounded-md shadow-lg"
        >
          <ul
            className={`py-1 ${
              theme.palette.mode === "dark"
                ? "bg-[#1F2A40] border-gray-600"
                : "bg-white border-gray-200"
            } border rounded-md`}
          >
            {filteredProjectUsers.map((item, index) => (
              <li
                key={item._id}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                  highlightedIndex === index
                    ? theme.palette.mode === "dark"
                      ? "bg-gray-700 text-white"
                      : "bg-blue-50 text-blue-700"
                    : theme.palette.mode === "dark"
                    ? "text-gray-200 hover:bg-gray-700"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => {
                  addSelectedItem(item);
                  setCurrentInputValue("");
                  myRef.current.focus();
                }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    {item.name && (
                      <span className="font-medium">{item.name}</span>
                    )}
                    {item.phone && (
                      <span
                        className={`${
                          item.name ? "text-gray-500" : "font-medium"
                        }`}
                      >
                        {item.name ? `(${item.phone})` : item.phone}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">ID: {item._id}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ChipComponentUsers;
