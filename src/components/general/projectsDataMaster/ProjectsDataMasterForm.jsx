import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { supabase } from "../../../config/supabase";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../../config/s3Config";

import { getNameList, getUniqueItems, removeSpaces, sortArrayByName } from "../../../MyFunctions";

function ProjectsForm({ editData, setModeToDisplay, userToken, userId, displayMode }) {
  const [isUploading, setIsUploading] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [projects, setProjects] = useState([]);

  const [dropdownOpen, setDropdownOpen] = useState();

  const [addData, setAddData] = useState({
    propertyId: "",
    state: "",
    city: "",
    builder: "",
    project: "",
    overview: "",
    address: "",
    pincode: "",
    status: "",
    type: "",
    availableFor: "",
    category: "",
    minimumPrice: "",
    maximumPrice: "",
    bhk: "",
    appartmentType: [],
    appartmentSubType: [],
    features: [],
    amenities: [],
    commercialHubs: [],
    hospitals: [],
    hotels: [],
    shoppingCentres: [],
    transportationHubs: [],
    educationalInstitutions: [],
    images: [],
    floorPlan: [],
    enable: "true",
    isViewed: "no"
  });

  const getPublicUrlFromSupabase = (path) => {
    const { data, error } = supabase.storage
      .from(process.env.REACT_APP_SITE_BUCKET)
      .getPublicUrl(path);
    if (error) {
      console.error("Error fetching public URL:", error);
      return null;
    }
    return {
      name: path.split("/")[path.split("/").length - 1],
      url: data.publicUrl,
    };
  };

  const uploadFileToCloud = async (myFile, type) => {
    const myFileName = removeSpaces(myFile.name);
    const myPath = `Projects/${type}/${myFileName}`;
    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_SITE_BUCKET,
        Key: myPath,
        Body: myFile,
        ContentType: myFile.type,
      };
      const command = new PutObjectCommand(uploadParams);
      await client.send(command);
      return myPath;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    const maxFiles = type === 'images' ? 15 : 5;
    const currentFiles = type === 'images' ? addData.images : addData.floorPlan;
    
    if (currentFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed for ${type}`);
      return;
    }

    setIsUploading(true);
    toast("Uploading files...");

    try {
      for (const file of files) {
        const cloudFilePath = await uploadFileToCloud(file, type);
        if (cloudFilePath) {
          const publicUrl = getPublicUrlFromSupabase(cloudFilePath);
          if (publicUrl) {
            setAddData(prev => ({
              ...prev,
              [type]: [...prev[type], publicUrl]
            }));
          }
        }
      }
      setIsUploading(false);
      toast.success("Files uploaded successfully");
    } catch (error) {
      setIsUploading(false);
      toast.error("Error uploading files");
      console.error(error);
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


  const handleRemoveFile = (index, type) => {
    setAddData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleChipInput = (e, field) => {
    if (e.key === 'Enter' && e.target.value) {
      const value = e.target.value.trim();
      if (!addData[field].includes(value)) {
        setAddData(prev => ({
          ...prev,
          [field]: [...prev[field], value]
        }));
      }
      e.target.value = '';
    }
  };

  const handleRemoveChip = (index, field) => {
    setAddData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
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

  const handleSubmit = () => {
    if (!addData.propertyId ||!addData.state || !addData.city || !addData.builder || !addData.project) {
      toast.error("Required fields: State, City, Builder, and Project");
      return;
    }

    const endpoint = editData 
      ? `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/updateProject/${editData._id}?userId=${userId}`
      : `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/addProject?userId=${userId}`;
    
    const method = editData ? 'put' : 'post';
    
    axios[method](endpoint, addData, {
      headers: {
        "auth-token": userToken,
      },
    })
      .then((response) => {
        if (response) {
          toast.success(editData ? "Project updated!" : "Project Added!");
          setTimeout(() => {
            setModeToDisplay();
          }, 2000);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occurred.");
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

    if (editData) {
      setAddData(editData);
    }
  }, [editData]);

  return (
    <Box sx={{
      padding: "24px",
      "& .MuiInputBase-root": {
        backgroundColor: colors.primary[400],
        color: colors.grey[100],
        borderRadius: "4px",
        "&:hover": {
          borderColor: colors.blueAccent[700],
        },
        "& input": {
          color: "#000000",
        },
      },
      "& .MuiInputLabel-root": {
        color: colors.grey[300],
        "&.Mui-focused": {
          color: colors.blueAccent[700],
        },
      },
    }}>
      <div className="flex items-center justify-center">
        <div className="w-full">
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="mb-5">
                <label htmlFor="propertyId" className="mb-3 block text-base font-medium">
                  Property ID *
                </label>
                <input 
                readOnly={displayMode ? true : false}
                  type="text"
                  name="propertyId"
                  id="propertyId"
                  value={addData.propertyId}
                  onChange={(e) => changeField("propertyId", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="state" className="mb-3 block text-base font-medium">
                  State *
                </label>
                <input readOnly={displayMode ? true : false}
                  type="text"
                  name="state"
                  id="state"
                  list="states"
                  required
                  value={addData.state}
                  onChange={(e) => changeField("state", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
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

              <div className="mb-5">
                <label htmlFor="city" className="mb-3 block text-base font-medium">
                  City *
                </label>
                <input readOnly={displayMode ? true : false}
                  type="text"
                  name="city"
                  id="city"
                  list="cities"
                  required 
                  value={addData.city}
                  onChange={(e) => changeField("city", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
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

              <div className="mb-5">
                <label htmlFor="builder" className="mb-3 block text-base font-medium">
                  Builder *
                </label>
                <input readOnly={displayMode ? true : false}
                  type="text"
                  name="builder"
                  id="builder"
                  list="builders"
                  required
                  value={addData.builder}
                  onChange={(e) => changeField("builder", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
                 <datalist id="builders">
                    {builders.length > 0 &&
                      builders.map((item, index) => (
                        <option key={index} value={item} />
                      ))}
                  </datalist>
              </div>

              <div className="mb-5">
                <label htmlFor="project" className="mb-3 block text-base font-medium">
                  Project Name *
                </label>
                <input readOnly={displayMode ? true : false}
                  type="text"
                  name="project"
                  id="project"
                  list="projects"
                  required
                  value={addData.project}
                  onChange={(e) => changeField("project", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
                 <datalist id="projects">
                    {projects.length > 0 &&
                      projects.map((item, index) => (
                        <option key={index} value={item} />
                      ))}
                  </datalist>
              </div>

              <div className="mb-5 col-span-2">
                <label htmlFor="overview" className="mb-3 block text-base font-medium">
                  Overview
                </label>
                <textarea
                readOnly={displayMode ? true : false}
                  name="overview"
                  id="overview"
                  value={addData.overview}
                  onChange={(e) => changeField("overview", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  rows={4}
                />
              </div>

              <div className="mb-5 col-span-2">
                <label htmlFor="address" className="mb-3 block text-base font-medium">
                  Address
                </label>
                <textarea
                readOnly={displayMode ? true : false}
                  name="address"
                  id="address"
                  value={addData.address}
                  onChange={(e) => changeField("address", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  rows={3}
                />
              </div>

              {/* Property Details */}
              <div className="mb-5">
                <label htmlFor="pincode" className="mb-3 block text-base font-medium">
                  Pincode
                </label>
                <input readOnly={displayMode ? true : false}
                  type="text"
                  name="pincode"
                  id="pincode"
                  value={addData.pincode}
                  onChange={(e) => changeField("pincode", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="status" className="mb-3 block text-base font-medium">
                  Status
                </label>
                <select
                readOnly={displayMode ? true : false}
                  name="status"
                  id="status"
                  value={addData.status}
                  onChange={(e) => changeField("status", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value="">Select Status</option>
                  <option value="Ready to Move">Ready to Move</option>
                  <option value="Under Construction">Under Construction</option>
                </select>
              </div>

              <div className="mb-5">
                <label htmlFor="type" className="mb-3 block text-base font-medium">
                  Type
                </label>
                <select
                readOnly={displayMode ? true : false}
                  name="type"
                  id="type"
                  value={addData.type}
                  onChange={(e) => changeField("type", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value="">Select Type</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div className="mb-5">
                <label htmlFor="availableFor" className="mb-3 block text-base font-medium">
                  Available For
                </label>
                <select
                readOnly={displayMode ? true : false}
                  name="availableFor"
                  id="availableFor"
                  value={addData.availableFor}
                  onChange={(e) => changeField("availableFor", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value="">Select Availability</option>
                  <option value="Sale">Sale</option>
                  <option value="Rent">Rent</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              {/* Price Details */}
              <div className="mb-5">
                <label htmlFor="minimumPrice" className="mb-3 block text-base font-medium">
                  Minimum Price
                </label>
                <input readOnly={displayMode ? true : false}
                  type="text"
                  name="minimumPrice"
                  id="minimumPrice"
                  value={addData.minimumPrice}
                  onChange={(e) => changeField("minimumPrice", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="maximumPrice" className="mb-3 block text-base font-medium">
                  Maximum Price
                </label>
                <input readOnly={displayMode ? true : false}
                  type="text"
                  name="maximumPrice"
                  id="maximumPrice"
                  value={addData.maximumPrice}
                  onChange={(e) => changeField("maximumPrice", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label htmlFor="bhk" className="mb-3 block text-base font-medium">
                  BHK
                </label>
                <input readOnly={displayMode ? true : false}
                  type="text"
                  name="bhk"
                  id="bhk"
                  value={addData.bhk}
                  onChange={(e) => changeField("bhk", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              {/* Multiple Value Inputs with Chips */}
              {[
                { field: 'appartmentType', label: 'Apartment Type' },
                { field: 'appartmentSubType', label: 'Apartment Sub Type' },
                { field: 'features', label: 'Features' },
                { field: 'amenities', label: 'Amenities' },
                { field: 'commercialHubs', label: 'Commercial Hubs' },
                { field: 'hospitals', label: 'Hospitals' },
                { field: 'hotels', label: 'Hotels' },
                { field: 'shoppingCentres', label: 'Shopping Centres' },
                { field: 'transportationHubs', label: 'Transportation Hubs' },
                { field: 'educationalInstitutions', label: 'Educational Institutions' }
              ].map(({ field, label }) => (
                <div key={field} className="mb-5 col-span-2">
                  <label className="mb-3 block text-base font-medium">
                    {label}
                  </label>
                  <input readOnly={displayMode ? true : false}
                    type="text"
                    placeholder={`Press Enter to add ${label}`}
                    onKeyPress={(e) => handleChipInput(e, field)}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {addData[field].map((item, index) => (
                      <div
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveChip(index, field)}
                          className="ml-2 text-blue-800 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* File Uploads */}
              <div className="mb-5 col-span-2">
                <label className="mb-3 block text-base font-medium">
                  Property Images (Max 15)
                </label>
                {!displayMode && <input readOnly={displayMode ? true : false}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'images')}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  disabled={isUploading || addData.images.length >= 15}
                />}
                <div className="text-sm text-gray-500 mt-1">
                  {15 - addData.images.length} slots remaining
                </div>
                {addData.images.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    {addData.images.map((file, index) => (
                      <div key={index} className="flex items-center border p-2 rounded">
                        <span className="truncate max-w-xs">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index, 'images')}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-5 col-span-2">
                <label className="mb-3 block text-base font-medium">
                  Floor Plans (Max 5)
                </label>
                {!displayMode && <input readOnly={displayMode ? true : false}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'floorPlan')}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  disabled={isUploading || addData.floorPlan.length >= 5}
                />}
                <div className="text-sm text-gray-500 mt-1">
                  {5 - addData.floorPlan.length} slots remaining
                </div>
                {addData.floorPlan.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    {addData.floorPlan.map((file, index) => (
                      <div key={index} className="flex items-center border p-2 rounded">
                        <span className="truncate max-w-xs">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index, 'floorPlan')}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enable/Disable Toggle */}
              {!displayMode && <div className="mb-5 col-span-2">
                <label className="mb-3 block text-base font-medium">
                  Project Status
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input 
                      type="radio"
                      name="enable"
                      value="true"
                      className="h-5 w-5"
                      checked={addData.enable === "true"}
                      onChange={(e) => changeField("enable", e.target.value)}
                    />
                    <label className="pl-3 text-base font-medium">Enable</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="radio"
                      name="enable"
                      value="false"
                      className="h-5 w-5"
                      checked={addData.enable === "false"}
                      onChange={(e) => changeField("enable", e.target.value)}
                    />
                    <label className="pl-3 text-base font-medium">Disable</label>
                  </div>
                </div>
              </div>}
            </div>

            {/* Submit Button */}
            {!displayMode && <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
                className={`px-8 py-3 ${
                  isUploading ? "bg-gray-600" : "bg-[#6A64F1]"
                } text-white font-medium text-lg rounded-md shadow-md ${
                  isUploading ? "" : "hover:bg-[#5a52e0]"
                } focus:outline-none focus:ring-2 focus:ring-[#6A64F1] focus:ring-opacity-50`}
              >
                {isUploading ? "Uploading..." : (editData ? "Update Project" : "Add Project")}
              </button>
            </div>}
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default ProjectsForm;