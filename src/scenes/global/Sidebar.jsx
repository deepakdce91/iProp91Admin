import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

import { MdOutlineRealEstateAgent } from "react-icons/md";
import { FaCity } from "react-icons/fa";
import { SiElectronbuilder } from "react-icons/si";
import { FaProjectDiagram } from "react-icons/fa";
import { IoDocumentTextSharp } from "react-icons/io5";
import { TbInfoTriangleFilled } from "react-icons/tb";
import { BsFillInfoSquareFill } from "react-icons/bs";
import { MdLandscape } from "react-icons/md";
import { FaUsers } from "react-icons/fa";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <Box
      sx={{
        position : "sticky",
        top: 0,
        height: "100vh",

        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  Iprop91
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            // image and name and user type
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY6qtMj2fJlymAcGTWLvNtVSCULkLnWYCDcQ&s`}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  Deepak Verma
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  Admin
                </Typography>
              </Box>
            </Box>
          )}

          {/* // sidebar options */}
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {/* // heading...  */}
            {!isCollapsed && (
              <Typography
                variant="h6"
                color={colors.grey[200]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                General
              </Typography>
            )}
             <Item
              title="Users"
              to="/users"
              icon={<FaUsers className="h-5 w-5" />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Property"
              to="/property"
              icon={<MdLandscape className="h-5 w-5" />}
              selected={selected}
              setSelected={setSelected}
            />


            {/* // heading...  */}
            {!isCollapsed && (
              <Typography
                variant="h6"
                color={colors.grey[200]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Configurations
              </Typography>
            )}

            <Item
              title="State"
              to="/state"
              icon={<MdOutlineRealEstateAgent className="h-5 w-5" />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="City"
              to="/city"
              icon={<FaCity className="h-5 w-5" />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Builders"
              to="/builders"
              icon={<SiElectronbuilder className="h-5 w-5" />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Projects"
              to="/projects"
              icon={<FaProjectDiagram className="h-5 w-5" />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Document Type"
              to="/documentType"
              icon={<IoDocumentTextSharp className="h-5 w-5" />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Rejected Reasons"
              to="/rejectedReasons"
              icon={<TbInfoTriangleFilled className="h-5 w-5" />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="More Info Reasons"
              to="/moreInfoReasons"
              icon={<BsFillInfoSquareFill className="h-4 w-4" />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
