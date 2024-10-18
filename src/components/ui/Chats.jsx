import React, { useRef,useEffect, useState } from "react";
import { useTheme } from "@mui/material";

import io from 'socket.io-client';

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
import { TbMessageReportFilled } from "react-icons/tb";
import { MdDelete } from "react-icons/md";

import { TbPaperclip } from "react-icons/tb";
import { FaRegFilePdf } from "react-icons/fa";
import { GrDocumentWord } from "react-icons/gr";
import { GrDocumentExcel } from "react-icons/gr";
import { FaRegFilePowerpoint } from "react-icons/fa";

const socket = io(process.env.REACT_APP_BACKEND_URL, {transportOptions : ["websocket"]}); 

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

const txtMessages = {
  communityId: "670c2ec525a1a478846a540c",

  messages: [
    {
      _id: "hjbdcjksdvsvsd",
      text: "Hello, how's everyone doing?",
      userId: "user_123",
      userName: "John Doe",
      userProfilePicture:
        "https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_1280.png",
      flag: "false",
      createdAt: "2024-10-14T10:00:00.000Z",
      updatedAt: "2024-10-14T10:05:00.000Z",
    },
    {
      _id: "hjbdcrrggvsvsd",
      userId: "IPA003",
      userProfilePicture:
        "https://cdn.vectorstock.com/i/500p/17/61/male-avatar-profile-picture-vector-10211761.jpg",

      userName: "Jane Smith",
      flag: "true",
      file: {
        name: "a photo",
        type: "jpg",
        url: "https://cdn.vectorstock.com/i/500p/17/61/male-avatar-profile-picture-vector-10211761.jpg",
      },
      createdAt: "2024-10-14T10:06:00.000Z",
      updatedAt: "2024-10-14T10:07:00.000Z",
    },
    {
      _id: "hjbdcrrggvsvsd",
      userId: "IPA003",
      userProfilePicture:
        "https://cdn.vectorstock.com/i/500p/17/61/male-avatar-profile-picture-vector-10211761.jpg",

      userName: "Jane Smith",
      flag: "true",
      file: {
        name: "rich dad poor dad hindi",
        type: "pdf",
        url: "https://shipmin.gov.in/sites/default/files/instapdf.in-rich-dad-poor-dad-hindi-696.pdf",
      },
      createdAt: "2024-10-14T10:06:00.000Z",
      updatedAt: "2024-10-14T10:07:00.000Z",
    },

    {
      _id: "hjbdcrrggvsvsd",
      userId: "IPA003",
      userProfilePicture:
        "https://cdn.vectorstock.com/i/500p/17/61/male-avatar-profile-picture-vector-10211761.jpg",

      userName: "Jane Smith",
      flag: "true",
      file: {
        type: "mp4",
        name: "rera video",
        url: "https://mwsiclqblrbxyioropji.supabase.co/storage/v1/s3/iprop-property-documents/documentsSafe/IPS00001/reraApproval/rera-approval.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=afa1381155fff83976f566402755138a%2F20241015%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20241015T185537Z&X-Amz-Expires=3600&X-Amz-Signature=084138501681c20de9f0ef533bf08fc3a9d288fcac284dad861be153e5cb7428&X-Amz-SignedHeaders=host&response-content-disposition=inline&x-id=GetObject",
      },
      createdAt: "2024-10-14T10:06:00.000Z",
      updatedAt: "2024-10-14T10:07:00.000Z",
    },
    {
      _id: "jbdcwwwwdvsvsd",
      text: "The progress is just great!",
      userId: "IPA003",
      userProfilePicture:
        "https://cdn.vectorstock.com/i/500p/17/61/male-avatar-profile-picture-vector-10211761.jpg",
      userName: "Jane Smith",
      flag: "true",
      createdAt: "2024-10-14T10:06:00.000Z",
      updatedAt: "2024-10-14T10:07:00.000Z",
    },
    {
      _id: "jbdcwwwdawdvsvsd",
      text: "https://youtu.be/PT2_F-1esPk?si=Pn-7Y_YzyM1Mwafn",
      userId: "IPA003",
      userProfilePicture:
        "https://cdn.vectorstock.com/i/500p/17/61/male-avatar-profile-picture-vector-10211761.jpg",
      userName: "Jane Smith",
      flag: "true",
      createdAt: "2024-10-14T10:06:00.000Z",
      updatedAt: "2024-10-14T10:07:00.000Z",
    },
  ],
  createdAt: "2024-10-14T09:55:00.000Z",
  updatedAt: "2024-10-14T10:07:00.000Z",
};

