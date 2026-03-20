import { ColorSchemeToggle } from '@/components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '@/components/Welcome/Welcome';
import { Article, ArticleRenderer } from '../components/ArticleRenderer/ArticleRenderer';
import testArticle from '../testing/test-article.json';

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
