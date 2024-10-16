import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import Chats from "./Chats";
import { IoChevronBackSharp } from "react-icons/io5";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineClose } from "react-icons/md";
import { IoStarOutline } from "react-icons/io5";
import { IoStar } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-toastify";


const defaultCommunityUrl = "https://img.freepik.com/premium-vector/teamwork-business-team-friendship-icon-social-group-organization-vector-conceptual-unusual-symbol-your-design_570429-33721.jpg"


function ChatScreen({userId, userToken}) {
  const theme = useTheme();

  const [groupNames, setGroupNames] = useState([]);
  const [currentGroupData, setCurrentGroupData] = useState();

  const [isUsersListOpen, setIsUsersListOpen] = useState(false);


  const fetchAllCommunities = () => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/communities/getAllCommunities?userId=${userId}`, {
          headers: {
            "auth-token" : userToken
          },
        })
      .then((response) => {
        setGroupNames(response.data.data);

      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };


  const toggleAdmin = async(communityId,idOfUser)=>{

    axios
      .put(`${process.env.REACT_APP_BACKEND_URL}/api/communities/toggleAdmin/${communityId}/${idOfUser}?userId=${userId}`,{}, {
          headers: {
            "auth-token" : userToken
          },
        })
      .then((response) => {
         // Success message
         toast(response.data.message);

         // Update the state locally to reflect the admin change
         setCurrentGroupData((prevGroup) => {
             const updatedCustomers = prevGroup.customers.map((customer) => {
                 if (customer._id === idOfUser) {
                     return { ...customer, admin: customer.admin === "true" ? "false" : "true" };
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


  }


  useEffect(() => {
    
    fetchAllCommunities();
    
  }, [])
  

  return (
    <div>
      {/* <!-- component --> */}
      <div className="flex  overflow-hidden relative">
        {/* <!-- Sidebar --> */}
        <div className={` bg-transparent border-r border-gray-300 ${currentGroupData ? "hidden md:block  w-1/4" : "w-1/2" }`}>
          {/* <!-- Sidebar Header --> */}
          <header className="p-4 border-b border-gray-300 flex justify-between items-center bg-indigo-600 text-white">
            <h1 className="text-2xl font-semibold">Conversations</h1>
          </header>

          {/* <!-- Contact List --> */}
          <div className="overflow-y-auto bg-transparent h-fit p-3 mb-9 pb-20">
            {groupNames.map((item, index) => {
              return (
                <div
                  onClick={() => {
                    setCurrentGroupData(item);
                  }}
                  key={`community-${index}`}
                  className={`flex items-center mb-4 cursor-pointer ${currentGroupData._id === item._id ? "bg-gray-200" : null } hover:bg-gray-200  ${
                    theme.palette.mode === "dark" ? "bg-opacity-20 hover:bg-opacity-20" : null
                  } p-2 rounded-md`}
                >
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
                    <img
                      src={(item.thumbnail !== "") ? item.thumbnail : defaultCommunityUrl}
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
        <div className={`flex-1  ${currentGroupData ? "w-3/4" : " w-1/2" }`}>
          <div className="flex flex-col h-[88vh]">
            {/* <!-- Chat Header --> */}
            <header
              className={`${
                theme.palette.mode === "dark"
                  ? "bg-green-700 text-gray-100"
                  : "text-white bg-green-500"
              }  p-4  `}
            >

              {currentGroupData && <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <button
                    className="text-gray-200 hover:scale-110 hover:text-white"
                    onClick={() => setCurrentGroupData()}
                  >
                    <IoChevronBackSharp className="w-6 h-6 mr-3 " />
                  </button>
                  <h1 className="text-2xl font-semibold">{currentGroupData.name}</h1>
                </div>

                <button onClick={()=>{setIsUsersListOpen(true)}} className="font-bold text-gray-200 hover:text-white hover:scale-110">
                  <BsInfoCircle  className="w-6 h-6 mr-4 " />
                </button>
              </div>}

              {!currentGroupData && <div className="flex justify-between items-center"> 
                <p className="text-2xl">See all conversations here</p>
                </div>}

            </header>

            {/* <!-- Chat Messages --> */}
            {currentGroupData && <Chats communityId={currentGroupData._id} userId={userId} userToken = {userToken}/>}
            {!currentGroupData && (
              <div className="h-full w-full flex items-center justify-center">
                <p className="text-lg mx-3">{`Select a community to see the messages.`}</p>
              </div>
            )}
          </div>
        </div>

        {/* ------ members list sidebar  */}
       {currentGroupData &&  (isUsersListOpen === true) && <div className={` animate-slide-in-right  ease-in-out absolute top-0 right-0 h-full w-[300px] p-4   border-l shadow-md sm:p-8  ${theme.palette.mode === "dark" ? "bg-[#141B2D] text-gray-100" : "bg-gray-100 text-gray-900"}`}>

        <button className="absolute top-4 left-4 hover:-rotate-90 hover scale-110 transition-all duration-300 mr-8" onClick={()=>{
            setIsUsersListOpen(false);
        }}>
        <MdOutlineClose className="w-6 h-6  "/>
        </button>

        <h3 className="text-xl font-bold text-center leading-none mb-4">List of users</h3>

        <ul role="list" className={`divide-y ${theme.palette.mode === "dark" ? "divide-gray-600" : "divide-gray-300"}`}>
            
            {currentGroupData.customers.map((customer,index)=>{
                return <li className="py-3 sm:py-4" key={`user-${index}-list`}>
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <img className="w-8 h-8 rounded-full" src={(customer.profilePicture !== "") ? customer.profilePicture : process.env.REACT_APP_DEFAULT_PROFILE_URL} alt="user image"/>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                            {customer.name}
                        </p>

                    </div>
                    <button
                    onClick={(e)=>{
                        e.preventDefault();
                        toggleAdmin(currentGroupData._id, customer._id, userId, userToken)
                    }}
                    className={`${theme.palette.mode === "dark" ? "text-gray-200 hover:bg-gray-200 hover:bg-opacity-20 " : " text-gray-500 hover:bg-gray-200"} rounded-lg p-2 inline-flex items-center `}>
                        {customer.admin === "false" ? <IoStarOutline  className="w-5 h-5" /> : <IoStar  className="w-5 h-5 text-red-500" />}
                        
                        
                    </button>
                </div>
            </li>
            })}

            
        </ul>
        </div>}
      </div>
    </div>
  );
}

export default ChatScreen;
