import React from 'react'
import Layout from '../components/Layout'
import ChatBox from '../components/Chat'

const Chat = () => (
    <Layout loggedIn more='tasks'>
        <ChatBox />
    </Layout>
)

export default Chat