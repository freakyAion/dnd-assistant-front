import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// IMPORT TITLE FROM MANTINE CORE
import { Title } from '@mantine/core';
import { Layout } from './components/Layout';
import { BackgroundsPage } from './pages/Background.page';
import { CharactersPage } from './pages/Characters.page';
import { CharacterSheetPage } from './pages/CharacterSheet.page';
import { ClassesPage } from './pages/Classes.page';
import { EditorPage } from './pages/Editor.page';
import { HomePage } from './pages/Home.page';
import { ItemsPage } from './pages/Items.page';
import { LoginPage } from './pages/Login.page';
import { RegisterPage } from './pages/Register.page';
import { RulesPage } from './pages/Rules.page';
import { SpeciesPage } from './pages/Species.page';
import { SpellsPage } from './pages/Spells.page';
import { WorldsPage } from './pages/Worlds.page';
import { WorldSheetPage } from './pages/WorldSheet.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/editor', element: <EditorPage /> },

      // Reference Book Routes (Corrected with Title order properties)
      { path: '/books/rules', element: <RulesPage /> },
      { path: '/books/classes', element: <ClassesPage /> },
      { path: '/books/species', element: <SpeciesPage /> },
      { path: '/books/backgrounds', element: <BackgroundsPage /> },
      { path: '/books/spells', element: <SpellsPage /> },
      { path: '/books/items', element: <ItemsPage /> },

      { path: '/characters', element: <CharactersPage /> },
      { path: '/characters/:id', element: <CharacterSheetPage /> },

      { path: '/worlds', element: <WorldsPage /> },
      { path: '/worlds/:id', element: <WorldSheetPage /> },

      { path: '*', element: <Title order={3}>Страница не найдена</Title> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
