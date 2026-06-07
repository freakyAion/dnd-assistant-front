import {
  IconArchive,
  IconBackpack,
  IconBooks,
  IconCompass,
  IconDice,
  IconGlobe,
  IconHome2,
  IconLogin,
  IconLogout,
  IconPencil,
  IconPlus,
  IconShield,
  IconSkull,
  IconSparkles,
  IconSword,
  IconUser,
  IconUserPlus,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppShell, NavLink, Stack } from '@mantine/core';
// 1. Update your store import at the top of the file
import { isLoggedIn, removeToken } from '../store/auth';

// 2. Update the system bottom action inside the Navbar block:

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const authenticated = isLoggedIn();

  // Helper to handle client-side routing instead of page reloads
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <AppShell navbar={{ width: 240, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar>
        <Stack gap="xs" style={{ height: '100%', justifyContent: 'space-between' }}>
          <Stack gap="xs">
            {/* AUTH TRIGGER / PROFILE */}
            {!authenticated ? (
              <NavLink
                onClick={() => handleNavigation('/login')}
                active={location.pathname === '/login'}
                label="Войти / Регистрация"
                leftSection={<IconLogin size={18} />}
              />
            ) : (
              <NavLink
                label="Мой профиль"
                leftSection={<IconUser size={18} />}
                onClick={() => handleNavigation('/profile')}
              />
            )}

            <NavLink
              onClick={() => handleNavigation('/')}
              active={location.pathname === '/'}
              label="На главную"
              leftSection={<IconHome2 size={18} />}
            />

            {/* REFERENCE SECTION (COMPENDIUM) */}
            <NavLink label="Справочник" leftSection={<IconBooks size={18} />} defaultOpened>
              <NavLink
                onClick={() => handleNavigation('/books/rules')}
                active={location.pathname === '/books/rules'}
                label="Правила игры"
                leftSection={<IconShield size={16} />}
              />
              <NavLink
                onClick={() => handleNavigation('/books/classes')}
                active={location.pathname === '/books/classes'}
                label="Классы"
                leftSection={<IconSword size={16} />}
              />
              <NavLink
                onClick={() => handleNavigation('/books/species')}
                active={location.pathname === '/books/species'}
                label="Расы"
                leftSection={<IconSkull size={16} />}
              />
              <NavLink
                onClick={() => handleNavigation('/books/backgrounds')}
                active={location.pathname === '/books/backgrounds'}
                label="Предыстории"
                leftSection={<IconArchive size={16} />}
              />
              <NavLink
                onClick={() => handleNavigation('/books/spells')}
                active={location.pathname === '/books/spells'}
                label="Заклинания"
                leftSection={<IconSparkles size={16} />}
              />
              <NavLink
                onClick={() => handleNavigation('/books/items')}
                active={location.pathname === '/books/items'}
                label="Предметы и снаряжение"
                leftSection={<IconBackpack size={16} />}
              />
            </NavLink>

            {/* CHARACTERS SECTION */}
            <NavLink label="Персонажи" leftSection={<IconUsers size={18} />}>
              {authenticated && (
                <NavLink
                  onClick={() => handleNavigation('/characters/me')}
                  active={location.pathname === '/characters/me'}
                  label="Мои персонажи"
                  leftSection={<IconUser size={16} />}
                />
              )}
              {authenticated && (
                <NavLink
                  onClick={() => handleNavigation('/characters/new')}
                  active={location.pathname === '/characters/new'}
                  label="Создать нового"
                  leftSection={<IconUserPlus size={16} />}
                />
              )}
              <NavLink
                onClick={() => handleNavigation('/characters/public')}
                active={location.pathname === '/characters/public'}
                label="Публичные листы"
                leftSection={<IconCompass size={16} />}
              />
            </NavLink>

            {/* CAMPAIGNS & PLAY SECTION */}
            {authenticated && (
              <NavLink label="Игровые сессии" leftSection={<IconDice size={18} />}>
                <NavLink
                  onClick={() => handleNavigation('/campaigns')}
                  active={location.pathname === '/campaigns'}
                  label="Мои кампании"
                  leftSection={<IconUsers size={16} />}
                />
              </NavLink>
            )}

            {/* WORLDS SECTION */}
            <NavLink label="Миры" leftSection={<IconWorld size={18} />}>
              {authenticated && (
                <NavLink
                  onClick={() => handleNavigation('/worlds/me')}
                  active={location.pathname === '/worlds/me'}
                  label="Мои миры"
                  leftSection={<IconGlobe size={16} />}
                />
              )}
              {authenticated && (
                <NavLink
                  onClick={() => handleNavigation('/worlds/new')}
                  active={location.pathname === '/worlds/new'}
                  label="Создать новый"
                  leftSection={<IconPlus size={16} />}
                />
              )}
              <NavLink
                onClick={() => handleNavigation('/worlds/explore')}
                active={location.pathname === '/worlds/explore'}
                label="Обзор миров"
                leftSection={<IconCompass size={16} />}
              />
            </NavLink>

            {/* TOOLS SECTION */}
            {authenticated && (
              <NavLink
                onClick={() => handleNavigation('/editor')}
                active={location.pathname === '/editor'}
                label="Конструктор контента"
                leftSection={<IconPencil size={18} />}
              />
            )}
          </Stack>

          {authenticated && (
            <NavLink
              onClick={() => {
                removeToken(); // Clears the token from localStorage
                handleNavigation('/'); // Redirects to home page
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
