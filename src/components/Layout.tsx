import { AppShell, NavLink, Stack } from '@mantine/core';
import { IconHome2, IconUsers, IconBooks, IconWorld, IconSword, IconSparkles, IconSkull, IconPencil } from '@tabler/icons-react';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <AppShell
      navbar={{ width: 220, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Navbar p="1">
        <Stack gap="1">
          <NavLink
            href="/"
            label="На главную"
            leftSection={<IconHome2 size={18} />}
          />
          <NavLink
            label="Мои персонажи"
            leftSection={<IconUsers size={18} />}
          >
            <NavLink href="/characters" label="Все персонажи" />
            <NavLink href="/characters/new" label="Создать персонажа" />
          </NavLink>
          <NavLink
            label="Книги"
            leftSection={<IconBooks size={18} />}
          >
            <NavLink href="/books/classes" label="Классы" leftSection={<IconSword size={16} />} />
            <NavLink href="/books/spells" label="Заклинания" leftSection={<IconSparkles size={16} />} />
            <NavLink href="/books/monsters" label="Монстры" leftSection={<IconSkull size={16} />} />
          </NavLink>
          <NavLink
            label="Мои миры"
            leftSection={<IconWorld size={18} />}
          />
          <NavLink
            label="Редактор"
            href="/editor"
            leftSection={<IconPencil size={18} />}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}