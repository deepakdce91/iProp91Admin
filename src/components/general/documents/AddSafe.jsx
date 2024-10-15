import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";


function AddSafe({  setModeToDisplay, userToken, userId  }) {
 
    const [propertyId, setpropertyId] = useState("")
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleSubmit = (e) => {
   
      if (
        propertyId !== ""
      ) {
        axios
            .post(`${process.env.REACT_APP_BACKEND_URL}/api/documents/adddocumentsafe?userId=${userId}`, {
                propertyId
            },  {
              headers: {
                "auth-token" : userToken
              },
            })
            .then((response) => {
              if (response) {
                toast(response.data.message);
                setpropertyId("");
                if(response.data.success === true){
                    setTimeout(() => {
                        setModeToDisplay();
                    }, 1000);
                }
               
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              toast.error("Some ERROR occurred.");
            });
      } else {
        toast.error("Provide Property id.");
      }
    
  };

  return (
    <Box
      sx={{
        padding: "24px",
        "& .MuiInputBase-root": {
          backgroundColor: colors.primary[400],
          color: colors.grey[100],
          borderRadius: "4px",
          "&:hover": {
            borderColor: colors.blueAccent[700],
          },
        },
        "& .MuiInputLabel-root": {
          color: colors.grey[300],
          "&.Mui-focused": {
            color: colors.blueAccent[700],
          },
        },
        "& .MuiFormControl-root": {
          marginBottom: "16px",
        },
        "& .MuiSelect-root": {
          backgroundColor: colors.primary[400],
          color: colors.grey[100],
          borderRadius: "4px",
          "&:hover": {
            borderColor: colors.blueAccent[700],
          },
        },
        "& .MuiFormLabel-root": {
          color: colors.grey[100],
          "&.Mui-focused": {
            color: colors.greenAccent[300],
          },
        },
        "& .MuiRadio-root": {
          color: `${colors.greenAccent[200]} !important`,
        },
        "& .MuiButton-root": {
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
          "&:hover": {
            backgroundColor: colors.greenAccent[400],
          },
        },
        "& .MuiFormHelperText-root": {
          color: colors.grey[200],
        },
      }}
    >
      <div className="flex items-center justify-center">
        <div className="w-full">
          <form>

             {/* // customer name and number  */}
             <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="c-id"
                    className="mb-3 block text-base font-medium"
                  >
                    Property Id 
                  </label>
                  <input
                    type="text"
                    name="c-id"
                    id="c-id"
                    value={propertyId}
                    onChange={(e) => setpropertyId(e.target.value)}
                    placeholder="Property id"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>

            </div>



            <div className="flex  mt-5">
              <button
                type="button"
                onClick={handleSubmit}
                className={`px-8 py-3 bg-[#6A64F1] text-white font-medium hover:bg-[#5a52e0] text-sm rounded-md shadow-md  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}

              >
                {"Create Safe"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default AddSafe;
