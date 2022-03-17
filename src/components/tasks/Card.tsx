import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
  Modal,
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { TaskData } from '../../utils/types';
import EditForm from './EditForm';

const useStyles = makeStyles((theme: any) => ({
  editButton: {
    color: theme.palette.primary.main,
    marginLeft: '1rem',
  },
  completeButton: {
    color: theme.palette.primary.main,
  },
  notCompleteButton: {
    color: 'gray',
  },
  pomodoroCount: {
    '&.Mui-disabled': {
      color: theme.palette.secondary.main,
    },
  },
  listItem: {
    '&:hover': {
      backgroundColor: 'rgba(187, 134, 252, 0.08)',
    },
  },
  editTaskModal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    border: '2px solid #000',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    borderColor: theme.palette.primary.main,
  },
}));

interface TaskCardProps {
  task: TaskData;
  current: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, current }) => {
  const classes = useStyles();
  const taskId = task.id;

  const { setCurrentTask, completeTask, uncompleteTask } = useTasks();

  const [openEdit, setOpenEdit] = useState(false);
  const handleOpenEdit = () => setOpenEdit(true);
  const handleCloseEdit = () => setOpenEdit(false);

  const handleSetCurrentTask = async () => await setCurrentTask(taskId);
  const handleCompleteTask = async () => {
    if (task.complete !== true) {
      await completeTask(taskId);
    } else {
      await uncompleteTask(taskId);
    }
  };

  return (
    <>
      <ListItem
        secondaryAction={
          <>
            <IconButton
              edge="end"
              className={classes.pomodoroCount}
              disabled={true}
            >
              <Typography>
                {task.pomodorosDone} / {task.pomodorosTotal}
              </Typography>
            </IconButton>
            <Tooltip title="Edit">
              <IconButton
                edge="end"
                aria-label="edit-task"
                onClick={handleOpenEdit}
                className={classes.editButton}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </>
        }
        onClick={handleSetCurrentTask}
        selected={current}
        className={classes.listItem}
      >
        <Tooltip title="Complete?">
          <IconButton
            edge="start"
            aria-label="complete-task"
            onClick={handleCompleteTask}
            className={
              task.complete === true
                ? classes.completeButton
                : classes.notCompleteButton
            }
          >
            <CheckCircleIcon />
          </IconButton>
        </Tooltip>
        <ListItemText primary={task.title} secondary={task.description} />
      </ListItem>
      <Modal
        open={openEdit}
        onClose={handleCloseEdit}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={classes.editTaskModal}>
          <EditForm handleClose={handleCloseEdit} task={task} />
        </Box>
      </Modal>
      <Divider />
    </>
  );
};

export default TaskCard;