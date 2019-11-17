import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import {makeStyles, IconButton, Menu, MenuItem} from '@material-ui/core'
import MoreIcon from '@material-ui/icons/MoreVert'
import {Link} from 'react-router-dom'

import './style.css'

const useStyles = makeStyles(theme => ({
    inline: {
      display: 'inline',
      paddingInlineStart: '0.5rem'
    },
    root: {
        display: 'flex',
        marginTop: 0,
        alignItems: 'center'
    },
    appRoot: {
        flexDirection: 'row'
    }
  }));


const Layout = ({children, loggedIn, more='tasks'}) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleMenu = event => {
        setAnchorEl(event.currentTarget);
    }

    const classes = useStyles()
    return (
    <div className='container'>
        <AppBar className={classes.appRoot}>
            {
                loggedIn ? <ListItem alignItems="flex-start">
                <ListItemAvatar className={classes.root}>
                  <Avatar alt="Remy Sharp" src="https://cdn1.iconfinder.com/data/icons/main-ui-elements-with-colour-bg/512/male_avatar-512.png" />
                  <Typography variant="h6" component="span" className={classes.inline}>
            Souvik Banerjee
        </Typography>
                </ListItemAvatar></ListItem> : <Typography variant="h6" className='logo-text'>
            UNION
        </Typography>
            }
            <IconButton aria-label="display more actions" edge="end" color="inherit" onClick={handleMenu}>
                <MoreIcon />
            </IconButton>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}><Link to={`/${more}`}>{more}</Link></MenuItem>
              </Menu>
        </AppBar>
        {children}
    </div>
    )
}

export default Layout
