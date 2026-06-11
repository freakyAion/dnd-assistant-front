import {
  IconArchive,
  IconBackpack,
  IconBooks,
  IconGlobe,
  IconHome2,
  IconLogin,
  IconLogout,
  IconPencil,
  IconShield,
  IconSkull,
  IconSparkles,
  IconSword,
  IconUser,
} from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppShell, NavLink, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { isLoggedIn, removeToken } from '../store/auth';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isLoggedIn();

  return (
    <AppShell navbar={{ width: 240, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar p="xs">
        <Stack gap="xs" style={{ height: '100%', justifyContent: 'space-between' }}>
          <Stack gap="xs">
            <NavLink
              onClick={() => navigate('/')}
              active={location.pathname === '/'}
              label="На главную"
              leftSection={<IconHome2 size={18} />}
            />

            {!authenticated && (
              <NavLink
                onClick={() => navigate('/login')}
                active={location.pathname === '/login' || location.pathname === '/register'}
                label="Войти / Регистрация"
                leftSection={<IconLogin size={18} />}
              />
            )}

            <NavLink label="Справочник" leftSection={<IconBooks size={18} />} defaultOpened>
              <NavLink
                onClick={() => navigate('/books/rules')}
                active={location.pathname === '/books/rules'}
                label="Правила игры"
                leftSection={<IconShield size={16} />}
              />
              <NavLink
                onClick={() => navigate('/books/classes')}
                active={location.pathname === '/books/classes'}
                label="Классы"
                leftSection={<IconSword size={16} />}
              />
              <NavLink
                onClick={() => navigate('/books/species')}
                active={location.pathname === '/books/species'}
                label="Расы"
                leftSection={<IconSkull size={16} />}
              />
              <NavLink
                onClick={() => navigate('/books/backgrounds')}
                active={location.pathname === '/books/backgrounds'}
                label="Предыстории"
                leftSection={<IconArchive size={16} />}
              />
              <NavLink
                onClick={() => navigate('/books/spells')}
                active={location.pathname === '/books/spells'}
                label="Заклинания"
                leftSection={<IconSparkles size={16} />}
              />
              <NavLink
                onClick={() => navigate('/books/items')}
                active={location.pathname === '/books/items'}
                label="Предметы"
                leftSection={<IconBackpack size={16} />}
              />
            </NavLink>

            <NavLink
              onClick={() => navigate('/characters')}
              active={location.pathname.startsWith('/characters')}
              label="Персонажи"
              leftSection={<IconUser size={18} />}
            />

            {/* Added Worlds Navigation Link */}
            <NavLink
              onClick={() => navigate('/worlds')}
              active={location.pathname.startsWith('/worlds')}
              label="Миры"
              leftSection={<IconGlobe size={18} />}
            />

            {authenticated && (
              <NavLink
                onClick={() => navigate('/editor')}
                active={location.pathname === '/editor'}
                label="Конструктор контента"
                leftSection={<IconPencil size={18} />}
              />
            )}
          </Stack>

          {authenticated && (
            <NavLink
              onClick={() => {
                notifications.show({
                  title: 'Вышли из системы',
                  message: 'Сессия успешно завершена. До встречи, путник!',
                  color: 'blue',
                  autoClose: 3000,
                });

                removeToken();
                navigate('/');
              }}
              label="Выйти"
              leftSection={<IconLogout size={18} />}
              color="red"
              variant="subtle"
            />
          )}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
