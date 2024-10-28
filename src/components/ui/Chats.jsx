import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "@mui/material";

import io from "socket.io-client";

import { format } from "date-fns";
import { getDate, getTime } from "../../MyFunctions";

import axios from "axios";
import { toast } from "react-toastify";
import ScrollToBottom from "react-scroll-to-bottom";
import EmojiPicker from "emoji-picker-react";
import heic2any from "heic2any";
import {
  getNameList,
  getUniqueItems,
  removeSpaces,
  sortArrayByName,
} from "../../MyFunctions";

import ReactPlayer from "react-player";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { client } from "../../config/s3Config";
import { supabase } from "../../config/supabase";

import { Image } from "primereact/image";
import { TiDelete } from "react-icons/ti";

import { FaSmile } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";

import { GrFlagFill, GrFlag } from "react-icons/gr";
import { MdDelete } from "react-icons/md";

import { TbPaperclip } from "react-icons/tb";
import { FaRegFilePdf } from "react-icons/fa";
import { GrDocumentWord } from "react-icons/gr";
import { GrDocumentExcel } from "react-icons/gr";
import { FaRegFilePowerpoint } from "react-icons/fa";

const socket = io(process.env.REACT_APP_BACKEND_URL, {
  transportOptions: ["websocket"],
});

function isValidURL(text) {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol (http or https)
      "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR IPv4 address
      "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-zA-Z\\d_]*)?$", // fragment locator
    "i"
  );
  return !!urlPattern.test(text);
}

function checkFileType(file) {
  const images = ["jpg", "jpeg", "png", "gif"];
  const videos = ["mp4", "mkv", "mov", "webm"];

  if (images.includes(file.type)) {
    return "image";
  } else if (videos.includes(file.type)) {
    return "video";
  } else {
    return "none";
  }
}

function hasExcelExtension(filename) {
  const excelExtensions = [
    "xlsx",
    "xls",
    "xlsm",
    "xlsb",
    "xltx",
    "xltm",
    "csv",
    "xml",
  ];
  const lowerCaseFilename = filename.toLowerCase();
  return excelExtensions.some((extension) =>
    lowerCaseFilename.endsWith(extension)
  );
}

function hasPowerPointExtension(filename) {
  const pptExtensions = [
    "pptx",
    "ppt",
    "pptm",
    "potx",
    "pot",
    "potm",
    "ppsx",
    "ppsm",
    "pps",
    "odp",
  ];
  const lowerCaseFilename = filename.toLowerCase();
  return pptExtensions.some((extension) =>
    lowerCaseFilename.endsWith(extension)
  );
}

function hasWordExtension(filename) {
  const wordExtensions = [
    "docx",
    "doc",
    "dotx",
    "dot",
    "docm",
    "dotm",
    "rtf",
    "txt",
    "odt",
  ];
  const lowerCaseFilename = filename.toLowerCase();
  return wordExtensions.some((extension) =>
    lowerCaseFilename.endsWith(extension)
  );
}

