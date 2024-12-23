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

function Index({setRefetchNotification}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); 

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display"); //display add edit showDetails

  const [allData, setAllData] = useState([]);

  const [editData, setEditData] = useState();

  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      valueGetter: (params) => params.row.userData.name,
      cellClassName: "name-column--cell",
    },
    {
      field: "phone",
      headerName: "Number",
      flex: 1,
      valueGetter: (params) => params.row.userData.phone,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      valueGetter: (params) => params.row.userData.email,
    },
    {
      field: "lastLogin",
      headerName: "Last Login",
      flex: 1,
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
      align: "left",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      valueGetter: (params) => formatDate(params.row.userData.createdAt),
    },
    {
      field: "avatarSelected",
      headerName: "Avatar",
      flex: 1,
      valueGetter: (params) => {
        if(params.row.userData.avatar && params.row.userData.avatar !== ""){
          return "Yes";
        }else{
          return "No";
        }
      },
    },
    {
      field: "properties",
      headerName: "Properties",
      flex: 1,
      align: "center",
      renderCell: (params) => (
        <button
        onClick={() => console.log(params.row.properties)}
        >
          <span
            className="text-grey-400 text-sm hover:underline cursor-pointer p-2 rounded-sm hover:bg-gray-200 hover:bg-opacity-20"
          >
           { params.row.properties.length}
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
        onClick={() => console.log(params.row.safes)}
        >
          <span
            className="text-grey-400 text-sm hover:underline cursor-pointer p-2 rounded-sm hover:bg-gray-200 hover:bg-opacity-20"
          >
           { params.row.safes.length}
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
        onClick={() => console.log(params.row.communities)}
        >
          <span
            className="text-grey-400 text-sm hover:underline cursor-pointer p-2 rounded-sm hover:bg-gray-200 hover:bg-opacity-20"
          >
           { params.row.communities.length}
          </span>
        </button>
      ),

    },
    {
      field: "action",
      headerName: "Action",
      flex: 2,
      renderCell: (params) => (
        <Box>

          <IconButton
            onClick={() => handleEdit(params.row.userData._id)}
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
  const resetCounter = async (userId, userToken,type) => {
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
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/users/fetchuserforadmin/${id}?userId=${userId}`,  {
              headers: {
                "auth-token" : userToken
              },
            })
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
      .delete(`${process.env.REACT_APP_BACKEND_URL}/api/users/deleteuser/${id}?userId=${userId}`,  {
              headers: {
                "auth-token" : userToken
              },
            })
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
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/users/getUsersCompleteDetails?userId=${userId}`,  {
              headers: {
                "auth-token" : userToken
              },
            })
          .then((response) => {
        if (response) {
          setAllData(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Some ERROR occured.");
      });
  }

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


  const setModeToDisplay = () => {
    setMode("display");
    getCompleteUserDetails(userId, userToken);
  };

  // Click handler for the delete button
  const handleDelete = (id) => {
    deleteUserById(id);
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
              : "Manage users here"
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
        <UsersForm userId = {userId}
        userToken = {userToken} setModeToDisplay={setModeToDisplay} />
      ) : mode === "edit" ? (
        editData && (
          <>
            {/* <ShowPropertDetails data={editData} /> */}
            <UsersForm
              editData={editData}
              userId = {userId}
              userToken = {userToken}
              setModeToDisplay={setModeToDisplay}
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
            rows={allData}
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
