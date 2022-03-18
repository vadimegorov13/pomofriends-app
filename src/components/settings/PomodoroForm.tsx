import React, { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { useSettings } from '../../hooks/useSettings';
import {
  ErrorMessage,
  PomodoroSettings,
  PomodoroSettingsForm as Form,
} from '../../utils/types';
import {
  Container,
  Grid,
  Alert,
  Typography,
  Switch,
  Input,
} from '@mui/material';
import SubmitButton from '../buttons/SubmitButton';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: any) => ({
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  input: {
    minHeight: '3.2rem',
    height: '3.2rem',
  },
}));

interface PomodoroSettingsFormProps {
  handleClose: () => void;
  settings: PomodoroSettings;
  resetTimer: () => void;
}

const PomodoroSettingsForm: React.FC<PomodoroSettingsFormProps> = ({
  handleClose,
  settings,
  resetTimer,
}) => {
  const classes = useStyles();

  const { updateSettings } = useSettings();

  const { handleSubmit, control } = useForm<Form>();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorMessage | null>(null);

  const onSubmit: SubmitHandler<Form> = (data: Form) => {
    handleClose();
    setIsLoading(true);
    setError(null);
    return updateSettings({
      pomodoro: data.pomodoro * 60,
      shortBreak: data.shortBreak * 60,
      longBreak: data.longBreak * 60,
      autoStartPomodoro: data.autoStartPomodoro,
      autoStartBreak: data.autoStartBreak,
      longBreakInterval: data.longBreakInterval,
      notificationsOn: data.notificationsOn,
    });
  };

  return (
    <Container maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
        <Grid container spacing={2}>
          {error?.message && (
            <Grid item xs={12}>
              <Alert severity="error" variant="filled">
                {error.message}
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <Controller
              name="pomodoro"
              control={control}
              defaultValue={settings.pomodoro / 60}
              render={({ field: { onChange, value } }) => (
                <Grid container spacing={2} className={classes.input}>
                  <Grid item xs={6}>
                    <Typography>Pomodoro</Typography>
                  </Grid>
                  <Grid item xs={6} container justifyContent="flex-end">
                    <Input
                      value={value}
                      size="small"
                      onChange={onChange}
                      inputProps={{
                        step: 1,
                        min: 1,
                        max: 59,
                        type: 'number',
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="shortBreak"
              control={control}
              defaultValue={settings.shortBreak / 60}
              render={({ field: { onChange, value } }) => (
                <Grid container spacing={2} className={classes.input}>
                  <Grid item xs={6}>
                    <Typography>Short Break</Typography>
                  </Grid>
                  <Grid item xs={6} container justifyContent="flex-end">
                    <Input
                      value={value}
                      size="small"
                      onChange={onChange}
                      inputProps={{
                        step: 1,
                        min: 1,
                        max: 59,
                        type: 'number',
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="longBreak"
              control={control}
              defaultValue={settings.longBreak / 60}
              render={({ field: { onChange, value } }) => (
                <Grid container spacing={2} className={classes.input}>
                  <Grid item xs={6}>
                    <Typography>Long Break</Typography>
                  </Grid>
                  <Grid item xs={6} container justifyContent="flex-end">
                    <Input
                      value={value}
                      size="small"
                      onChange={onChange}
                      inputProps={{
                        step: 1,
                        min: 1,
                        max: 59,
                        type: 'number',
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="longBreakInterval"
              control={control}
              defaultValue={settings.longBreakInterval}
              render={({ field: { onChange, value } }) => (
                <Grid container spacing={2} className={classes.input}>
                  <Grid item xs={6}>
                    <Typography>Long Break Interval</Typography>
                  </Grid>
                  <Grid item xs={6} container justifyContent="flex-end">
                    <Input
                      value={value}
                      size="small"
                      onChange={onChange}
                      inputProps={{
                        step: 1,
                        min: 1,
                        max: 10,
                        type: 'number',
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="autoStartPomodoro"
              control={control}
              defaultValue={settings.autoStartPomodoro}
              render={({ field: { onChange, value } }) => (
                <Grid container spacing={2} className={classes.input}>
                  <Grid item xs={6}>
                    <Typography>Auto Start Pomodoro</Typography>
                  </Grid>
                  <Grid item xs={6} container justifyContent="flex-end">
                    <Switch
                      onChange={(e) => onChange(e.target.checked)}
                      checked={value}
                    />
                  </Grid>
                </Grid>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="autoStartBreak"
              control={control}
              defaultValue={settings.autoStartBreak}
              render={({ field: { onChange, value } }) => (
                <Grid container spacing={2} className={classes.input}>
                  <Grid item xs={6}>
                    <Typography>Auto Start Break</Typography>
                  </Grid>
                  <Grid item xs={6} container justifyContent="flex-end">
                    <Switch
                      onChange={(e) => onChange(e.target.checked)}
                      checked={value}
                    />
                  </Grid>
                </Grid>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="notificationsOn"
              control={control}
              defaultValue={settings.notificationsOn}
              render={({ field: { onChange, value } }) => (
                <Grid container spacing={2} className={classes.input}>
                  <Grid item xs={6}>
                    <Typography>Notifications</Typography>
                  </Grid>
                  <Grid item xs={6} container justifyContent="flex-end">
                    <Switch
                      onChange={(e) => onChange(e.target.checked)}
                      checked={value}
                    />
                  </Grid>
                </Grid>
              )}
            />
          </Grid>
        </Grid>
        <SubmitButton
          title="Update Settings"
          type="submit"
          isLoading={isLoading}
        />
      </form>
    </Container>
  );
};

export default PomodoroSettingsForm;
