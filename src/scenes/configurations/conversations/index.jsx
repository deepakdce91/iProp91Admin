import React from 'react'
import ChatScreen from '../../../components/ui/ChatScreen'

function Index({userId, userToken}) {

  
  return (
    <div>
        <ChatScreen userId={userId} userToken={userToken}/>
    </div>
  )
}

export default Index