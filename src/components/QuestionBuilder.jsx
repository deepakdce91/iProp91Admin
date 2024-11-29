import React, { useState, useEffect, useRef } from "react";

const QuestionBuilder = () => {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState({});
  const [inputValue, setInputValue] = useState("");

  const inputRef = useRef(null); // Ref for the input field

  // Open modal
  const openModal = (type, data = {}) => {
    setModalType(type);
    setModalData(data);
    setInputValue("");
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Focus on the input field when modal opens
  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  // Handle addition based on modal type
  const handleAdd = () => {
    if (modalType === "root") {
      addRootQuestion();
    } else if (modalType === "option") {
      addOption(modalData.parentId);
    } else if (modalType === "sub-question") {
      addSubQuestion(modalData.optionId);
    }
    closeModal();
  };

  // Add a root question
  const addRootQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      questionText: inputValue,
      options: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  // Add an option to a specific question or sub-question
  const addOption = (parentId) => {
    const updatedQuestions = updateNestedStructure(questions, parentId, (item) => ({
      ...item,
      options: [
        ...item.options,
        { id: Date.now(), text: inputValue, subQuestions: [] },
      ],
    }));
    setQuestions(updatedQuestions);
  };

  // Add a sub-question to a specific option
  const addSubQuestion = (optionId) => {
    const updatedQuestions = updateNestedStructure(questions, optionId, (option) => ({
      ...option,
      subQuestions: [
        ...option.subQuestions,
        { id: Date.now(), questionText: inputValue, options: [] },
      ],
    }));
    setQuestions(updatedQuestions);
  };

  // Recursive helper to update nested data structure
  const updateNestedStructure = (items, id, callback) => {
    return items.map((item) => {
      if (item.id === id) {
        return callback(item);
      }
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
  };

  // Recursive helper to delete an item from nested structure
  const deleteNestedStructure = (items, id) => {
    return items
      .map((item) => {
        if (item.id === id) {
          return null; // Remove the item
        }
        if (item.options?.length > 0) {
          return {
            ...item,
            options: deleteNestedStructure(item.options, id),
          };
        }
        if (item.subQuestions?.length > 0) {
          return {
            ...item,
            subQuestions: deleteNestedStructure(item.subQuestions, id),
          };
        }
        return item;
      })
      .filter(Boolean); // Remove any null values
  };

  // Delete an item by ID
  const deleteItem = (id) => {
    const updatedQuestions = deleteNestedStructure(questions, id);
    setQuestions(updatedQuestions);
  };

  // Handle Enter key press to add data
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  // Recursive render function for options
  const renderOptions = (options) => {
    return options.map((opt) => (
      <div key={opt.id} style={{ marginLeft: 20 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <button
            className="bg-red-500 text-white rounded-lg  px-2 py-1 mr-2"
            style={{ marginLeft: 10 }}
            onClick={() => deleteItem(opt.id)}
          >
            Delete
          </button>
          <span>{opt.text}</span>
          {opt.subQuestions && (
            <button
              className="bg-white rounded-lg text-gray-700 px-2 py-1"
              style={{ marginLeft: 10 }}
              onClick={() => openModal("sub-question", { optionId: opt.id })}
            >
              Add Sub-Question
            </button>
          )}
          {opt.options && (
            <button
              className="bg-white rounded-lg text-gray-700  px-2 py-1"
              style={{ marginLeft: 10 }}
              onClick={() => openModal("option", { parentId: opt.id })}
            >
              Add Option
            </button>
          )}
        </div>
        {/* Render nested sub-questions */}
        {opt.subQuestions.length > 0 && (
          <div style={{ marginLeft: 20 }}>{renderQuestions(opt.subQuestions)}</div>
        )}
        {/* Render nested options */}
        {opt.options?.length > 0 && <div style={{ marginLeft: 20 }}>{renderOptions(opt.options)}</div>}
      </div>
    ));
  };

  // Recursive render function for questions
  const renderQuestions = (items) => {
    return items.map((q) => (
      <div key={q.id} style={{ marginLeft: 20 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <button
            className="bg-red-500 text-white rounded-lg  px-2 py-1 mr-2"
            style={{ marginLeft: 10 }}
            onClick={() => deleteItem(q.id)}
          >
            Delete
          </button>
          <span>{q.questionText}</span>
          <button
            className="bg-white rounded-lg text-gray-700  px-2 py-1"
            style={{ marginLeft: 10 }}
            onClick={() => openModal("option", { parentId: q.id })}
          >
            Add Option
          </button>
        </div>
        {/* Render options */}
        {q.options?.length > 0 && <div style={{ marginLeft: 20 }}>{renderOptions(q.options)}</div>}
      </div>
    ));
  };

  return (
    <div style={{ padding: "20px" }}>
      <div className="flex justify-between">
        <h1 className="text-4xl font-semibold">Question Builder</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
          onClick={() => openModal("root")}
        >
          Add Root Question
        </button>
      </div>
      <div className="mt-8">{renderQuestions(questions)}</div>

      {/* JSON Preview */}
      {questions.length > 0 &&  <pre>{JSON.stringify(questions, null, 2)}</pre>}

      {questions.length === 0 && <div className="w-full h-[60vh]"> Nothing to show here, go ahead and add root questions.</div>}

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="relative"
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "5px",
              width: "300px",
            }}
          >
            <button
              className="text-black bg-white text-[12px]"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
              }}
              onClick={closeModal}
            >
              Close
            </button>
            <h3>
              Add {modalType === "root" ? "Root Question" : modalType === "option" ? "Option" : "Sub-Question"}
            </h3>
           <div className="flex flex-col mt-5">
           <input
              ref={inputRef} // Set focus to this input field
              type="text"
              className="border border-1 text-gray-700 border-gray-600 py-1 px-3 rounded-sm "
              placeholder="Enter text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress} // Handle Enter key press
            />
            <button
              className="bg-green-500 text-white rounded-lg px-3 py-1 mt-4"
              onClick={handleAdd}
            >
              Add
            </button>
           </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBuilder;
