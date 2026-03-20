import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home.page';
import { EditorPage } from './pages/Editor.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,   // ← wraps everything
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/characters', element: <div>Мои персонажи</div> },
      { path: '/books', element: <div>Книги</div> },
      { path: '/worlds', element: <div>Мои миры</div> },
      { path: '/editor', element: <EditorPage />}
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}