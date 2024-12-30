import React from "react";
import SafeCard from "./cards/SafeCard";

function ViewSafes({userToken, userId, data }) {
  return (
    <div>
      <div className="m-6">
        <div className="flex flex-wrap -mx-6">
          {data.length > 0 &&
            data.map((safe, index) => {
              return <SafeCard userId={userId} userToken={userToken}  key={index} safe={safe} />;
            })}
        </div>
      </div>
    </div>
  );
}

export default ViewSafes;
