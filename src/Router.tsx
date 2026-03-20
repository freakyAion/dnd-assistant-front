import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { EditorPage } from './pages/Editor.page';
import { HomePage } from './pages/Home.page';
import { LoginPage } from './pages/Login.page';
import { RegisterPage } from './pages/Register.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // ← wraps everything
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/', element: <HomePage /> },
      { path: '/characters', element: <div>Мои персонажи</div> },
      { path: '/books', element: <div>Книги</div> },
      { path: '/worlds', element: <div>Мои миры</div> },
      { path: '/editor', element: <EditorPage /> },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
