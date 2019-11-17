import React from 'react'
import {Switch, Route} from 'react-router-dom'
import HomePage from '../pages/index'
import Contacts from '../pages/contacts'
import Tasks from '../pages/tasks'
import Chat from '../pages/chat'

const Routes = (props) => (
    <Switch>
        <Route exact path='/'>
            <HomePage {...props} />
        </Route>
        <Route path='/contacts'>
            <Contacts {...props} />
        </Route>
        <Route path='/tasks'>
            <Tasks {...props} />
        </Route>
        <Route path='/chat/:id'>
            <Chat {...props} />
        </Route>
    </Switch>
)

export default Routes