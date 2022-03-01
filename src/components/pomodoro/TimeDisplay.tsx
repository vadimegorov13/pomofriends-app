import {
  Typography,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Box,
  Modal,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { extraDigit, formatTime } from '../../utils/formatTime';
import SettingsIcon from '@mui/icons-material/Settings';
import { PomodoroSettings } from '../../utils/types';
import SettingsForm from '../settings/PomodoroForm';

const useStyles = makeStyles((theme: any) => ({
  timer: {
    height: 'full',
    verticalAlign: 'middle',
    color: theme.palette.background.default,
    [theme.breakpoints.up('sm')]: {
      fontSize: '6rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '6rem',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '7.2rem',
    },
    [theme.breakpoints.up('lg')]: {
      fontSize: '7.2rem',
    },
  },
  pomodoro: {
    borderRadius: 8,
    margin: 8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '13rem',
    height: '13rem',
    backgroundColor: theme.palette.primary.main,
  },
  shortBreak: {
    borderRadius: 8,
    margin: 8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '13rem',
    height: '13rem',
    backgroundColor: theme.palette.secondary.main,
  },
  longBreak: {
    borderRadius: 8,
    margin: 8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '13rem',
    height: '13rem',
    backgroundColor: theme.palette.secondary.main,
  },
  settingsButton: {
    backgroundColor: theme.palette.secondary.main,
  },
  settingsButtonBreak: {
    backgroundColor: theme.palette.primary.main,
  },
  settingsBox: {
    marginLeft: '1.5rem',
    marginTop: '0.7rem',
    position: 'absolute',
  },
  settingsModal: {
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

interface TimerProps {
  time: number;
  isBreak: boolean;
  isLongBreak: boolean;
  settings: PomodoroSettings;
  resetTimer: () => void;
}

const TimeDisplay: React.FC<TimerProps> = ({
  time,
  isBreak,
  isLongBreak,
  settings,
  resetTimer,
}) => {
  const classes = useStyles();
  const convertedTime = formatTime(time, false);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box className={classes.settingsBox}>
        <Tooltip title="Pomodoro Settings">
          <IconButton
            edge="start"
            aria-label="pomodoro-settings"
            onClick={handleOpen}
          >
            <Avatar
              className={
                !isBreak ? classes.settingsButton : classes.settingsButtonBreak
              }
            >
              <SettingsIcon />
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={classes.settingsModal}>
          <SettingsForm
            handleClose={handleClose}
            settings={settings}
            resetTimer={resetTimer}
          />
        </Box>
      </Modal>

      <Paper
        className={
          !isBreak
            ? classes.pomodoro
            : isLongBreak
            ? classes.longBreak
            : classes.shortBreak
        }
        elevation={3}
      >
        <Typography align="center" className={classes.timer}>
          {extraDigit(convertedTime.minutes)}:
          {extraDigit(convertedTime.seconds)}
        </Typography>
      </Paper>
    </>
  );
};

export default TimeDisplay;
