import { useState } from 'react';
import { IconArrowLeft, IconCheck, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  ActionIcon,
  Box,
  Button,
  Grid,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Timeline,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { addHistoryEvent, deleteHistoryEvent, HistoryEvent, updateHistoryEvent } from '@/api/api';
import { ArticleEditor } from '../ArticleEditor/ArticleEditor';
import { ArticleRenderer, Block } from '../ArticleRenderer/ArticleRenderer';

interface HistoryModuleProps {
  worldId: string;
  initialEvents: HistoryEvent[];
  isOwner: boolean;
}

export function HistoryModule({ worldId, initialEvents, isOwner }: HistoryModuleProps) {
  const [events, setEvents] = useState<HistoryEvent[]>(initialEvents);

  const [windowOpened, setWindowOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);

  const openViewWindow = (event: HistoryEvent) => {
    setSelectedEvent(event);
    setEditName(event.name);
    setEditDate(event.dateOrEra);
    setEditBlocks(event.description?.blocks || []);
    setIsEditing(false);
    setWindowOpened(true);
  };

  const openCreateWindow = () => {
    setSelectedEvent(null);
    setEditName('');
    setEditDate('');
    setEditBlocks([]);
    setIsEditing(true);
    setWindowOpened(true);
  };

  const closeWindow = () => {
    setWindowOpened(false);
    setSelectedEvent(null);
  };

  const handleSave = async () => {
    if (!editName.trim() || !editDate.trim()) {
      notifications.show({ title: 'Ошибка', message: 'Заполните обязательные поля', color: 'red' });
      return;
    }

    setSubmitting(true);
    const payload = {
      name: editName,
      dateOrEra: editDate,
      description: { blocks: editBlocks },
    };

    try {
      if (selectedEvent) {
        const res = await updateHistoryEvent(selectedEvent.id, payload);
        setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? res.data : e)));
        notifications.show({
          title: 'Успех',
          message: 'Изменения хроники сохранены',
          color: 'green',
        });
      } else {
        const res = await addHistoryEvent(worldId, payload);
        setEvents((prev) => [...prev, res.data]);
        notifications.show({
          title: 'Успех',
          message: 'Событие успешно добавлено',
          color: 'green',
        });
      }
      closeWindow();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось сохранить запись хронологии',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent launching the modal view handler
    try {
      await deleteHistoryEvent(id);
      setEvents((prev) => prev.filter((item) => item.id !== id));
      notifications.show({
        title: 'Удалено',
        message: 'Событие удалено из хроники мира',
        color: 'gray',
      });
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить историческое событие',
        color: 'red',
      });
    }
  };

  return (
    <Stack gap="md">
      {isOwner && (
        <Group justify="flex-end">
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateWindow}>
            Добавить событие
          </Button>
        </Group>
      )}

      {events.length === 0 ? (
        <Text c="dimmed">Хроника этого мира пока пуста. Великие свершения еще впереди.</Text>
      ) : (
        <Timeline bulletSize={24} lineWidth={2} active={events.length}>
          {events.map((event) => (
            <Timeline.Item
              key={event.id}
              title={event.name}
              bullet={<Text size="xs">⏳</Text>}
              style={{ cursor: 'pointer' }}
              onClick={() => openViewWindow(event)}
            >
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Text size="xs" c="dimmed" fw={700}>
                    {event.dateOrEra}
                  </Text>
                  {event.description?.blocks?.length > 0 ? (
                    <Text size="sm" c="dimmed" lineClamp={2}>
                      Просмотр деталей хроники доступен при нажатии на карточку события.
                    </Text>
                  ) : (
                    <Text size="sm" c="dimmed" fs="italic">
                      Нет детального описания.
                    </Text>
                  )}
                </Stack>
                {isOwner && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={(e) => handleDelete(event.id, e)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            </Timeline.Item>
          ))}
        </Timeline>
      )}

      {/* Main Full Window Workspace Editor/Viewer */}
      <Modal
        opened={windowOpened}
        onClose={closeWindow}
        title={
          isEditing
            ? selectedEvent
              ? 'Редактирование исторического события'
              : 'Новое историческое событие'
            : 'Историческая летопись'
        }
        size="100%"
        radius="md"
      >
        <Stack gap="md">
          {isEditing ? (
            <Stack gap="sm">
              <Group grow>
                <TextInput
                  label="Название события"
                  placeholder="Падение Аластара"
                  value={editName}
                  onChange={(e) => setEditName(e.currentTarget.value)}
                  required
                />
                <TextInput
                  label="Дата или Эпоха"
                  placeholder="442 год Третьей Эпохи"
                  value={editDate}
                  onChange={(e) => setEditDate(e.currentTarget.value)}
                  required
                />
              </Group>

              <Box mt="xs">
                <Text size="sm" fw={500} mb={4}>
                  Описание исторического процесса
                </Text>
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper p="xs" withBorder radius="sm">
                      <Text size="xs" c="dimmed" mb="xs">
                        Конструктор контента:
                      </Text>
                      <ArticleEditor blocks={editBlocks} onChange={setEditBlocks} />
                    </Paper>
                  </Grid.Col>
                  <Grid.Col
                    span={{ base: 12, md: 6 }}
                    style={{ borderLeft: '1px solid var(--mantine-color-default-border)' }}
                  >
                    <Text size="xs" c="dimmed" mb="xs">
                      Живой предпросмотр изменений:
                    </Text>
                    <Paper
                      p="md"
                      withBorder
                      radius="sm"
                      style={{ minHeight: '300px', height: '100%' }}
                    >
                      <ArticleRenderer
                        article={{
                          title: editName || 'Название исторического события',
                          content: editBlocks,
                        }}
                      />
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Box>

              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  color="gray"
                  onClick={() => (selectedEvent ? setIsEditing(false) : closeWindow())}
                >
                  Отмена
                </Button>
                <Button
                  color="green"
                  leftSection={<IconCheck size={16} />}
                  onClick={handleSave}
                  loading={submitting}
                >
                  Сохранить событие
                </Button>
              </Group>
            </Stack>
          ) : (
            selectedEvent && (
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Box>
                    <Title order={3}>{selectedEvent.name}</Title>
                    <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
                      {selectedEvent.dateOrEra}
                    </Text>
                  </Box>
                  {isOwner && (
                    <Button
                      variant="outline"
                      size="xs"
                      leftSection={<IconEdit size={14} />}
                      onClick={() => setIsEditing(true)}
                    >
                      Редактировать
                    </Button>
                  )}
                </Group>

                <Box
                  mt="md"
                  style={{
                    borderTop: '1px solid var(--mantine-color-default-border)',
                    paddingTop: '15px',
                  }}
                >
                  {selectedEvent.description?.blocks &&
                  selectedEvent.description.blocks.length > 0 ? (
                    <ArticleRenderer
                      article={{
                        title: '',
                        content: selectedEvent.description.blocks as Block[],
                      }}
                    />
                  ) : (
                    <Text c="dimmed" size="sm" style={{ fontStyle: 'italic' }}>
                      У этого события пока нет подробного лора.
                    </Text>
                  )}
                </Box>

                <Group justify="flex-end" mt="lg">
                  <Button
                    variant="outline"
                    color="gray"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={closeWindow}
                  >
                    Закрыть свиток
                  </Button>
                </Group>
              </Stack>
            )
          )}
        </Stack>
      </Modal>
    </Stack>
  );
}
