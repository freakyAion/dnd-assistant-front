import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { Block, Span } from '../ArticleRenderer/ArticleRenderer';

function SpanEditor({ spans, onChange }: { spans: Span[]; onChange: (spans: Span[]) => void }) {
  const addSpan = (type: Span['type']) => {
    const base = { type, text: '' };
    const newSpan: Span =
      type === 'link'
        ? { type: 'link', text: '', href: '', external: false }
        : type === 'colored'
          ? { type: 'colored', text: '', color: 'red' }
          : (base as Span);
    onChange([...spans, newSpan]);
  };

  const updateSpan = (index: number, updated: Span) => {
    const next = [...spans];
    next[index] = updated;
    onChange(next);
  };

  return (
    <Stack gap="xs">
      {spans.map((span, i) => (
        <Paper key={i} p="xs" withBorder>
          <Group align="flex-start" wrap="nowrap">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Select
                size="xs"
                value={span.type}
                data={[
                  { value: 'text', label: 'Обычный текст' },
                  { value: 'italic', label: 'Курсив' },
                  { value: 'colored', label: 'Цветной' },
                  { value: 'link', label: 'Ссылка' },
                ]}
                onChange={(val) => updateSpan(i, { ...span, type: val as Span['type'] } as Span)}
              />
              <TextInput
                size="xs"
                placeholder="Текст фрагмента"
                value={span.text}
                onChange={(e) => updateSpan(i, { ...span, text: e.target.value } as Span)}
              />
              {span.type === 'colored' && (
                <TextInput
                  size="xs"
                  placeholder="Цвет (например red, #ff0055, orange)"
                  value={span.color}
                  onChange={(e) => updateSpan(i, { ...span, color: e.target.value } as Span)}
                />
              )}
              {span.type === 'link' && (
                <>
                  <TextInput
                    size="xs"
                    placeholder="Ссылка URL (например /rules/combat)"
                    value={span.href}
                    onChange={(e) => updateSpan(i, { ...span, href: e.target.value } as Span)}
                  />
                  <Select
                    size="xs"
                    value={span.external ? 'external' : 'internal'}
                    data={[
                      { value: 'internal', label: 'Внутренняя переадресация' },
                      { value: 'external', label: 'Внешний сайт' },
                    ]}
                    onChange={(val) =>
                      updateSpan(i, { ...span, external: val === 'external' } as Span)
                    }
                  />
                </>
              )}
            </Stack>
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={() => onChange(spans.filter((_, idx) => idx !== i))}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Paper>
      ))}
      <Group gap="xs">
        {(['text', 'italic', 'colored', 'link'] as Span['type'][]).map((type) => (
          <Button
            key={type}
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={() => addSpan(type)}
          >
            {type === 'text'
              ? 'Текст'
              : type === 'italic'
                ? 'Курсив'
                : type === 'colored'
                  ? 'Цвет'
                  : 'Ссылка'}
          </Button>
        ))}
      </Group>
    </Stack>
  );
}

function BlockEditor({
  block,
  onChange,
  onDelete,
}: {
  block: Block;
  onChange: (b: Block) => void;
  onDelete: () => void;
}) {
  return (
    <Paper p="sm" withBorder>
      <Group justify="space-between" mb="xs">
        <Title order={6}>
          {block.type === 'heading' ? `Заголовок H${block.level}` : 'Параграф со стилизацией'}
        </Title>
        <ActionIcon color="red" variant="subtle" onClick={onDelete}>
          <IconTrash size={16} />
        </ActionIcon>
      </Group>

      {block.type === 'heading' && (
        <Stack gap="xs">
          <Select
            label="Уровень важности"
            size="xs"
            value={String(block.level)}
            data={['1', '2', '3', '4', '5', '6']}
            onChange={(val) => onChange({ ...block, level: Number(val) })}
          />
          <TextInput
            label="Текст заголовка"
            size="xs"
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
          />
        </Stack>
      )}

      {block.type === 'paragraph' && (
        <SpanEditor spans={block.spans || []} onChange={(spans) => onChange({ ...block, spans })} />
      )}
    </Paper>
  );
}

interface ArticleEditorProps {
  blocks: Block[];
  onChange: (updatedBlocks: Block[]) => void;
}

export function ArticleEditor({ blocks, onChange }: ArticleEditorProps) {
  const addBlock = (type: Block['type']) => {
    const newBlock: Block =
      type === 'heading'
        ? { type: 'heading', level: 3, text: '' }
        : { type: 'paragraph', spans: [] };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updated: Block) => {
    const next = [...blocks];
    next[index] = updated;
    onChange(next);
  };

  const deleteBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  return (
    <Stack gap="md">
      {blocks.map((block, i) => (
        <BlockEditor
          key={i}
          block={block}
          onChange={(b) => updateBlock(i, b)}
          onDelete={() => deleteBlock(i)}
        />
      ))}
      <Group>
        <Button
          variant="outline"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => addBlock('heading')}
        >
          Добавить заголовок
        </Button>
        <Button
          variant="outline"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => addBlock('paragraph')}
        >
          Добавить параграф
        </Button>
      </Group>
      <Divider my="xs" />
    </Stack>
  );
}
