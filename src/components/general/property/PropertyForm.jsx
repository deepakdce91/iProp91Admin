import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { getNameList } from "../../../MyFunctions";
import { getUniqueItems } from "../../../MyFunctions";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../../config/s3Config";

import heic2any from "heic2any";

 

function PropertyForm({ editData, setModeToDisplay  }) {
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
    name: "",
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
    customerNumber: "",
    customerName: "",
    isDeleted : "no",
    documents: {
      type: "",
      files: [],
    },
    addedBy: "admin",
  });

  // Upload the file to Supabase S3
  const uploadFileToCloud = async (myFile) => {
     
      const myPath = `propertyDocs/${addData.customerNumber}/${myFile.name}`;
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

  // handles file upload
  // const handleFileAdding = (e) => {
  //   const files = e.target.files;

  //   if (files) {
  //     // Convert the FileList object into an array and update the state
  //     setUploadFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
  //   }
  // };

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
    if(addData.customerNumber.length === 10 ){
      const isNumeric = /^[0-9]*$/.test(addData.customerNumber);
      if(!isNumeric){
        toast.error("Customer number should contain only number")
      }else{
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
      }
      
    }else{
      toast.error("Enter valid customer number");
      return
      
    }
  };

  const fetchCitiesByState = (state) => {
    axios
      .get(`http://localhost:3700/api/city/fetchcitiesbystate/${state}`)
      .then((response) => {
        setCities(getUniqueItems(getNameList(response.data)));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const fetchBuildersByCity = (city) => {
    axios
      .get(`http://localhost:3700/api/builders/fetchbuildersbycity/${city}`)
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
        `http://localhost:3700/api/projects/fetchprojectbybuilder/${builder}`
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
      fetchCitiesByState(value);
    }

    if (field === "city" && value) {
      fetchBuildersByCity(value);
    }

    if (field === "state" && value) {
      fetchCitiesByState(value);
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
        addData.name !== "" &&
        addData.state !== "" &&
        addData.city !== "" &&
        addData.builder !== "" &&
        addData.project !== "" &&
        addData.tower !== "" &&
        addData.unit !== "" &&
        addData.size !== "" &&
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
              `http://localhost:3700/api/property/updateproperty/${editData._id}`,
              addData
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
            .post("http://localhost:3700/api/property/addproperty", addData)
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
      .get("http://localhost:3700/api/documentType/fetchallDocumentTypes")
      .then((response) => {
        setDocumentTypes(getUniqueItems(getNameList(response.data)));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
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
    fetchAllDocumentTypes();

    if (editData) {
      setAddData({
        name: editData.name,
        applicationStatus: editData.applicationStatus,
        state: editData.state,
        city: editData.city,
        builder: editData.builder,
        project: editData.project,
        tower: editData.tower,
        unit: editData.unit,
        size: editData.size,
        nature: editData.nature,
        enable : editData.enable,
        customerName : editData.customerName,
        customerNumber: editData.customerNumber,
        status: editData.status,
        isDeleted : editData.isDeleted,
        documents: {
          type: editData.documents.type,
          files: editData.documents.files,
        },
        addedBy: "admin",
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
                    Customer name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="c-name"
                    value={addData.customerName}
                    onChange={(e) => changeField("customerName", e.target.value)}
                    placeholder="Customer name"
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
                    Customer number
                  </label>
                  <input
                    type="tel"
                    name="name"
                    id="c-num"
                    value={addData.customerNumber}
                    onChange={(e) => changeField("customerNumber", e.target.value)}
                    placeholder="Customer number"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>
            </div>


            {/* Basic property name and state  */}
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label
                    htmlFor="name"
                    className="mb-3 block text-base font-medium"
                  >
                    Property name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={addData.name}
                    onChange={(e) => changeField("name", e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>

              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">
                    Choose a state 
                  </label>
                  <input
                    list="states"
                    name="myState"
                    className="w-full text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    placeholder="Select a state..."
                    value={addData.state}
                    onChange={(e) => changeField("state", e.target.value)}
                  />
                  <datalist id="states">
                    {states.length > 0 &&
                      states.map((item, index) => (
                        <option key={index} value={item} />
                      ))}
                  </datalist>
                </div>
              </div>
            </div>

           

            {/*  City and builder */}
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">Choose a city</label>
                  <input
                    list="cities"
                    disabled={addData.state.length > 0 ? false : true}
                    name="myCities"
                    className="w-full text-gray-600 mt-2 rounded-md border border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    placeholder="Select a city..."
                    value={addData.city}
                    onChange={(e) => changeField("city", e.target.value)}
                  />
                  <datalist id="cities">
                    {cities.length > 0 &&
                      cities.map((item, index) => (
                        <option key={index} value={item} />
                      ))}
                  </datalist>
                </div>
              </div>

              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">
                    Choose a Builder
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

            {/* Additional Fields */}
            <div className="flex flex-col md:flex-row -mx-3">
              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">
                    Choose a Project
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
            </div>

            <div className="flex flex-col md:flex-row -mx-3">
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
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default PropertyForm;
