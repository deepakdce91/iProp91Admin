import axios from "axios";
import React, { useEffect, useState } from "react";
import { HiMiniUserGroup } from "react-icons/hi2";
import { useTheme } from "@mui/material";
import { toast } from "react-toastify";
import GroupFormationForm from "../configurations/GroupFormationForm";

function AddCommunityModal({
  _id,
  propertyData,
  propertyOwnerData,
  profilePicture,
  name,
  phone,
  userId,
  userToken,
  closeModal,
}) {
  const theme = useTheme();

  // addUser or makeGroup
  const [displayMode, setDisplayMode] = useState("addUser");

  const [communities, setCommunities] = useState([]);

  const [selectedObj, setSelectedObj] = useState();

  const handleSelect = (e) => {
    const selectedName = e.target.value;
    const selected = communities.find((obj) => obj.name === selectedName);
    setSelectedObj(selected);
  };

  const setModeToAddUser = () =>{
    setDisplayMode("addUser");
  }

  const handleSubmit = (e) => {
    const userObj = {
      _id,
      name,
      phone,
      profilePicture,
    };

    axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/communities/addCustomer/${selectedObj._id}?userId=${userId}`,
        userObj,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          if (response.data.success === true) {
            toast.success(response.data.message);
            closeModal();
          } else {
            toast(response.data.message);
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {

    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/communities/getAllCommunities?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setCommunities(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, []);

  return (
    <div
      className={`fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif] `}
    >
      {displayMode === "addUser" && <div
        className={`${
          theme.palette.mode === "dark"
            ? "text-gray-200 bg-[#090E17]"
            : "text-gray-800 bg-white"
        } w-full max-w-md  shadow-lg rounded-lg p-6 relative`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          onClick={closeModal}
          className="w-3 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500 float-right"
          viewBox="0 0 320.591 320.591"
        >
          <path
            d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
            data-original="#000000"
          ></path>
          <path
            d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
            data-original="#000000"
          ></path>
        </svg>

        <div className="my-4 text-center">
          <div className="flex  justify-center">
            <HiMiniUserGroup className="h-24 w-24 " />
          </div>
          <h4 className=" text-lg font-semibold mt-4">
            Add user to a community
          </h4>
          <select
            id="dropdown"
            onChange={handleSelect}
            className=" border-[1px] mt-5 text-gray-800 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">--Select a Community--</option>
            {communities.map((obj) => (
              <option key={obj._id} value={obj.name}>
                {obj.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-white text-sm tracking-wide bg-green-500 hover:bg-green-600 active:bg-green-500"
          >
            Add
          </button>
          <h3 className="flex items-center w-full">
            <span className="flex-grow bg-gray-200 rounded h-[1px]"></span>
            <span className="mx-3 text-lg font-medium">or</span>
            <span className="flex-grow bg-gray-200 rounded h-[1px]"></span>
          </h3>
          <button
            type="button"
            onClick={()=>{
              setDisplayMode("createGroup");
            }}
            className="px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 border border-1 border-gray-400 hover:bg-white hover:text-black active:bg-gray-200"
          >
            Create a group
          </button>
        </div>
      </div>}

      {displayMode === "createGroup" && <div className={`z-50 ${theme.palette.mode === "dark" ? "bg-black" : "bg-white"}`}>
        
        <GroupFormationForm propertyOwnerId={propertyOwnerData._id} closeModal={closeModal} propertyData={propertyData} setModeToDisplay={setModeToAddUser}  userId={userId} userToken = {userToken}/>
        </div>}
    </div>
  );
} 

export default AddCommunityModal;
