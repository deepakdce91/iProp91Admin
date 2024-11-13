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
import TestimonialForm from "../../../components/frontendPreview/TestimonialForm";
import { formatDate } from "../../../MyFunctions";

import { jwtDecode } from "jwt-decode";

function Index() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display");
  const [data, setData] = useState([]);

  const [editData, setEditData] = useState();

  const columns = [
    {
        field: "serial",
        headerName: "No.",
        width: 70,
        valueGetter: (params) => params.api.getRowIndex(params.id) + 1, // Start numbering from 1
      },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "userInfo",
      headerName: "Added By",
      flex: 1,
      valueGetter: (params) => params.value.id,
    },

    {
      field: "enable",
      headerName: "Enabled",
      headerAlign: "left",
      align: "left",
      flex: 0.5,
    },

    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      valueGetter: (params) => formatDate(params.value),
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      flex: 1,
      valueGetter: (params) => formatDate(params.value),
    },

    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleEdit(params.row._id)}
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

  const fetchTestimonial = async (id) => {
    // Make the DELETE request
    await axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/testimonials/fetchTestimonial/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token" : userToken
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

  const fetchAllTestimonials = (userId, userToken) => {
    axios 
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/testimonials/fetchAllTestimonials?userId=${userId}`,
        {
          headers: {
            "auth-token" : userToken
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

  const deleteTestimonialById = async (id) => {
    // Make the DELETE request
    await axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/testimonials/deleteTestimonial/${id}?userId=${userId}`, 
        {
          headers: {
            "auth-token" : userToken
          },
        }
      )
      .then((response) => {
        if (response) {
          toast.error("Testimonial deleted!");
          fetchAllTestimonials(userId,userToken);
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
        fetchAllTestimonials(decoded.userId, token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleAddMore = () => {
    setMode("add");
  };

  const handleCancel = () => {
    fetchAllTestimonials(userId,userToken);
    setMode("display");
  };

  // Click handler for the edit button
  const handleEdit = (id) => {
    fetchTestimonial(id);

    setTimeout(() => {
      setMode("edit");
    }, 500);
  };

  // Click handler for the delete button
  const handleDelete = (id) => {
    deleteTestimonialById(id);
  };

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Testimonials"
          subtitle={
            mode === "add"
              ? "Add a Testimonial"
              : mode === "edit"
              ? "Edit Testimonial "
              : "Manage Testimonials here"
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
        <TestimonialForm setModeToDisplay={handleCancel} userId={userId} userToken = {userToken} />
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
            <TestimonialForm setModeToDisplay={handleCancel} userId={userId} userToken = {userToken} editData={editData} />{" "}
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
