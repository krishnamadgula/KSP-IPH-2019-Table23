import React, {Fragment} from 'react'
import Layout from '../components/Layout'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Divider from '@material-ui/core/Divider'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import {Link} from 'react-router-dom'

import '../styles/contacts.css'

const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    inline: {
      display: 'inline',
    },
  }));
  


const contacts = [
    {
        name: 'A',
        designation: 'desig1',
        id: 1
    },
    {
        name: 'B',
        designation: 'desig2',
        id: 2
    },
    {
        name: 'C',
        designation: 'desig3',
        id: 3
    }
]

const Contacts = (props)  => {
    const classes = useStyles()
    return (
        <Layout loggedIn>
            <List>
            {
                contacts.map(contact => (
                    <Link to={`/chat/${contact.id}`}>
                    <ListItem alignItems="flex-start">
        <ListItemAvatar>
          <Avatar alt="Remy Sharp" src="https://cdn1.iconfinder.com/data/icons/main-ui-elements-with-colour-bg/512/male_avatar-512.png" />
        </ListItemAvatar>
        <ListItemText
          secondary="Last message"
          primary={
            <Fragment>
              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary"
              >
                {contact.name}
              </Typography>
              <Typography className='card-designation'>{contact.designation}</Typography>
            </Fragment>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
      </Link>
                ))
            }
            </List>
        </Layout>
    )
}

export default Contacts