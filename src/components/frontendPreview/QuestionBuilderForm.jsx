import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { RiDeleteBinFill } from "react-icons/ri";

const QuestionBuilder = ({
  dataArray,
  setModeToDisplay,
  userId,
  userToken,
  questionId
}) => {
  const [questions, setQuestions] = useState(dataArray);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [redirectionLink, setRedirectionLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const inputRef = useRef(null);

  const openModal = (type, data = {}) => {
    setModalType(type);
    setModalData(data);
    setInputValue("");
    setRedirectionLink("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  useEffect(() => {
    if (showModal && inputRef.current) inputRef.current.focus();
  }, [showModal]);

  const handleSubmit = () => {
    if (questions.length > 0) {
      setIsUploading(true);
      const endpoint = dataArray.length > 0 
        ? `${process.env.REACT_APP_BACKEND_URL}/api/questions/updateQuestion/${questionId}?userId=${userId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/questions/addQuestion?userId=${userId}`;
      
      const method = dataArray.length > 0 ? 'put' : 'post';

      axios({
        method,
        url: endpoint,
        data: { data: questions },
        headers: { "auth-token": userToken }
      })
        .then(response => {
          if (response) {
            toast.success(dataArray.length > 0 ? "Questions updated!" : "Questions Added!");
            setIsUploading(false);
            setTimeout(() => setModeToDisplay(), 2000);
          }
        })
        .catch(error => {
          setIsUploading(false);
          console.error("Error:", error);
          toast.error("Some ERROR occurred.");
        });
    } else {
      toast.error("Add questions first.");
    }
  };

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    
    const payload = {
      id: Date.now(),
      text: inputValue,
      redirectionLink: redirectionLink.trim() || null
    };

    if (modalType === "root") {
      payload.questionText = inputValue;
      payload.options = [];
      delete payload.text;
      setQuestions([...questions, payload]);
    } else if (modalType === "option") {
      const updatedQuestions = updateNestedStructure(
        questions,
        modalData.parentId,
        (item) => ({
          ...item,
          options: [...item.options, { ...payload, subQuestions: [] }]
        })
      );
      setQuestions(updatedQuestions);
    } else if (modalType === "sub-question") {
      payload.questionText = inputValue;
      payload.options = [];
      delete payload.text;
      const updatedQuestions = updateNestedStructure(
        questions,
        modalData.optionId,
        (option) => ({
          ...option,
          subQuestions: [...option.subQuestions, payload]
        })
      );
      setQuestions(updatedQuestions);
    }
    closeModal();
  };

  const updateNestedStructure = (items, id, callback) =>
    items.map((item) => {
      if (item.id === id) return callback(item);
      if (item.options?.length > 0) {
        return {
          ...item,
          options: updateNestedStructure(item.options, id, callback),
        };
      }
      if (item.subQuestions?.length > 0) {
        return {
          ...item,
          subQuestions: updateNestedStructure(item.subQuestions, id, callback),
        };
      }
      return item;
    });

  const deleteNestedStructure = (items, id) =>
    items
      .map((item) => {
        if (item.id === id) return null;
        if (item.options?.length > 0)
          return { ...item, options: deleteNestedStructure(item.options, id) };
        if (item.subQuestions?.length > 0)
          return {
            ...item,
            subQuestions: deleteNestedStructure(item.subQuestions, id),
          };
        return item;
      })
      .filter(Boolean);

  const deleteItem = (id) => {
    const updatedQuestions = deleteNestedStructure(questions, id);
    setQuestions(updatedQuestions);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  const renderOptions = (options) =>
    options.map((opt) => (
      <div className="relative ml-8 pl-4 border-l border-gray-300" key={opt.id}>
        <div className="flex items-center mb-4">
          <button
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2 py-1 mr-2"
            onClick={() => deleteItem(opt.id)}
          >
            <RiDeleteBinFill className="h-4 w-4"/>
          </button>
          <span>{opt.text}</span>
          {opt.redirectionLink && (
            <span className="ml-2 text-blue-600">→ {opt.redirectionLink}</span>
          )}
          {/* Only show Add Sub-Question button if there's no redirectionLink */}
          {opt.subQuestions && !opt.redirectionLink && (
            <button
              className="bg-white hover:bg-gray-200 rounded-lg text-gray-700 px-2 py-1 ml-2"
              onClick={() => openModal("sub-question", { optionId: opt.id })}
            >
              Add Sub-Question
            </button>
          )}
          {opt.options && (
            <button
              className="bg-white hover:bg-gray-200 rounded-lg text-gray-700 px-2 py-1 ml-2"
              onClick={() => openModal("option", { parentId: opt.id })}
            >
              Add Option
            </button>
          )}
        </div>
        {opt.subQuestions?.length > 0 && <div>{renderQuestions(opt.subQuestions)}</div>}
        {opt.options?.length > 0 && <div>{renderOptions(opt.options)}</div>}
      </div>
    ));

  const renderQuestions = (items) =>
    items.map((q) => (
      <div key={`${new Date()}`} className="relative ml-8 pl-4 border-l border-gray-300">
        <div className="flex items-center mb-4">
          <button
            className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-2 py-1 mr-2"
            onClick={() => deleteItem(q.id)}
          >
            <RiDeleteBinFill className="h-4 w-4"/>
          </button>
          <span>{q.questionText}</span>
          <button
            className="bg-white hover:bg-gray-200 rounded-lg text-gray-700 px-2 py-1 ml-2"
            onClick={() => openModal("option", { parentId: q.id })}
          >
            Add Option
          </button>
        </div>
        {q.options?.length > 0 && <div>{renderOptions(q.options)}</div>}
      </div>
    ));

  return (
    <div>
      {questions && questions.length === 0 && (
        <div className="flex justify-start items-center">
          <p className="text-lg mr-4">No questions yet!</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            onClick={() => openModal("root")}
          >
            Add Root Question
          </button>
        </div>
      )}

      <div>
        {questions && questions.length > 0 && (
          <>
            {renderQuestions(questions)}
            <button
              className="bg-green-500 mt-8 text-[15px] hover:bg-green-600 text-white rounded-sm px-4 py-1 ml-6"
              onClick={handleSubmit}
              disabled={isUploading}
            >
              Save question
            </button>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white relative rounded-lg p-6 w-96">
            <button
              className="absolute top-2 right-3 hover:text-gray-500 text-gray-700"
              onClick={closeModal}
            >
              Close
            </button>
            <h3 className="mb-4 text-gray-800 text-xl">
              Add {modalType === "root" ? "Root Question" : modalType === "option" ? "Option" : "Sub-Question"}
            </h3>
            <input
              ref={inputRef}
              type="text"
              className="w-full border text-gray-700 border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Enter text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {modalType !== "sub-question" && <input
              type="text"
              className="w-full border text-gray-700 border-gray-300 rounded px-3 py-2 mb-4"
              placeholder="Redirection Link (optional)"
              value={redirectionLink}
              onChange={(e) => setRedirectionLink(e.target.value)}
            />}
            <button
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBuilder; 