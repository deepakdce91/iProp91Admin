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

import {
  removeSpaces,
  sortArrayByName,
} from "../../../MyFunctions";
import CustomDropdown from "../../ui/CustomDropdown";
import { Add } from "@mui/icons-material";

function ProjectsForm({
  editData,
  setModeToDisplay,
  userToken,
  userId,
  displayMode,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [projects, setProjects] = useState([]);

  const [addData, setAddData] = useState({
    thumbnail: "",
    propertyId: "none",
    listingId: "none",
    state: "",
    city: "",
    builder: "",
    project: "",
    overview: "",
    address: "",
    sector : "",
    pincode: "",
    status: "",
    type: "",
    availableFor: "",
    category: "",
    minimumPrice: "",
    maximumPrice: "",
    bhk: "",
    longitude: "",
    latitude: "",

    houseNumber: "",
    floorNumber: "",
    tower: "",
    unit: "",
    size: "",

    numberOfFloors: "",
    numberOfBedrooms: "",
    numberOfBathrooms: "",
    numberOfWashrooms: "",
    numberOfParkings: "",
    isTitleDeedVerified: "",

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
    videos : [],
    floorPlan: [],
    enable: "true",
    isViewed: "no",
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
    // Add videos to the possible paths
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

  // Single file upload for thumbnail
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    toast("Uploading thumbnail...");

    try {
      const cloudFilePath = await uploadFileToCloud(file, "thumbnails");
      if (cloudFilePath) {
        const publicUrl = getPublicUrlFromSupabase(cloudFilePath);
        if (publicUrl) {
          setAddData((prev) => ({
            ...prev,
            thumbnail: {
              name: publicUrl.name,
              path: publicUrl.url,
            },
          }));
        } 
      }
      setIsUploading(false);
      toast.success("Thumbnail uploaded successfully");
    } catch (error) {
      setIsUploading(false);
      toast.error("Error uploading thumbnail");
      console.error(error);
    }
  };

  // Multiple file upload function with path handling
  const handleFileUpload = async (e, type) => {

    const files = Array.from(e.target.files);
    const maxFiles = {
      images: 15,
      floorPlan: 5,
      videos: 5
    }[type];
  
    const maxSizeInMB = type === 'videos' ? 100 : 5; // 100MB for videos, 5MB for images
    const currentFiles = addData[type];
  
    if (currentFiles.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed for ${type}`);
      return;
    }
  
    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > maxSizeInMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the ${maxSizeInMB}MB size limit`);
      return;
    }
  
    setIsUploading(true);
    toast(`Uploading ${type}...`);
  
    try {
      const uploadPromises = files.map(async (file) => {
        const cloudFilePath = await uploadFileToCloud(file, type);
        if (cloudFilePath) {
          const publicUrl = getPublicUrlFromSupabase(cloudFilePath);
          return {
            name: publicUrl.name,
            path: publicUrl.url,
          };
        }
        return null;
      });
  
      const uploadedFiles = await Promise.all(uploadPromises);
      const validFiles = uploadedFiles.filter((file) => file !== null);
  
      setAddData((prev) => ({
        ...prev,
        [type]: [...prev[type], ...validFiles],
      }));
  
      setIsUploading(false);
      toast.success(`${type} uploaded successfully`);
    } catch (error) {
      setIsUploading(false);
      toast.error(`Error uploading ${type}`);
      console.error(error);
    }
  };

  // Function to handle thumbnail removal
  const handleRemoveThumbnail = () => {
    setAddData((prev) => ({
      ...prev,
      thumbnail: "",
    }));
  };

  // Function to handle file removal with path
  const handleRemoveFile = (index, type) => {
    setAddData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
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
        setBuilders(response.data);
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
        setProjects(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleChipInput = (e, field) => {
    if (e.key === "Enter" && e.target.value) {
      const value = e.target.value.trim();
      if (!addData[field].includes(value)) {
        setAddData((prev) => ({
          ...prev,
          [field]: [...prev[field], value],
        }));
      }
      e.target.value = "";
    }
  };

  const handleRemoveChip = (index, field) => {
    setAddData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const changeFieldForDropdown = (e) => {
    setAddData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));

    const value = e.target.value;

    if (e.target.name === "state" && value) {
      if (value && value.length > 0) {
        const selectedValue = value;
        const item = states.find((state) => state.name === selectedValue);
        if (item) {
          fetchCitiesByState(item.iso2);
        }
      }
    }
    if (e.target.name === "city" && value) {
      fetchBuildersByCity(value);
    }

    if (e.target.name === "builder" && value) {
      fetchProjectByBuilder(value);
    }
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

  const handleSubmit = () => {
    if (
      !addData.state ||
      !addData.city ||
      !addData.builder ||
      !addData.project
    ) {
      toast.error("Required fields: State, City, Builder, and Project");
      return;
    }

    // setAddData((prevData) => ({
    //   ...prevData,
    //   longitute: parseFloat(prevData.longitude) || 0,
    //   latitude: parseFloat(prevData.latitude) || 0,
    // }));

    const localAddData = addData;
    localAddData.longitude = parseFloat(localAddData.longitude) || 0;
    localAddData.latitude = parseFloat(localAddData.latitude) || 0;

    const endpoint = editData
      ? `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/updateProject/${editData._id}?userId=${userId}`
      : `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/addProject?userId=${userId}`;

    const method = editData ? "put" : "post";

    axios[method](endpoint, localAddData, {
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
      setAddData({
        ...editData,
        latitude: editData.coordinates[0] || 0,
        longitude: editData.coordinates[1] || 0,
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
      }}
    >
      <div className="flex items-center justify-center">
        <div className="w-full">
          <form>
            <div className="flex flex-wrap gap-4">
              {/* Basic Information */}

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="thumbnail"
                  className="mb-3 block text-base font-medium"
                >
                  Thumbnail Image
                </label>
                {!displayMode && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    disabled={isUploading}
                  />
                )}
                {addData.thumbnail && (
                  <div className="flex items-center border p-2 rounded mt-2">
                    <span className="truncate max-w-xs">
                      {addData.thumbnail.name}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="propertyId"
                  className="mb-3 block text-base font-medium"
                >
                  Property ID
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

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="listingId"
                  className="mb-3 block text-base font-medium"
                >
                  Listing ID
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="text"
                  name="listingId"
                  id="listingId"
                  value={addData.listingId}
                  onChange={(e) => changeField("listingId", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
              <div className="mb-5 w-full lg:w-[45%]">
                <CustomDropdown
                  label="Select State *"
                  options={states.filter(
                    (item, index, self) =>
                      index === self.findIndex((obj) => obj.name === item.name)
                  )}
                  value={addData.state}
                  onChange={changeFieldForDropdown}
                  placeholder="Select or type a state..."
                  name="state"
                />
              </div>
              <div className="mb-5 w-full lg:w-[45%]">
                <CustomDropdown
                  label="Select City *"
                  options={cities.filter(
                    (item, index, self) =>
                      index === self.findIndex((obj) => obj.name === item.name)
                  )}
                  value={addData.city}
                  onChange={changeFieldForDropdown}
                  placeholder="Select or type a city..."
                  name="city"
                />
              </div>
              <div className="mb-5 w-full lg:w-[45%]">
                <CustomDropdown
                  label="Select Builder *"
                  options={builders?.filter(
                    (item, index, self) =>
                      index === self.findIndex((obj) => obj.name === item.name)
                  )}
                  value={addData.builder}
                  onChange={changeFieldForDropdown}
                  placeholder="Select or type a builder..."
                  name="builder"
                />
              </div>
              <div className="mb-5 w-full lg:w-[45%]">
                {/* Project Dropdown */}
                <CustomDropdown
                  label="Select Project *"
                  options={projects?.filter(
                    (item, index, self) =>
                      index === self.findIndex((obj) => obj.name === item.name)
                  )}
                  value={addData.project}
                  onChange={changeFieldForDropdown}
                  placeholder="Select or type a project..."
                  name="project"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="houseNumber"
                  className="mb-3 block text-base font-medium"
                >
                  House Number
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="text"
                  name="houseNumber"
                  id="houseNumber"
                  value={addData.houseNumber}
                  onChange={(e) => changeField("houseNumber", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="floorNumber"
                  className="mb-3 block text-base font-medium"
                >
                  Floor Number
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="text"
                  name="floorNumber"
                  id="floorNumber"
                  value={addData.floorNumber}
                  onChange={(e) => changeField("floorNumber", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="tower"
                  className="mb-3 block text-base font-medium"
                >
                  Tower
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="text"
                  name="tower"
                  id="tower"
                  value={addData.tower}
                  onChange={(e) => changeField("tower", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="unit"
                  className="mb-3 block text-base font-medium"
                >
                  Unit
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="text"
                  name="unit"
                  id="unit"
                  value={addData.unit}
                  onChange={(e) => changeField("unit", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="size"
                  className="mb-3 block text-base font-medium"
                >
                  Size
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="text"
                  name="size"
                  id="size"
                  value={addData.size}
                  onChange={(e) => changeField("size", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="latitude"
                  className="mb-3 block text-base font-medium"
                >
                  Latitude
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="Number"
                  name="latitude"
                  id="latitude"
                  value={addData.latitude}
                  onChange={(e) => changeField("latitude", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  placeholder="Enter latitude coordinate"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="longitude"
                  className="mb-3 block text-base font-medium"
                >
                  Longitude
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="Number"
                  name="longitude"
                  id="longitude"
                  value={addData.longitude}
                  onChange={(e) => changeField("longitude", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                  placeholder="Enter longitude coordinate"
                />
              </div>

              

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="overview"
                  className="mb-3 block text-base font-medium"
                >
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

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="address"
                  className="mb-3 block text-base font-medium"
                >
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
              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="sector"
                  className="mb-3 block text-base font-medium"
                >
                  Sector
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="text"
                  name="sector"
                  id="sector"
                  value={addData.sector}
                  onChange={(e) => changeField("sector", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="pincode"
                  className="mb-3 block text-base font-medium"
                >
                  Pincode
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="text"
                  name="pincode"
                  id="pincode"
                  value={addData.pincode}
                  onChange={(e) => changeField("pincode", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="status"
                  className="mb-3 block text-base font-medium"
                >
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
                  <option value="completed">Completed</option>
                  <option value="under-construction">Under Construction</option>
                </select>
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="type"
                  className="mb-3 block text-base font-medium"
                >
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

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="availableFor"
                  className="mb-3 block text-base font-medium"
                >
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

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="category"
                  className="mb-3 block text-base font-medium"
                >
                  Category
                </label>
                <select
                  readOnly={displayMode ? true : false}
                  name="category"
                  id="category"
                  value={addData.category}
                  onChange={(e) => changeField("category", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value="">Select category</option>
                  <option value="pre_launch">Pre Launch</option>
                  <option value="verified_owner">Verified Owner</option>
                  <option value="property_resale">Property Resale</option>
                  <option value="new_projects">New Projects</option>
                  <option value="upcoming_projects">Upcoming Projects</option>
                </select>
              </div>

              {/* Price Details */}
              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="minimumPrice"
                  className="mb-3 block text-base font-medium"
                >
                  Minimum Price
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="text"
                  name="minimumPrice"
                  id="minimumPrice"
                  value={addData.minimumPrice}
                  onChange={(e) => changeField("minimumPrice", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="maximumPrice"
                  className="mb-3 block text-base font-medium"
                >
                  Maximum Price
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="text"
                  name="maximumPrice"
                  id="maximumPrice"
                  value={addData.maximumPrice}
                  onChange={(e) => changeField("maximumPrice", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="bhk"
                  className="mb-3 block text-base font-medium"
                >
                  BHK
                </label>
                <select
                  readOnly={displayMode ? true : false}
                  name="bhk"
                  id="bhk"
                  value={addData.bhk}
                  onChange={(e) => changeField("bhk", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value="">--Select--</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="5+">5+</option>
                  <option value="studio_appartment">Studio Appartment</option>
                  <option value="plot">Plot</option>    
                </select>
               
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="numberOfFloors"
                  className="mb-3 block text-base font-medium"
                >
                  Number Of Floors
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="number"
                  min={0}
                  name="numberOfFloors"
                  id="numberOfFloors"
                  value={addData.numberOfFloors}
                  onChange={(e) =>
                    changeField("numberOfFloors", e.target.value)
                  }
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="numberOfBedrooms"
                  className="mb-3 block text-base font-medium"
                >
                  Number Of Bedrooms
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="number"
                  min={0}
                  name="numberOfBedrooms"
                  id="numberOfBedrooms"
                  value={addData.numberOfBedrooms}
                  onChange={(e) =>
                    changeField("numberOfBedrooms", e.target.value)
                  }
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="numberOfBathrooms"
                  className="mb-3 block text-base font-medium"
                >
                  Number Of Bathrooms
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="number"
                  min={0}
                  name="numberOfBathrooms"
                  id="numberOfBathrooms"
                  value={addData.numberOfBathrooms}
                  onChange={(e) =>
                    changeField("numberOfBathrooms", e.target.value)
                  }
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="numberOfWashrooms"
                  className="mb-3 block text-base font-medium"
                >
                  Number Of Washrooms
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="number"
                  min={0}
                  name="numberOfWashrooms"
                  id="numberOfWashrooms"
                  value={addData.numberOfWashrooms}
                  onChange={(e) =>
                    changeField("numberOfWashrooms", e.target.value)
                  }
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="numberOfParkings"
                  className="mb-3 block text-base font-medium"
                >
                  Number Of Parkings
                </label>
                <input
                  readOnly={displayMode ? true : false}
                  type="number"
                  min={0}
                  name="numberOfParkings"
                  id="numberOfParkings"
                  value={addData.numberOfParkings}
                  onChange={(e) =>
                    changeField("numberOfParkings", e.target.value)
                  }
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              {/* Multiple Value Inputs with Chips */}
              {[
                { field: "appartmentType", label: "Apartment Type" },
                { field: "appartmentSubType", label: "Apartment Sub Type" },
                { field: "features", label: "Features" },
                { field: "amenities", label: "Amenities" },
                { field: "commercialHubs", label: "Commercial Hubs" },
                { field: "hospitals", label: "Hospitals" },
                { field: "hotels", label: "Hotels" },
                { field: "shoppingCentres", label: "Shopping Centres" },
                { field: "transportationHubs", label: "Transportation Hubs" },
                {
                  field: "educationalInstitutions",
                  label: "Educational Institutions",
                },
              ].map(({ field, label }) => (
                <div key={field} className="mb-5 w-full lg:w-[45%]">
                  <label className="mb-3 block text-base font-medium">
                    {label}
                  </label>
                  <input
                    readOnly={displayMode ? true : false}
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
              <div className="mb-5 w-[95%]">
                <label className="mb-3 block text-base font-medium">
                  Property Images (Max 15)
                </label>
                {!displayMode && (
                  <input
                    readOnly={displayMode ? true : false}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "images")}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    disabled={isUploading || addData.images.length >= 15}
                  />
                )}
                <div className="text-sm text-gray-500 mt-1">
                  {15 - addData.images.length} slots remaining
                </div>
                {addData.images.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    {addData.images.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center border p-2 rounded"
                      >
                        <span className="truncate max-w-xs">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index, "images")}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Uploads */}
<div className="mb-5 w-[95%]">
  <label className="mb-3 block text-base font-medium">
    Property Videos (Max 5)
  </label>
  {!displayMode && (
    <input
      readOnly={displayMode ? true : false}
      type="file"
      multiple
      accept="video/*"
      onChange={(e) => handleFileUpload(e, "videos")}
      className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
      disabled={isUploading || addData.videos.length >= 5}
    />
  )}
  <div className="text-sm text-gray-500 mt-1">
    {5 - addData.videos.length} slots remaining
  </div>
  {addData.videos.length > 0 && (
    <div className="flex flex-wrap gap-4 mt-4">
      {addData.videos.map((file, index) => (
        <div
          key={index}
          className="flex items-center border p-2 rounded"
        >
          <span className="truncate max-w-xs">{file.name}</span>
          <button
            type="button"
            onClick={() => handleRemoveFile(index, "videos")}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}
</div>

              <div className="mb-5  w-[95%]">
                <label className="mb-3 block text-base font-medium">
                  Floor Plans (Max 5)
                </label>
                {!displayMode && (
                  <input
                    readOnly={displayMode ? true : false}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "floorPlan")}
                    className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                    disabled={isUploading || addData.floorPlan.length >= 5}
                  />
                )}
                <div className="text-sm text-gray-500 mt-1">
                  {5 - addData.floorPlan.length} slots remaining
                </div>
                {addData.floorPlan.length > 0 && (
                  <div className="flex flex-wrap gap-4 mt-4">
                    {addData.floorPlan.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center border p-2 rounded"
                      >
                        <span className="truncate max-w-xs">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index, "floorPlan")}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-5 w-full lg:w-[45%]">
                <label
                  htmlFor="isTitleDeedVerified"
                  className="mb-3 block text-base font-medium"
                >
                  Is Title Deed Verified ?
                </label>
                <select
                  readOnly={displayMode ? true : false}
                  name="isTitleDeedVerified"
                  id="isTitleDeedVerified"
                  value={addData.isTitleDeedVerified}
                  onChange={(e) =>
                    changeField("isTitleDeedVerified", e.target.value)
                  }
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value="">Select </option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Enable/Disable Toggle */}
              {!displayMode && (
                <div className="mb-5 w-full lg:w-[45%]">
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
                      <label className="pl-3 text-base font-medium">
                        Enable
                      </label>
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
                      <label className="pl-3 text-base font-medium">
                        Disable
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            {!displayMode && (
              <div className="flex justify-center mt-8">
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
                  {isUploading
                    ? "Uploading..."
                    : editData
                    ? "Update Project"
                    : "Add Project"}
                </button>
              </div>
            )}
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default ProjectsForm;