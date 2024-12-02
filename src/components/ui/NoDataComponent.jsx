import React from 'react';

export default function NoDataComponent({handleCreate}) {
  return (

        <div className="max-w-4xl mx-auto px-10 py-4 bg-white rounded-lg shadow-lg">
          
          <div className="flex flex-col justify-center py-12 items-center">
            <div className="flex justify-center items-center">
              <img className="w-64 h-64" src="https://res.cloudinary.com/daqsjyrgg/image/upload/v1690257804/jjqw2hfv0t6karxdeq1s.svg" alt="image empty states" />
            </div>
            <h1 className="text-gray-700 font-medium text-2xl text-center mb-3">Create a Question Journey!</h1>
           
            <div className="flex flex-col justify-center">
              <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleCreate}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Create Questions
              </button>
              <a href="#" className="underline mt-4 text-sm font-light mx-auto">Learn more</a>
            </div>
          </div>
        </div>

  );
}
