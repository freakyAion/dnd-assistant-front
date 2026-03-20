import { useState } from 'react';
import { Title, TextInput, Button, Group, Stack, Select, Textarea, Paper, ActionIcon, Divider, Grid, ScrollArea } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { ArticleRenderer, Article, Block, Span } from '../components/ArticleRenderer/ArticleRenderer';

// ---- Span Editor ----
function SpanEditor({ spans, onChange }: { spans: Span[], onChange: (spans: Span[]) => void }) {
  const addSpan = (type: Span['type']) => {
    const base = { type, text: '' };
    const newSpan: Span =
      type === 'link' ? { type: 'link', text: '', href: '', external: false } :
      type === 'colored' ? { type: 'colored', text: '', color: 'red' } :
      base as Span;
    onChange([...spans, newSpan]);
  };

  const updateSpan = (index: number, updated: Span) => {
    const next = [...spans];
    next[index] = updated;
    onChange(next);
  };

  const removeSpan = (index: number) => {
    onChange(spans.filter((_, i) => i !== index));
  };

  return (
    <Stack gap="xs">
      {spans.map((span, i) => (
        <Paper key={i} p="xs" withBorder>
          <Group align="flex-start">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Select
                size="xs"
                value={span.type}
                data={['text', 'italic', 'colored', 'link']}
                onChange={(val) => updateSpan(i, { ...span, type: val as Span['type'] } as Span)}
              />
              <TextInput
                size="xs"
                placeholder="Текст"
                value={span.text}
                onChange={(e) => updateSpan(i, { ...span, text: e.target.value } as Span)}
              />
              {span.type === 'colored' && (
                <TextInput
                  size="xs"
                  placeholder="Цвет (red, blue, ...)"
                  value={span.color}
                  onChange={(e) => updateSpan(i, { ...span, color: e.target.value } as Span)}
                />
              )}
              {span.type === 'link' && (
                <>
                  <TextInput
                    size="xs"
                    placeholder="Ссылка (href)"
                    value={span.href}
                    onChange={(e) => updateSpan(i, { ...span, href: e.target.value } as Span)}
                  />
                  <Select
                    size="xs"
                    value={span.external ? 'external' : 'internal'}
                    data={[{ value: 'internal', label: 'Внутренняя' }, { value: 'external', label: 'Внешняя' }]}
                    onChange={(val) => updateSpan(i, { ...span, external: val === 'external' } as Span)}
                  />
                </>
              )}
            </Stack>
            <ActionIcon color="red" variant="subtle" onClick={() => removeSpan(i)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Paper>
      ))}
      <Group gap="xs">
        {(['text', 'italic', 'colored', 'link'] as Span['type'][]).map(type => (
          <Button key={type} size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={() => addSpan(type)}>
            {type}
          </Button>
        ))}
      </Group>
    </Stack>
  );
}

// ---- Block Editor ----
function BlockEditor({ block, onChange, onDelete }: { block: Block, onChange: (b: Block) => void, onDelete: () => void }) {
  return (
    <Paper p="sm" withBorder>
      <Group justify="space-between" mb="xs">
        <Title order={6}>{block.type === 'heading' ? `Заголовок H${block.level}` : 'Параграф'}</Title>
        <ActionIcon color="red" variant="subtle" onClick={onDelete}>
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      {block.type === 'heading' && (
        <Stack gap="xs">
          <Select
            label="Уровень"
            size="xs"
            value={String(block.level)}
            data={['1','2','3','4','5','6']}
            onChange={(val) => onChange({ ...block, level: Number(val) })}
          />
          <TextInput
            label="Текст"
            size="xs"
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        </Stack>
      )}

      {block.type === 'paragraph' && (
        <SpanEditor spans={block.spans} onChange={(spans) => onChange({ ...block, spans })} />
      )}
    </Paper>
  );
}

// ---- Main Editor Page ----
export function EditorPage() {
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = type === 'heading'
      ? { type: 'heading', level: 2, text: '' }
      : { type: 'paragraph', spans: [] };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updated: Block) => {
    const next = [...blocks];
    next[index] = updated;
    setBlocks(next);
  };

  const deleteBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const exportJSON = () => {
    const article: Article = { title, content: blocks };
    const output = JSON.stringify({ response: { article } }, null, 2);
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'article'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const article: Article = { title, content: blocks };

  return (
    <Grid h="100%" style={{ height: 'calc(100vh - 60px)' }}>
      {/* Editor side */}
      <Grid.Col span={6}>
        <ScrollArea h="100%">
          <Stack p="md" gap="md">
            <Title order={3}>Редактор статей</Title>
            <TextInput
              label="Название статьи"
              placeholder="Воин"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Divider />
            {blocks.map((block, i) => (
              <BlockEditor
                key={i}
                block={block}
                onChange={(b) => updateBlock(i, b)}
                onDelete={() => deleteBlock(i)}
              />
            ))}
            <Group>
              <Button variant="light" leftSection={<IconPlus size={16} />} onClick={() => addBlock('heading')}>
                Заголовок
              </Button>
              <Button variant="light" leftSection={<IconPlus size={16} />} onClick={() => addBlock('paragraph')}>
                Параграф
              </Button>
            </Group>
            <Button onClick={exportJSON}>Экспорт JSON</Button>
          </Stack>
        </ScrollArea>
      </Grid.Col>

      {/* Preview side */}
      <Grid.Col span={6} style={{ borderLeft: '1px solid var(--mantine-color-default-border)' }}>
        <ScrollArea h="100%">
          <Paper p="md">
            <Title order={4} mb="md" c="dimmed">Предпросмотр</Title>
            <ArticleRenderer article={article} />
          </Paper>
        </ScrollArea>
      </Grid.Col>
    </Grid>
  );
}