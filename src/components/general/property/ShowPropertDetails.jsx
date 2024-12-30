import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { client } from "../../../config/s3Config";
import { jwtDecode } from "jwt-decode";
import { FaEye } from "react-icons/fa";
import AccordionCustomIcon from "../../ui/Accordion";
import { handleDownload } from "../../../MyFunctions";
import { IoMdDownload } from "react-icons/io";
import AddCommunityModal from "../../ui/AddCommunityModal";
import AddMoreInfoReasonModal from "../../ui/AddMoreInfoReasonModal";

//get signed url---will be used sooon
const getSignedUrlForPrivateFile = async (path) => {
  try {
    const getParams = {
      Bucket: process.env.REACT_APP_PROPERTY_BUCKET,
      Key: path,
      ResponseContentDisposition: "inline",
    };

    const command = new GetObjectCommand(getParams);
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 }); // URL valid for 1 hour

    return signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
};

const ShowPropertyDetails = ({ data }) => {
  const [showSafe, setShowSafe] = useState(false);

  const [userId, setUserId] = useState();
  const [userToken, setUserToken] = useState();

  const theme = useTheme();
  // theme.palette.mode  === "dark"

  const [safeData, setSafeData] = useState();

  const [updateData, setUpdateData] = useState(data);
  const [documentArray, setDocumentArray] = useState([]);

  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [propertyOwnerData, setPropertyOwnerData] = useState();

  const [showMoreInfoReasonModal, setShowMoreInfoReasonModal] = useState(false);

  const fetchPropertyOwnerData = async (userId, userToken) => {
    const id = data.addedBy;
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/fetchuser/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setPropertyOwnerData(response.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occurred.");
      });
  };

  const closeModal = () => {
    setShowCommunityModal(false);
  };

  const closeMoreInfoReasonModal = () => {
    setShowMoreInfoReasonModal(false);
  };

  const fetchSafeData = async (userToken, userId) => {
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/safe/adminFetchAllDocuments/${data._id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setSafeData(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occurred.");
      });
  };
  const getUrlsArray = (pathArray) => {
    pathArray.map(async (path) => {
      let url = await getSignedUrlForPrivateFile(path);
      setDocumentArray((prevItems) => [...prevItems, url]);
    });
  };

  const updateOriginalData = (field, value) => {
    setUpdateData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const changeField = (field, value) => {
    if (value === "more-info-required") {
      setShowMoreInfoReasonModal(true);
    } else {
      setUpdateData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
      axios
        .put(
          `${process.env.REACT_APP_BACKEND_URL}/api/property/updateproperty/${data._id}?userId=${userId}`,
          {
            applicationStatus: value,
          },
          {
            headers: {
              "auth-token": userToken,
            },
          }
        )
        .then((response) => {
          if (response) {
            toast.success("Field updated!");
            // if application status changed to approve...
            // make a safe with that propertyId
            if (value === "approved") {
              axios
                .post(
                  `${process.env.REACT_APP_BACKEND_URL}/api/safe/adminAddNewSafeWithCommonSafeDocs?userId=${userId}`,
                  {
                    propertyId: data._id,
                    state: data.state,
                    city: data.city,
                    builder: data.builder,
                    project: data.project

                  },
                  {
                    headers: {
                      "auth-token": userToken,
                    },
                  }
                )
                .then((response) => {
                  if (response) {
                    toast.success("Safe Created!");
                  }
                })
                .catch((error) => {
                  console.error("Error:", error);
                  toast.error("Some ERROR occurred.");
                });
            }
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error("Some ERROR occurred.");
        });
    }
  };

  useEffect(() => {
    getUrlsArray(data.documents.files);
  }, []);
  useEffect(() => {
    try {
      // getting userId and userToken
      let token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
        fetchSafeData(token, decoded.userId);
        fetchPropertyOwnerData(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <>
      <div className="w-full mx-auto h-auto p-4 pt-2 md:p-6 lg:p-12 bg-gray-200 rounded shadow-md">
        <div className="text-2xl font-bold mb-8 text-black ">
          <h2>Property Details</h2>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Customer Id
            </label>
            <p className="text-gray-900">{data.addedBy}</p>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Customer Name
            </label>
            <p className="text-gray-900">{data.customerName}</p>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Customer Phone
            </label>
            <p className="text-gray-900">{data.customerNumber}</p>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              House Number
            </label>
            <p className="text-gray-900">{data.houseNumber}</p>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Floor Number
            </label>
            <p className="text-gray-900">{data.floorNumber}</p>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              State
            </label>
            <p className="text-gray-900">{data.state}</p>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              City
            </label>
            <p className="text-gray-900">{data.city}</p>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Builder
            </label>
            <p className="text-gray-900">{data.builder}</p>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Project
            </label>
            <p className="text-gray-900">{data.project}</p>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Tower
            </label>
            <p className="text-gray-900">{data.tower}</p>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Unit
            </label>
            <p className="text-gray-900">{data.unit}</p>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Size (sq. ft.)
            </label>
            <p className="text-gray-900">{data.size}</p>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Nature
            </label>
            <p className="text-gray-900">{data.nature}</p>
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Status
            </label>
            <p className="text-gray-900">{data.status}</p>
          </div>
        </div>

        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Documents
            </label>
            {documentArray.length > 0 && (
              <ul className="list-disc pl-4">
                {data.documents.files.map((file, index) => (
                  <li
                    className="text-gray-800 items-center flex my-2"
                    key={index}
                  >
                    <div className="font-bold">
                      {file.split("/")[file.split("/").length - 1]}{" "}
                    </div>
                    <a
                      href={documentArray[index]}
                      target="_blank"
                      className="ml-2 "
                    >
                      {" "}
                      <div className="flex ml-3 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-sm px-3 items-center justify-center">
                        <FaEye className="mr-2" />
                        <p>View</p>
                      </div>
                    </a>
                    <button
                      // href={arrWithUrl[index]["path"]}
                      className="bg-green-500 hover:bg-green-600 ml-3 flex p-2 justify-center items-center rounded-sm text-white"
                      onClick={() => {
                        handleDownload(documentArray[index]);
                      }}
                    >
                      <IoMdDownload className="h-4 w-4 mr-1" /> Download
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row -mx-3 uppercase tracking-wide text-gray-700 text-xs font-bold">
          <div className="w-full px-3 md:w-1/2">
            <div className="mb-5">
              <label htmlFor="applicationStatus" className="mb-3 block ">
                Application Status
              </label>
              <select
                id="applicationStatus"
                value={updateData.applicationStatus}
                onChange={(e) =>
                  changeField("applicationStatus", e.target.value)
                }
                className="w-full rounded-md border text-gray-600 border-[#e0e0e0] py-3 px-6 text-base font-medium outline-none focus:border-[#6A64F1] focus:shadow-md"
              >
                {updateData.applicationStatus === "approved" ? null : (
                  <option value="">Select...</option>
                )}
                \<option value="approved">Approved</option>
                {updateData.applicationStatus === "approved" ? null : (
                  <>
                    <option value="rejected">Rejected</option>
                    <option value="under-review">Under Review</option>
                    <option value="more-info-required">
                      More info required
                    </option>{" "}
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {data.moreInfoReason && data.moreInfoReason.length > 0 && <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3 mb-6 md:mb-0">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              More info reason 
            </label>
            <p className="text-gray-900">{data.moreInfoReason}</p>
          </div>
        </div>}

        <div className="mb-5 uppercase tracking-wide text-gray-700 text-xs font-bold">
          <label className="mb-3 block ">Delete Property?</label>
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="radio"
                name="enable"
                value="yes"
                className="h-5 w-5"
                id="radioButton1"
                checked={updateData.isDeleted === "yes"}
                onChange={(e) => changeField("isDeleted", e.target.value)}
              />
              <label htmlFor="radioButton1" className="pl-3  font-medium">
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
                checked={updateData.isDeleted === "no"}
                onChange={(e) => changeField("isDeleted", e.target.value)}
              />
              <label htmlFor="radioButton2" className="pl-3  font-medium">
                No
              </label>
            </div>
          </div>
        </div>
      </div>

      {updateData.applicationStatus === "approved" && (
        <div className="mb-5 mt-5">
          {showSafe === false && (
            <button
              type="button"
              className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-purple-500 text-white hover:bg-purple-600 focus:outline-none focus:bg-purple-600 disabled:opacity-50 disabled:pointer-events-none "
              onClick={() => {
                setShowSafe(true);
              }}
            >
              View Safe
            </button>
          )}

          {showSafe === true && (
            <button
              type="button"
              className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:bg-red-600 disabled:opacity-50 disabled:pointer-events-none "
              onClick={() => {
                setShowSafe(false);
              }}
            >
              Hide Safe
            </button>
          )}

          <button
            onClick={() => {
              setShowCommunityModal(true);
            }}
            type="button"
            className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-green-500 text-white hover:bg-green-600  disabled:opacity-50 disabled:pointer-events-none ml-3"
          >
            Add to community 
          </button> 
          {userId && showCommunityModal === true && propertyOwnerData && (
            <AddCommunityModal
            propertyData = {data}
            propertyOwnerData = {propertyOwnerData}
              userId={userId}
              userToken={userToken}
              closeModal={closeModal}
              _id={propertyOwnerData._id}
              profilePicture={propertyOwnerData.profilePicture}
              name={propertyOwnerData.name}
              phone={propertyOwnerData.phone}
            />
          )}

        </div>
      )}

      <div className="py-4">
        {showSafe === true && (
          <AccordionCustomIcon
            userId={userId}
            userToken={userToken}
            propertyId={data._id}
            safeData={safeData}
          />
        )}

{userId && showMoreInfoReasonModal === true && propertyOwnerData && (
            <AddMoreInfoReasonModal
              _id={data._id}
              updateOriginalData={updateOriginalData}
              userId={userId}
              userToken={userToken}
              closeModal={closeMoreInfoReasonModal}
            />
          )}
      </div>
    </>
  );
};

export default ShowPropertyDetails;
