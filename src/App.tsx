import '@mantine/core/styles.css';

import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { getServerStatus } from './api';
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
      <Router />
    </MantineProvider>
  );
}
