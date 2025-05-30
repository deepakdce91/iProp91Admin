import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; 
import {sortArrayByName} from "../../MyFunctions"

function StatehtmlForm({ editData, userId, userToken }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [statesArray, setStatesArray] = useState([]);

  const [addData, setAddData] = useState({
    name: "",
    enable: "no",
    addedBy: "admin",
  });

  const changeName = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      name: value,
    }));
  };

  const changeEnableStatus = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      enable: value,
    }));
  };


  const handleSubmit = (addData) => {
    if (addData.name !== "") {
      if (editData) {
        axios
          .put(
            `${process.env.REACT_APP_BACKEND_URL}/api/state/updatestate/${editData._id}?userId=${userId}`,
            addData, {
              headers: {
                "auth-token" : userToken
              },
            }
          )
          .then((response) => {
            if (response) {
              toast("State updated!");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error("Some ERROR occurred.");
          });
      } else {
        axios
          .post(`${process.env.REACT_APP_BACKEND_URL}/api/state/addstate?userId=${userId}`, addData, {
            headers: {
              "auth-token" : userToken
            }, 
          })
          .then((response) => {
            if (response) {
              toast("State added!");
              changeName("");
              changeEnableStatus("no");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error("Some ERROR occurred.");
          });
      }
    } else {
      toast.error("Enter a name.");
    }
  };

  useEffect(() => {
    axios
    .get(`https://api.countrystatecity.in/v1/countries/IN/states`,{
      headers: {
        'X-CSCAPI-KEY': process.env.REACT_APP_CSC_API,
      }
    })
    .then((response) => {
      setStatesArray(sortArrayByName(response.data));
    })
    .catch((error) => {
      console.error("Error:", error);
    });

    // getting userId and Token
    
  }, [])
  

  useEffect(() => {
    if (editData) {
      setAddData({
        name: editData.name,
        enable: editData.enable,
        addedBy: editData.addedBy,
      });
    }
  }, [editData]);

  return (
    <Box
    sx={{
      "& .MuiInputBase-root": {
        backgroundColor: colors.primary[400],
        color: theme.palette.mode === "dark" ? colors.grey[100] : colors.grey[900],
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
      "& .MuiFormHelperText-root": {
        color: colors.grey[200],
      },
      "& .MuiFormLabel-root": {
        color: colors.grey[100],
        "&.Mui-focused": {
          color: colors.greenAccent[300],
        },
      },
      "& .MuiButton-root": {
        backgroundColor: colors.blueAccent[700],
        color: colors.grey[100],
        "&:hover": {
          backgroundColor: colors.greenAccent[400],
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
      "& .MuiCheckbox-root": {
        color: `${colors.greenAccent[200]} !important`,
      },
    }}
    >
      <div className="flex items-center justify-center pl-6 px-12">
        <div className="w-full">
          <form>
            <div className="-mx-3 flex flex-wrap">
              <div className="w-full px-3 sm:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="fName"
                    className="mb-3 block text-base font-medium"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="off"
                    list="mystates"
                    value={addData.name}
                    onChange={(e) => {
                      changeName(e.target.value);
                    
                    }}
                    placeholder="State"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                  <datalist id="mystates">
                    {statesArray.length > 0 &&
                      statesArray.map((item, index) => (
                        <option key={index} value={item.name}/> 
                      ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Enable state?
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="enable"
                    value="yes"
                    className="h-5 w-5"
                    id="radioButton1"
                    checked={addData.enable === "yes"}
                    onChange={(e) => changeEnableStatus(e.target.value)}
                  />
                  <label
                    htmlFor="radioButton1"
                    className="pl-3 text-base font-medium"
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="enable"
                    value="no"
                    className="h-5 w-5"
                    id="radioButton2"
                    checked={addData.enable === "no"}
                    onChange={(e) => changeEnableStatus(e.target.value)}
                  />
                  <label
                    htmlFor="radioButton2"
                    className="pl-3 text-base font-medium"
                  >
                    No
                  </label>
                </div>
              </div>
            </div>

            <div>
              <button
              style={{ backgroundColor: colors.blueAccent[500] }}
                className="hover:shadow-htmlForm rounded-md py-3 px-8 text-center text-base font-semibold text-white outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(addData);
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default StatehtmlForm;
