import React, {useState} from 'react'
import Layout from '../components/Layout'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import {List, ListItem, ListItemAvatar, Avatar, AppBar, Tab, Tabs, Dialog, DialogTitle, DialogContent, Slide} from '@material-ui/core'

import {makeStyles} from '@material-ui/core'
import '../styles/tasks.css'


const contacts = [
    {
        name: 'A',
        designation: 'abc'
    },
    {
        name: 'B',
        designation: 'xyz'
    },
    {
        name: 'C',
        designation: 'ijk'
    }
]

const taskStatus = ['PENDING', 'DOING', 'DONE']

const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
      maxWidth: 360,
    },
    inline: {
      display: 'inline',
    },
    button: {
        display: 'block',
        marginTop: '1rem'
    },
    taskInline: {
        display: 'inline',
      },
    taskRroot: {
        display: 'flex',
        marginTop: 0,
        alignItems: 'center',
        width: '100%',
        paddingBottom: '0.5rem',
      },
      selectRoot: {
          width: '100px',
          marginLeft: 'auto',
          marginTop: '8px'
      },
      avatar: {
        width: '15px',
        height: '15px',
        position: 'absolute',
        bottom: '10px',
        left: '1rem'
      },
      listRoot: {
        border: '1px solid #dfdfdf',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        marginBottom: '0.5rem',
      }
  }));


  let tasks = [
    {
        "id": 3773,
        "title": "Get records",
        "description": "Get the records from SP office",
        "status": "DOING",
        "dueDate": "2019-01-02",
        "assignee": "A",
        "createdBy": "Jay"
      },
      {
        "id": 3774,
        "title": "Get permissions",
        "description": "Get the documents from SP office",
        "status": "PENDING",
        "dueDate": "2019-01-02",
        "assignee": "B",
        "createdBy": "Jay"
      },
      {
        "id": 5,
        "title": "Raid",
        "description": "Get the records from SP office",
        "status": "PENDING",
        "dueDate": "2020-01-02",
        "assignee": "Rohit",
        "createdBy": "A",
        "dependencyId": 3773,
        "verified": false
      }
  ]

