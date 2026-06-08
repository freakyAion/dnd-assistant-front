import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { useEffect } from 'react';
import { MantineProvider, Notification } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { getServerStatus } from './api/api';
import { Router } from './Router';
import { theme } from './theme';

export default function App() {
  useEffect(() => {
    getServerStatus()
      .then((res) => console.log('Server status:', res.data))
      .catch((err) => console.error('Server unreachable:', err));
  }, []);

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      <Router />
    </MantineProvider>
  );
}
