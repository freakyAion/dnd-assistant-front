import {
  IconBooks,
  IconHome2,
  IconLogin,
  IconPencil,
  IconSkull,
  IconSparkles,
  IconSword,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { Outlet } from 'react-router-dom';
import { AppShell, NavLink, Stack } from '@mantine/core';
import { isLoggedIn } from '../store/auth';

export function Layout() {
  return (
    <AppShell navbar={{ width: 220, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar p="1">
        <Stack gap="1">
          {!isLoggedIn() && (
            <NavLink
              href="/login"
              label="Войти / Регистрация"
              leftSection={<IconLogin size={18} />}
              color="blue"
              variant="filled"
            />
          )}
          <NavLink href="/" label="На главную" leftSection={<IconHome2 size={18} />} />
          <NavLink label="Мои персонажи" leftSection={<IconUsers size={18} />}>
            <NavLink href="/characters" label="Все персонажи" />
            <NavLink href="/characters/new" label="Создать персонажа" />
          </NavLink>
          <NavLink label="Книги" leftSection={<IconBooks size={18} />}>
            <NavLink href="/books/classes" label="Классы" leftSection={<IconSword size={16} />} />
            <NavLink
              href="/books/spells"
              label="Заклинания"
              leftSection={<IconSparkles size={16} />}
            />
            <NavLink href="/books/monsters" label="Монстры" leftSection={<IconSkull size={16} />} />
          </NavLink>
          <NavLink label="Мои миры" leftSection={<IconWorld size={18} />} />
          <NavLink label="Редактор" href="/editor" leftSection={<IconPencil size={18} />} />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
