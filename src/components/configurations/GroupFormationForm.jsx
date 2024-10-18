import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {
  getNameList,
  getUniqueItems,
  removeSpaces, 
  sortArrayByName,
} from "../../MyFunctions";

import { supabase } from "../../config/supabase";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../config/s3Config";

import heic2any from "heic2any";

import ChipComponent from "../ui/ChipComponent";
import ChipComponentUsers from "../ui/ChipComponentUsers";



function GroupFormationForm({ editData, setModeToDisplay, userToken, userId }) {

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [projects, setProjects] = useState([]);

  const [uploadFile, setUploadFile] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const [fileAddedForUpload, setFileAddedForUpload] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    thumbnail: "",
    name: "",
    state: "",
    city: "",
    builder: "",
    projects: [],
    customers: [],
  });

  const getPublicUrlFromSupabase = (path) => {
    const { data, error } = supabase.storage.from(process.env.REACT_APP_THUMBNAIL_PIC_BUCKET).getPublicUrl(path);
    if (error) {
      console.error("Error fetching public URL:", error);
      return null;
    }
    return data.publicUrl;
  };

  const [selectedProjects, setSelectedProjects] = useState([]);
  const handleProjectChange = (arr) =>{
    setSelectedProjects(arr);
    changeField("projects", arr);
  }

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([])
  const handleUsersChange = (arr) =>{
    setSelectedUsers(arr);
    changeField("customers", arr);
  }


  const fetchAllUsers = () => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/users/fetchallusersForGroupFormation?userId=${userId}`,  {
              headers: {
                "auth-token" : userToken
              },
            })
          .then((response) => {
            setAllUsers(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Upload the file to Supabase S3
  const uploadFileToCloud = async (myFile) => {
    const myFileName = removeSpaces(myFile.name); // removing blank space from name
    const myPath = `communitiesThumbnail/${myFileName}`;
    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_THUMBNAIL_PIC_BUCKET,
        Key: myPath,
        Body: myFile, // The file content
        ContentType: myFile.type, // The MIME type of the file
      };
      const command = new PutObjectCommand(uploadParams);
      await client.send(command);
      return myPath; //  return the file path
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileAdding = async (event) => {
    const file = event.target.files[0];

      // checking for .heic files and converting it into jpeg before adding
      if (file.type === "image/heic") {
        try {
          // Convert .heic file to .png
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
          });

          // Create a new File object from the Blob
          const convertedFile = new File(
            [convertedBlob],
            file.name.replace(/\.heic$/i, ".jpeg"),
            {
              type: "image/jpeg",
            }
          );

          setUploadFile(convertedFile);
          setFileAddedForUpload(true);
        } catch (error) {
          console.error("Error converting HEIC file:", error);
        }
      } else {
        // if file is not jpeg..adding directly
        setUploadFile(file);
        setFileAddedForUpload(true);
      }
    
  };

  const handleFileUpload = async(e) => {
    e.preventDefault();

      try {
        setIsUploading(true);
        toast("Uploading file.")
        
            let cloudFilePath = await uploadFileToCloud(uploadFile);
            
 
            // when in last iteration
            if (cloudFilePath) {
              const publicUrl = getPublicUrlFromSupabase(cloudFilePath);
                if(publicUrl){
                  changeField("thumbnail", publicUrl)
                  console.log(publicUrl);
                setIsUploading(false);
                setUploadFile("");
                setFileAddedForUpload(false);
                toast.success("File uploaded.")
                }
            }

      } catch (error) {
        setIsUploading(false);
        toast.error("Some error occured while uploading.");
        console.log(error.message);
      }
  
  };

  const fetchCitiesByState = (currentStateCode) => {
    axios
      .get(
        `https://api.countrystatecity.in/v1/countries/IN/states/${currentStateCode}/cities`,
        {
          headers: {
            "X-CSCAPI-KEY": process.env.REACT_APP_CSC_API,
          },
        }
      )
      .then((response) => {
        setCities(sortArrayByName(response.data));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const fetchBuildersByCity = (city) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/builders/fetchbuildersbycity/${city}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
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
        `${process.env.REACT_APP_BACKEND_URL}/api/projects/fetchprojectbybuilder/${builder}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
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
        const item = states.find((state) => state.name === selectedValue);
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

  const createMessageCollection = async (communityId) =>{
    await axios
    .post(
      `${process.env.REACT_APP_BACKEND_URL}/api/messages/createMessagesCollection?userId=${userId}`,
      {communityId},
      {
        headers: {
          "auth-token": userToken,
        },
      }
    )
    .then((response) => {
      if (response) {
        toast.success("Message collection created!");
        setTimeout(() => {
          setModeToDisplay();
        }, 2000);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      toast.error("Some ERROR occurred.");
    });
  }

  const handleSubmit = () => {
    if (uploadFile) {
      toast.error("Upload thumbnail file before submitting form.");
    } else {
      if (
        addData.name !== "" &&
        addData.state !== "" &&
        addData.city !== "" &&
        addData.builder !== "" &&
        addData.customers.length !== 0 &&
        addData.projects.length !== 0 
      ) {


        if (editData) {
          axios
            .put(
              `${process.env.REACT_APP_BACKEND_URL}/api/communities/updateCommunity/${editData._id}?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token": userToken,
                },
              }
            )
            .then((response) => {
              if (response) {
                toast.success("Community updated!");
                setTimeout(() => {
                  setModeToDisplay();
                }, 2000);
              }
            })
            .catch((error) => {
              console.error("Error:", error);
              toast.error("Some ERROR occurred.");
            });
        } else {
          axios
            .post(
              `${process.env.REACT_APP_BACKEND_URL}/api/communities/addCommunity?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token": userToken,
                },
              }
            )
            .then((response) => {
              if (response) {
     
                toast.success("Community created!");

                // create a message collection 
                createMessageCollection(response.data.data._id);

                
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

    if (editData) {
      setAddData({
        name: editData.name,
        state: editData.state,
        city: editData.city,
        builder: editData.builder,
        projects: editData.projects,
        thumbnail: editData.thumbnail,
        customers: editData.customers,
      });

      // fetches all builders
      fetchProjectByBuilder(editData.builder);

      setSelectedProjects(editData.projects);
      setSelectedUsers(editData.customers);
    }
  }, [editData]);

  useEffect(() => {
    fetchAllUsers()
  
  }, [])
  

  return (
    <Box
    sx={{
        padding: "24px",
        "& .MuiInputBase-root": {
          backgroundColor: colors.primary[400],
          color: colors.grey[100], // This still applies to other areas, not input text
          borderRadius: "4px",
          "&:hover": {
            borderColor: colors.blueAccent[700],
          },
          // Ensure input text is always black
          "& input": {
            color: "#000000", // Sets the input text color to black
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
                    htmlFor="name"
                    className="mb-3 block text-base font-medium"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={addData.name}
                    onChange={(e) => changeField("name", e.target.value)}
                    placeholder="Community Name"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>

              <div className="w-full items-center flex px-3 md:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="thumbnail"
                    className="mb-3 block text-base font-medium"
                  >
                    Thumbnail
                  </label>
                  <input
                    type="file"
                    name="thumbnail"
                    id="thumbnail"
                    onChange={handleFileAdding}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className={`px-8 py-3 h-fit mx-3 mt-3 ${
                    fileAddedForUpload === false ? "bg-gray-600" : "bg-blue-500"
                  }  text-white font-medium text-lg rounded-md shadow-md ${
                    fileAddedForUpload === false
                      ? "bg-gray-600"
                      : "hover:bg-blue-600"
                  }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                  disabled={fileAddedForUpload === false ? true : false}
                >
                    {`Upload`}
                  
                </button>
              </div>
            </div>

            {/*  City and builder */}
            <div className="flex flex-col md:flex-row -mx-3">
              {/* state  */}
              <div className="flex mx-3 flex-col w-full md:w-1/2 pr-5 pb-5">
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
              <div className="flex flex-col w-full md:w-1/2 pr-0 md:pr-5 pb-6">
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

              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">Select Builder</label>
                  <input
                    list="builders"
                    autoComplete="off"
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
            </div>

            {/* Additional Fields */}
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 ">
                <div className="mb-5 flex flex-col">
                  <label className="text-lg font-medium pb-3">
                    Select Projects
                  </label>

                  <ChipComponent
                      itemArray={projects.length > 0 ? projects : []}
                      preSelected={selectedProjects}
                      updateSelectedArr={handleProjectChange}
                      disabled={addData.builder.length > 0 ? false : true}
                    />  
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 ">
                <div className="mb-5 flex flex-col">
                  <label className="text-lg font-medium pb-3">
                    Select Customers
                  </label>

                  <ChipComponentUsers
                      itemArray={allUsers.length > 0 ? allUsers : []}
                      preSelected={selectedUsers}
                      updateSelectedArr={handleUsersChange}
                    />  
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-5">
              <button
                type="button"
                onClick={() => {
                    handleSubmit()
                    // console.log(addData)
                }}
                className={`px-8 py-3 ${
                  isUploading === true ? "bg-gray-600" : "bg-[#6A64F1]"
                }  text-white font-medium text-lg rounded-md shadow-md ${
                  isUploading === true ? "bg-gray-600" : "hover:bg-[#5a52e0]"
                }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                disabled={isUploading === true ? true : false}
              >
                {editData ? "Update Community" : "Add Community"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default GroupFormationForm;
