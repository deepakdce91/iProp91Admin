import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { getNameList } from "../../../MyFunctions";
import { getUniqueItems } from "../../../MyFunctions";

import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { client } from "../../../config/s3Config";

// Upload the file to Supabase S3
const uploadFileToCloud = async (myFile) => {
  const userNumber = "5566556656";
  const myPath = `propertyDocs/${userNumber}/${myFile.name}`;
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

//get signed url---will be used sooon
const getSignedUrlForPrivateFile = async (path) => {
  try {
    const getParams = {
      Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
      Key: path,
    };

    const command = new GetObjectCommand(getParams);
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 }); // URL valid for 1 hour

    console.log("Signed URL:", signedUrl);
    return signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
};

function PropertyForm({ editData }) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);

  const [uploadStatus, setUploadStatus] = useState(false);

  const [uploadFiles, setUploadFiles] = useState([]);

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
    documents: {
      type: "",
      files: [],
    },
    addedBy: "Unknown",
  });

  // handles file upload
  const handleFileAdding = (e) => {
    const files = e.target.files;

    if (files) {
      // Convert the FileList object into an array and update the state
      setUploadFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
    }
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    try {
      toast("Uploading files!");
      uploadFiles.length > 0 &&
        uploadFiles.map(async (item) => {
          let cloudFilePath = await uploadFileToCloud(item);
          setAddData((prevData) => ({
            ...prevData,
            documents: {
              ...prevData.documents,
              files: [...prevData.documents.files, cloudFilePath], // Append new files
            },
          }));
        });
      setTimeout(() => {
        toast.success("Files Uploaded!");
        setUploadStatus(true);
        setUploadFiles([]);
      }, 3000);
    } catch (error) {
      toast.error("Some error occured while uploading.");
      console.log(error.message);
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
    if (uploadFiles.length > 0) {
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
                setAddData({
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
                  documents: {
                    type: "",
                    files: [],
                  },
                  addedBy: "Unknown",
                });
                setUploadStatus(false);
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
        status: editData.status,
        documents: {
          type: editData.documents.type,
          files: editData.documents.files,
        },
        addedBy: editData.addedBy,
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
            {/* Basic property name and state  */}
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
                    placeholder="Name"
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                </div>
              </div>

              <div className="w-full px-3 md:w-1/2">
                <div className="mb-5">
                  <label className="text-lg font-medium">Choose a state:</label>
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
                  <label className="text-lg font-medium">Choose a city:</label>
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
                    Choose a Builder:
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
                    Choose a Project:
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
                              {item}
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

                        <button
                          className="border-2 mt-2  border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200"
                          onClick={handleFileUpload}
                        >
                          Upload
                        </button>
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
                      Nature
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

            <div className="flex justify-center mt-5">
              <button
                type="button"
                onClick={() => handleSubmit(addData)}
                className="px-8 py-3 bg-[#6A64F1] text-white font-medium text-lg rounded-md shadow-md hover:bg-[#5a52e0] focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50"
              >
                {editData ? "Update Property" : "Add Property"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-right" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default PropertyForm;
