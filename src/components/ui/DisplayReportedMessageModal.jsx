import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { HiMiniUserGroup } from "react-icons/hi2";
import { useTheme } from "@mui/material";
import { toast } from 'react-toastify';

import { formatDate } from '../../MyFunctions';

function DisplayReportedMessagesModal({data, closeModal}) {
    const theme = useTheme()


  return (
    <div
            className={`fixed inset-0  p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif] `}>
            <div className={` ${theme.palette.mode === "dark"? "border-[1px] border-gray-600 text-gray-200 bg-[#090E17]":"text-gray-800 bg-white"} w-full max-w-md  shadow-lg rounded-lg p-6 relative`}>
                

                <div className="my-4  text-center">
                {/* <div className='flex  justify-center'><HiMiniUserGroup className='h-24 w-24 '/></div> */}
                    <h4 className=" text-lg font-semibold mt-4 mb-8">Reported Message Details </h4>
                    
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
            <p className="">{data.message}</p>
          </div>
          
        </div>

                </div>

                <div className="flex flex-col space-y-2">
                    <button type="button"
                    onClick={closeModal}
                        className="px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 hover:bg-gray-300 active:bg-gray-200">Close</button>
                </div>
            </div>
        </div>
  )
}

export default DisplayReportedMessagesModal