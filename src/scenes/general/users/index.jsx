import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import UsersForm from "../../../components/general/users/UsersForm";
import { formatDate } from "../../../MyFunctions";
import { jwtDecode } from "jwt-decode";
import ViewProperties from "../../../components/ViewPages/ViewProperties";
import ViewSafes from "../../../components/ViewPages/ViewSafes";
import { MdClose } from "react-icons/md";
import { MdMessage } from "react-icons/md";
import { TbCircleDotFilled } from "react-icons/tb";
import { PiHandCoinsFill } from "react-icons/pi";
import DeleteModal from "../../../components/ui/DeleteModal";
import MarkUnreadModal from "../../../components/ui/MarkUnreadModal";

const RewardPointsModal = ({
  isOpen,
  onClose,
  currentUserId,
  userId,
  userToken,
  onSuccess,
  currentRewardPoints,
}) => {
  const [amount, setAmount] = useState("");
  const [actionType, setActionType] = useState("add");
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [reasonSuggestions, setReasonSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Ref for the dropdown container
  const dropdownRef = useRef(null);

  // Fetch reason suggestions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchReasonSuggestions();
    }
  }, [isOpen]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const fetchReasonSuggestions = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/rewards/fetchUniqueRewardNames?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      );
      if (response.data.uniqueNames) {
        setReasonSuggestions(response.data.uniqueNames);
      }
    } catch (error) {
      console.error("Error fetching reason suggestions:", error);
    }
  };

  const handleReasonSelect = (selectedReason) => {
    setReason(selectedReason);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
  
    try {
      const endpoint =
        actionType === "add"
          ? `${process.env.REACT_APP_BACKEND_URL}/api/users/increaseRewardPointsDirectly?userId=${userId}`
          : `${process.env.REACT_APP_BACKEND_URL}/api/users/decreaseRewardPointsDirectly?userId=${userId}`;
  
          console.log("comments", comments);
      const response = await axios.put(
        endpoint,
        { 
          currentUserId: currentUserId, 
          amount: parseInt(amount),
          purpose: reason,
          comments: comments, // Only send comments if it's not empty
        },
        {
          headers: {
            "auth-token": userToken,
          },
        }
      );
  
      if (response.data.success) {
        toast.success(`Reward points ${actionType === "add" ? "added" : "deducted"} successfully`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {actionType === "add" ? "Add" : "Deduct"} Reward Points
          </h2>
          <button onClick={onClose}>
            <MdClose className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-black">Current Reward Points: {currentRewardPoints}</p>
        </div>
        <div className="mb-4">
          <div className="flex mb-2">
            <button
              className={`mr-2 px-4 py-2 rounded ${
                actionType === "add"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActionType("add")}
            >
              Add
            </button>
            <button
              className={`px-4 py-2 rounded ${
                actionType === "deduct"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActionType("deduct")}
            >
              Deduct
            </button>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full p-2 border rounded text-black mb-3"
          />
          
          {/* Reason input with dropdown */}
          <div className="relative mb-3" ref={dropdownRef}>
            <input
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={(e) => {
                // Delay hiding to allow click on suggestion to register
                setTimeout(() => {
                  if (!dropdownRef.current?.contains(document.activeElement)) {
                    setShowSuggestions(false);
                  }
                }, 200);
              }}
              placeholder="Enter reason for adjustment"
              className="w-full p-2 border rounded text-black"
            />
            
            {/* Dropdown for suggestions */}
            {showSuggestions && reasonSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                {reasonSuggestions
                  .filter((suggestion) => 
                    suggestion.toLowerCase().includes(reason.toLowerCase())
                  )
                  .map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                      onMouseDown={(e) => {
                        // Using onMouseDown instead of onClick prevents the blur event from firing first
                        e.preventDefault();
                        handleReasonSelect(suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
          
          {/* Additional Comments field */}
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Additional comments (optional)"
            className="w-full p-2 border rounded text-black"
            rows="3"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-200 rounded text-black"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

function Index({ setRefetchNotification }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display");
  const [allData, setAllData] = useState([]);

  // New state for reward points modal
  const [showRewardPointsModal, setShowRewardPointsModal] = useState(false);
  const [selectedUserForRewardPoints, setSelectedUserForRewardPoints] =
    useState(null);

  const [editData, setEditData] = useState();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [deleteIsViewed, setDeleteIsViewed] = useState();

  const [showUnreadModal, setShowUnreadModal] = useState(false);
  const [unreadId, setUnreadId] = useState();

  const [showGroupModal, setShowGroupModal] = useState(false);

  const [currentProperties, setCurrentProperties] = useState([]);
  const [currentSafes, setCurrentSafes] = useState([]);
  const [currentGroups, setCurrentGroups] = useState([]);

  const columns = [
    {
      field: "isViewed",
      headerName: "",
      flex: 0.2,
      renderCell: (params) => {
        if (params.row.userData.isViewed === "no") {
          return <TbCircleDotFilled className="text-green-400" />;
        } else if (params.row.userData.isViewed === "red") {
          return <TbCircleDotFilled className="text-red-400" />;
        } else {
          return (
            <TbCircleDotFilled
              onClick={() => {
                handleMarkUnread(params.row.userData._id);
              }}
              className="text-gray-400 cursor-pointer"
            />
          );
        }
      },
    },
    { field: "_id", headerName: "ID", width: 80 },
    {
      field: "name",
      headerName: "Name",
      width: 100,
      valueGetter: (params) => params.row.userData.name,
      cellClassName: "name-column--cell",
    },
    {
      field: "phone",
      headerName: "Number",
      width: 100,
      valueGetter: (params) => params.row.userData.phone,
    },
    {
      field: "email",
      headerName: "Email",
      width: 150,
      valueGetter: (params) => params.row.userData.email,
    },
    {
      field: "lastLogin",
      headerName: "Last Login",
      width: 100,
      valueGetter: (params) => formatDate(params.row.userData.lastLogin),
    },
    {
      field: "fraud",
      headerName: "Fraud",
      valueGetter: (params) => params.row.userData.fraud,
      flex: 1,
    },
    {
      field: "suspended",
      headerName: "Suspended",
      headerAlign: "left",
      valueGetter: (params) => params.row.userData.suspended,
      width: 80,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 100,
      valueGetter: (params) => formatDate(params.row.userData.createdAt),
    },
    {
      field: "avatarSelected",
      headerName: "Avatar",
      width: 100,
      valueGetter: (params) => {
        if (params.row.userData.avatar && params.row.userData.avatar !== "") {
          return params.row.userData.avatar;
        } else {
          return "No";
        }
      },
    },

    {
      field: "keepProfileDiscreet",
      headerName: "Profile Discreet",
      width: 120,
      valueGetter: (params) => {
        if (
          params.row.userData.keepProfileDiscreet &&
          params.row.userData.keepProfileDiscreet !== "no"
        ) {
          return "Yes";
        } else {
          return "No";
        }
      },
    },

    {
      field: "properties",
      headerName: "Properties",
      width: 80,
      align: "center",
      renderCell: (params) => (
        <button
          onClick={() => {
            if (params.row.properties.length > 0) {
              // setUserViewed(params.row.userData._id);
              setCurrentProperties(params.row.properties);
              console.log(params.row.properties);
              setMode("showPropDetails");
            }
          }}
        >
          <span
            className={`text-grey-400 text-sm ${
              params.row.properties.length > 0
                ? "cursor-pointer hover:underline hover:bg-gray-200 hover:bg-opacity-20"
                : " cursor-default"
            }   p-2 rounded-sm  `}
          >
            {params.row.properties.length}
          </span>
        </button>
      ),
    },
    {
      field: "safes",
      headerName: "Safes",
      flex: 1,
      align: "center",
      renderCell: (params) => (
        <button
          onClick={() => {
            if (params.row.safes.length > 0) {
              // setUserViewed(params.row.userData._id);
              setCurrentSafes(params.row.safes);
              setMode("showSafeDetails");
            }
          }}
        >
          <span
            className={`text-grey-400 text-sm ${
              params.row.safes.length > 0
                ? "cursor-pointer hover:underline hover:bg-gray-200 hover:bg-opacity-20"
                : "cursor-default"
            }   p-2 rounded-sm  `}
          >
            {params.row.safes.length}
          </span>
        </button>
      ),
    },
    {
      field: "groups",
      headerName: "Groups",
      flex: 1,
      align: "center",
      renderCell: (params) => (
        <button
          onClick={() => {
            if (params.row.communities.length > 0) {
              // setUserViewed(params.row.userData._id);
              setCurrentGroups(params.row.communities);
              setMode("showGroupDetails");
              setShowGroupModal(true);
            }
          }}
        >
          <span
            className={`text-grey-400 text-sm ${
              params.row.communities.length > 0
                ? "cursor-pointer hover:underline hover:bg-gray-200 hover:bg-opacity-20"
                : "cursor-default"
            }   p-2 rounded-sm  `}
          >
            {params.row.communities.length}
          </span>
        </button>
      ),
    },

    {
      field: "rewardPoints",
      headerName: "Reward Points",
      width: 120,
      renderCell: (params) => (
        <div className="flex items-center">
          <PiHandCoinsFill className="mr-2 text-yellow-500" />
          <span>{params.row.userData.rewardPoints || 0}</span>
          <button
            onClick={() => {
              setSelectedUserForRewardPoints({
                id: params.row.userData._id,
                currentRewardPoints: params.row.userData.rewardPoints || 0,
              });
              setShowRewardPointsModal(true);
            }}
            className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
          >
            Manage
          </button>
        </div>
      ),
    },

    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => {
              handleEdit(params.row.userData);
              if (params.row.userData.isViewed !== "yes") {
                toggleUserViewed(params.row.userData._id, "yes");
                if (params.row.userData.isViewed === "no") {
                  decreaseCounter(userId, userToken, "newUsers");
                }
              }
            }}
            // color="primary"
            className="text-grey-400"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() =>
              handleDelete(
                params.row.userData._id,
                params.row.userData.isViewed
              )
            }
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];
  const decreaseCounter = async (userId, userToken, type) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/notifications/decreaseCounter?userId=${userId}`,

        {
          type,
        },
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setRefetchNotification(); //reset value on sidebar
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  const fetchUser = async (id) => {
    // Make the DELETE request
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/fetchuserforadmin/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setEditData(response.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  const deleteUserById = async (id, myIsViewed) => {
    // Make the DELETE request
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/deleteuser/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast("User deleted!");
          if (myIsViewed === "no") {
            decreaseCounter(userId, userToken, "newUsers");
          }
          setDeleteId();
          getCompleteUserDetails(userId, userToken);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  // get complete user detailsss
  const getCompleteUserDetails = async (userId, userToken) => {
    // Make the GET request
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/getUsersCompleteDetails?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          setAllData(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  };

  // useeffecttt
  useEffect(() => {
    try {
      // getting userId and userToken
      let token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
        getCompleteUserDetails(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  ///----

  const handleAddMore = () => {
    setMode("add");
  };

  const handleCancel = () => {
    setMode("display");
    setEditData();
    getCompleteUserDetails(userId, userToken);
    setRefetchNotification();
  };

  // Click handler for the edit button
  const handleEdit = (data) => {
    // fetchProperty(id);
    setEditData(data);
    setMode("edit");
  };

  const setModeToDisplay = () => {
    setMode("display");
    setEditData();
    setRefetchNotification();
    getCompleteUserDetails(userId, userToken);
  };

  // Click handler for the delete button
  const handleDelete = (id, isViewed) => {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteIsViewed(isViewed);
  };

  const handleMarkUnread = (id) => {
    setShowUnreadModal(true);
    setUnreadId(id);
  };

  const toggleUserViewed = async (id, to) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/${
          to === "yes"
            ? "setUserViewed"
            : to === "red"
            ? "setUserViewedRed"
            : "setUserNotViewed"
        }/${id}?userId=${userId}`,
        {}, // empty body since we're only updating isViewed to "yes"
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          getCompleteUserDetails(userId, userToken);
          setRefetchNotification();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error.");
      });
  };
  // ----

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Users"
          subtitle={
            mode === "add"
              ? "Add a user"
              : mode === "edit"
              ? "Edit the user details"
              : mode === "showPropDetails"
              ? "User's Properties"
              : mode === "showUserDetails"
              ? "User Details"
              : mode === "showGroupDetails"
              ? "User's Group Details"
              : "Manage Users here"
          }
        />

        <Box>
          {mode === "display" ? (
            <div
              className="border-2 mr-12 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200"
              onClick={handleAddMore}
            >
              Add more
            </div>
          ) : (
            <div
              className="border-2 mr-12 border-red-600 rounded-lg px-3 py-2 text-red-400 cursor-pointer hover:bg-red-600 hover:text-red-200"
              onClick={handleCancel}
            >
              Back
            </div>
          )}
        </Box>
      </Box>

      {/* Render form or DataGrid based on mode */}
      {mode === "add" ? (
        <UsersForm
          userId={userId}
          userToken={userToken}
          setModeToDisplay={setModeToDisplay}
        />
      ) : mode === "edit" ? (
        editData && (
          <>
            {/* <ShowPropertDetails data={editData} /> */}
            <UsersForm
              editData={editData}
              userId={userId}
              userToken={userToken}
              setModeToDisplay={setModeToDisplay}
            />
            {console.log(allData)}
          </>
        )
      ) : mode === "showPropDetails" ? (
        // <div>showPropDetails</div>
        currentProperties && <ViewProperties data={currentProperties} />
      ) : mode === "showSafeDetails" ? (
        currentSafes && (
          <ViewSafes
            userToken={userToken}
            userId={userId}
            data={currentSafes}
          />
        )
      ) : mode === "showGroupDetails" ? (
        showGroupModal === true &&
        currentGroups && (
          <div className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]">
            <div
              className={`relative rounded-lg p-4 shadow-lg max-w-lg w-full pt-9 ${
                theme.palette.mode === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setMode("display");
                }}
                className="absolute top-2 right-2  text-sm"
              >
                <MdClose className="h-5 w-5" />
              </button>

              {currentGroups.map((group, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-row justify-between gap-2 my-2 hover:bg-gray-200 hover:bg-opacity-20 p-2 rounded-sm items-center"
                  >
                    <div className="flex flex-row items-center gap-2">
                      <MdMessage className="h-5 w-5 " />
                      <h1 className="text-xl">{group.name}</h1>
                    </div>
                    <div className="flex flex-row">
                      <h1 className="text-xs">
                        {group.customers.length} Members
                      </h1>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <Box
          m="40px 0 0 0"
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
          <DataGrid
            rows={allData}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
            getRowId={(row) => row._id}
            autoHeight
            disableExtendRowFullWidth={true}
            scrollbarSize={10}
          />
        </Box>
      )}
      {showDeleteModal === true && deleteId && (
        <DeleteModal
          handleDelete={() => {
            deleteUserById(deleteId, deleteIsViewed);
          }}
          closeModal={() => {
            setShowDeleteModal(false);
          }}
        />
      )}

      {showUnreadModal === true && unreadId && (
        <MarkUnreadModal
          handleMarkUnread={() => {
            toggleUserViewed(unreadId, "red");
          }}
          closeModal={() => {
            setShowUnreadModal(false);
          }}
        />
      )}

      {showRewardPointsModal && selectedUserForRewardPoints && (
        <RewardPointsModal
          isOpen={showRewardPointsModal}
          onClose={() => setShowRewardPointsModal(false)}
          currentUserId={selectedUserForRewardPoints.id}
          userId={userId}
          userToken={userToken}
          currentRewardPoints={selectedUserForRewardPoints.currentRewardPoints}
          onSuccess={() => {
            getCompleteUserDetails(userId, userToken);
          }}
        />
      )}
    </Box>
  );
} 

export default Index;
