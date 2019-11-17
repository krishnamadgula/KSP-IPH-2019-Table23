import React from 'react'
import Layout from '../components/Layout'
import Container from '@material-ui/core/Container'
import LoginForm from '../components/LoginForm'

import '../styles/index.css'

function HomePage () {
    return (
        <Layout>
        <Container>
            <LoginForm />
        </Container>
    </Layout>
    )
}

export default HomePage