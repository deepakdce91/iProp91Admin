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
import RewardsForm from "../../../components/configurations/RewardsForm";
import { formatDate } from "../../../MyFunctions";

import { jwtDecode } from "jwt-decode";

function Index() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [canSetInitialRewards, setCanSetInitialRewards] = useState(false);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display");
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const columns = [
    {
        field: "serial",
        headerName: "No.",
        width: 45,
        valueGetter: (params) => params.api.getRowIndex(params.id) + 1, // Start numbering from 1
      },
      {
        field: "title",
        headerName: "Title",
        width : 150,
        cellClassName: "name-column--cell",
      },
    {
      field: "name",
      headerName: "Reward Name",
      width : 150,
      cellClassName: "name-column--cell",
    },
    {
      field: "type",
      headerName: "Type",
      headerAlign: "left",
      align: "left",
      width : 120,
    },
    {
      field: "discountType",
      headerName: "Discount Type",
      headerAlign: "left",
      align: "left",
      width : 130,
    },
    {
      field: "amount",
      headerName: "Amount",
      headerAlign: "right",
      align: "right",
      width : 100,
    },
    {
      field: "enabled",
      headerName: "Enabled",
      headerAlign: "left",
      align: "left",
      width : 100,
    },
    {
      field: "createdAt",
      headerName: "Created",
      width : 150,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width : 150,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "action", 
      headerName: "Action",
      width : 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleEdit(params.row._id)}
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

  const fetchReward = async (id) => {
    await axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/rewards/fetchReward/${id}?userId=${userId}`,
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
        toast.error("Some ERROR occurred.");
      });
  };

  const fetchAllRewards = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/rewards/fetchAllRewards?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response.data.length === 0) {
          setCanSetInitialRewards(true);
        }
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

      // // ------
      // axios
      // .get(
      //   `${process.env.REACT_APP_BACKEND_URL}/api/rewards/fetchUniqueRewardNames?userId=${userId}`,
      //   {
      //     headers: {
      //       "auth-token": userToken,
      //     },
      //   } 
      // )
      // .then((response) => {
      //   // if (response.data.length === 0) {
      //   //   setCanSetInitialRewards(true);
      //   // }
      //   console.log(response.data.uniqueNames);
      // })
      // .catch((error) => {
      //   console.error("Error:", error);
      // });
  };

  const SetInitialRewards = (userId, userToken) => {
    console.log("Setting Initial Rewards");
    console.log(userId, userToken);
    axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/rewards/addDefaultRewards?userId=${userId}`, {},
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        toast("Initial Rewards Set!");
        fetchAllRewards(userId, userToken);
        setCanSetInitialRewards(false);
        // if(response.data.length === 0) {
        //   setCanSetInitialRewards(true);
        // }
        // setData(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const deleteRewardById = async (id) => {
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/rewards/deleteReward/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if (response) {
          toast("Reward deleted!");
          fetchAllRewards(userId, userToken);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occurred.");
      });
  };

  useEffect(() => {
    try {
      // getting userId and userToken
      let token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
        fetchAllRewards(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleAddMore = () => {
    setMode("add");
  };

  const handleCancel = () => {
    fetchAllRewards(userId, userToken);
    setMode("display");
  };

  // Click handler for the edit button
  const handleEdit = (id) => {
    fetchReward(id);

    setTimeout(() => {
      setMode("edit");
    }, 500);
  };

  // Click handler for the delete button
  const handleDelete = (id) => {
    deleteRewardById(id);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Reward Points"
          subtitle={
            mode === "add"
              ? "Add a Reward Point"
              : mode === "edit"
              ? "Edit the Reward Points"
              : "Manage Reward Points here"
          }
        />

        <Box>
          {mode === "display" ? (
            <div className="flex items-center">
              {canSetInitialRewards === true && <div
                className="border-2 mr-12 border-green-600 rounded-lg px-3 py-2 text-green-400 cursor-pointer hover:bg-green-600 hover:text-green-200"
                onClick={()=>{
                    SetInitialRewards(userId, userToken);
                }}
              >
                Set Initial Rewards
              </div>}

              <div
                className="border-2 mr-12 border-blue-600 rounded-lg px-3 py-2 text-blue-400 cursor-pointer hover:bg-blue-600 hover:text-blue-200"
                onClick={handleAddMore}
              >
                Add more
              </div>
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
        <RewardsForm
          userId={userId}
          userToken={userToken}
          closeForm={handleCancel}
        />
      ) : mode === "edit" ? (
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
            <RewardsForm
              userId={userId}
              userToken={userToken}
              editData={editData}
              closeForm={handleCancel}
            />
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
      <ToastContainer position="top-right" autoClose={2000} />
    </Box>
  );
}

export default Index;
