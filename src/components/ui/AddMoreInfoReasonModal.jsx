import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { HiMiniUserGroup } from "react-icons/hi2";
import { useTheme } from "@mui/material";
import { toast } from 'react-toastify';

function AddMoreInfoReasonModal({_id, updateOriginalData, userId, userToken, closeModal}) {
    const theme = useTheme()

const [myMoreInfoReason, setMyMoreInfoReason] = useState("");

  const handleSubmit = (e) =>{
    e.preventDefault();
    axios
        .put(
          `${process.env.REACT_APP_BACKEND_URL}/api/property/updateproperty/${_id}?userId=${userId}`,
          {
            applicationStatus: "more-info-required",
            moreInfoReason : myMoreInfoReason
          },
          {
            headers: {
              "auth-token": userToken,
            },
          }
        )
        .then((response) => {
          if (response) {
            toast.success("Field updated!");
            updateOriginalData("applicationStatus", "more-info-required");
            setTimeout(() => {
                closeModal();
            }, 1000);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error("Some ERROR occurred.");
        });
  }


  return (
    <div
            className={`fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif] `}>
            <div className={`${theme.palette.mode === "dark"? "text-gray-200 bg-[#090E17]":"text-gray-800 bg-white"} w-full max-w-md  shadow-lg rounded-lg p-6 relative`}>
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

                <div className="my-4 text-center">
                <div className='flex  justify-center'><HiMiniUserGroup className='h-24 w-24 '/></div>
                    <h4 className=" text-lg font-semibold mt-4">Add a reason why and what more info is required?</h4>

                    <textarea className='w-full  text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md' name="moreInfoReason" id="moreInfoReason" value={myMoreInfoReason} onChange={(e)=>{setMyMoreInfoReason(e.target.value)}}/>

                    
                </div>

                <div className="flex flex-col space-y-2">
                    <button type="button"
                    onClick={handleSubmit}
                        className="px-4 py-2 rounded-lg text-white text-sm tracking-wide bg-green-500 hover:bg-green-600 active:bg-green-500">Sumbit</button>
                    <button type="button"
                    onClick={closeModal}
                        className="px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 hover:bg-gray-300 active:bg-gray-200">Cancel</button>
                </div>
            </div>
        </div>
  )
}

export default AddMoreInfoReasonModal