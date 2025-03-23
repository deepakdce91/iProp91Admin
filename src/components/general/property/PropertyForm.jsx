import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { getNameList, getUniqueItems, removeSpaces, sortArrayByName } from "../../../MyFunctions";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../../config/s3Config";

import heic2any from "heic2any"; 


function PropertyForm({ editData, setModeToDisplay, userToken, userId  }) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);

  const [uploadStatus, setUploadStatus] = useState(false);

  const [uploadFiles, setUploadFiles] = useState([]);

  const [isUploading, setIsUploading] = useState(false);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    customerName : "",
    customerNumber : "",
    applicationStatus: "under-review",
    state: "",
    city: "",
    builder: "",
    project: "",
    tower: "",
    unit: "",
    size: "",
    nature: "",
    status: "",
    isDeleted : "no",
    documents: {
      type: "",
      files: [],
    },
    addedBy: "",
  });

  // Upload the file to Supabase S3
  const uploadFileToCloud = async (myFile) => {
     
      const myFileName = removeSpaces(myFile.name) // removing blank space from name
      const myPath = `propertyDocs/${addData.customerId}/${myFileName}`;
      try {
        const uploadParams = {
          Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
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
    const files = event.target.files;

    // Loop over each selected file
    for (const file of files) {

      // checking for .heic files and converting it into jpeg before adding
      if (file.type === "image/heic") {
        try {
          // Convert .heic file to .png
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
          });

          // Create a new File object from the Blob
          const convertedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, ".jpeg"), {
            type: "image/jpeg",
          });

          setUploadFiles((prevFiles) => [...prevFiles, convertedFile]);

        } catch (error) {
          console.error("Error converting HEIC file:", error);
        }
      }else{
        // if file is not jpeg..adding directly
        setUploadFiles((prevFiles) => [...prevFiles, file]);
      }
    }
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    if(addData.customerId !== "" ){
      
      try {
        setIsUploading(true);
        uploadFiles.length > 0 &&
          uploadFiles.map(async (item, index) => {
            let cloudFilePath = await uploadFileToCloud(item);
            setAddData((prevData) => ({
              ...prevData,
              documents: {
                ...prevData.documents,
                files: [...prevData.documents.files, cloudFilePath], // Append new files
              },
            }));
  
            // when in last iteration
            if (index === uploadFiles.length - 1) {
              // when last file has been uploaded
              if (cloudFilePath) {
                setIsUploading(false);
                setUploadStatus(true);
                setUploadFiles([]);
              }
            }
          });
      } catch (error) {
        setIsUploading(false);
        toast.error("Some error occured while uploading.");
        console.log(error.message);
      }
      
    }else{
      toast.error("Enter customer Id before upload");
      return
      
    }
  };

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

  const handleSubmit = (addData) => {
    if (uploadFiles.length > 0 || addData.documents.files.length === 0) {
      toast.error("Upload files before submitting form.");
    } else {
      if (
        addData.customerName !== "" &&
        addData.customerNumber !== "" &&
        addData.state !== "" &&
        addData.city !== "" &&
        addData.builder !== "" &&
        addData.project !== "" &&
        addData.tower !== "" &&
        addData.unit !== "" &&
        addData.size !== "" &&
        addData.addedBy !== "" &&
        addData.nature !== "" &&
        addData.status !== "" &&
        addData.user !== "" &&
        addData.applicationStatus !== "" &&
        addData.documents.type !== "" &&
        addData.documents.files.length > 0
      ) {
        if (editData) {
          axios
            .put(
              `${process.env.REACT_APP_BACKEND_URL}/api/property/updateproperty/${editData._id}?userId=${userId}`,
              addData,
              {
                headers: {
                  "auth-token" : userToken
                },
              }
            )
            .then((response) => {
              if (response) {
                toast("Property updated!");
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
            .post(`${process.env.REACT_APP_BACKEND_URL}/api/property/addproperty?userId=${userId}`, addData,  {
              headers: {
                "auth-token" : userToken
              },
            })
            .then((response) => {
              if (response) {
                toast("Property added!");
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
      } else {
        toast.error("Fill all the fields.");
      }
    }
  };

  const fetchAllDocumentTypes = () => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/documentType/fetchallDocumentTypes?userId=${userId}`,  {
              headers: {
                "auth-token" : userToken
              },
            })
          .then((response) => {
        setDocumentTypes(getUniqueItems(getNameList(response.data)));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
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
    fetchAllDocumentTypes();

    if (editData) {
      setAddData({
        ...editData,
        applicationStatus: editData.applicationStatus,
        state: editData.state,
        city: editData.city,
        builder: editData.builder,
        addedBy : editData.addedBy,
        project: editData.project,
        tower: editData.tower,
        unit: editData.unit,
        size: editData.size,
        nature: editData.nature,
        customerName : editData.customerName,
        customerNumber : editData.customerNumber,
        status: editData.status,
        isDeleted : editData.isDeleted,
        documents: {
          type: editData.documents.type,
          files: editData.documents.files,
        },
      });
    }
  }, [editData]);

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
                    htmlFor="c-name"
                    className="mb-3 block text-base font-medium"
                  >
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="c-name"
                    id="c-name"
                    value={addData.customerName}
                    onChange={(e) => changeField("customerName", e.target.value)}
                    placeholder="Customer Name"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>

              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="c-num"
                    className="mb-3 block text-base font-medium"
                  >
                    Customer Number
                  </label>
                  <input
                    type="text"
                    name="c-num"
                    id="c-num"
                    value={addData.customerNumber}
                    onChange={(e) => changeField("customerNumber", e.target.value)}
                    placeholder="Customer Number"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>

              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="custid"
                    className="mb-3 block text-base font-medium"
                  >
                    Customer Id
                  </label>
                  <input
                    type="text"
                    name="custid"
                    id="custid"
                    value={addData.addedBy}
                    onChange={(e) => changeField("addedBy", e.target.value)}
                    placeholder="Customer Id"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>


            {/* Basic property name and state  */}
            <div className="flex flex-col lg:flex-row -mx-3">


              <div className="w-full px-3 lg:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="tower"
                    className="mb-3 block text-base font-medium"
                  >
                    Tower
                  </label>
                  <input
                    type="text"
                    name="tower"
                    id="tower"
                    value={addData.tower}
                    onChange={(e) => changeField("tower", e.target.value)}
                    placeholder="Tower"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>

              {/* state  */}
              <div className="flex flex-col w-full lg:w-1/2 pr-5 pb-5">
              <label className="text-lg font-medium">
                  Select state
                </label>
                <input
                  list="states"
                  name="myState"
                  autoComplete="off"
                  className="w-full  text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  placeholder="Select a state..."
                  value={addData.state}
                  onChange={(e) => changeField("state",e.target.value)}
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

              
            </div>

           

            {/*  City and builder */}
            <div className="flex flex-col lg:flex-row -mx-3">

            

              {/* city  */}
              <div className="flex flex-col w-full lg:w-1/2 pl-3 sm:pl-0  pb-6">
              <label className="text-lg font-medium">
                  Select city
                </label>
                <input
                  list="cities"
                  autoComplete="off"
                  disabled = {addData.state.length>0 ? false : true}
                  name="myCities"
                  className="w-full  text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  placeholder="Select a city..."
                  value={addData.city}
                  onChange={(e) => changeField("city",e.target.value)}
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

            {/* builder */}
            <div className="w-full px-3 lg:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">
                  Select Builder
                  </label>
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
            </div>

            {/* project */}
            <div className="flex flex-col md:flex-row -mx-3">

              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">
                  Select Project
                  </label>
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


              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="unit"
                    className="mb-3 block text-base font-medium"
                  >
                    Unit
                  </label>
                  <input
                    type="text"
                    name="unit"
                    id="unit"
                    value={addData.unit}
                    onChange={(e) => changeField("unit", e.target.value)}
                    placeholder="Unit"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>

              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="size"
                    className="mb-3 block text-base font-medium"
                  >
                    Size (sq. ft.)
                  </label>
                  <input
                    type="text"
                    name="size"
                    id="size"
                    value={addData.size}
                    onChange={(e) => changeField("size", e.target.value)}
                    placeholder="Size in sq. ft."
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
              
            </div>

           

            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="nature"
                    className="mb-3 block text-base font-medium"
                  >
                    Nature
                  </label> 
                  <select
                    id="dropdown2"
                    value={addData.nature}
                    onChange={(e) => changeField("nature", e.target.value)}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  >
                    <option value="">Select...</option>
                    <option value="commercial">Commercial</option>
                    <option value="residential">Residential</option>
                  </select>
                </div>
              </div>

              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="status"
                    className="mb-3 block text-base font-medium"
                  >
                    Status
                  </label>

                  <select
                    id="dropdown"
                    value={addData.status}
                    onChange={(e) => changeField("status", e.target.value)}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  >
                    <option value="">Select...</option>
                    <option value="completed">Completed</option>
                    <option value="under-construction">
                      Under Construction
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* ///documentsss  */}
            <h2 className="text-xl mt-4 mb-3">
              {editData ? "Update" : "Add"} documents
            </h2>
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">Document Type</label>
                  <input
                    list="docs"
                    name="docs"
                    className="w-full text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    placeholder="Select..."
                    value={addData.documents.type}
                    onChange={(e) => {
                      setAddData((prevData) => ({
                        ...prevData,
                        documents: {
                          ...prevData.documents,
                          type: e.target.value,
                        },
                      }));
                    }}
                  />
                  <datalist id="docs">
                    {documentTypes.length > 0 &&
                      documentTypes.map((item, index) => (
                        <option key={index} value={item} />
                      ))}
                  </datalist>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3">
                <div className="mb-5">
                  <label
                    htmlFor="document"
                    className="mb-3 block text-base font-medium"
                  >
                    Document
                  </label>

                  {editData && addData.documents.files.length > 0 && (
                    <div
                      className={`bg-green-600 text-gray-200 p-4 rounded-lg mb-5`}
                    >
                      <p className="text-[16px] font-bold mb-2">
                        Already uploaded files :{" "}
                      </p>
                      <ul>
                        {editData.documents.files.map((item, index) => {
                          return (
                            <li
                              className="text-sm mb-1"
                              key={`${index}-${item}`}
                            >
                              {item.split("/")[item.split("/").length - 1]}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {uploadStatus === false ? (
                    <div>
                      <input
                        type="file"
                        name="document"
                        id="document"
                        multiple
                        onChange={handleFileAdding}
                        className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                      />

                      <div
                        className={`${
                          theme.palette.mode === "dark"
                            ? "bg-slate-700 text-white"
                            : "text-slate-700 bg-slate-300"
                        } p-5 rounded-lg`}
                      >
                        <p className="text-[16px] font-bold mb-2">
                          {editData ? "New " : null}Selected files :{" "}
                          {uploadFiles.length === 0 ? (
                            <span className="font-light">none</span>
                          ) : null}
                        </p>
                        <ul>
                          {uploadFiles.length > 0 &&
                            uploadFiles.map((item, index) => {
                              return (
                                <li className="text-sm mb-1" key={index}>
                                  {item.name}
                                </li>
                              );
                            })}
                        </ul>

                        <div className="flex items-center ">
                          <button
                            className={`border-2 mt-2  ${
                              isUploading === true
                                ? "border-transparent text-blue-500"
                                : "border-blue-600  hover:bg-blue-600 hover:text-blue-200"
                            } rounded-lg px-3 py-2 text-blue-400 cursor-pointer  flex`}
                            onClick={handleFileUpload}
                            disabled={(uploadFiles.length === 0 ||isUploading === true )? true : false}
                          >
                            {isUploading === true ? "Uploading" : "Upload"}
                          </button>

                          {isUploading === true && (
                            <img
                              className="ml-2 mt-2 h-8 w-7"
                              src={`${
                                theme.palette.mode === "dark"
                                  ? "/spinner-white.svg"
                                  : "/spinner.svg"
                              }`}
                              alt="upload-spinner"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="bg-green-500 text-white p-4 rounded-lg">
                      {editData && "New "}Files Uploaded!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {editData && (
              <div className="flex flex-col md:flex-row -mx-3">
                <div className="w-full px-3 md:w-1/2">
                  <div className="mb-5">
                    <label
                      htmlFor="applicationStatus"
                      className="mb-3 block text-base font-medium"
                    >
                      Application Status
                    </label>
                    <select
                      id="applicationStatus"
                      value={addData.applicationStatus}
                      onChange={(e) =>
                        changeField("applicationStatus", e.target.value)
                      }
                      className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    >
                      <option value="">Select...</option>
                      <option value="under-review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="more-info-required">
                        More info required
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {editData && <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Delete Property?
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="enable"
                    value="yes"
                    className="h-5 w-5"
                    id="radioButton1"
                    checked={addData.isDeleted === "yes"}
                    onChange={(e) => changeField("isDeleted", e.target.value)}
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
                    checked={addData.isDeleted === "no"}
                    onChange={(e) => changeField("isDeleted", e.target.value)}
                  />
                  <label
                    htmlFor="radioButton2"
                    className="pl-3 text-base font-medium"
                  >
                    No
                  </label>
                </div>
              </div>
            </div>}

            <div className="flex justify-center mt-5">
              <button
                type="button"
                onClick={() => handleSubmit(addData)}
                className={`px-8 py-3 ${
                  isUploading === true ? "bg-gray-600" : "bg-[#6A64F1]"
                }  text-white font-medium text-lg rounded-md shadow-md ${
                  isUploading === true ? "bg-gray-600" : "hover:bg-[#5a52e0]"
                }  focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
                disabled={isUploading === true ? true : false}
              >
                {editData ? "Update Property" : "Add Property"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Box>
  );
}

export default PropertyForm;
 