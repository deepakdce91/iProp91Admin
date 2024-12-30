import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { getNameList, getUniqueItems, removeSpaces, sortArrayByName } from "../../../MyFunctions";


function AddSafe({ setModeToDisplay, userToken, userId }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [projects, setProjects] = useState([]);

  const [addData, setAddData] = useState({
    state: "",
    city: "",
    builder: "",
    project: "",
   
  });

  const fetchCitiesByState = (currentStateCode) => {
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
  };

  const fetchBuildersByCity = (city) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/builders/fetchbuildersbycity/${city}?userId=${userId}`,  {
              headers: {
                "auth-token" : userToken
              },
            })
          .then((response) => {
        setBuilders(getUniqueItems(getNameList(response.data)));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const fetchProjectByBuilder = (builder) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/projects/fetchprojectbybuilder/${builder}?userId=${userId}`,  {
              headers: {
                "auth-token" : userToken
              },
            })
          .then((response) => {
        setProjects(getUniqueItems(getNameList(response.data)));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const changeField = (field, value) => {
    setAddData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    if (field === "state" && value) {

    if (value && value.length > 0) {
      const selectedValue = value;
      const item = states.find(state => state.name === selectedValue);
      if (item) {
        fetchCitiesByState(item.iso2);
      }
      
    }
    }

    if (field === "city" && value) {
      fetchBuildersByCity(value);
    }

    if (field === "builder" && value) {
      fetchProjectByBuilder(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addData.state !== "" && addData.city !== "" && addData.builder !== "" && addData.project !== "") {
      axios
        .post(
          `${process.env.REACT_APP_BACKEND_URL}/api/commonSafe/create?userId=${userId}`,
          {
            propertyDetails : addData,
          },
          {
            headers: {
              "auth-token": userToken,
            },
          }
        )
        .then((response) => {
          if (response) {
            toast("Common Safe Created Successfully.");
            setTimeout(() => {
                setModeToDisplay();
              }, 1000);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error("Some ERROR occurred.");
        });
    } else {
      toast.error("Fill all the fields.");
    }
  };


  const fetchAllStates = () => {
    axios
      .get(`https://api.countrystatecity.in/v1/countries/IN/states`, {
        headers: {
          "X-CSCAPI-KEY": process.env.REACT_APP_CSC_API,
        },
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

  }, []);

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
            <div className="flex flex-col lg:flex-row -mx-3">
              {/* state  */}
              <div className="flex mx-3 flex-col w-full lg:w-1/2 pr-5 pb-5">
                <label className="text-lg font-medium">Select state</label>
                <input
                  list="states"
                  name="myState"
                  autoComplete="off"
                  className="w-full  text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  placeholder="Select a state..."
                  value={addData.state}
                  onChange={(e) => changeField("state", e.target.value)}
                />
                <datalist id="states">
                  {states.length > 0 &&
                    states.map((item, index) => (
                      <option key={index} value={item.name} />
                    ))}
                </datalist>
              </div>

              {/* city  */}
              <div className="flex flex-col w-full lg:w-1/2 pl-3 lg:pl-0 pr-0 md:pr-5 pb-6">
                <label className="text-lg font-medium">Select city</label>
                <input
                  list="cities"
                  autoComplete="off"
                  disabled={addData.state.length > 0 ? false : true}
                  name="myCities"
                  className="w-full  text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  placeholder="Select a city..."
                  value={addData.city}
                  onChange={(e) => changeField("city", e.target.value)}
                />
                <datalist id="cities">
                  {cities.length > 0 &&
                    cities.map((item, index) => (
                      <option key={index} value={item.name} />
                    ))}
                </datalist>
              </div>
            </div>

            {/* // builder project  */}
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 lg:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">Select Builder</label>
                  <input
                    list="builders"
                    disabled={addData.city.length > 0 ? false : true}
                    name="myBuilders"
                    className="w-full text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    placeholder="Select builder..."
                    value={addData.builder}
                    onChange={(e) => changeField("builder", e.target.value)}
                  />
                  <datalist id="builders">
                    {builders.length > 0 &&
                      builders.map((item, index) => (
                        <option key={index} value={item} />
                      ))}
                  </datalist>
                </div>
              </div>

              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">Select Project</label>
                  <input
                    list="projects"
                    disabled={addData.builder.length > 0 ? false : true}
                    name="myprojects"
                    className="w-full text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    placeholder="Select project..."
                    value={addData.project}
                    onChange={(e) => changeField("project", e.target.value)}
                  />
                  <datalist id="projects">
                    {projects.length > 0 &&
                      projects.map((item, index) => (
                        <option key={index} value={item} />
                      ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="flex  mt-5">
              <button
                type="button"
                onClick={handleSubmit}
                className={`px-8 py-3 bg-[#6A64F1] text-white font-medium hover:bg-[#5a52e0] text-sm rounded-md shadow-md  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
              >
                {"Create Common Safe"}
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
