import React from 'react'
import { BsSafeFill } from "react-icons/bs";

import { useState } from "react";
import { useTheme } from "@mui/material";
import { MdClose } from "react-icons/md";
import AccordionCustomIcon from '../../ui/Accordion';

function SafeCard({safe, userToken, userId}) {

    const theme = useTheme();

    const mode = theme.palette.mode;

    const [isModalOpen, setIsModalOpen] = useState(false)

  const onClickView = () =>{
    setIsModalOpen(true);
  }

  const closeEditModal = ()=>{
    setIsModalOpen(false)
  }

  return (

    <div  className="w-full cursor-pointer px-6 mb-3 sm:2/3 md:w-1/2 xl:w-1/3">
            <div onClick={onClickView} className="flex items-center px-5 py-6 shadow-sm rounded-md bg-slate-100">
                <div className="p-3 rounded-full bg-indigo-600 bg-opacity-75">
                <BsSafeFill className='h-8 w-8'/>
                </div>

                <div className="mx-5">
                    <h4 className="text-2xl font-semibold text-gray-700">Safe{` ${safe._id}`}</h4>
                    <div className="text-gray-500">For property : {safe.propertyId}</div>
                </div>
            </div>

            {isModalOpen === true && <div className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]">
            <div className={`relative rounded-lg p-4 shadow-lg max-w-lg w-full pt-9 ${mode === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <button onClick={closeEditModal} className="absolute top-2 right-2  text-sm">
                <MdClose className="h-5 w-5"/>
              </button>
              <AccordionCustomIcon
                          userId={userId}
                          userToken={userToken}
                          propertyId={safe.propertyId}
                          safeData={safe}
                        />
            </div>
          </div>}
        </div> 
  )
}

export default SafeCard