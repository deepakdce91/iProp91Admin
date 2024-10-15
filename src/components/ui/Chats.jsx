import React, { useState } from "react";
import { useTheme } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import ScrollToBottom from "react-scroll-to-bottom";
import EmojiPicker from "emoji-picker-react";

import { Image } from "primereact/image";

import { FaSmile } from "react-icons/fa";
import { FaFileAlt } from "react-icons/fa";

import { GrFlagFill, GrFlag } from "react-icons/gr";
import { TbMessageReportFilled } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import { TbPaperclip } from "react-icons/tb";

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

function IncomingMessage({
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
                : process.env.REACT_APP_DEFAULT_PROFILE_URL
            }
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
        </div>
        <div
          className={`relative flex max-w-96 items-center ${
            theme.palette.mode === "dark" ? "bg-gray-100" : "bg-gray-200"
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
                <FaFileAlt className="w-8 h-8 mr-3" />
                <a
                  className="hover:underline text-gray-700"
                  target="_blank"
                  href={file.url}
                >
                  {file.url}
                </a>
              </div>
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
  _id,
  userProfilePicture,
  text,
  file,
  userId,
  removeMessage,
}) {
  const theme = useTheme();

  return (
    <div className="flex flex-col  mb-4 cursor-pointer group items-end">
      <p className="mr-12 mb-1">{userId.includes("IPA") === true ? "Admin" : "You"}</p>
      <div className="flex justify-end">
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
                <FaFileAlt className="w-8 h-8 mr-3" />
                <a className="hover:underline" target="_blank" href={file.url}>
                  {file.url}
                </a>
              </div>
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

function Chats({ communityId, userId, userToken }) {
  // users/fetchuser/:id
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
          url: "https://mwsiclqblrbxyioropji.supabase.co/storage/v1/s3/iprop-property-documents/documentsSafe/IPS00001/reraApproval/rera-approval.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=afa1381155fff83976f566402755138a%2F20241015%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20241015T055726Z&X-Amz-Expires=3600&X-Amz-Signature=a132aad31ea9257b00d37114826b0fc3abd4d7ae5f211bd28e16d93831832658&X-Amz-SignedHeaders=host&response-content-disposition=inline&x-id=GetObject",
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
    ],
    createdAt: "2024-10-14T09:55:00.000Z",
    updatedAt: "2024-10-14T10:07:00.000Z",
  };

  const theme = useTheme();

  const [messages, setMessages] = useState(txtMessages);

  const [textMessage, setTextMessage] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const addFile = ()=>{
    
  }

  const addMessage = () => {
    const msgObj = {
      _id: `${textMessage}-id`,
      text: textMessage,
      userId,
      userProfilePicture:
        "/admin-avatar.jpg",
      userName: "Admin",
    };

    setMessages((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, msgObj],
      updatedAt: new Date().toISOString(),
    }));

    setTextMessage("");
  };

  const removeMessage = (messageId) => {
    // console.log(messages)
    setMessages((prevState) => ({
      ...prevState,
      messages: prevState.messages.filter(
        (message) => message._id !== messageId
      ),
      updatedAt: new Date().toISOString(),
    }));
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

  const fetchLoggedInUserDetails = () => {};
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
                      _id={msg._id}
                      userProfilePicture={msg.userProfilePicture}
                      userId={userId}
                      file={msg.file}
                      removeMessage={removeMessage}
                    />
                  ) : (
                    <OutgoingMessage
                      _id={msg._id}
                      userId={userId}
                      userProfilePicture={msg.userProfilePicture}
                      text={msg.text}
                      removeMessage={removeMessage}
                    />
                  )
                ) : msg.file ? (
                  <IncomingMessage
                    _id={msg._id}
                    userProfilePicture={msg.userProfilePicture}
                    userName={msg.userName}
                    file={msg.file}
                    removeMessage={removeMessage}
                  />
                ) : (
                  <IncomingMessage
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
          <button
            className="ml-3"
            onClick={() => {
              console.log("select file ");
            }}
          >
            <TbPaperclip className="h-6 w-6 text-gray-300 hover:scale-110 hover:text-white" />
          </button>

          {/* Emoji button/icon */}
          <button
            className="mr-1"
            onClick={() => setShowPicker(!showPicker)} // Toggle picker visibility
          >
            <FaSmile
              className="text-gray-300 hover:scale-110 hover:text-white"
              style={{ fontSize: "24px", cursor: "pointer", marginLeft: "8px" }}
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
            className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2"
            onClick={(e) => {
              e.preventDefault();
              console.log("add message");
              addMessage();
            }}
          >
            Send
          </button>
        </div>
      </footer>
    </>
  );
}

export default Chats;
