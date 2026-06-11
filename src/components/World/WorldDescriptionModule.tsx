import { useState } from 'react';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { Box, Button, Grid, Group, Modal, Paper, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { RichTextContent, updateWorldDescription } from '../../api/api';
import { ArticleEditor } from '../ArticleEditor/ArticleEditor';
import { ArticleRenderer, Block } from '../ArticleRenderer/ArticleRenderer';

interface WorldDescriptionModuleProps {
  worldId: string;
  initialDescription: RichTextContent;
  isOwner: boolean;
  onDescriptionUpdated?: (updatedDesc: RichTextContent) => void;
}

export function WorldDescriptionModule({
  worldId,
  initialDescription,
  isOwner,
  onDescriptionUpdated,
}: WorldDescriptionModuleProps) {
  const [description, setDescription] = useState<RichTextContent>(initialDescription);
  const [opened, { open, close }] = useDisclosure(false);
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenEditor = () => {
    // Safe mapping sequence guardrail
    const rawBlocks = description?.blocks || [];
    const sanitizedBlocks = rawBlocks.map((b: any) => {
      if (b.type === 'paragraph' && !b.spans) {
        return {
          type: 'paragraph' as const,
          spans: b.text ? [{ type: 'text' as const, text: b.text }] : [],
        };
      }
      return b;
    }) as Block[];

    setEditBlocks(sanitizedBlocks);
    open();
  };

  const handleSave = () => {
    setSubmitting(true);
    const updatedDesc: RichTextContent = { blocks: editBlocks };

    updateWorldDescription(worldId, updatedDesc)
      .then(() => {
        notifications.show({ message: 'Описание мира успешно обновлено!', color: 'green' });
        setDescription(updatedDesc);
        if (onDescriptionUpdated) onDescriptionUpdated(updatedDesc);
        close();
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось сохранить изменения.',
          color: 'red',
        })
      )
      .finally(() => setSubmitting(false));
  };

  // Pre-process display array to guarantee the ArticleRenderer never encounters undefined maps
  const displayBlocks = (description?.blocks || []).map((b: any) => {
    if (b.type === 'paragraph' && !b.spans) {
      return { type: 'paragraph', spans: b.text ? [{ type: 'text', text: b.text }] : [] };
    }
    return b;
  }) as Block[];

  return (
    <Stack gap="md">
      {isOwner && (
        <Group justify="flex-end">
          <Button
            variant="outline"
            size="xs"
            leftSection={<IconEdit size={14} />}
            onClick={handleOpenEditor}
          >
            Редактировать описание
          </Button>
        </Group>
      )}

      <Box>
        {displayBlocks.length > 0 ? (
          <ArticleRenderer
            article={{
              title: 'История и описание',
              content: displayBlocks,
            }}
          />
        ) : (
          <Text c="dimmed" style={{ fontStyle: 'italic' }}>
            Описание этого мира пока пусто. Нажмите кнопку выше, чтобы добавить лор.
          </Text>
        )}
      </Box>

      {/* Large focused modal containing the editor blocks layout panels */}
      <Modal opened={opened} onClose={close} title="Редактор описания мира" size="100%" radius="md">
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="xs" withBorder radius="sm">
                <Text size="xs" c="dimmed" mb="xs">
                  Конструктор разделов:
                </Text>
                <ArticleEditor blocks={editBlocks} onChange={setEditBlocks} />
              </Paper>
            </Grid.Col>
            <Grid.Col
              span={{ base: 12, md: 6 }}
              style={{ borderLeft: '1px solid var(--mantine-color-default-border)' }}
            >
              <Text size="xs" c="dimmed" mb="xs">
                Живой предпросмотр статьи:
              </Text>
              <Paper p="md" withBorder radius="sm" style={{ minHeight: '300px', height: '100%' }}>
                <ArticleRenderer
                  article={{
                    title: 'Предпросмотр лора',
                    content: editBlocks,
                  }}
                />
              </Paper>
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" color="gray" onClick={close}>
              Отмена
            </Button>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={handleSave}
              loading={submitting}
            >
              Сохранить описание
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
