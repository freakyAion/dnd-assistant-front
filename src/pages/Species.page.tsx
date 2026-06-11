import { useEffect, useState } from 'react';
import {
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
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  createSpecies,
  CreatureSize,
  deleteSpecies,
  getSpecies,
  Species,
  updateSpecies,
} from '../api/api';
import { ArticleEditor } from '../components/ArticleEditor/ArticleEditor';
import { ArticleRenderer, Block } from '../components/ArticleRenderer/ArticleRenderer';
import { IsAdmin } from '../store/auth';

const SIZE_LABELS: Record<CreatureSize, string> = {
  [CreatureSize.Tiny]: 'Крошечный (Tiny)',
  [CreatureSize.Small]: 'Маленький (Small)',
  [CreatureSize.Medium]: 'Средний (Medium)',
  [CreatureSize.Large]: 'Большой (Large)',
};

const formatSizeName = (size: CreatureSize | number) => {
  return SIZE_LABELS[size as CreatureSize] || `Размер ${size}`;
};

const SIZE_OPTIONS = Object.entries(SIZE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const parseDescriptionBlocks = (textString: string): Block[] => {
  if (!textString) return [];
  try {
    if (textString.trim().startsWith('[') || textString.trim().startsWith('{')) {
      const parsed = JSON.parse(textString);
      return Array.isArray(parsed) ? parsed : parsed.blocks || [];
    }
  } catch {
    // Graceful fallback for historical legacy plain-text database profiles
  }
  return [{ type: 'paragraph', text: textString }];
};

export function SpeciesPage() {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sizeFilters, setSizeFilters] = useState<string[]>([]);
  const [adminMode, setAdminMode] = useState(false);

  // Admin Window Buffers
  const [editorOpened, setEditorOpened] = useState(false);
  const [editingSpeciesId, setEditingSpeciesId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editName, setEditName] = useState('');
  const [editSize, setEditSize] = useState<string>(String(CreatureSize.Medium));
  const [editBaseSpeed, setEditBaseSpeed] = useState<number>(30);
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);

  const fetchSpeciesList = () => {
    setLoading(true);
    getSpecies()
      .then((res) => setSpeciesList(Array.isArray(res.data) ? res.data : []))
      .catch(() =>
        notifications.show({ title: 'Ошибка', message: 'Не удалось загрузить расы', color: 'red' })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSpeciesList();
  }, []);

  useEffect(() => {
    setAdminMode(IsAdmin());
  }, [speciesList, selectedSpecies]);

  const openEditor = (species: Species | null = null) => {
    if (species) {
      setEditingSpeciesId(species.id);
      setEditName(species.name);
      setEditSize(String(species.size));
      setEditBaseSpeed(species.baseSpeed || 30);
      setEditBlocks(parseDescriptionBlocks(species.description?.text || ''));
    } else {
      setEditingSpeciesId(null);
      setEditName('');
      setEditSize(String(CreatureSize.Medium));
      setEditBaseSpeed(30);
      setEditBlocks([]);
    }
    setEditorOpened(true);
  };

  const handleSaveSpecies = async () => {
    if (!editName.trim()) {
      notifications.show({ title: 'Ошибка', message: 'Введите название расы', color: 'red' });
      return;
    }

    setSubmitting(true);
    const payload: Omit<Species, 'id' | 'traits'> = {
      name: editName,
      size: Number(editSize) as CreatureSize,
      baseSpeed: editBaseSpeed,
      description: { text: JSON.stringify(editBlocks) },
    };

    try {
      if (editingSpeciesId) {
        await updateSpecies(editingSpeciesId, payload);
        notifications.show({
          title: 'Успех',
          message: 'Свойства расы успешно изменены',
          color: 'green',
        });
      } else {
        await createSpecies(payload);
        notifications.show({
          title: 'Успех',
          message: 'Новая раса добавлена в архивы',
          color: 'green',
        });
      }
      setEditorOpened(false);
      setSelectedSpecies(null);
      fetchSpeciesList();
    } catch {
      notifications.show({ title: 'Ошибка', message: 'Не удалось сохранить расу', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSpecies = async (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!window.confirm('Удалить эту расу окончательно?')) return;

    try {
      await deleteSpecies(id);
      notifications.show({ title: 'Удалено', message: 'Раса успешно стерта', color: 'gray' });
      setSelectedSpecies(null);
      fetchSpeciesList();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось выполнить удаление',
        color: 'red',
      });
    }
  };

  const filteredSpecies = speciesList.filter((s) => {
    if (!s || !s.name) return false;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesSize = sizeFilters.length === 0 || sizeFilters.includes(String(s.size));
    return matchesSearch && matchesSize;
  });

  const uniqueSizes = Array.from(new Set(speciesList.map((s) => s.size)))
    .filter((s) => s !== undefined && s !== null)
    .map((s) => ({ value: String(s), label: formatSizeName(s) }));

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Загрузка генеалогического древа рас...</Text>
      </Stack>
    );
  }

  if (selectedSpecies) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft size={16} />}
              onClick={() => setSelectedSpecies(null)}
              p={0}
              color="gray"
            >
              Назад к расам
            </Button>
            {adminMode && (
              <Group gap="xs">
                <Button
                  size="xs"
                  variant="outline"
                  leftSection={<IconEdit size={14} />}
                  onClick={() => openEditor(selectedSpecies)}
                >
                  Редактировать
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => handleDeleteSpecies(selectedSpecies.id)}
                >
                  Удалить
                </Button>
              </Group>
            )}
          </Group>

          <Group justify="space-between" align="center">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Title order={1}>{selectedSpecies.name}</Title>
              <Box mt="xs">
                <ArticleRenderer
                  article={{
                    title: '',
                    content: parseDescriptionBlocks(selectedSpecies.description?.text || ''),
                  }}
                />
              </Box>
            </Stack>
            <Stack gap="xs" align="flex-end">
              <Badge color="blue" size="xl">
                Размер: {formatSizeName(selectedSpecies.size)}
              </Badge>
              <Badge color="green" size="xl">
                Скорость: {selectedSpecies.baseSpeed} фт.
              </Badge>
            </Stack>
          </Group>

          <Divider my="sm" />

          <Stack gap="md">
            <Title order={2}>Расовые особенности</Title>
            {selectedSpecies.traits?.map((trait, idx) => (
              <Card key={trait.id || idx} withBorder padding="md" radius="sm">
                <Stack gap="xs">
                  <Text fw={700} size="lg" c="blue.8">
                    {trait.name}
                  </Text>
                  <ArticleRenderer
                    article={{
                      title: '',
                      content: parseDescriptionBlocks(trait.description?.text || ''),
                    }}
                  />
                </Stack>
              </Card>
            ))}
            {(!selectedSpecies.traits || selectedSpecies.traits.length === 0) && (
              <Text c="dimmed" fs="italic">
                У этой расы нет дополнительных особенностей.
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
            <Title order={1}>Расы и происхождения</Title>
            <Text c="dimmed">Выберите расу для вашего искателя приключений</Text>
          </Stack>
          {adminMode && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => openEditor(null)}>
              Добавить расу
            </Button>
          )}
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TextInput
            placeholder="Поиск расы..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <MultiSelect
            placeholder="Фильтр по размеру"
            clearable
            searchable
            data={uniqueSizes}
            value={sizeFilters}
            onChange={setSizeFilters}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredSpecies.map((s) => (
            <Card
              key={s.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedSpecies(s)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Title order={3} lineClamp={1}>
                  {s.name}
                </Title>
                <Group gap={4} onClick={(e) => e.stopPropagation()}>
                  {adminMode && (
                    <>
                      <ActionIcon variant="subtle" color="blue" onClick={() => openEditor(s)}>
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={(e) => handleDeleteSpecies(s.id, e)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </>
                  )}
                </Group>
              </Group>
              <Group gap={4} mt="xs" mb="xs">
                <Badge size="xs" variant="light" color="blue">
                  {formatSizeName(s.size)}
                </Badge>
                <Badge size="xs" variant="light" color="green">
                  {s.baseSpeed} фт.
                </Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      <Modal
        opened={editorOpened}
        onClose={() => setEditorOpened(false)}
        title={editingSpeciesId ? 'Редактирование параметров расы' : 'Создание новой расы'}
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
                    label="Название расы"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <Group grow>
                    <Select
                      label="Размер существа"
                      data={SIZE_OPTIONS}
                      value={editSize}
                      onChange={(val) => setEditSize(val || String(CreatureSize.Medium))}
                    />
                    <NumberInput
                      label="Базовая скорость (фт.)"
                      value={editBaseSpeed}
                      onChange={(val) => setEditBaseSpeed(Number(val))}
                      min={0}
                      step={5}
                    />
                  </Group>
                  <Box mt="sm">
                    <Text size="sm" fw={500} mb={4}>
                      Описание расы и лор
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
                Живой предпросмотр библиотечной карточки:
              </Text>
              <Paper
                p="xl"
                withBorder
                radius="md"
                shadow="xs"
                style={{ minHeight: '400px', height: '100%' }}
              >
                <Title order={2}>{editName || 'Название новой расы'}</Title>
                <Group gap="xs" mt="xs" mb="lg">
                  <Badge color="blue">Размер: {formatSizeName(Number(editSize))}</Badge>
                  <Badge color="green">Скорость: {editBaseSpeed} фт.</Badge>
                </Group>
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
              onClick={handleSaveSpecies}
              loading={submitting}
            >
              Сохранить расу
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
