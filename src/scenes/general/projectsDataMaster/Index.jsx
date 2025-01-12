import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import ProjectsDataMasterForm from "../../../components/general/projectsDataMaster/ProjectsDataMasterForm";
import { formatDate } from "../../../MyFunctions";
import { jwtDecode } from "jwt-decode";
import { TbCircleDotFilled } from "react-icons/tb";
import DeleteModal from "../../../components/ui/DeleteModal";
import MarkUnreadModal from "../../../components/ui/MarkUnreadModal";

function Index({ setRefetchNotification }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display"); //display add edit showDetails
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [deleteIsViewed, setDeleteIsViewed] = useState();

  const [showUnreadModal, setShowUnreadModal] = useState(false);
  const [unreadId, setUnreadId] = useState();

  const columns = [
    {
      field: "isViewed",
      headerName: "",
      flex: 0.2,
      renderCell: (params) => {
        if (params.row.isViewed === "no") {
          return <TbCircleDotFilled className="text-green-400" />;
        } else if (params.row.isViewed === "red") {
          return <TbCircleDotFilled className="text-red-400" />;
        } else {
          return <TbCircleDotFilled onClick={()=>{
            handleMarkUnread(params.row._id);
          }} className="text-gray-400 cursor-pointer" />;
        }
      },
    },

    { field: "_id", headerName: "ID", flex: 1, width: 120 },
    {
      field: "propertyId",
      headerName: "Property Id",
      width: 100,
      cellClassName: "name-column--cell",
    },
    {
      field: "project",
      headerName: "Project",
      width: 180,
    },
    {
      field: "city",
      headerName: "City",
      width: 180,
    },
    {
      field: "builder",
      headerName: "Builder",
      width: 180,
    },
    {
      field: "state",
      headerName: "State",
      width: 180,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
    },
    {
      field: "type",
      headerName: "Type",
      width: 150,
    },
    {
      field: "minimumPrice",
      headerName: "Min Price",
      width: 160,
    },
    {
      field: "listingId",
      headerName: "From Listings",
      valueGetter: (params) => {
        if(params.value !== "none"){
          return `Yes (${params.value})`;
        }else{
          return "No"
        }

      },
      width: 180,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 180,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton 
            onClick={() => {
              handleShowDetails(params.row);

              if (params.row.isViewed !== "yes") {
                toggleProjectDataMasterViewed(params.row._id, "yes");
                if(params.row.isViewed === "no"){
                  decreaseCounter(userId, userToken, "newProjectsDataMasters");
                }
              }
            }}
            // color="primary"
            className="text-grey-400"
          >
            <VisibilityIcon />
          </IconButton>

          <IconButton
            onClick={() => {
              handleEdit(params.row);

              if (params.row.isViewed !== "yes") {
                toggleProjectDataMasterViewed(params.row._id, "yes");
                if(params.row.isViewed === "no"){
                  decreaseCounter(userId, userToken, "newProjectsDataMasters");
                }}

            }}
            className="text-grey-400"
          >
            <EditIcon />
          </IconButton>

          <IconButton
            onClick={() => handleDelete(params.row._id,params.row.isViewed)}
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

  // const fetchProperty = async (id) => {
  //   // Make the DELETE request
  //   await axios
  //     .get(
  //       `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/fetchProject/${id}?userId=${userId}`,
  //       {
  //         headers: {
  //           "auth-token": userToken,
  //         },
  //       }
  //     )
  //     .then((response) => {
  //       if (response) {
  //         setEditData(response.data);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //       toast.error("Some ERROR occured.");
  //     });
  // };

  const fetchAllProjectsDataMaster = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/fetchAllProjects?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteProjectsMasterById = async (id, myIsViewed) => {
    // Make the DELETE request
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/deleteProject/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast("Project deleted!");
          if(myIsViewed === "no"){
            decreaseCounter(userId, userToken, "newProjectsDataMasters");
          }
          setDeleteId();
          fetchAllProjectsDataMaster(userId, userToken);
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
        fetchAllProjectsDataMaster(decoded.userId, token);
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
    setEditData();
    fetchAllProjectsDataMaster(userId, userToken);
    setRefetchNotification();
  };

  // Click handler for the edit button
  const handleEdit = (data) => {
    // fetchProperty(id);
    setEditData(data);
    setMode("edit");
  };

  // to show the details of property
  const handleShowDetails = (data) => {
    setEditData(data);
    setMode("showDetails");
  };

  const setModeToDisplay = () => {
    setMode("display");
    setEditData();
    setRefetchNotification();
    fetchAllProjectsDataMaster(userId, userToken);
  };

  // Click handler for the delete button
  const handleDelete = (id,isViewed) => {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteIsViewed(isViewed);
  };

  const handleMarkUnread = (id) => {
    setShowUnreadModal(true);
    setUnreadId(id);
  };

  const toggleProjectDataMasterViewed = async (id, to) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/projectsDataMaster/${
          to === "yes"
            ? "setProjectsMasterViewed"
            : to === "red"
            ? "setProjectsMasterViewedRed"
            : "setProjectsMasterNotViewed"
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
          fetchAllProjectsDataMaster(userId, userToken);
          setRefetchNotification();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error.");
      });
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Projects Data Master"
          subtitle={
            mode === "add"
              ? "Add Projects Data Master"
              : mode === "edit"
              ? "Edit Projects Data Master"
              : mode === "showDetails"
              ? "See property details"
              : "Manage Projects Data Master here"
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
      {1 === 1 && (
        <>
          {mode === "add" ? (
            <ProjectsDataMasterForm
              setModeToDisplay={setModeToDisplay}
              userId={userId}
              userToken={userToken}
            />
          ) : mode === "edit" ? (
            editData && (
              <>
                <ProjectsDataMasterForm
                  userId={userId}
                  userToken={userToken}
                  editData={editData}
                  setModeToDisplay={setModeToDisplay}
                />
              </>
            )
          ) : mode === "showDetails" ? (
            editData && (
              <>
                <ProjectsDataMasterForm
                  displayMode={true}
                  editData={editData}
                />
              </>
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
                rows={data}
                columns={columns}
                components={{ Toolbar: GridToolbar }}
                getRowId={(row) => row._id}
                autoHeight
                disableExtendRowFullWidth={true}
                scrollbarSize={10}
              />
            </Box>
          )}
        </>
      )}
      {showDeleteModal === true && deleteId && (
        <DeleteModal
          handleDelete={() => {
            deleteProjectsMasterById(deleteId, deleteIsViewed);
          }}
          closeModal={() => {
            setShowDeleteModal(false);
          }}
        />
      )}

      {showUnreadModal === true && unreadId && (
        <MarkUnreadModal
          handleMarkUnread={() => {
            toggleProjectDataMasterViewed(unreadId, "red");
          }}
          closeModal={() => {
            setShowUnreadModal(false);
          }}
        />
      )}
    </Box>
  );
}

export default Index;
