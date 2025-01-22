import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  useTheme,
  Button,
  FormControl,
  TextField,
  Typography,
  Paper,
  useMediaQuery,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { X, Upload, Copy, Check, Trash2 } from "lucide-react";
import { tokens } from "../../../theme";
import Header from "../../../components/Header";
import { jwtDecode } from "jwt-decode";
import { removeSpaces } from "../../../MyFunctions";

import { supabase } from "../../../config/supabase";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../../config/s3Config";

// Upload the file to Supabase S3
const uploadFileToCloud = async (myFile, fileType) => {
  const myFileName = removeSpaces(myFile.name); // removing blank space from name
  const myPath = `masterProjects/${fileType}/${myFileName}`;
  try {
    const uploadParams = {
      Bucket: process.env.REACT_APP_SITE_BUCKET,
      Key: myPath,
      Body: myFile, // The file content
      ContentType: myFile.type, // The MIME type of the file
    };
    const command = new PutObjectCommand(uploadParams);
    await client.send(command);
    return myPath; //  return the file path
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// get public url
const getPublicUrlFromSupabase = (path) => {
  const { data, error } = supabase.storage
    .from(process.env.REACT_APP_SITE_BUCKET)
    .getPublicUrl(path);
  if (error) {
    console.error("Error fetching public URL:", error);
    return null;
  }
  return {
    name: path.split("/")[path.split("/").length - 1],
    url: data.publicUrl,
  };
};

const Index = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDark = theme.palette.mode === "dark";

  // Existing states
  const [userId, setUserId] = useState("");
  const [userToken, setUserToken] = useState("");
  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [urls, setUrls] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // New states for file type management
  const [fileTypes, setFileTypes] = useState([]);
  const [newFileType, setNewFileType] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);

  // Fetch existing file types
  const fetchFileTypes = async () => {

    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/fileToUrlFileTypes/fetchAllTypes?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        setFileTypes(response.data);
      })
      .catch((error) => {
        console.error("Error fetching file types:", error);
      });
  };

  // Add new file type
  const handleAddFileType = async () => {
    if (!newFileType.trim()) return;
    try {
      setIsAddingType(true);
      axios
      .post(
        `${process.env.REACT_APP_BACKEND_URL}/api/fileToUrlFileTypes/addType?userId=${userId}`,
        {
          name: newFileType,
        },
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        setFileTypes([...fileTypes, response.data]);
        setNewFileType("");
        setFileType(response.data.name);
      })
      .catch((error) => {
        console.error("Error deleting file type:", error);
      });
    } catch (error) {
      console.error("Error adding file type:", error);
    } finally {
      setIsAddingType(false);
    }
  };

  // Delete file type
  const handleDeleteFileType = async (id) => {
    axios
      .delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/fileToUrlFileTypes/deleteType/${id}?userId=${userId}`,
        {
          headers: {
            "auth-token": userToken,
          },
        }
      )
      .then((response) => {
        setFileTypes(fileTypes.filter((type) => type._id !== id));
      if (fileType === id) setFileType("");
      })
      .catch((error) => {
        console.error("Error deleting file type:", error);
      });
   
  };

  useEffect(() => {
    try {
      let token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFileTypes();
    }
  }, [userId]);

  useEffect(() => {
    try {
      let token = localStorage.getItem("iProp-token");
      if (token) {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserToken(token);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleGetUrls = async () => {
    setIsProcessing(true);
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const path = await uploadFileToCloud(file, fileType);
          const urlData = getPublicUrlFromSupabase(path);
          return urlData.url;
        })
      );
      setUrls(uploadedUrls);
      setShowResults(true);
    } catch (error) {
      console.error("Error getting URLs:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy =
      urls.length === 1 ? urls[0] : JSON.stringify(urls, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetUpload = () => {
    setFiles([]);
    setFileType("");
    setUrls([]);
    setShowResults(false);
  };

  const baseStyles = {
    background: isDark ? colors.primary[400] : "#ffffff",
    boxShadow: isDark
      ? "0 4px 6px rgba(0, 0, 0, 0.6)"
      : "0 4px 6px rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    color: isDark ? colors.grey[100] : "#000000", // Updated text color for light theme
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Header
          title="File to URL"
          subtitle="Upload one or more files to get their URL"
        />
      </Box>

      <Paper
        elevation={3}
        sx={{
          ...baseStyles,
          p: { xs: 2, sm: 4 },
          minHeight: "500px",
        }}
      >
        {!showResults ? (
          <Box
            sx={{
              ...baseStyles,
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box display="flex" gap={2}>
            <Autocomplete
        value={fileType}
        className="w-[50%]"
        onChange={(event, newValue) => setFileType(newValue)}
        options={fileTypes.map((type) => type.name)}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            className="w-40"
            label="File Type"
            variant="outlined"
            value={newFileType}
            onChange={(e) => setNewFileType(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: isDark ? colors.grey[100] : '#000000',
                },
                '&:hover fieldset': {
                  borderColor: isDark ? colors.grey[100] : '#000000',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isDark ? colors.grey[100] : '#000000',
                },
              },
              '& .MuiInputLabel-root': {
                color: isDark ? colors.grey[100] : '#000000',
                '&.Mui-focused': {
                  color: isDark ? colors.grey[100] : '#000000',
                },
              },
              '& .MuiAutocomplete-input': {
                color: isDark ? colors.grey[100] : '#000000',
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            sx={{ 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              color: isDark ? colors.grey[100] : '#000000',
              width: "100%", // Ensure full width
              pr: 1, // Add right padding for the icon
              '& .MuiIconButton-root': {
                ml: 'auto', // Push icon to the right
                opacity: 0, // Hide by default
                transition: 'opacity 0.2s',
              },
              '&:hover .MuiIconButton-root': {
                opacity: 1, // Show on hover
              },
            }}
          >
            <span style={{ flex: 1 }}>{option}</span>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFileType(
                  fileTypes.find((type) => type.name === option)._id
                );
              }}
              sx={{
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          </Box>
        )}
        sx={{
          '& .MuiAutocomplete-listbox': {
            backgroundColor: isDark ? colors.primary[400] : '#ffffff',
            color: isDark ? colors.grey[100] : '#000000',
          },
        }}
      />
              <Button
                variant="contained"
                onClick={handleAddFileType}
                disabled={isAddingType || !newFileType.trim()}
              >
                Add Type
              </Button>
            </Box>

            <Paper
              elevation={0}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: `2px dashed ${
                  isDragging
                    ? colors.greenAccent[400]
                    : isDark
                    ? colors.grey[100]
                    : '#000000'
                }`,
                borderRadius: "8px",
                padding: { xs: "20px", sm: "40px" },
                textAlign: "center",
                backgroundColor: isDragging
                  ? isDark
                    ? colors.primary[300]
                    : "#f0f7ff"
                  : "transparent",
                transition: "all 0.3s ease",
                cursor: "pointer",
                mb: 3,
                "&:hover": {
                  backgroundColor: isDark ? colors.primary[300] : "#f0f7ff",
                },
              }}
              onClick={() => document.getElementById("file-input").click()}
            >
              <input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <Upload
                size={48}
                color={isDark ? colors.grey[100] : '#000000'}
              />
              <Typography
                variant="h5"
                sx={{
                  mt: 2,
                  color: isDark ? colors.grey[100] : '#000000',
                }}
              >
                Drag and drop files here or click to select
              </Typography>
            </Paper>

            {files.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    color: isDark ? colors.grey[100] : '#000000',
                  }}
                >
                  Selected Files:
                </Typography>
                {files.map((file, index) => (
                  <Paper
                    key={index}
                    elevation={1}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: isDark ? colors.primary[300] : "#f5f5f5",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      mb: 1,
                      color: isDark ? colors.grey[100] : '#000000',
                      transition: "transform 0.2s ease",
                      "&:hover": {
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Typography color={isDark ? colors.grey[100] : '#000000'}>
                      {file.name}
                    </Typography>
                    <IconButton
                      onClick={() => removeFile(index)}
                      sx={{
                        color: colors.redAccent[400],
                        "&:hover": {
                          backgroundColor: isDark
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.05)",
                        },
                      }}
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}

            <Button
              variant="contained"
              disabled={!fileType || files.length === 0 || isProcessing}
              onClick={handleGetUrls}
              sx={{
                backgroundColor: colors.greenAccent[500],
                color: "white",
                px: 4,
                py: 1.5,
                "&:hover": {
                  backgroundColor: colors.greenAccent[600],
                },
                "&:disabled": {
                  backgroundColor: isDark ? colors.grey[700] : colors.grey[300],
                  color: isDark ? colors.grey[500] : colors.grey[500],
                },
              }}
            >
              {isProcessing ? "Processing..." : "Get URL"}
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: isDark ? colors.grey[100] : '#000000',
              }}
            >
              Generated URLs:
            </Typography>
            <Paper
              elevation={1}
              sx={{
                backgroundColor: isDark ? colors.primary[700] : "#f5f5f5",
                padding: "16px",
                paddingRight: "50px",
                borderRadius: "8px",
                mb: 3,
                position: "relative",
                maxHeight: "300px",
                overflow: "auto",
                color: isDark ? colors.grey[100] : '#000000',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {urls.length === 1 ? urls[0] : JSON.stringify(urls, null, 2)}
              </pre>
              <IconButton
                onClick={copyToClipboard}
                sx={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  color: copied
                    ? colors.greenAccent[400]
                    : isDark
                    ? colors.grey[100]
                    : '#000000',
                  backgroundColor: isDark
                    ? "rgba(0, 0, 0, 0.2)"
                    : "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    backgroundColor: isDark
                      ? "rgba(225, 225, 225, 0.3)"
                      : "rgba(255, 255, 255, 0.9)",
                  },
                }}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </IconButton>
            </Paper>
            <Button
              variant="contained"
              onClick={resetUpload}
              sx={{
                backgroundColor: colors.blueAccent[500],
                color: "white",
                px: 4,
                py: 1.5,
                "&:hover": {
                  backgroundColor: colors.blueAccent[600],
                },
              }}
            >
              Upload More
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Index;
