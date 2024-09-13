import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../..//theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {getNameList} from "../../MyFunctions";
import {getUniqueItems} from "../../MyFunctions";

function BuildersForm({ editData }) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);


  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    name: "",
    enable: "no",
    state: "",
    city : "",
    addedBy: "Unknown",
  });

  const fetchCitiesByState = (state) =>{
    axios
      .get(`http://localhost:3700/api/city/fetchcitiesbystate/${state}`)
      .then((response) => {
        setCities(getUniqueItems(getNameList(response.data)));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

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

    if(value && value.length > 0){
      fetchCitiesByState(value);
    }
  };

  const changeCity = (value) => {
    setAddData((prevData) => ({
      ...prevData,
      city: value,
    }));
  };

  const handleSubmit = (addData) => {
    if (addData.name !== "" && addData.state !== "" && addData.city !== "") {
      if (editData) {
        axios
          .put(`http://localhost:3700/api/builders/updatebuilder/${editData._id}`, addData)
          .then((response) => {
            if (response) {
              toast("Builder updated!");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            toast.error("Some ERROR occurred.");
          });
      } else {
        axios
          .post("http://localhost:3700/api/builders/addbuilder", addData)
          .then((response) => {
            if (response) {
              toast("Builder added!");
              changeName("");
              changeEnableStatus("no");
              changeState("");
              changeCity("");
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
      .get("http://localhost:3700/api/state/fetchallstates")
      .then((response) => {
        setStates(getUniqueItems(getNameList(response.data)));
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
        state: editData.state ,
        city : editData.city ,
        addedBy: editData.addedBy,
      });
    }
  }, [editData]);
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
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="fName"
                    className="mb-3 block text-base font-medium"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={addData.name}
                    onChange={(e) => changeName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>

              <div className="flex mx-3 flex-col w-full md:w-1/2 pr-5 pb-5">
              <label className="text-lg font-medium">
                  Choose a state:
                </label>
                <input
                  list="states"
                  name="myState"
                  className="w-full  text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  placeholder="Select a state..."
                  value={addData.state}
                  onChange={(e) => changeState(e.target.value)}
                />
                <datalist id="states">
                  {states.length > 0 &&
                    states.map((item, index) => (
                      <option
                        key={index}
                        value={item}
                      />
                    ))}
                </datalist>
              </div>
            </div>

            <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 pb-6">
            <label className="text-lg font-medium">
                  Choose a city:
                </label>
                <input
                  list="cities"
                  disabled = {addData.state.length>0 ? false : true}
                  name="myCities"
                  className="w-full  text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  placeholder="Select a city..."
                  value={addData.city}
                  onChange={(e) => changeCity(e.target.value)}
                />
                <datalist id="cities">
                  {cities.length > 0 &&
                    cities.map((item, index) => (
                      <option
                        key={index}
                        value={item}
                      />
                    ))}
                </datalist>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Enable Builder?
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
                className="hover:shadow-form rounded-md py-3 px-8 text-center text-base font-semibold text-white outline-none"
                style={{ backgroundColor: colors.blueAccent[500] }}
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

export default BuildersForm;
