import { Welcome } from '@/components/Welcome/Welcome';
import { ArticleRenderer, Article } from '../components/ArticleRenderer/ArticleRenderer';
import testArticle from '../testing/test-article.json';
import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';

export function HomePage() {
  const article = testArticle.response.article as unknown as Article;

  return (
    <>
      <Welcome />
      <ColorSchemeToggle />
      <ArticleRenderer article={article} />
    </>
  );
}