const AddTaskForm = ({handleChange, handleFormSubmit, classes, handleEditTask, data}) => {
 return (<form onSubmit={handleEditTask ? (task) => handleEditTask(task) : handleFormSubmit} className='add-task-form'>
      <TextField id={'title'} name='title' label='Title' onChange={handleChange} value={data.title || ''} />
      <TextField
          name='description'
          label="Description"
          margin="normal"
          className={classes.root}
          onChange={handleChange}
          value={data.description || ''}
      />
      <TextField
          className={classes.root}
          select
          label="Assign to"
          margin="normal"
          name='asignee'
          onChange={handleChange}
          value={data.assignee || ''}
      >
          {contacts.map(option => (
                  <MenuItem key={option.name} value={option.name}>
                  {option.name}
                  </MenuItem>
              ))
          }
      </TextField>
      <TextField
          name="dueDate"
          label="Due date"
          type="date"
          onChange={handleChange}
          defaultValue={data.dueDate || '2019-11-17'}
      />
      <TextField
          name="dependencyId"
          label="Blocked on"
          select
          className={classes.root}
          onChange={handleChange}
          defaultValue={data.dependencyId || '2019-11-17'}
      >
        {tasks.filter(({id}) => id !== data.id).map(option => (
            <MenuItem key={option.title} value={option.id}>
              {option.title}
            </MenuItem>
          ))
        }
      </TextField>
      <Button color='primary' variant='contained' type='submit' className={classes.button}>Submit</Button>
  </form>
)}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Tasks = (props) => {
    let [addTask, toggleAddTask] = useState(false)
    let [addTaskData, setAddTaskData] = useState({})
    let [showTaskPopup, setShowTaskPopup] = useState(false)
    let [selectedTask, setSelectedTask] = useState()
    let [tab, setTab] = useState(0)
    let [error, setError] = useState({})

    function handleToggleAddTask () {
        toggleAddTask(!addTask)
    }

    function handleFormSubmit (e) {
        e && e.preventDefault()

        tasks.push({...addTaskData, status: 'PENDING'})
        setAddTaskData({})
        setSelectedTask()
        handleToggleAddTask()
    }

    function handleChange (e) {
        let {name, value} = e.target
        setAddTaskData({...addTaskData, [name]: value})
    }

    function handleTaskSelect (task) {
      setSelectedTask(task)
      setAddTaskData(task)
      setShowTaskPopup(true)
    }

    function handleTabSelecton(_, value) {
      setTab(value)
    }

    function handleEditTask(task) {
      let data = task || addTaskData
      console.log(task)
      if (task.preventDefault) {
        task.preventDefault()
        data = addTaskData
      }
      let {id, dependencyId, status} = data
      if (dependencyId && status === 'DONE') {
        setError({text: `There is a dependent task ${dependencyId} pending`, id: dependencyId})
      } else {
        tasks = tasks.map(t => {
          if(t.id === id) {
            return (data)
          } else {
            if (id === t.dependencyId) {
              t.dependencyId = null
            }
            return t
          }
        })
        setSelectedTask()
        setAddTaskData({})
        setShowTaskPopup(false)
      }
    }

    const classes = useStyles()
    return (
    <Layout loggedIn more='contacts'>
        <Container>
            <div className='task-header'>
            <Typography variant='h5'>Tasks</Typography>
            <Button color='secondary' variant='contained' onClick={handleToggleAddTask}>{addTask ? 'X' : 'Add task'}</Button>
            </div>
            {
                addTask && <AddTaskForm handleChange={handleChange} handleFormSubmit={handleFormSubmit} classes={classes} data={addTaskData} />
            }
            <AppBar position="static" color="default">
              <Tabs
                value={tab}
                onChange={handleTabSelecton}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
              >
                {
                  taskStatus.map(status => <Tab label={status} />)
                }
              </Tabs>
            </AppBar>
            <List>
                {
                    tasks.filter(({status}) => status === taskStatus[tab]).map(task => (
                        <ListItem alignItems="flex-start" onClick={() => handleTaskSelect(task)} className={classes.listRoot}>
                            <ListItemAvatar className={classes.taskRroot}>
                                <Avatar alt="Remy Sharp" src="https://cdn1.iconfinder.com/data/icons/main-ui-elements-with-colour-bg/512/male_avatar-512.png" className={classes.avatar} title={task.assignee} />
                                <Typography variant="h6" component="span" className={classes.taskInline}>
                                    {task.title}
                                </Typography>
                                <TextField
                                    className={classes.selectRoot}
                                    select
                                    margin="normal"
                                    value={task.status}
                                    onClick={e => e.stopPropagation()}
                                    onChange={(e) => handleEditTask({...task, status: e.target.value})}
                                >
                                    {
                                        taskStatus.map(option => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>)
                                        )
                                    }
                                </TextField>
                            </ListItemAvatar>
                        </ListItem>
                    ))
                }
            </List>
            {
              <Dialog
              open={showTaskPopup}
              TransitionComponent={Transition}
              keepMounted
              onClose={() => setShowTaskPopup(false)}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle id="alert-dialog-slide-title">{"Task details"}</DialogTitle>
              <DialogContent>
                <AddTaskForm selectedTask={selectedTask} classes={classes} handleChange={handleChange} handleFormSubmit={handleFormSubmit} handleEditTask={handleEditTask} data={addTaskData} />
              </DialogContent>
              </Dialog>
            }
            {
              <Dialog
              open={error.text}
              TransitionComponent={Transition}
              keepMounted
              onClose={() => setError({})}
              aria-labelledby="alert-dialog-slide-title"
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle id="alert-dialog-slide-title-error">{"Error"}</DialogTitle>
              <DialogContent>
                {error.text}
                <hr />
                {tasks.filter(({id}) => id === error.id).map(task => (
                  <ListItem alignItems="flex-start" onClick={() => handleTaskSelect(task)} className={classes.listRoot}>
                  <ListItemAvatar className={classes.taskRroot}>
                      <Avatar alt="Remy Sharp" src="https://cdn1.iconfinder.com/data/icons/main-ui-elements-with-colour-bg/512/male_avatar-512.png" className={classes.avatar} title={task.assignee} />
                      <Typography variant="h6" component="span" className={classes.taskInline}>
                          {task.title}
                      </Typography>
                  </ListItemAvatar>
              </ListItem>
                )) }
              </DialogContent>
              </Dialog>
            }
        </Container>
    </Layout>
)}

export default Tasks