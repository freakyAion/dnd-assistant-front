import { Link } from 'react-router-dom';
import { Anchor, Text, Title } from '@mantine/core';

// Types
interface TextSpan {
  type: 'text';
  text: string;
}

interface ItalicSpan {
  type: 'italic';
  text: string;
}

interface ColoredSpan {
  type: 'colored';
  text: string;
  color: string;
}

interface LinkSpan {
  type: 'link';
  text: string;
  href: string;
  external: boolean;
}

export type Span = TextSpan | ItalicSpan | ColoredSpan | LinkSpan;

interface HeadingBlock {
  type: 'heading';
  level: number;
  text: string;
}

interface ParagraphBlock {
  type: 'paragraph';
  spans: Span[];
}

export type Block = HeadingBlock | ParagraphBlock;

export interface Article {
  title: string;
  content: Block[];
}

// Span renderer
function renderSpan(span: Span, index: number) {
  switch (span.type) {
    case 'text':
      return <span key={index}>{span.text}</span>;
    case 'italic':
      return (
        <Text component="em" key={index} fs="italic" inherit>
          {span.text}
        </Text>
      );
    case 'colored':
      return (
        <Text component="span" key={index} c={span.color} inherit>
          {span.text}
        </Text>
      );
    case 'link':
      return span.external ? (
        <Anchor key={index} href={span.href} target="_blank" rel="noopener noreferrer">
          {span.text}
        </Anchor>
      ) : (
        <Anchor key={index} component={Link} to={span.href}>
          {span.text}
        </Anchor>
      );
  }
}

// Block renderer
function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case 'heading':
      return (
        <Title key={index} order={block.level as 1 | 2 | 3 | 4 | 5 | 6} mb="sm">
          {block.text}
        </Title>
      );
    case 'paragraph':
      return (
        <Text key={index} mb="md">
          {block.spans.map((span, i) => renderSpan(span, i))}
        </Text>
      );
  }
}

interface ArticleRendererProps {
  article: Article;
}

export function ArticleRenderer({ article }: ArticleRendererProps) {
  return (
    <div>
      <Title order={1} mb="lg">
        {article.title}
      </Title>
      {article.content.map((block, i) => renderBlock(block, i))}
    </div>
  );
}
