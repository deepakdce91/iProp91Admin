import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {getNameList} from "../../MyFunctions";
import {sortArrayByName} from "../../MyFunctions";

function CityForm({ editData, userId, userToken  }) {
  const [states, setStates] = useState([]);
  const [currentStateCode , setCurrentStateCode ] = useState("") //iso2
  const [cities, setCities] = useState([]);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    name: "",
    enable: "no",
    state: "",
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

  const changeState = (value) => {

    setAddData((prevData) => ({
      ...prevData,
      state: value,
    }));

    const selectedValue = value;
    const item = states.find(state => state.name === selectedValue);

        if (item) {
          setCurrentStateCode(item.iso2);
        }

    
  };

  const handleSubmit = (addData) => {
    if (addData.name !== "" && addData.state !== "") {
      if (editData) {
        axios
          .put(`${process.env.REACT_APP_BACKEND_URL}/api/city/updatecity/${editData._id}?userId=${userId}`, addData, {
              headers: {
                "auth-token" : userToken
              },
            })
          .then((response) => {
            if (response) {
              toast("City updated!");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error("Some ERROR occurred.");
          });
      } else {
        axios
          .post(`${process.env.REACT_APP_BACKEND_URL}/api/city/addcity?userId=${userId}`, addData, {
              headers: {
                "auth-token" : userToken
              },
            })
          .then((response) => {
            if (response) {
              toast("City added!");
              changeName("");
              changeState("");
              changeEnableStatus("no");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error("Some ERROR occurred.");
          });
      }
    } else {
      toast.error("Fill all the fields.");
    }
  };

  const fetchAllStates = () => {
    
      axios
      .get(`https://api.countrystatecity.in/v1/countries/IN/states`,{
        headers: {
          'X-CSCAPI-KEY': process.env.REACT_APP_CSC_API,
        }
      })
      .then((response) => {
        setStates(sortArrayByName(response.data));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    
  };

  useEffect(() => {
    fetchAllStates();

    if (editData) {
      setAddData({
        name: editData.name,
        enable: editData.enable,
        state: editData.state || "", // Added this line to handle editing
        addedBy: editData.addedBy,
      });
    }
  }, [editData]);

  // fetching cities by state
  useEffect(() => {
    if(currentStateCode !== ""){
      axios
      .get(`https://api.countrystatecity.in/v1/countries/IN/states/${currentStateCode}/cities`,{
        headers: {
          'X-CSCAPI-KEY': process.env.REACT_APP_CSC_API,
        }
      })
      .then((response) => {
        setCities(sortArrayByName(response.data));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    }
  }, [currentStateCode]);

  return (
    <Box
      sx={{
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
            <div className="flex flex-col md:flex-row gap-2">

            <div className="flex flex-col space-y-4 pr-4 w-full md:w-1/2 pb-5">
                <label className="text-lg font-medium">
                  Choose a state
                </label>
                <input
                  list="states"
                  name="myState"
                  className="w-full text-gray-600 -mt-1 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  autoComplete="off"
                  placeholder="Select a state..."
                  value={addData.state}
                  onChange={(e) => changeState(e.target.value)}
                />
                <datalist id="states">
                  {states.length > 0 &&
                    states.map((item, index) => (
                      <option
                        key={index}
                        value={item.name}
                      />
                    ))}
                </datalist>
              </div>


              <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 pb-6">
                <div className="w-full pr-3">
                  <div className="mb-5">
                    <label
                      htmlFor="fName"
                      className="text-lg font-medium"
                    >
                      Set City
                    </label>
                    <input
                      type="text"
                      list="cities"
                      autoComplete="off"
                      name="name"
                      id="name"
                      value={addData.name}
                      onChange={(e) => changeName(e.target.value)}
                      placeholder="City"
                      className="w-full mt-[18px] text-gray-700 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    />
                     <datalist id="cities">
                  {cities.length > 0 &&
                    cities.map((item, index) => (
                      <option
                        key={index}
                        value={item.name}
                      />
                    ))}
                </datalist>
                  </div>
                </div>
              </div>

              
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Enable city?
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="radio1"
                    id="radioButton1"
                    className="h-5 w-5"
                    value="yes"
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
                    name="radio1"
                    id="radioButton2"
                    className="h-5 w-5"
                    value="no"
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
                className="hover:shadow-htmlForm rounded-md py-3 px-8 text-center text-base font-semibold text-white outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(addData);
                }}
                style={{ backgroundColor: colors.blueAccent[500] }}
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

export default CityForm;
