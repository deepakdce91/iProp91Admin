import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import Chats from "./Chats";
import { IoChevronBackSharp } from "react-icons/io5";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineClose } from "react-icons/md";
import { IoStarOutline, IoStar } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-toastify";

const defaultCommunityUrl = "/community-pfp.jpg";

function ChatScreen({ userId, userToken }) {
  const theme = useTheme();

  const [groupNames, setGroupNames] = useState([]);
  const [filteredGroupNames, setFilteredGroupNames] = useState([]);
  const [currentGroupData, setCurrentGroupData] = useState();
  const [isUsersListOpen, setIsUsersListOpen] = useState(false);
  const [communitySearchQuery, setCommunitySearchQuery] = useState("");

  // Fetch all communities
  const fetchAllCommunities = () => {
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
        setGroupNames(response.data.data);
        setFilteredGroupNames(response.data.data); // Initialize with all communities
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Toggle admin status
  const toggleAdmin = async (communityId, idOfUser) => {
    axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/communities/toggleAdmin/${communityId}/${idOfUser}?userId=${userId}`,
        {},
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        toast(response.data.message);

        // Update the state locally to reflect the admin change
        setCurrentGroupData((prevGroup) => {
          const updatedCustomers = prevGroup.customers.map((customer) => {
            if (customer._id === idOfUser) {
              return {
                ...customer,
                admin: customer.admin === "true" ? "false" : "true",
              };
            }
            return customer;
          });

          return { ...prevGroup, customers: updatedCustomers };
        });

        fetchAllCommunities();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Filter the communities based on search query
  useEffect(() => {
    if (communitySearchQuery.trim() === "") {
      setFilteredGroupNames(groupNames); // Reset to full list if search query is empty
    } else {
      const filtered = groupNames.filter((community) =>
        community.name
          .toLowerCase()
          .includes(communitySearchQuery.toLowerCase())
      );
      setFilteredGroupNames(filtered);
    }
  }, [communitySearchQuery, groupNames]);

  useEffect(() => {
    fetchAllCommunities();
  }, []);

  return (
    <div>
      {/* <!-- component --> */}
      <div className="flex  overflow-hidden relative">
        {/* <!-- Sidebar --> */}
        <div
          className={` bg-transparent border-r border-gray-300 ${
            currentGroupData ? "hidden md:block  w-1/4" : "w-full"
          }`}
        >
          {/* <!-- Sidebar Header --> */}
          <header className="p-4 border-b flex-col border-gray-300 flex justify-between items-center bg-indigo-600 text-white">
            <h1 className="text-2xl font-semibold">Conversations</h1>
            <div className="flex px-4 py-3 mt-2 rounded-md border-[1px] border-gray-200 overflow-hidden max-w-md mx-auto font-[sans-serif]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 192.904 192.904"
                width="16px"
                className="fill-white mr-3 rotate-90"
              >
                <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
              </svg>
              <input
                type="text"
                value={communitySearchQuery}
                onChange={(e) => {
                  setCommunitySearchQuery(e.target.value);
                }}
                placeholder="Search"
                className="w-full outline-none bg-transparent text-gray-100 text-sm"
              />
            </div>
          </header>

          {/* <!-- Community List --> */}
          <div className="overflow-y-auto bg-transparent h-fit p-3 mb-9 pb-20">
            {filteredGroupNames.map((item, index) => {
              return (
                <div
                  onClick={() => {
                    setCurrentGroupData(item);
                  }}
                  key={`community-${index}`}
                  className={`flex items-center mb-4 cursor-pointer ${
                    currentGroupData &&
                    (currentGroupData._id === item._id ? "bg-gray-200" : null)
                  } hover:bg-gray-200  ${
                    theme.palette.mode === "dark"
                      ? "bg-opacity-20 hover:bg-opacity-20"
                      : null
                  } p-2 rounded-md`}
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                    <img
                      src={
                        item.thumbnail !== ""
                          ? item.thumbnail
                          : defaultCommunityUrl
                      }
                      alt="User Avatar"
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* <!-- Main Chat Area --> */}
        <div className={`flex-1  ${currentGroupData ? "w-3/4" : " hidden"}`}>
          <div className="flex flex-col h-[88vh]">
            {/* <!-- Chat Header --> */}
            <header
              className={`${
                theme.palette.mode === "dark"
                  ? "bg-green-700 text-gray-100"
                  : "text-white bg-green-500"
              }  p-4  `}
            >
              {currentGroupData && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <button
                      className="text-gray-200 hover:scale-110 hover:text-white"
                      onClick={() => setCurrentGroupData()}
                    >
                      <IoChevronBackSharp className="w-6 h-6 mr-3 " />
                    </button>
                    <h1 className="text-2xl font-semibold">
                      {currentGroupData.name}
                    </h1>
                  </div>

                  <button
                    onClick={() => {
                      setIsUsersListOpen(true);
                    }}
                    className="font-bold text-gray-200 hover:text-white hover:scale-110"
                  >
                    <BsInfoCircle className="w-6 h-6 mr-4 " />
                  </button>
                </div>
              )}

              {!currentGroupData && (
                <div className="flex justify-between items-center">
                  <p className="text-2xl">See all conversations here</p>
                </div>
              )}
            </header>

            {/* <!-- Chat Messages --> */}

            {currentGroupData && (
              <Chats
                currentGroupDetails={currentGroupData}
                communityId={currentGroupData._id}
                userId={userId}
                userToken={userToken}
              />
            )}
            {!currentGroupData && (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-lg mx-3">{`Select a community to see the messages.`}</p>
              </div>
            )}
          </div>
        </div>

        {/* ------ members list sidebar  */}
        {currentGroupData && isUsersListOpen === true && (
          <div
            className={` animate-slide-in-right  ease-in-out absolute top-0 right-0 h-full w-[300px] p-4   border-l shadow-md sm:p-8  ${
              theme.palette.mode === "dark"
                ? "bg-[#141B2D] text-gray-100"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <button
              className="absolute top-4 left-4 hover:-rotate-90 hover scale-110 transition-all duration-300 mr-8"
              onClick={() => {
                setIsUsersListOpen(false);
              }}
            >
              <MdOutlineClose className="w-6 h-6  " />
            </button>

            <h3 className="text-xl font-bold text-center leading-none mb-4">
              List of users
            </h3>

            <ul
              role="list"
              className={`divide-y ${
                theme.palette.mode === "dark"
                  ? "divide-gray-600"
                  : "divide-gray-300"
              }`}
            >
              {currentGroupData.customers.map((customer, index) => {
                return (
                  <li className="py-3 sm:py-4" key={`user-${index}-list`}>
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          className="w-8 h-8 rounded-full"
                          src={
                            customer.profilePicture !== ""
                              ? customer.profilePicture
                              : process.env.REACT_APP_DEFAULT_PROFILE_URL
                          }
                          alt="user image"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{customer.name}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleAdmin(
                            currentGroupData._id,
                            customer._id,
                            userId,
                            userToken
                          );
                        }}
                        className={`${
                          theme.palette.mode === "dark"
                            ? "text-gray-200 hover:bg-gray-200 hover:bg-opacity-20 "
                            : " text-gray-500 hover:bg-gray-200"
                        } rounded-lg p-2 inline-flex items-center `}
                      >
                        {customer.admin === "false" ? (
                          <IoStarOutline className="w-5 h-5" />
                        ) : (
                          <IoStar className="w-5 h-5 text-red-500" />
                        )}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatScreen;
