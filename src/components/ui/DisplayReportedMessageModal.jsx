import axios from "axios";
import React, { useEffect, useState } from "react";
import { HiMiniUserGroup } from "react-icons/hi2";
import { toast } from "react-toastify";
import { MdDeleteForever } from "react-icons/md";
import { GrFlagFill, GrFlag } from "react-icons/gr";

import {  useTheme } from "@mui/material";

import { formatDate } from "../../MyFunctions";

function DisplayReportedMessagesModal({ data, closeModal, userToken, userId }) {
  const theme = useTheme();

  const [currentMessageFlag, setCurrentMessageFlag] = useState();

  const handleUpdateFlag = () =>{
    axios
    .get(`${process.env.REACT_APP_BACKEND_URL}/api/messages/getSingleMessage/${data.groupId}/${data.messageId}?userId=${userId}`, {
        headers: {
          "auth-token" : userToken
        },
      })
    .then((response) => {
      setCurrentMessageFlag(response.data.message.flag)
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  }

  const handleChangeMade = async() =>{
     // Make the DELETE request
     await axios
     .put(`${process.env.REACT_APP_BACKEND_URL}/api/reportedMessages/setActionTaken/${data.groupId}/${data.messageId}?userId=${userId}`,
      {},
       {
         headers: {
           "auth-token" : userToken
         },
       })
     .catch((error) => {
       console.error("Error:", error);
       toast.error("Some ERROR occured.");
     });
  }

  const handleDelete = async(e)=>{
    e.preventDefault();

    await axios
    .delete(`${process.env.REACT_APP_BACKEND_URL}/api/messages/deleteMessage/${data.groupId}/${data.messageId}?userId=${userId}`, {
        headers: {
          "auth-token" : userToken
        },
      })
    .then((response) => {
     if(response.data.success === false){
      toast.error(response.data.message)
     }else{
      toast.success(response.data.message)
      handleChangeMade();
     }
    })
    .catch((error) => {
      console.error("Error:", error);
    });


  }

  const handleToggleFlag = async(e)=>{
    e.preventDefault();

    await axios
    .put(`${process.env.REACT_APP_BACKEND_URL}/api/messages/toggleFlag/${data.groupId}/${data.messageId}?userId=${userId}`,{}, {
        headers: {
          "auth-token" : userToken
        },
      })
    .then((response) => {
     if(response.data.success === false){
      toast.error(response.data.message)
     }else{
      toast.success(response.data.message);
      handleChangeMade();
      handleUpdateFlag();
     }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  }

  useEffect(() => {
    
   handleUpdateFlag();
  
  }, [])
  
  return (
    <div
      className={`fixed inset-0  p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif] `}
    >
      <div
        className={` ${
          theme.palette.mode === "dark"
            ? "border-[1px] border-gray-600 text-gray-200 bg-[#090E17]"
            : "text-gray-800 bg-white"
        } w-full max-w-md  shadow-lg rounded-lg p-6 relative`}
      >
{/* // close svg  */}
<svg xmlns="http://www.w3.org/2000/svg"
                onClick={closeModal}
                    className="w-3 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500 float-right" viewBox="0 0 320.591 320.591">
                    <path
                        d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                        data-original="#000000"></path>
                    <path
                        d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                        data-original="#000000"></path>
                </svg>


        <div className="my-4  text-center">
          {/* <div className='flex  justify-center'><HiMiniUserGroup className='h-24 w-24 '/></div> */}
          <h4 className=" text-lg font-semibold mt-4 mb-8">
            Reported Message Details{" "}
          </h4>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide  text-xs font-bold mb-2">
                Reported by
              </label>
              <p className="">{data.reportedBy}</p>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide  text-xs font-bold mb-2">
                Reported at
              </label>
              <p className="">{formatDate(data.createdAt)}</p>
            </div>
          </div>

          <div className="flex flex-wrap -mx-3 mb-6">
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide  text-xs font-bold mb-2">
                Group Name
              </label>
              <p className="">{data.groupName}</p>
            </div>
            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide  text-xs font-bold mb-2">
                Message by
              </label>
              <p className="">{data.messageBy}</p>
            </div>
          </div>

          <div className="flex flex-wrap i-mx-3 mb-6">
            <div className="w-full  px-3 mb-6 md:mb-0">
              <label className="block uppercase tracking-wide  text-xs font-bold mb-2">
                Message
              </label>
              <p className=" overflow-auto">{data.message}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
        <button
            type="button"
            onClick={handleDelete}
            className="group flex items-center justify-center px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 hover:bg-red-500 active:bg-red-600"
          >
            <MdDeleteForever className="group-hover:text-white h-5 w-5 mr-2"/>
            <p className="group-hover:text-white">{"Delete Message"}</p>

          </button>

          <button
            type="button"
            onClick={handleToggleFlag}
            className="flex items-center justify-center group px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 hover:bg-blue-500 active:bg-blue-600"
          >
            {currentMessageFlag === "true" ? <GrFlag className="group-hover:text-white h-4 w-4 mr-2"/> :<GrFlagFill className="group-hover:text-white h-4 w-4 mr-2"/>}
            <p className="group-hover:text-white">{currentMessageFlag === "true" ? "Unflag Message" : "Flag Message"}</p>

          </button>
        </div>

        
      </div>
    </div>
  );
}

export default DisplayReportedMessagesModal;
