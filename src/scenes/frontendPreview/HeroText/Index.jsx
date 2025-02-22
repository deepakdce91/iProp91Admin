import {
    Box,
    Button,
    TextField,
    useTheme,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
  } from "@mui/material";
  import { Formik } from "formik";
  import * as yup from "yup";
  import { tokens } from "../../../theme";
  import axios from "axios";
  import Header from "../../../components/Header";
  import { toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { useEffect, useState } from "react";
  import { jwtDecode } from "jwt-decode";
  import CloseIcon from "@mui/icons-material/Close";
  
  const HeadingTextForm = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isDark = theme.palette.mode === 'dark';
  
    const [userId, setUserId] = useState("");
    const [userToken, setUserToken] = useState("");
    const [editData, setEditData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
    const textFieldStyles = {
      "& .MuiInputBase-input": {
        color: isDark ? colors.grey[100] : colors.grey[900],
      },
      "& .MuiInputLabel-root": {
        color: isDark ? colors.grey[100] : colors.grey[900],
        "&.Mui-focused": {
          color: colors.blueAccent[500],
        },
      },
      "& .MuiFilledInput-root": {
        backgroundColor: isDark ? colors.primary[600] : "#fff",
        "&:hover": {
          backgroundColor: isDark ? colors.primary[500] : colors.grey[100],
        },
        "&.Mui-focused": {
          backgroundColor: isDark ? colors.primary[500] : colors.grey[100],
        },
      },
      "& .MuiOutlinedInput-root": {
        backgroundColor: isDark ? colors.primary[600] : "#fff",
        "& fieldset": {
          borderColor: isDark ? colors.primary[300] : colors.grey[400],
        },
        "&:hover fieldset": {
          borderColor: isDark ? colors.primary[200] : colors.grey[900],
        },
        "&.Mui-focused fieldset": {
          borderColor: colors.blueAccent[500],
        },
      },
      "& .MuiFormHelperText-root": {
        color: theme.palette.error.main,
      },
    };
  
    const fetchHeroTexts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/heroText/fetchAllHeroTexts`,
          {
            headers: {
              "auth-token": userToken,
            },
            params: {
              userId: userId,
            },
          }
        );
  
        if (response.data && response.data.length > 0) {
          setEditData(response.data[0]);
        } else {
          setEditData(null);
        }
      } catch (error) {
        console.error("Error fetching hero texts:", error);
        toast.error("Failed to fetch hero texts.");
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleFormSubmit = async (values) => {
      if (editData) {
        try {
          await axios.put(
            `${process.env.REACT_APP_BACKEND_URL}/api/heroText/updateHeroText/${editData._id}?userId=${userId}`,
            values,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          );
          toast.success("Content updated successfully!");
          fetchHeroTexts();
        } catch (error) {
          console.error("Error updating hero text:", error);
          toast.error("Failed to update content.");
        }
      } else {
        try {
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/heroText/addHeroText?userId=${userId}`,
            values,
            {
              headers: {
                "auth-token": userToken,
              },
            }
          );
          toast.success("Content created successfully!");
          fetchHeroTexts();
          setIsCreateModalOpen(false);
        } catch (error) {
          console.error("Error creating hero text:", error);
          toast.error("Failed to create content.");
        }
      }
    };
  
    const initialValues = {
      title: editData?.title || "",
      text: editData?.text || "",
    };
  
    const validationSchema = yup.object().shape({
      title: yup.string().required("Title is required"),
      text: yup.string().required("Content text is required"),
    });
  
    useEffect(() => {
      try {
        const token = localStorage.getItem("iProp-token");
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.userId);
          setUserToken(token);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }, []);
  
    useEffect(() => {
      if (userToken && userId) {
        fetchHeroTexts();
      }
    }, [userToken, userId]);
  
    if (isLoading) {
      return <Typography>Loading...</Typography>;
    }
  
    return (
      <Box p="20px" bgcolor={colors.primary[400]} borderRadius="8px">
        <Header title="Hero Text" subtitle="Manage Hero Text here" />
  
        {editData ? (
          <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box
                  display="grid"
                  gap="30px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Title"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.title}
                    name="title"
                    error={!!touched.title && !!errors.title}
                    helperText={touched.title && errors.title}
                    sx={{ gridColumn: "span 4", ...textFieldStyles }}
                  />
  
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Content"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.text}
                    name="text"
                    error={!!touched.text && !!errors.text}
                    helperText={touched.text && errors.text}
                    multiline
                    rows={6}
                    sx={{ gridColumn: "span 4", ...textFieldStyles }}
                  />
                </Box>
  
                <Box display="flex" justifyContent="end" mt="20px">
                  <Button
                    type="submit"
                    color="secondary"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      backgroundColor: colors.blueAccent[500],
                      "&:hover": {
                        backgroundColor: colors.blueAccent[700],
                      },
                    }}
                  >
                    Update
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        ) : (
          <Box textAlign="center">
            <Typography variant="h6" mb="20px" color={isDark ? colors.grey[100] : colors.grey[900]}>
              No content provided yet.
            </Typography>
            <Button
              color="secondary"
              variant="contained"
              onClick={() => setIsCreateModalOpen(true)}
              sx={{
                backgroundColor: colors.blueAccent[500],
                "&:hover": {
                  backgroundColor: colors.blueAccent[700],
                },
              }}
            >
              Create
            </Button>
          </Box>
        )}
  
        <Dialog
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            style: {
              backgroundColor: colors.primary[400],
              color: isDark ? colors.grey[100] : colors.grey[900],
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
          <DialogTitle
            sx={{
              borderBottom: `1px solid ${isDark ? colors.primary[300] : colors.grey[300]}`,
              padding: "20px 24px",
            }}
          >
            <Typography variant="h5" component="div" fontWeight="bold">
              Create New Content
            </Typography>
            <IconButton
              onClick={() => setIsCreateModalOpen(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: isDark ? colors.grey[100] : colors.grey[900],
                "&:hover": {
                  backgroundColor: isDark ? colors.primary[500] : colors.grey[200],
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ padding: "24px" }}>
            <Formik
              onSubmit={handleFormSubmit}
              initialValues={{ title: "", text: "" }}
              validationSchema={validationSchema}
            >
              {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Box display="grid" gap="24px">
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      label="Title"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.title}
                      name="title"
                      error={!!touched.title && !!errors.title}
                      helperText={touched.title && errors.title}
                      sx={textFieldStyles}
                    />
  
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      label="Content"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.text}
                      name="text"
                      error={!!touched.text && !!errors.text}
                      helperText={touched.text && errors.text}
                      multiline
                      rows={6}
                      sx={textFieldStyles}
                    />
                  </Box>
  
                  <DialogActions sx={{ padding: "24px 0 0 0" }}>
                    <Button
                      onClick={() => setIsCreateModalOpen(false)}
                      sx={{
                        color: isDark ? colors.grey[100] : colors.grey[900],
                        "&:hover": {
                          backgroundColor: isDark ? colors.primary[500] : colors.grey[200],
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      color="secondary"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{
                        backgroundColor: colors.blueAccent[500],
                        "&:hover": {
                          backgroundColor: colors.blueAccent[700],
                        },
                        padding: "8px 24px",
                      }}
                    >
                      Create
                    </Button>
                  </DialogActions>
                </form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      </Box>
    );
  };
  
  export default HeadingTextForm;