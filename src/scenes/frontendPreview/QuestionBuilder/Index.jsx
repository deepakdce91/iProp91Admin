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
import QuestionBuilderForm from "../../../components/frontendPreview/QuestionBuilderForm";
import NoDataComponent from "../../../components/ui/NoDataComponent";

function Index() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");

  const [mode, setMode] = useState("display");
  const [data, setData] = useState([]);
  const [questionId, setQuestionId] = useState();


  const setModeToDisplay = () => {
    setMode("display");
    fetchAllQuestions(userId, userToken);
  };

  const fetchAllQuestions = (userId, userToken) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/questions/fetchAllQuestions?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        if(response.data.length > 0){
          setData(response.data[0].data);
        setQuestionId(response.data[0]._id);
        }
        
      })
      .catch((error) => {
        console.error("Error:", error);
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
        fetchAllQuestions(decoded.userId, token);
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
    fetchAllQuestions(userId, userToken);
  };

  // Click handler for the edit button
  const handleEdit = () => {
      setMode("edit");

  };


  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Question Builder"
          subtitle={
            mode === "add" 
              ? "Add Questions"
              : mode === "edit"
              ? "Edit Questions"
              : "Manage Questions here"
          }
        />

        <Box>
          {mode !== "display" && (
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
        <QuestionBuilderForm
        dataArray={[]}
          setModeToDisplay={setModeToDisplay}
          userId={userId}
          userToken={userToken}
        />
      ) :  (
        mode === "edit" ? (
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
            <QuestionBuilderForm
              dataArray={data}
              questionId={questionId}
              setModeToDisplay={setModeToDisplay}
              userId={userId}
              userToken={userToken}
            />{" "}
          </Box>
        ) : <>
        {
          data.length > 0 ? <div className="bg-gray-100 rounded-lg items-center text-gray-700 p-3 flex justify-between">
            <h1>Question Journey</h1>
            <button onClick={handleEdit} className="bg-purple-500 text-white py-1 px-3 rounded-sm">Edit</button>
          </div> : <NoDataComponent handleCreate={handleAddMore}/>
        }
        </>
        
      )}


      
    </Box>
  );
}

export default Index;
