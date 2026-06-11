import { useState } from 'react';
import {
  IconCheck,
  IconEdit,
  IconEyeOff,
  IconMask,
  IconSearch,
  IconUserPlus,
} from '@tabler/icons-react';
import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { addNpc, Npc, updateNpc } from '../../api/api';
import { ArticleEditor } from '../ArticleEditor/ArticleEditor';
import { ArticleRenderer, Block } from '../ArticleRenderer/ArticleRenderer';

interface NpcsModuleProps {
  worldId: string;
  initialNpcs: Npc[];
  isOwner: boolean;
  onNpcAdded?: (newNpc: Npc) => void;
}

const ALIGNMENT_OPTIONS = [
  'Законно-добрый',
  'Нейтрально-добрый',
  'Хаотично-добрый',
  'Законно-нейтральный',
  'Истинно-нейтральный',
  'Хаотично-нейтральный',
  'Законно-злой',
  'Нейтрально-злой',
  'Хаотично-злой',
  'Нейтральный',
];

export function NpcsModule({ worldId, initialNpcs, isOwner, onNpcAdded }: NpcsModuleProps) {
  const [npcs, setNpcs] = useState<Npc[]>(initialNpcs);
  const [search, setSearch] = useState('');

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [name, setName] = useState('');
  const [race, setRace] = useState('');
  const [occupation, setOccupation] = useState('');
  const [alignment, setAlignment] = useState<string | null>('Истинно-нейтральный');
  const [isSecret, setIsSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Состояния для просмотра/редактирования конкретной анкеты
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [selectedNpc, setSelectedNpc] = useState<Npc | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Временные буферные состояния редактирования выбранного NPC
  const [editName, setEditName] = useState('');
  const [editRace, setEditRace] = useState('');
  const [editOccupation, setEditOccupation] = useState('');
  const [editAlignment, setEditAlignment] = useState<string | null>('');
  const [editIsSecret, setEditIsSecret] = useState(false);
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);

  const handleAddNpc = () => {
    if (!name.trim()) {
      notifications.show({ title: 'Ошибка', message: 'Укажите имя персонажа.', color: 'red' });
      return;
    }
    setSubmitting(true);
    addNpc(worldId, {
      name,
      race,
      occupation,
      alignment: alignment || 'Нейтральный',
      isSecret,
      description: { blocks: [] },
    })
      .then((res) => {
        notifications.show({ message: 'Персонаж добавлен!', color: 'green' });
        const updatedList = [...npcs, res.data];
        setNpcs(updatedList);
        if (onNpcAdded) onNpcAdded(res.data);
        closeCreateModal();
      })
      .catch(() =>
        notifications.show({ title: 'Ошибка', message: 'Сбой при создании.', color: 'red' })
      )
      .finally(() => setSubmitting(false));
  };

  const handleOpenProfile = (npc: Npc) => {
    setSelectedNpc(npc);
    setEditName(npc.name);
    setEditRace(npc.race || '');
    setEditOccupation(npc.occupation || '');
    setEditAlignment(npc.alignment);
    setEditIsSecret(npc.isSecret);

    // Безопасная инициализация: фильтруем блоки, проверяя, что они имеют массив spans или текст
    const rawBlocks = npc.description?.blocks || [];
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
    setIsEditingProfile(false);
    openView();
  };

  const handleSaveProfileUpdate = () => {
    if (!selectedNpc) return;
    if (!editName.trim()) {
      notifications.show({ title: 'Ошибка', message: 'Имя не может быть пустым.', color: 'red' });
      return;
    }

    setSubmitting(true);

    const updatedDto = {
      name: editName,
      race: editRace,
      occupation: editOccupation,
      alignment: editAlignment || 'Нейтральный',
      isSecret: editIsSecret,
      description: { blocks: editBlocks },
    };

    updateNpc(worldId, selectedNpc.id, updatedDto)
      .then((res) => {
        notifications.show({ message: 'Анкета успешно сохранена!', color: 'green' });

        const updatedList = npcs.map((n) => (n.id === selectedNpc.id ? res.data : n));
        setNpcs(updatedList);
        setSelectedNpc(res.data);
        setIsEditingProfile(false);
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось обновить анкету.',
          color: 'red',
        })
      )
      .finally(() => setSubmitting(false));
  };

  const closeCreateModal = () => {
    closeCreate();
    setName('');
    setRace('');
    setOccupation('');
    setAlignment('Истинно-нейтральный');
    setIsSecret(false);
  };

  const filteredNpcs = npcs.filter((npc) => {
    if (npc.isSecret && !isOwner) return false;
    const query = search.toLowerCase();
    return (
      npc.name.toLowerCase().includes(query) ||
      (npc.race && npc.race.toLowerCase().includes(query)) ||
      (npc.occupation && npc.occupation.toLowerCase().includes(query))
    );
  });

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <TextInput
          placeholder="Поиск NPC по имени, расе..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          w={{ base: '100%', sm: 350 }}
        />
        {isOwner && (
          <Button leftSection={<IconUserPlus size={16} />} onClick={openCreate} color="blue">
            Добавить NPC
          </Button>
        )}
      </Group>

      {filteredNpcs.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredNpcs.map((npc) => (
            <Card
              key={npc.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                borderTop: npc.isSecret ? '2px solid var(--mantine-color-pink-filled)' : undefined,
              }}
            >
              <Stack gap="xs" justify="space-between" style={{ height: '100%' }}>
                <Box>
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Title order={4} lineClamp={1}>
                      {npc.name}
                    </Title>
                    {npc.isSecret && (
                      <Badge color="pink" variant="light" leftSection={<IconEyeOff size={12} />}>
                        Мастеру
                      </Badge>
                    )}
                  </Group>

                  <Group gap={6} mt={4}>
                    {npc.race && (
                      <Badge variant="flat" color="gray">
                        {npc.race}
                      </Badge>
                    )}
                    {npc.occupation && (
                      <Badge variant="flat" color="blue">
                        {npc.occupation}
                      </Badge>
                    )}
                  </Group>
                </Box>

                <Group
                  justify="space-between"
                  align="center"
                  mt="md"
                  pt="xs"
                  style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
                >
                  <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                    {npc.alignment}
                  </Text>
                  <Button
                    variant="light"
                    size="xs"
                    color="blue"
                    leftSection={<IconMask size={14} />}
                    onClick={() => handleOpenProfile(npc)}
                  >
                    Анкета
                  </Button>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Card withBorder padding="xl" radius="md" style={{ textAlign: 'center' }}>
          <Text c="dimmed">Персонажи не найдены.</Text>
        </Card>
      )}

      {/* Модальное окно создания */}
      <Modal
        opened={createOpened}
        onClose={closeCreateModal}
        title="Новый персонаж (NPC)"
        radius="md"
      >
        <Stack gap="md">
          <TextInput
            label="Имя / Титул"
            placeholder="например, Страж Джарлакс"
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <TextInput
            label="Раса"
            placeholder="например, Дроу, Нага"
            value={race}
            onChange={(e) => setRace(e.currentTarget.value)}
          />
          <TextInput
            label="Роль / Занятие"
            placeholder="например, Капитан наемников"
            value={occupation}
            onChange={(e) => setOccupation(e.currentTarget.value)}
          />
          <Select
            label="Мировоззрение"
            placeholder="Выберите склонность"
            data={ALIGNMENT_OPTIONS}
            value={alignment}
            onChange={setAlignment}
          />
          <Switch
            label="Секретный NPC"
            checked={isSecret}
            onChange={(e) => setIsSecret(e.currentTarget.checked)}
            color="pink"
            mt="xs"
          />
          <Button color="blue" onClick={handleAddNpc} loading={submitting} mt="md">
            Сохранить
          </Button>
        </Stack>
      </Modal>

      {/* Модальное окно детальной Анкеты / Редактирования */}
      <Modal
        opened={viewOpened}
        onClose={closeView}
        title={isEditingProfile ? 'Редактирование анкеты' : 'Анкета персонажа'}
        size="100%"
        radius="md"
      >
        {selectedNpc && (
          <Stack gap="md">
            {isEditingProfile ? (
              // Интерфейс редактирования
              <Stack gap="sm">
                <TextInput
                  label="Имя"
                  value={editName}
                  onChange={(e) => setEditName(e.currentTarget.value)}
                  required
                />
                <Group grow>
                  <TextInput
                    label="Раса"
                    value={editRace}
                    onChange={(e) => setEditRace(e.currentTarget.value)}
                  />
                  <TextInput
                    label="Занятие"
                    value={editOccupation}
                    onChange={(e) => setEditOccupation(e.currentTarget.value)}
                  />
                </Group>
                <Select
                  label="Мировоззрение"
                  data={ALIGNMENT_OPTIONS}
                  value={editAlignment}
                  onChange={setEditAlignment}
                />

                <Box mt="xs">
                  <Text size="sm" fw={500} mb={4}>
                    Заметки и биография персонажа
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
                        style={{ minHeight: '200px', height: '100%' }}
                      >
                        <ArticleRenderer
                          article={{
                            title: editName || 'Имя персонажа',
                            content: editBlocks,
                          }}
                        />
                      </Paper>
                    </Grid.Col>
                  </Grid>
                </Box>

                <Switch
                  label="Скрыть карточку от игроков"
                  checked={editIsSecret}
                  onChange={(e) => setEditIsSecret(e.currentTarget.checked)}
                  color="pink"
                  mt="md"
                />

                <Group justify="flex-end" mt="md">
                  <Button variant="outline" color="gray" onClick={() => setIsEditingProfile(false)}>
                    Отмена
                  </Button>
                  <Button
                    color="green"
                    leftSection={<IconCheck size={16} />}
                    onClick={handleSaveProfileUpdate}
                    loading={submitting}
                  >
                    Сохранить изменения
                  </Button>
                </Group>
              </Stack>
            ) : (
              // Интерфейс просмотра лора
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Box>
                    <Title order={3}>{selectedNpc.name}</Title>
                    <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>
                      {selectedNpc.alignment}
                    </Text>
                  </Box>
                  {isOwner && (
                    <Button
                      variant="outline"
                      size="xs"
                      leftSection={<IconEdit size={14} />}
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Редактировать
                    </Button>
                  )}
                </Group>

                <Group gap="xs">
                  {selectedNpc.race && (
                    <Badge color="gray" variant="dot">
                      {selectedNpc.race}
                    </Badge>
                  )}
                  {selectedNpc.occupation && (
                    <Badge color="blue" variant="dot">
                      {selectedNpc.occupation}
                    </Badge>
                  )}
                </Group>

                <Box
                  mt="md"
                  style={{
                    borderTop: '1px solid var(--mantine-color-default-border)',
                    paddingTop: '15px',
                  }}
                >
                  {selectedNpc.description?.blocks && selectedNpc.description.blocks.length > 0 ? (
                    <ArticleRenderer
                      article={{
                        title: 'Заметки и биография',
                        content: (selectedNpc.description.blocks as any[]).map((b: any) => {
                          if (b.type === 'paragraph' && !b.spans) {
                            return {
                              type: 'paragraph',
                              spans: b.text ? [{ type: 'text', text: b.text }] : [],
                            };
                          }
                          return b;
                        }) as Block[],
                      }}
                    />
                  ) : (
                    <Text c="dimmed" size="sm" style={{ fontStyle: 'italic' }}>
                      У этого персонажа пока нет подробного лора.
                    </Text>
                  )}
                </Box>
              </Stack>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