function IncomingMessage({
  isGroupAdmin,
  userId,
  _id,
  userProfilePicture,
  userName,
  text,
  file,
  removeMessage,
}) {
  const theme = useTheme();

  return (
    <div className="flex flex-col my-4 cursor-pointer group">
      <p className="ml-12 mb-1">{userName}</p>
      <div className="flex">
        <div className="w-9 h-9 rounded-full flex items-center justify-center mr-2">
          <img
            src={
              userProfilePicture && userProfilePicture !== ""
                ? userProfilePicture
                : "/default-profile-pic.jpg"
            }
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
        </div>
        <div
          className={`relative flex max-w-96 items-center ${
            theme.palette.mode === "dark" ? "bg-gray-100 text-gray-700" : "bg-gray-200 text-gray-700"
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

                <a className="hover:underline" target="_blank" href={file.url}>
                  {file.name}
                </a>
              </div>
            )
          ) : isValidURL(text) ? (
            text.includes("youtu") ? (
              <ReactPlayer  controls url={text} />
            ) : (
              <a className="underline" href={text} target="_blank">
                {text}
              </a>
            )
          ) : (
            <p className="text-gray-700">{text}</p>
          )}

          <div className={`absolute -right-[68px] flex`}>
            <button
              onClick={() => {
                console.log("flag pressed", _id);
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

            <button
              onClick={() => {
                removeMessage(_id);
                console.log("delete pressed", _id);
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
      </div>
    </div>
  );
}

function OutgoingMessage({
  isGroupAdmin,
  _id,
  userProfilePicture,
  text,
  file,
  userId,
  removeMessage,
  createdAt
}) {
  const theme = useTheme();

  return (
    <div className="flex flex-col  mb-4 cursor-pointer group items-end">
      <p className="mr-12 mb-1">
        {userId.includes("IPA") === true ? "Admin" : "You"}
      </p>
      <div className="flex justify-end">
        <p>{createdAt}</p>
        <div className="flex relative items-center max-w-96 bg-indigo-500 text-white rounded-lg p-3 gap-3">
          <div className="absolute -left-[68px] flex flex-row-reverse">
            <button
              onClick={() => {
                console.log("flag pressed", _id);
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

            <button
              onClick={() => {
                console.log("delete pressed", _id);
                removeMessage(_id);
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

                <a className="hover:underline" target="_blank" href={file.url}>
                  {file.name}
                </a>
              </div>
            )
          ) : isValidURL(text) ? (
            text.includes("youtu") ? (
              <ReactPlayer  controls url={text} />
            ) : (
              <a className="underline" href={text} target="_blank">
                {text}
              </a>
            )
          ) : (
            <p className="text-gray-100">{text}</p>
          )}
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center ml-2">
          <img
            src={
              userProfilePicture && userProfilePicture !== ""
                ? userProfilePicture
                : process.env.REACT_APP_DEFAULT_PROFILE_URL
            }
            alt="My Avatar"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------

function Chats({ communityId, userId = "IPP0001", userToken ,isGroupAdmin }) {
  // users/fetchuser/:id

  const fileInputRef = useRef(null);
  const theme = useTheme();

  const [messages, setMessages] = useState({});

  const [textMessage, setTextMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const [fileToUpload, setFileToUpload] = useState();

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
    console.log("isadmin - ", isGroupAdmin);
    socket.emit('joinCommunity', communityId);

    socket.on('existingMessages', (existingMessages) => {
      setMessages(existingMessages);
    });

    socket.on('newMessage', (data) => {

        if(data.communityId === communityId){
            setMessages((prev) => ({
                ...prev,
                messages: [...prev.messages, data.message],
              }));
        }
    
        

    });

    socket.on('messageDeleted', (messageId) => {
        setMessages((prev) => ({
            ...prev,
            messages: prev.messages.filter(message => message._id !== messageId),
          }));


    });

    return () => {
      socket.off('existingMessages');
      socket.off('newMessage');
      socket.off('messageDeleted');
    };
  }, [communityId]);

  const handleSendMessage = (messageObj) => {
      socket.emit('sendMessage', { communityId, message: messageObj });
  };

  const handleDeleteMessage = (communityId, messageId) => {
    socket.emit('deleteMessage', {communityId, messageId});
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
            _id: `id`,
            userId,
            userProfilePicture: "/admin-avatar.jpg", /// try catch
            file: {
              name: fileName,
              url: publicUrl,
              type: fileExtension,
            },
            userName: "Admin",
          };

          handleSendMessage(msgObj);

          setFileToUpload();
        }
      }
    } catch (error) {
      console.log(error.message);
      setFileToUpload();
    }
  };

  const addMessage = () => {
    const msgObj = {
      _id: `${textMessage}-id`,
      text: textMessage,
      userId,
      userProfilePicture: "/admin-avatar.jpg",
      userName: "Admin",
    };

    handleSendMessage(msgObj);

    setTextMessage("");
  };

  const removeMessage = (messageId) => {
    handleDeleteMessage(communityId, messageId);
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


  return (
    <>
      <ScrollToBottom className="h-screen overflow-y-auto px-4 ">
        {messages &&
          messages.messages?.map((msg, index) => {
            return (
              <div key={`msg-${index}`}>
                {msg.userId === userId ? (
                  msg.file ? (
                    <OutgoingMessage
                    createdAt = {msg.createdAt}
                    isGroupAdmin={isGroupAdmin}
                      _id={msg._id}
                      userProfilePicture={msg.userProfilePicture}
                      userId={userId}
                      file={msg.file}
                      removeMessage={removeMessage}
                    />
                  ) : (
                    <OutgoingMessage
                    createdAt = {msg.createdAt}
                    isGroupAdmin={isGroupAdmin}
                      _id={msg._id}
                      userId={userId}
                      userProfilePicture={msg.userProfilePicture}
                      text={msg.text}
                      removeMessage={removeMessage}
                    />
                  )
                ) : msg.file ? (
                  <IncomingMessage
                  createdAt = {msg.createdAt}
                  userId={userId}
                  isGroupAdmin={isGroupAdmin}
                    _id={msg._id}
                    userProfilePicture={msg.userProfilePicture}
                    userName={msg.userName}
                    file={msg.file}
                    removeMessage={removeMessage}
                  />
                ) : (
                  <IncomingMessage
                  createdAt = {msg.createdAt}
                  userId={userId}
                  isGroupAdmin={isGroupAdmin}
                    _id={msg._id}
                    userProfilePicture={msg.userProfilePicture}
                    userName={msg.userName}
                    text={msg.text}
                    removeMessage={removeMessage}
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
              <TbPaperclip className={theme.palette.mode === "dark" ? "h-6 w-6 text-gray-300 hover:scale-110 hover:text-white" : "h-6 w-6 text-gray-700 hover:scale-110 hover:ext-gray-900"}/>
            </button>

            {/* Emoji button/icon */}
            <button
              className="mr-1"
              onClick={() => setShowPicker(!showPicker)} // Toggle picker visibility
            >
              <FaSmile
                className={theme.palette.mode === "dark" ? "text-gray-300 hover:scale-110 hover:text-white" : "text-gray-700 hover:scale-110 hover:ext-gray-900"}
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
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md ml-2"
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
              <p className={`${theme.palette.mode === "dark" ? "text-white" : "text-gray-900"}`}>{fileToUpload.name}</p>
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
