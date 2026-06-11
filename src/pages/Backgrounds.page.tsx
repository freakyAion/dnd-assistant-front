import { useEffect, useState } from 'react';
import {
  IconBriefcase,
  IconCheck,
  IconChevronLeft,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  MultiSelect,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  Background,
  createBackground,
  deleteBackground,
  getBackgrounds,
  updateBackground,
} from '../api/api';
import { ArticleEditor } from '../components/ArticleEditor/ArticleEditor';
import { ArticleRenderer, Block } from '../components/ArticleRenderer/ArticleRenderer';
import { IsAdmin } from '../store/auth';

// Standard D&D 5e Skill list indices mapping to mirror backend Shared.Enums.Skill
const SKILL_MAP: Record<number, string> = {
  0: 'Атлетика (Athletics)',
  1: 'Акробатика (Acrobatics)',
  2: 'Ловкость рук (Sleight of Hand)',
  3: 'Скрытность (Stealth)',
  4: 'Магия (Arcana)',
  5: 'История (History)',
  6: 'Анализ (Investigation)',
  7: 'Природа (Nature)',
  8: 'Религия (Religion)',
  9: 'Уход за животными (Animal Handling)',
  10: 'Проницательность (Insight)',
  11: 'Медицина (Medicine)',
  12: 'Внимательность (Perception)',
  13: 'Выживание (Survival)',
  14: 'Обман (Deception)',
  15: 'Запугивание (Intimidation)',
  16: 'Выступление (Performance)',
  17: 'Убеждение (Persuasion)',
};

const SKILL_OPTIONS = Object.entries(SKILL_MAP).map(([id, label]) => ({
  value: id,
  label,
}));

const formatSkillList = (skillIds: number[] | null | undefined): string => {
  if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) return 'Нет';
  return skillIds.map((id) => SKILL_MAP[id] || `Навык ${id}`).join(', ');
};

const parseDescriptionBlocks = (textString: string): Block[] => {
  if (!textString) return [];
  try {
    if (textString.trim().startsWith('[') || textString.trim().startsWith('{')) {
      const parsed = JSON.parse(textString);
      return Array.isArray(parsed) ? parsed : parsed.blocks || [];
    }
  } catch {
    // Graceful fallback for raw text records
  }
  return [{ type: 'paragraph', text: textString }];
};

