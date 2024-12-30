import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
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

function Index({ setRefetchNotification }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display");
  //display add edit showPropDetails showSafeDetails showGroupDetails

  const [allData, setAllData] = useState([]);

  const [editData, setEditData] = useState();

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
        } else {
          return "";
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
      flex: 1,
      valueGetter: (params) => {
        if (params.row.userData.avatar && params.row.userData.avatar !== "") {
          return params.row.userData.avatar;
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
              setUserViewed(params.row.userData._id);
              setCurrentProperties(params.row.properties);
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
              setUserViewed(params.row.userData._id);
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
              setUserViewed(params.row.userData._id);
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
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => {handleEdit(params.row.userData._id); setUserViewed(params.row.userData._id)}}
            // color="primary"
            className="text-grey-400"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.userData._id)}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];
  const resetCounter = async (userId, userToken, type) => {
    await axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/notifications/resetCounter?userId=${userId}`,

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

  const deleteUserById = async (id) => {
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
          //reset counter
          resetCounter(userId, userToken, "newUsers");
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

  const handleAddMore = () => {
    setMode("add");
  };

  const handleCancel = () => {
    setMode("display");
    getCompleteUserDetails(userId, userToken);
  };

  // Click handler for the edit button
  const handleEdit = (id) => {
    fetchUser(id);

    setTimeout(() => {
      setMode("edit");
    }, 500);
  };

  const handleShowPropDetails = (id) => {
    setMode("showPropDetails");
  };

  const setModeToDisplay = () => {
    setMode("display");
    getCompleteUserDetails(userId, userToken);
  };

  // Click handler for the delete button
  const handleDelete = (id) => {
    deleteUserById(id);
  };

  const setUserViewed = async (id) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/setUserViewed/${id}?userId=${userId}`,
        {},  // empty body since we're only updating isViewed to "yes"
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .catch((error) => {
        console.error("Error--:", error);
        toast.error("Some ERROR occured.");
      });
  };

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
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default Index;
