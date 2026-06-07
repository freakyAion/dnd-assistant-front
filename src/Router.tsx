import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CharacterDetailPage } from './pages/CharacterDetails.page'; // Import the detail viewer
import { EditorPage } from './pages/Editor.page';
import { HomePage } from './pages/Home.page';
import { LoginPage } from './pages/Login.page';
import { CharactersPage } from './pages/MyCharacters.page'; // Import your page

import { NewCharacterPage } from './pages/NewCharacter.page';
import { RegisterPage } from './pages/Register.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/', element: <HomePage /> },

      // Character Routes
      { path: '/characters/me', element: <CharactersPage /> },
      { path: '/characters/new', element: <NewCharacterPage /> },
      { path: '/characters/:id', element: <CharacterDetailPage /> }, // Fixes the error page redirect
      { path: '/characters/:id/edit', element: <div>Редактирование персонажа</div> },
      { path: '/characters/new', element: <div>Создание персонажа</div> },

      { path: '/books', element: <div>Книги</div> },
      { path: '/worlds', element: <div>Мои миры</div> },
      { path: '/editor', element: <EditorPage /> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