export function BackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adminMode, setAdminMode] = useState(false);

  // Admin Window Buffers
  const [editorOpened, setEditorOpened] = useState(false);
  const [editingBgId, setEditingBgId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editName, setEditName] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);

  const fetchBackgroundsList = () => {
    setLoading(true);
    getBackgrounds()
      .then((res) => setBackgrounds(Array.isArray(res.data) ? res.data : []))
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить предыстории',
          color: 'red',
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBackgroundsList();
  }, []);

  useEffect(() => {
    setAdminMode(IsAdmin());
  }, [backgrounds, selectedBackground]);

  const openEditor = (bg: Background | null = null) => {
    if (bg) {
      setEditingBgId(bg.id);
      setEditName(bg.name);
      setEditSkills(Array.isArray(bg.skillProficiencies) ? bg.skillProficiencies.map(String) : []);
      setEditBlocks(parseDescriptionBlocks(bg.description?.text || ''));
    } else {
      setEditingBgId(null);
      setEditName('');
      setEditSkills([]);
      setEditBlocks([]);
    }
    setEditorOpened(true);
  };

  const handleSaveBackground = async () => {
    if (!editName.trim()) {
      notifications.show({
        title: 'Ошибка',
        message: 'Введите название предыстории',
        color: 'red',
      });
      return;
    }

    setSubmitting(true);
    const payload: Omit<Background, 'id' | 'features'> = {
      name: editName,
      skillProficiencies: editSkills.map(Number),
      description: { text: JSON.stringify(editBlocks) },
    };

    try {
      if (editingBgId) {
        await updateBackground(editingBgId, payload);
        notifications.show({
          title: 'Успех',
          message: 'Предыстория успешно изменена',
          color: 'green',
        });
      } else {
        await createBackground(payload);
        notifications.show({
          title: 'Успех',
          message: 'Новая предыстория добавлена в справочники',
          color: 'green',
        });
      }
      setEditorOpened(false);
      setSelectedBackground(null);
      fetchBackgroundsList();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось сохранить предысторию',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBackground = async (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!window.confirm('Удалить эту предысторию окончательно?')) return;

    try {
      await deleteBackground(id);
      notifications.show({
        title: 'Удалено',
        message: 'Предыстория успешно удалена',
        color: 'gray',
      });
      setSelectedBackground(null);
      fetchBackgroundsList();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось завершить операцию удаления',
        color: 'red',
      });
    }
  };

  const filteredBackgrounds = backgrounds.filter((b) => {
    if (!b || !b.name) return false;
    return b.name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Летопись прошлых заслуг и предысторий...</Text>
      </Stack>
    );
  }

  if (selectedBackground) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft size={16} />}
              onClick={() => setSelectedBackground(null)}
              p={0}
              color="gray"
            >
              Назад к предысториям
            </Button>
            {adminMode && (
              <Group gap="xs">
                <Button
                  size="xs"
                  variant="outline"
                  leftSection={<IconEdit size={14} />}
                  onClick={() => openEditor(selectedBackground)}
                >
                  Редактировать
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => handleDeleteBackground(selectedBackground.id)}
                >
                  Удалить
                </Button>
              </Group>
            )}
          </Group>

          <Stack gap="xs">
            <Title order={1}>{selectedBackground.name}</Title>
            <Box mt="xs">
              <ArticleRenderer
                article={{
                  title: '',
                  content: parseDescriptionBlocks(selectedBackground.description?.text || ''),
                }}
              />
            </Box>
          </Stack>

          <SimpleGrid cols={1} spacing="md" mt="md">
            <Card withBorder padding="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Бонусные навыки (Skill Proficiencies)
              </Text>
              <Text fw={600} size="md" mt={4}>
                {formatSkillList(selectedBackground.skillProficiencies)}
              </Text>
            </Card>
          </SimpleGrid>

          <Divider my="sm" />

          <Stack gap="md">
            <Title order={2}>Умения предыстории</Title>
            {selectedBackground.features?.map((feature, idx) => (
              <Card key={feature.id || idx} withBorder padding="lg" radius="md">
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconBriefcase
                      size={20}
                      style={{ color: 'var(--mantine-color-blue-filled)' }}
                    />
                    <Text fw={700} size="lg">
                      {feature.name}
                    </Text>
                  </Group>
                  <Box mt="xs">
                    <ArticleRenderer
                      article={{
                        title: '',
                        content: parseDescriptionBlocks(feature.description?.text || ''),
                      }}
                    />
                  </Box>
                </Stack>
              </Card>
            ))}
            {(!selectedBackground.features || selectedBackground.features.length === 0) && (
              <Text c="dimmed" fs="italic">
                Особые стартовые умения отсутствуют.
              </Text>
            )}
          </Stack>
        </Stack>
      </Container>
    );
  }

  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Предыстории персонажей</Title>
            <Text c="dimmed">Кем ваш герой был до того, как стал искать приключения?</Text>
          </Stack>
          {adminMode && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => openEditor(null)}>
              Добавить предысторию
            </Button>
          )}
        </Group>

        <TextInput
          placeholder="Поиск предыстории..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ maxWidth: '400px' }}
        />

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredBackgrounds.map((b) => (
            <Card
              key={b.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedBackground(b)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Title order={3} lineClamp={1}>
                  {b.name}
                </Title>
                <Group gap={4} onClick={(e) => e.stopPropagation()}>
                  {adminMode && (
                    <>
                      <ActionIcon variant="subtle" color="blue" onClick={() => openEditor(b)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={(e) => handleDeleteBackground(b.id, e)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </>
                  )}
                </Group>
              </Group>
              <Box mt="xs">
                <Text size="xs" c="dimmed" fw={600} lineClamp={1}>
                  Навыки: {formatSkillList(b.skillProficiencies)}
                </Text>
              </Box>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      <Modal
        opened={editorOpened}
        onClose={() => setEditorOpened(false)}
        title={editingBgId ? 'Редактирование предыстории' : 'Создание новой предыстории'}
        size="100%"
        radius="md"
      >
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder radius="sm">
                <Title order={4} mb="sm">
                  Конфигурация параметров
                </Title>
                <Stack gap="xs">
                  <TextInput
                    label="Название предыстории"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <MultiSelect
                    label="Даруемые навыки"
                    data={SKILL_OPTIONS}
                    value={editSkills}
                    onChange={setEditSkills}
                    placeholder="Выберите навыки..."
                    searchable
                    clearable
                  />
                  <Box mt="sm">
                    <Text size="sm" fw={500} mb={4}>
                      Описание предыстории и преимуществ
                    </Text>
                    <ArticleEditor blocks={editBlocks} onChange={setEditBlocks} />
                  </Box>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col
              span={{ base: 12, md: 6 }}
              style={{ borderLeft: '1px solid var(--mantine-color-default-border)' }}
            >
              <Text size="xs" c="dimmed" mb="xs">
                Живой предпросмотр предыстории:
              </Text>
              <Paper
                p="xl"
                withBorder
                radius="md"
                shadow="xs"
                style={{ minHeight: '400px', height: '100%' }}
              >
                <Title order={2}>{editName || 'Название новой предыстории'}</Title>
                <Box mt="xs" mb="md">
                  <Text size="xs" c="blue" fw={600}>
                    Навыки: {formatSkillList(editSkills.map(Number))}
                  </Text>
                </Box>
                <Box
                  style={{
                    borderTop: '1px solid var(--mantine-color-default-border)',
                    paddingTop: '12px',
                  }}
                >
                  <ArticleRenderer article={{ title: '', content: editBlocks }} />
                </Box>
              </Paper>
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" color="gray" onClick={() => setEditorOpened(false)}>
              Отмена
            </Button>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={handleSaveBackground}
              loading={submitting}
            >
              Сохранить предысторию
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
