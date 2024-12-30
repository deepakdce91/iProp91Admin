import { Box } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { removeSpaces } from "../../../MyFunctions";
import { supabase } from "../../../config/supabase";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../../config/s3Config";

function SellForm({ editData, setModeToDisplay, userToken, userId }) {
  const [isUploading, setIsUploading] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [addData, setAddData] = useState({
    propertyId: "",
    unitNumber: "",
    size: "",
    expectedPrice: "",
    type: "",
    numberOfWashrooms: "",
    numberOfFloors: "",
    numberOfParkings: "",
    isActive: "true",
    media: [],
  });

  const getPublicUrlFromSupabase = (path) => {
    const { data, error } = supabase.storage
      .from(process.env.REACT_APP_PROPERTY_BUCKET)
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

  const uploadFileToCloud = async (myFile) => {
    const myFileName = removeSpaces(myFile.name);
    const myPath = `SellListings/${myFileName}`;
    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
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

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (addData.media.length + files.length > 15) {
      toast.error("Maximum 15 files allowed");
      return;
    }

    setIsUploading(true);
    toast("Uploading files...");

    try {
      for (const file of files) {
        const cloudFilePath = await uploadFileToCloud(file);
        if (cloudFilePath) {
          const publicUrl = getPublicUrlFromSupabase(cloudFilePath);
          if (publicUrl) {
            setAddData((prev) => ({
              ...prev,
              media: [...prev.media, publicUrl],
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

  const handleRemoveImage = (index) => {
    setAddData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const changeField = (field, value) => {
    setAddData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (
      addData.propertyId !== "" &&
      addData.unitNumber !== "" &&
      addData.size !== "" &&
      addData.expectedPrice !== "" &&
      addData.type !== "" &&
      addData.numberOfWashrooms !== "" &&
      addData.numberOfFloors !== "" &&
      addData.numberOfParkings !== "" &&
      addData.isActive !== ""
    ) {
      const reqData = editData
        ? {
            ...editData,
            sellDetails: {
                unitNumber: addData.unitNumber,
                size: addData.size,
                expectedPrice: addData.expectedPrice,
                type: addData.type,
                numberOfWashrooms: addData.numberOfWashrooms,
                numberOfFloors: addData.numberOfFloors,
                numberOfParkings: addData.numberOfParkings,
                isActive: addData.isActive,
                media: addData.media,
              },
          }
        : {
            propertyId: addData.propertyId,
            sellDetails: {
              unitNumber: addData.unitNumber,
              size: addData.size,
              expectedPrice: addData.expectedPrice,
              type: addData.type,
              numberOfWashrooms: addData.numberOfWashrooms,
              numberOfFloors: addData.numberOfFloors,
              numberOfParkings: addData.numberOfParkings,
              isActive: "true",
              media: addData.media,
            },
          };

      const endpoint = editData
        ? `${process.env.REACT_APP_BACKEND_URL}/api/listings/updatesalelisting/${editData._id}?userId=${userId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/listings/addsalelisting?userId=${userId}`;

      const method = editData ? "put" : "post";

      axios[method](endpoint, reqData, {
        headers: {
          "auth-token": userToken,
        },
      })
        .then((response) => {
          if (response) {
            toast.success(
              editData ? "Sell listing updated!" : "Sell listing Added!"
            );
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
      toast.error("Fill all the fields.");
    }
  };

  useEffect(() => {
    if (editData) {
      setAddData({
        propertyId: editData.propertyId,
        unitNumber: editData.sellDetails.unitNumber,
        size: editData.sellDetails.size,
        expectedPrice: editData.sellDetails.expectedPrice,
        type: editData.sellDetails.type,
        numberOfWashrooms: editData.sellDetails.numberOfWashrooms,
        numberOfFloors: editData.sellDetails.numberOfFloors,
        numberOfParkings: editData.sellDetails.numberOfParkings,
        isActive: editData.sellDetails.isActive,
        media: editData.sellDetails.media,
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-5">
                <label
                  htmlFor="propertyId"
                  className="mb-3 block text-base font-medium"
                >
                  PropertyId
                </label>
                <input
                  type="text"
                  name="propertyId"
                  id="propertyId"
                  value={addData.propertyId}
                  onChange={(e) => changeField("propertyId", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="unitNumber"
                  className="mb-3 block text-base font-medium"
                >
                  Unit Number
                </label>
                <input
                  type="text"
                  name="unitNumber"
                  id="unitNumber"
                  value={addData.unitNumber}
                  onChange={(e) => changeField("unitNumber", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="size"
                  className="mb-3 block text-base font-medium"
                >
                  Size (sq ft)
                </label>
                <input
                  type="number"
                  name="size"
                  id="size"
                  value={addData.size}
                  onChange={(e) => changeField("size", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="expectedPrice"
                  className="mb-3 block text-base font-medium"
                >
                  Expected Price
                </label>
                <input
                  type="number"
                  name="expectedPrice"
                  id="expectedPrice"
                  value={addData.expectedPrice}
                  onChange={(e) => changeField("expectedPrice", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="type"
                  className="mb-3 block text-base font-medium"
                >
                  Property Type
                </label>
                <select
                  name="type"
                  id="type"
                  value={addData.type}
                  onChange={(e) => changeField("type", e.target.value)}
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                >
                  <option value="">Select Type</option>
                  <option value="apartment">Apartment</option>
                  <option value="independentHouse">Independent House</option>
                  <option value="plot">Plot</option>
                </select>
              </div>

              <div className="mb-5">
                <label
                  htmlFor="numberOfWashrooms"
                  className="mb-3 block text-base font-medium"
                >
                  Number of Washrooms
                </label>
                <input
                  type="number"
                  name="numberOfWashrooms"
                  id="numberOfWashrooms"
                  value={addData.numberOfWashrooms}
                  onChange={(e) =>
                    changeField("numberOfWashrooms", e.target.value)
                  }
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="numberOfFloors"
                  className="mb-3 block text-base font-medium"
                >
                  Number of Floors
                </label>
                <input
                  type="number"
                  name="numberOfFloors"
                  id="numberOfFloors"
                  value={addData.numberOfFloors}
                  onChange={(e) =>
                    changeField("numberOfFloors", e.target.value)
                  }
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="numberOfParkings"
                  className="mb-3 block text-base font-medium"
                >
                  Number of Parkings
                </label>
                <input
                  type="number"
                  name="numberOfParkings"
                  id="numberOfParkings"
                  value={addData.numberOfParkings}
                  onChange={(e) =>
                    changeField("numberOfParkings", e.target.value)
                  }
                  className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Active Status
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="isActive"
                    value="true"
                    className="h-5 w-5"
                    checked={addData.isActive === "true"}
                    onChange={(e) => changeField("isActive", e.target.value)}
                  />
                  <label className="pl-3 text-base font-medium">Active</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="isActive"
                    value="false"
                    className="h-5 w-5"
                    checked={addData.isActive === "false"}
                    onChange={(e) => changeField("isActive", e.target.value)}
                  />
                  <label className="pl-3 text-base font-medium">Inactive</label>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium">
                Property Images (Max 15)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
                disabled={isUploading || addData.media.length >= 15}
              />
              <div className="text-sm text-gray-500 mt-1">
                {15 - addData.media.length} slots remaining
              </div>
            </div>

            {addData.media.length > 0 && (
              <div className="mb-5">
                <label className="mb-3 block text-base font-medium">
                  Uploaded Images
                </label>
                <div className="flex flex-row flex-wrap gap-4">
                  {addData.media.map((file, index) => (
                    <div
                      key={index}
                      className=" flex items-center justify-center border-1 border"
                    >
                      <p className="my-1 py-1 px-2 ">{file.name}</p>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className=" top-2 m-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  ? "Update Sell Listing"
                  : "Add Sell Listing"}
              </button>
            </div>
          </form>
          <ToastContainer position="top-center" autoClose={2000} />
        </div>
      </div>
    </Box>
  );
}

export default SellForm;
