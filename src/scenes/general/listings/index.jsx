import { Box, IconButton, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../components/Header";
import { jwtDecode } from "jwt-decode";
import RentForm from "../../../components/general/listings/RentForm";
import SellForm from "../../../components/general/listings/SellForm";

import { TbCircleDotFilled } from "react-icons/tb";

function Index({setRefetchNotification}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display");
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const columns = [
    {
      field: "isViewed",
      headerName: "",
      flex: 0.2,
      renderCell: (params) => {
        if (params.row.isViewed === "no") {
          return <TbCircleDotFilled className="text-green-400" />;
        } else {
          return "";
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
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => {
              setListingViewed(params.row._id);
              if (params.row.sellDetails === null) {
                handleEdit(params.row, "editRent");
              } else {
                handleEdit(params.row, "editSell");
              }
            }}
            // color="primary"
            className="text-grey-400"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row._id)}
            color="secondary"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const setModeToDisplay = () => {
    setMode("display");
    setEditData();
    fetchAllListings(userId, userToken);
  };

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
        resetCounter(userId, userToken, "newListings");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteListingById = async (id) => {
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
          fetchAllListings(userId, userToken);
          toast.success("Listing deleted!");
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

  // Click handler for the delete button
  const handleDelete = (id) => {
    deleteListingById(id);
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
    </Box>
  );
}

export default Index;