function IncomingMessage({
  userId,
  _id,
  flag,
  userProfilePicture,
  userName,
  text,
  file,
  senderId,
  removeMessage,
  flagMessage,
  unflagMessage,
  createdAt,
  isGroupAdmin,
}) {
  const theme = useTheme();

  return (
    <div className="flex flex-col my-5 cursor-pointer group">
      <p className="ml-12 mb-1">{userName}</p>
      <div className="flex">
        <div className="w-9 h-9 relative rounded-full flex items-center justify-center mr-2">
          <img
            src={
              userProfilePicture && userProfilePicture !== ""
                ? userProfilePicture
                : "/default-profile-pic.jpg"
            }
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
          {isGroupAdmin === true ? (
            <img
              src="/star-badge.svg"
              alt="admin-badge"
              className="absolute text-yellow-500  right-0 -top-1 z-20 w-5 h-5"
            />
          ) : null}
        </div>
        <div className="flex flex-col items-start">
          <div
            className={`relative flex max-w-96 items-center ${
              theme.palette.mode === "dark"
                ? "bg-gray-100 text-gray-700"
                : "bg-gray-200 text-gray-700"
            } rounded-lg p-3 gap-3`}
          >
            {file ? (
              checkFileType(file) === "image" ? (
                <Image
                  className="w-48"
                  src={file.url}
                  alt="Image"
                  width="250"
                  preview
                />
              ) : checkFileType(file) === "video" ? (
                <video src={file.url} className=" w-56" controls />
              ) : (
                <div className="flex items-center">
                  {file.type.includes("pdf") ? (
                    <FaRegFilePdf className="w-8 h-8 mr-3" />
                  ) : hasWordExtension(file.type) ? (
                    <GrDocumentWord className="w-8 h-8 mr-3" />
                  ) : hasExcelExtension(file.type) ? (
                    <GrDocumentExcel className="w-8 h-8 mr-3" />
                  ) : hasPowerPointExtension(file.type) ? (
                    <FaRegFilePowerpoint className="w-8 h-8 mr-3" />
                  ) : (
                    <FaFileAlt className="w-8 h-8 mr-3" />
                  )}

                  <a
                    className="hover:underline text-[16px]"
                    target="_blank"
                    href={file.url}
                  >
                    {file.name}
                  </a>
                </div>
              )
            ) : isValidURL(text) ? (
              text.includes("youtu") ? (
                <ReactPlayer controls url={text} />
              ) : (
                <a
                  className="underline text-[16px]"
                  href={text}
                  target="_blank"
                >
                  {text}
                </a>
              )
            ) : (
              <p className="text-gray-700 text-[16px]">{text}</p>
            )}

            <div className={`absolute -right-[68px] flex`}>
              {flag === "false" ? (
                <button
                  onClick={() => {
                    const message = text
                    ? text
                    : `Media file with with link - ${
                        file ? file.url : ""
                      }`;
                    const messageBy = senderId;
                    const messageId = _id;

                    flagMessage(messageId, message, messageBy);
                  }}
                >
                  <GrFlag
                    className={`rounded-full py-2  h-8 my-2 w-8 p-1  group-hover:block hidden  ${
                      theme.palette.mode === "dark"
                        ? " text-gray-300 hover:bg-gray-600"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  />
                </button>
              ) : (
                <button
                  onClick={() => {
                    unflagMessage(_id);
                  }}
                >
                  <GrFlagFill
                    className={`rounded-full py-2  h-8 my-2 w-8 p-1  group-hover:block hidden  ${
                      theme.palette.mode === "dark"
                        ? " text-gray-300 hover:bg-gray-600"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  />
                </button>
              )}

              <button
                onClick={() => {
                  removeMessage(_id, userId);
                }}
              >
                <MdDelete
                  className={`rounded-full py-2 hover:text-red-400  h-8 my-2 w-8 p-1  group-hover:block hidden  ${
                    theme.palette.mode === "dark"
                      ? " text-gray-300 hover:bg-gray-600"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                />
              </button>
            </div>
          </div>
          <p
            className={`text-[12px] font-extralight ${
              theme.palette.mode === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {getTime(createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

function OutgoingMessage({
  _id,
  flag,
  userProfilePicture,
  text,
  file,
  userId,
  removeMessage,
  flagMessage,
  senderId,
  unflagMessage,
  createdAt,
  isGroupAdmin,
}) {
  const theme = useTheme();

  return (
    <div className="flex flex-col   mb-5 cursor-pointer group items-end">
      <p className="mr-12 mb-1">
        {userId.includes("IPA") === true ? "Admin" : "You"}
      </p>
      <div className="flex justify-end ">
        <div className="flex flex-col items-end">
          <div className="flex relative items-center max-w-96 bg-indigo-500 text-white rounded-lg p-3 gap-3">
            <div className="absolute -left-[68px] flex flex-row-reverse">
              {flag === "false" ? (
                <button
                  onClick={() => {
                    const message = text
                      ? text
                      : `Media file with with link - ${
                          file ? file.url : ""
                        }`;
                    const messageBy = senderId;
                    const messageId = _id;

                    flagMessage(messageId, message, messageBy);
                  }}
                >
                  <GrFlag
                    className={`rounded-full py-2  h-8 my-2 w-8 p-1  group-hover:block hidden  ${
                      theme.palette.mode === "dark"
                        ? " text-gray-300 hover:bg-gray-600"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  />
                </button>
              ) : (
                <button
                  onClick={() => {
                    unflagMessage(_id);
                  }}
                >
                  <GrFlagFill
                    className={`rounded-full py-2  h-8 my-2 w-8 p-1  group-hover:block hidden  ${
                      theme.palette.mode === "dark"
                        ? " text-gray-300 hover:bg-gray-600"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  />
                </button>
              )}

              <button
                onClick={() => {
                  removeMessage(_id, userId);
                }}
              >
                <MdDelete
                  className={`rounded-full py-2 hover:text-red-400  h-8 my-2 w-8 p-1  group-hover:block hidden  ${
                    theme.palette.mode === "dark"
                      ? " text-gray-300 hover:bg-gray-600"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                />
              </button>
            </div>

            {file ? (
              checkFileType(file) === "image" ? (
                <Image
                  className="w-48"
                  src={file.url}
                  alt="Image"
                  width="250"
                  preview
                />
              ) : checkFileType(file) === "video" ? (
                <video src={file.url} className=" w-56" controls />
              ) : (
                <div className="flex items-center">
                  {file.type.includes("pdf") ? (
                    <FaRegFilePdf className="w-8 h-8 mr-3" />
                  ) : hasWordExtension(file.type) ? (
                    <GrDocumentWord className="w-8 h-8 mr-3" />
                  ) : hasExcelExtension(file.type) ? (
                    <GrDocumentExcel className="w-8 h-8 mr-3" />
                  ) : hasPowerPointExtension(file.type) ? (
                    <FaRegFilePowerpoint className="w-8 h-8 mr-3" />
                  ) : (
                    <FaFileAlt className="w-8 h-8 mr-3" />
                  )}

                  <a
                    className="hover:underline text-[16px]"
                    target="_blank"
                    href={file.url}
                  >
                    {file.name}
                  </a>
                </div>
              )
            ) : isValidURL(text) ? (
              text.includes("youtu") ? (
                <ReactPlayer controls url={text} />
              ) : (
                <a
                  className="underline text-[16px]"
                  href={text}
                  target="_blank"
                >
                  {text}
                </a>
              )
            ) : (
              <p className="text-gray-100 text-[16px]">{text}</p>
            )}
          </div>
          <p
            className={` text-[12px] font-extralight ${
              theme.palette.mode === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {getTime(createdAt)}
          </p>
        </div>

        <div className="w-9 h-9 relative rounded-full flex items-center justify-center ml-2">
          <img
            src={
              userProfilePicture && userProfilePicture !== ""
                ? userProfilePicture
                : process.env.REACT_APP_DEFAULT_PROFILE_URL
            }
            alt="My Avatar"
            className="w-8 h-8 rounded-full"
          />
          {isGroupAdmin === true ? (
            <img
              src="/star-badge.svg"
              alt="admin-badge"
              className="absolute text-yellow-500  right-0 -top-1 z-20 w-5 h-5"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------

function Chats({
  communityId,
  userId = "IPP0001",
  userToken,
  currentGroupDetails,
}) {
  // users/fetchuser/:id

  let lastMessageDate = null;

  const fileInputRef = useRef(null);
  const theme = useTheme();

  const [messages, setMessages] = useState([]);

  const [textMessage, setTextMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const [fileToUpload, setFileToUpload] = useState();

  const [filteredMessages, setFilteredMessages] = useState([]);
  // for message filtering
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!(searchTerm.trim() === "")) {
      // Function to filter messages based on the search term
      const myFilteredMessages = messages.messages.filter((message) => {
        if (message.text) {
          return message.text.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (message.file) {
          return message.file.url.includes(searchTerm.toLowerCase());
        }
      });
      setFilteredMessages((prevData) => ({
        ...prevData,
        messages: myFilteredMessages,
      }));
    } else {
      setFilteredMessages(messages);
    }
  }, [searchTerm, messages]);

  const isBlank = (input) => {
    return !input || input.trim().length === 0;
  };

  const getPublicUrlFromSupabase = (path) => {
    const { data, error } = supabase.storage
      .from(process.env.REACT_APP_SHARED_FILES_BUCKET)
      .getPublicUrl(path);
    if (error) {
      console.error("Error fetching public URL:", error);
      return null;
    }
    return data.publicUrl;
  };

  const uploadFileToCloud = async (myFile) => {
    const myFileName = removeSpaces(myFile.name); // removing blank space from name
    const myPath = `sharedFiles/${userId}/${myFileName}`;
    try {
      const uploadParams = {
        Bucket: process.env.REACT_APP_SHARED_FILES_BUCKET,
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

  useEffect(() => {
    socket.emit("joinCommunity", { communityId, userId, userToken });

    socket.on(`existingMessages-${communityId}`, (existingMessages) => {
      setMessages(existingMessages);
    });

    socket.on(`newMessage-${communityId}`, (data) => {
      if (data.communityId === communityId) {
        setMessages((prev) => ({
          ...prev,
          messages: [...prev.messages, data.message],
        }));
      }
    });

    socket.on(`messageDeleted-${communityId}`, (messageId) => {
      setMessages((prev) => ({
        ...prev,
        messages: prev.messages.filter((message) => message._id !== messageId),
      }));
    });

    // Listen for flagging events
    socket.on(`messageFlagged-${communityId}`, (data) => {
      const { messageId, flag } = data;
      toast("Message flagged!");
      setMessages((prevObj) => ({
        ...prevObj,
        messages: prevObj.messages.map((message) =>
          message._id === messageId ? { ...message, flag: flag } : message
        ),
      }));
    });

    // Listen for unflagging events
    socket.on(`messageUnflagged-${communityId}`, (data) => {
      const { messageId, flag } = data;
      toast("Message unflagged!");
      setMessages((prevObj) => ({
        ...prevObj,
        messages: prevObj.messages.map((message) =>
          message._id === messageId ? { ...message, flag: flag } : message
        ),
      }));
    });

    // Listen for 'errorMessage' event
    socket.on(`errorMessage-${communityId}`, (data) => {
      toast.error(data.error);
    });

    return () => {
      socket.off(`existingMessages-${communityId}`);
      socket.off(`newMessage-${communityId}`);
      socket.off(`messageDeleted-${communityId}`);
      socket.off(`messageFlagged-${communityId}`);
      socket.off(`messageUnflagged-${communityId}`);
      socket.off(`errorMessage-${communityId}`);
    };
  }, [communityId]);

  const handleSendMessage = (messageObj, userId, userToken) => {
    socket.emit("sendMessage", {
      communityId,
      message: messageObj,
      userId,
      userToken,
    });
  };

  const handleDeleteMessage = (communityId, messageId, userId, userToken) => {
    socket.emit("deleteMessage", { communityId, messageId, userId, userToken });
  };

  const handleFlagMessage = (
    communityId,
    messageId,
    userId,
    userToken,
    reportData
  ) => {
    socket.emit("flagMessage", {
      communityId,
      messageId,
      userId,
      userToken,
      reportData,
    });
  };

  const handleUnflagMessage = (communityId, messageId, userId, userToken) => {
    socket.emit("unflagMessage", { communityId, messageId, userId, userToken });
  };

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Simulate a click on the hidden input
  };

  const handleFileAdding = async (event) => {
    const file = event.target.files[0];

    // checking for .heic files and converting it into jpeg before adding
    if (file.type === "image/heic") {
      try {
        // Convert .heic file to .png
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
        });

        // Create a new File object from the Blob
        const convertedFile = new File(
          [convertedBlob],
          file.name.replace(/\.heic$/i, ".jpeg"),
          {
            type: "image/jpeg",
          }
        );

        setFileToUpload(convertedFile);
      } catch (error) {
        console.error("Error converting HEIC file:", error);
      }
    } else {
      // if file is not jpeg..adding directly
      setFileToUpload(file);
    }
  };

  const handleFileRemoving = () => {
    setFileToUpload();
  };
// ---------------- 
  const addFile = async (e) => {
    e.preventDefault();

    const fileName = fileToUpload.name;
    const fileExtension = fileName.split(".")[fileName.split(".").length - 1];

    try {
      let cloudFilePath = await uploadFileToCloud(fileToUpload);
      if (cloudFilePath) {
        let publicUrl = getPublicUrlFromSupabase(cloudFilePath);
        if (publicUrl) {
          const msgObj = {
            userId,
            userProfilePicture: "/admin-avatar.jpg", /// try catch
            file: {
              name: fileName,
              url: publicUrl,
              type: fileExtension,
            },
            userName: "Admin",
          };

          handleSendMessage(msgObj, userId, userToken);
      setTextMessage("");
      setFileToUpload();
        }
      }
    } catch (error) {
      console.log(error.message);
      setFileToUpload();
    }
  };

  const addMessage = () => {
    if (!isBlank(textMessage)) {
      const msgObj = {
        text: textMessage,
        userId,
        userProfilePicture: "/admin-avatar.jpg",
        userName: "Admin",
      };
      handleSendMessage(msgObj, userId, userToken);
      setTextMessage("");
    }
  };

  const removeMessage = (messageId) => {
    handleDeleteMessage(communityId, messageId, userId, userToken);
  };

  const flagMessage = (messageId, message, messageBy) => {
    const reportData = {
      groupName: currentGroupDetails.name,
      reportedBy: userId,
      message,
      messageId,
      messageBy,
      groupId : communityId
    };

    handleFlagMessage(communityId, messageId, userId, userToken, reportData);
  };

  const unflagMessage = (messageId) => {
    handleUnflagMessage(communityId, messageId, userId, userToken);
  };

  const onEmojiClick = (emojiObject) => {
    setTextMessage((prevInput) => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  const handleTextMessageChange = (e) => {
    setTextMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      addMessage();
    }
  };

  const isAdmin = (id, myObj) => {
    const customers = myObj.customers;
    const customer = customers.find((customer) => customer._id === id);
    return customer ? customer.admin === "true" : false;
  };

  return (
    <>
      <div className="flex px-4 py-3 mt-2 rounded-md border-[1px] border-gray-200 overflow-hidden max-w-md mx-auto font-[sans-serif]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 192.904 192.904"
          width="16px"
          className="fill-white mr-3 rotate-90"
        >
          <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          placeholder="Search"
          className="w-full outline-none bg-transparent text-gray-100 text-sm"
        />
      </div>
      <ScrollToBottom className="h-screen overflow-y-auto px-4 ">
        {filteredMessages.messages?.length > 0 &&
          filteredMessages.messages?.map((msg, index) => {
            // msg daywise seperator logic
            const currentMessageDate = format(
              new Date(msg.createdAt),
              "yyyy-MM-dd"
            );
            const isNewDay = lastMessageDate !== currentMessageDate;
            lastMessageDate = currentMessageDate;

            const isGroupAdmin = isAdmin(msg.userId, currentGroupDetails);

            return (
              <div key={`msg-${index}`}>

                {isNewDay && (
                  // date wise seperator
                  <div className="text-center my-2">
                    {format(new Date(msg.createdAt), "yyyy-MM-dd") ===
                    format(new Date(), "yyyy-MM-dd")
                      ? "Today"
                      : getDate(msg.createdAt)}
                  </div>
                )}
                {msg.userId === userId ? (
                  msg.file ? (
                    <OutgoingMessage
                      createdAt={msg.createdAt}
                      _id={msg._id}
                      flag={msg.flag}
                      userProfilePicture={msg.userProfilePicture}
                      userId={userId}
                      senderId={msg.userId}
                      file={msg.file}
                      removeMessage={removeMessage}
                      flagMessage={flagMessage}
                      unflagMessage={unflagMessage}
                      isGroupAdmin={isGroupAdmin}
                    />
                  ) : (
                    <OutgoingMessage
                      createdAt={msg.createdAt}
                      flag={msg.flag}
                      _id={msg._id}
                      senderId={msg.userId}
                      userId={userId}
                      userProfilePicture={msg.userProfilePicture}
                      text={msg.text}
                      removeMessage={removeMessage}
                      flagMessage={flagMessage}
                      unflagMessage={unflagMessage}
                      isGroupAdmin={isGroupAdmin}
                    />
                  )
                ) : msg.file ? (
                  <IncomingMessage
                    createdAt={msg.createdAt}
                    userId={userId}
                    flag={msg.flag}
                    senderId={msg.userId}
                    _id={msg._id}
                    userProfilePicture={msg.userProfilePicture}
                    userName={msg.userName}
                    file={msg.file}
                    removeMessage={removeMessage}
                    flagMessage={flagMessage}
                    unflagMessage={unflagMessage}
                    isGroupAdmin={isGroupAdmin}
                  />
                ) : (
                  <IncomingMessage
                    createdAt={msg.createdAt}
                    userId={userId}
                    flag={msg.flag}
                    _id={msg._id}
                    senderId={msg.userId}
                    userProfilePicture={msg.userProfilePicture}
                    userName={msg.userName}
                    text={msg.text}
                    removeMessage={removeMessage}
                    flagMessage={flagMessage}
                    unflagMessage={unflagMessage}
                    isGroupAdmin={isGroupAdmin}
                  />
                )}
              </div>
            );
          })}
      </ScrollToBottom>
      {/* <!-- Chat Input --> */}
      <footer className=" border-t-[1px]  border-gray-300 p-4 w-full">
        {!fileToUpload && (
          <div className="flex items-center">
            <input
              type="text"
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              value={textMessage}
              onChange={handleTextMessageChange}
              className={`w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500 text-gray-600`}
            />

            {/* // button to send files  */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileAdding}
            />
            <button className="ml-3" onClick={handleButtonClick}>
              <TbPaperclip
                className={
                  theme.palette.mode === "dark"
                    ? "h-6 w-6 text-gray-300 hover:scale-110 hover:text-white"
                    : "h-6 w-6 text-gray-700 hover:scale-110 hover:ext-gray-900"
                }
              />
            </button>

            {/* Emoji button/icon */}
            <button
              className="mr-1"
              onClick={() => setShowPicker(!showPicker)} // Toggle picker visibility
            >
              <FaSmile
                className={
                  theme.palette.mode === "dark"
                    ? "text-gray-300 hover:scale-110 hover:text-white"
                    : "text-gray-700 hover:scale-110 hover:ext-gray-900"
                }
                style={{
                  fontSize: "24px",
                  cursor: "pointer",
                  marginLeft: "8px",
                }}
              />
            </button>

            {/* Emoji Picker - it should be absolutely positioned */}
            {showPicker && (
              <div
                style={{
                  position: "absolute",
                  bottom: "50px",
                  right: "0px",
                  zIndex: 1000,
                }}
              >
                <EmojiPicker
                  pickerStyle={{ width: "70%" }}
                  onEmojiClick={onEmojiClick}
                  emojiStyle="native"
                />
              </div>
            )}

            <button
              disabled={textMessage === "" ? true : false}
              className={`bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md ml-2`}
              onClick={(e) => {
                e.preventDefault();
                addMessage();
              }}
            >
              Send
            </button>
          </div>
        )}

        {fileToUpload && (
          <div className="flex flex-row justify-around items-center">
            <div className="flex flex-row items-center">
              <button onClick={handleFileRemoving}>
                <TiDelete className="h-7 w-7 text-red-400 hover:scale-110 hover:text-red-500 mr-4" />
              </button>
              <p
                className={`${
                  theme.palette.mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {fileToUpload.name}
              </p>
            </div>
            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md ml-2"
              onClick={addFile}
            >
              Send
            </button>
          </div>
        )}
      </footer>
    </>
  );
}

export default Chats;
