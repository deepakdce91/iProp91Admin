import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishIcon from "@mui/icons-material/UnpublishedOutlined";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import { jwtDecode } from "jwt-decode";
import RentForm from "../../../components/general/listings/RentForm";
import SellForm from "../../../components/general/listings/SellForm";
import { TbCircleDotFilled } from "react-icons/tb";
import MarkUnreadModal from "../../../components/ui/MarkUnreadModal";
import DeleteModal from "../../../components/ui/DeleteModal";

// ConfirmationModal.js
const ConfirmationModal = ({ title, message, handleConfirm, closeModal }) => {

  const theme = useTheme();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className=" bg-opacity-50 absolute inset-0"></div>
      <div className={`${theme.palette.mode === "dark" ? "bg-gray-800" :"bg-gray-100"} border border-1 border-gray-200 rounded-lg p-6 relative z-10`}>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};


function Index({setRefetchNotification}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display");
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [deleteIsViewed, setDeleteIsViewed] = useState();

  const [showUnreadModal, setShowUnreadModal] = useState(false);
  const [unreadId, setUnreadId] = useState();

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  const [publishId, setPublishId] = useState();

   // Add new handlers for publish/unpublish
   const handlePublish = async (id) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/listings/setlistingpublished/${id}?userId=${userId}`,
        {},
        {
          headers: {
            "auth-token": userToken,
          },
        }
      );
      
      if (response) {
        toast.success("Listing published successfully!");
        setRefetchNotification();
        fetchAllListings(userId, userToken);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to publish listing");
    }
    setShowPublishModal(false);
    setPublishId(null);
  };

  const handleUnpublish = async (id) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/listings/setlistingunpublished/${id}?userId=${userId}`,
        {},
        {
          headers: {
            "auth-token": userToken,
          },
        }
      );
      
      if (response) {
        toast.success("Listing unpublished successfully!");
        fetchAllListings(userId, userToken);
        setRefetchNotification();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to unpublish listing");
    }
    setShowUnpublishModal(false);
    setPublishId(null);
  };


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
    {
      field: "serial",
      headerName: "No.",
      width: 70,
      valueGetter: (params) => params.api.getRowIndex(params.id) + 1, // Start numbering from 1
    },

    {
      field: "_id",
      headerName: "Listing Id",
      flex: 1,
    },
    {
      field: "propertyId",
      headerName: "For Property",
      flex: 1,
    },

    {
      field: "type",
      headerName: "Type",
      flex: 1,
      valueGetter: (params) => {
        if (params.row.sellDetails === null) {
          return "Rent";
        } else {
          return "Sell";
        }
      },
    },

    
    { 
      field: "action",
      headerName: "Action",
      flex: 1.5,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => {
              if (params.row.sellDetails === null) {
                handleEdit(params.row, "editRent");
              } else {
                handleEdit(params.row, "editSell");
              }

              if (params.row.isViewed !== "yes") {
                toggleListingViewed(params.row._id, "yes");
                if(params.row.isViewed === "no"){
                  decreaseCounter(userId, userToken, "newListings");
                }
              }
            }}
            className="text-grey-400"
          >
            <EditIcon />
          </IconButton>

          <IconButton
            onClick={() => handleDelete(params.row._id, params.row.isViewed)}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>

          {params.row.isPublished === "no" ? (
            <IconButton
              onClick={() => {
                setPublishId(params.row._id);
                setShowPublishModal(true);
              }}
              color="primary"
              title="Publish"
            >
              <PublishIcon  className={`${theme.palette.mode === "dark" ? "text-white" : "text-black"}`}/>
            </IconButton>
          ) : (
            <IconButton
              onClick={() => {
                setPublishId(params.row._id);
                setShowUnpublishModal(true);
              }}
              color="warning"
              title="Unpublish"
            >
              <UnpublishIcon className={`${theme.palette.mode === "dark" ? "text-white" : "text-black"}`}/>
            </IconButton>
          )}
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

  // const fetchListing = async (id, myCallback) => {
  //   // Make the GET request
  //   await axios
  //     .get(
  //       `${process.env.REACT_APP_BACKEND_URL}/api/listings/fetchlisting/${id}?userId=${userId}`,
  //       {
  //         headers: {
  //           "auth-token": userToken,
  //         },
  //       }
  //     )
  //     .then((response) => {
  //       if (response) {
  //         setEditData(response.data);
  //         myCallback(response.data);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //       toast.error("Some ERROR occured.");
  //     });
  // };

  const fetchAllListings = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/listings/fetchalllistings?userId=${userId}`,
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

  const deleteListingById = async (id, myIsViewed) => {
    // Make the DELETE request
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/listings/deletelisting/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast("Listing deleted!");
          if(myIsViewed === "no"){
            decreaseCounter(userId, userToken, "newListings");
          }
          setDeleteId();
          fetchAllListings(userId, userToken);
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
        fetchAllListings(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleAddRent = () => {
    setMode("addRent");
  };

  const handleAddSell = () => {
    setMode("addSell");
  };

  const handleCancel = () => {
    setMode("display");
    fetchAllListings(userId, userToken);
  };

  // Click handler for the edit button
  const handleEdit = (rowData, mode) => {
    setEditData(rowData);
    setMode(mode);
  };


  const handleMarkUnread = (id) => {
    setShowUnreadModal(true);
    setUnreadId(id);
  };

  const setModeToDisplay = () => {
    setMode("display");
    setEditData();
    setRefetchNotification();
    fetchAllListings(userId, userToken);
  };

  // Click handler for the delete button
  const handleDelete = (id,isViewed) => {
    setShowDeleteModal(true);
    setDeleteId(id);
    setDeleteIsViewed(isViewed);
  };

  const toggleListingViewed = async (id, to) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/listings/${
          to === "yes"
            ? "setlistingviewed"
            : to === "red"
            ? "setlistingviewedred"
            : "setlistingnotviewed"
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
          fetchAllListings(userId, userToken);
          setRefetchNotification();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error.");
      });
  };

  const setListingViewed = async (id) => {
    await axios
      .put(
        `${process.env.REACT_APP_BACKEND_URL}/api/listings/setlistingviewed/${id}?userId=${userId}`,
        {},  // empty body since we're only updating isViewed to "yes"
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
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
          title="Listings"
          subtitle={
            mode === "addRent"
              ? "Add a rent listing"
              : mode === "addSell"
              ? "Add a sell listing"
              : mode === "editRent"
              ? "Edit rent listing"
              : mode === "editSell"
              ? "Edit sell listing"
              : "Manage listings here"
          }
        />

        <Box>
          {mode === "display" ? (
            <div className="mr-12">
              <button
                className="border-2 w-16  border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200"
                onClick={handleAddRent}
              >
                Rent
              </button>
              <button
                className="border-2 w-16 ml-2 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200"
                onClick={handleAddSell}
              >
                Sell
              </button>
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
      {mode === "addRent" ? (
        <RentForm
          setModeToDisplay={setModeToDisplay}
          userId={userId}
          userToken={userToken}
        />
      ) : mode === "addSell" ? (
        <SellForm
          setModeToDisplay={setModeToDisplay}
          userId={userId}
          userToken={userToken}
        />
      ) : mode === "editRent" ? (
        editData && (
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
            <RentForm
              editData={editData}
              setModeToDisplay={setModeToDisplay}
              userId={userId}
              userToken={userToken}
            />{" "}
          </Box>
        )
      ) : mode === "editSell" ? (
        editData && (
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
            <SellForm
              editData={editData}
              setModeToDisplay={setModeToDisplay}
              userId={userId}
              userToken={userToken}
            />{" "}
          </Box>
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
          />
        </Box> 
      )}

{showDeleteModal === true && deleteId && (
        <DeleteModal
          handleDelete={() => {
            deleteListingById(deleteId, deleteIsViewed);
          }}
          closeModal={() => {
            setShowDeleteModal(false);
          }}
        />
      )}

      {showUnreadModal === true && unreadId && (
        <MarkUnreadModal
          handleMarkUnread={() => {
            toggleListingViewed(unreadId, "red");
          }}
          closeModal={() => {
            setShowUnreadModal(false);
          }}
        />
      )}

{showPublishModal && publishId && (
  <ConfirmationModal
    title="Confirm Publish"
    message="Are you sure you want to publish this listing?"
    handleConfirm={() => handlePublish(publishId)}
    closeModal={() => {
      setShowPublishModal(false);
      setPublishId(null);
    }}
  />
)}

{showUnpublishModal && publishId && (
  <ConfirmationModal
    title="Confirm Unpublish"
    message="Are you sure you want to unpublish this listing?"
    handleConfirm={() => handleUnpublish(publishId)}
    closeModal={() => {
      setShowUnpublishModal(false);
      setPublishId(null);
    }}
  />
)}

    </Box>
  );
}

export default Index;
