
import ShowPropertyDetails from "../../general/property/ShowPropertDetails"
import { useState } from "react";
import { useTheme } from "@mui/material";
import { MdClose } from "react-icons/md";

export default function PropertyCard({props}) {
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
    <>
      <div className="h-52 w-fit border-transparent border-b-4 border-[1px] hover:border-simple hover:border-b-4 hover:border-[1px] p-4 rounded-xl">
      <img
            src="/propertyImage.jpeg"
            alt="home"
            className="h-32 rounded-xl object-cover "
          />
          <div className=" flex justify-between mt-3 mb-1">
            <h1 className="text-xl">{props.project}</h1>
            <p className="text-xs  mt-auto mb-auto">Tower: {props.tower}</p>
          </div>
          <div className="flex justify-between">
            <h1 className="text-xs">{props.builder}</h1>
            <p className="text-xs ">Unit: {props.unit}</p>
          </div>
          <div className="flex flex-row justify-between mt-4 gap-2">
 
            <button className=" w-full text-[14px] text-gray-700 hover:text-black bg-slate-300 hover:bg-white py-2 px-4 rounded-lg"
            onClick={onClickView}
            >
              View Details
            </button>
          </div>

        </div>
        {isModalOpen === true && <div className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]">
            <div className={`relative rounded-lg p-4 shadow-lg max-w-lg w-full pt-9 ${mode === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <button onClick={closeEditModal} className="absolute top-2 right-2  text-sm">
                <MdClose className="h-5 w-5"/>
              </button>
              <ShowPropertyDetails  data={props} />
            </div>
          </div>}
        
    </>
  );
}