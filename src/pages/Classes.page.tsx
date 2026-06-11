import { useEffect, useState } from 'react';
import {
  IconCheck,
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconShield,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Grid,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ClassData, createClass, deleteClass, getClasses, updateClass } from '../api/api';
import { ArticleEditor } from '../components/ArticleEditor/ArticleEditor';
import { ArticleRenderer, Block } from '../components/ArticleRenderer/ArticleRenderer';
import { IsAdmin } from '../store/auth';

const SAVING_THROWS = [
  { value: 1 << 0, label: 'Сила' },
  { value: 1 << 1, label: 'Ловкость' },
  { value: 1 << 2, label: 'Телосложение' },
  { value: 1 << 3, label: 'Интеллект' },
  { value: 1 << 4, label: 'Мудрость' },
  { value: 1 << 5, label: 'Харизма' },
];

const formatSavingThrows = (mask: number) => {
  const active = SAVING_THROWS.filter((item) => (mask & item.value) !== 0).map(
    (item) => item.label.split(' ')[0]
  );
  return active.length > 0 ? active.join(', ') : 'Нет';
};

// Helper to safely extract block arrays out of your flat backend string text field
const parseDescriptionBlocks = (textString: string): Block[] => {
  if (!textString) return [];
  try {
    // If it's stored as serialized JSON array blocks from the editor, extract it
    if (textString.trim().startsWith('[') || textString.trim().startsWith('{')) {
      const parsed = JSON.parse(textString);
      return Array.isArray(parsed) ? parsed : parsed.blocks || [];
    }
  } catch {
    // Fallback: If it's legacy raw text data, wrap it inside a safe paragraph block format
  }
  return [{ type: 'paragraph', text: textString }];
};

export function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [adminMode, setAdminMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);

  const [editorOpened, setEditorOpened] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editName, setEditName] = useState('');
  const [editHitDieSides, setEditHitDieSides] = useState<number>(8);
  const [editSavesMask, setEditSavesMask] = useState<number>(0);
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);

  const fetchClassesList = () => {
    setLoading(true);
    getClasses()
      .then((res) => setClasses(res.data))
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить классы',
          color: 'red',
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClassesList();
  }, []);

  useEffect(() => {
    setAdminMode(IsAdmin());
  }, [classes, selectedClass]);

  const openEditor = (charClass: ClassData | null = null) => {
    if (charClass) {
      setEditingClassId(charClass.id);
      setEditName(charClass.name);
      setEditHitDieSides(charClass.hitDieSides);
      setEditSavesMask(charClass.savingThrows);
      setEditBlocks(parseDescriptionBlocks(charClass.description?.text || ''));
    } else {
      setEditingClassId(null);
      setEditName('');
      setEditHitDieSides(8);
      setEditSavesMask(0);
      setEditBlocks([]);
    }
    setEditorOpened(true);
  };

  const handleToggleSaveFlag = (flagValue: number, checked: boolean) => {
    if (checked) {
      setEditSavesMask((prev) => prev | flagValue);
    } else {
      setEditSavesMask((prev) => prev & ~flagValue);
    }
  };

  const handleSaveClass = async () => {
    if (!editName.trim()) {
      notifications.show({ title: 'Ошибка', message: 'Введите имя класса', color: 'red' });
      return;
    }

    setSubmitting(true);

    // We stringify the rich blocks array into your flat text field to save schema changes
    const payload: Omit<ClassData, 'id' | 'progressions' | 'spells'> = {
      name: editName,
      hitDieSides: editHitDieSides,
      savingThrows: editSavesMask,
      description: { text: JSON.stringify(editBlocks) },
    };

    try {
      if (editingClassId) {
        await updateClass(editingClassId, payload);
        notifications.show({
          title: 'Успех',
          message: 'Свойства класса успешно изменены',
          color: 'green',
        });
      } else {
        await createClass(payload);
        notifications.show({
          title: 'Успех',
          message: 'Класс занесен в библиотечные архивы',
          color: 'green',
        });
      }
      setEditorOpened(false);
      setSelectedClass(null);
      fetchClassesList();
    } catch {
      notifications.show({ title: 'Ошибка', message: 'Не удалось сохранить класс', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!window.confirm('Вы уверены, что хотите окончательно стереть этот класс?')) return;

    try {
      await deleteClass(id);
      notifications.show({
        title: 'Удалено',
        message: 'Класс удален из справочника',
        color: 'gray',
      });
      setSelectedClass(null);
      fetchClassesList();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить выбранный класс',
        color: 'red',
      });
    }
  };

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Извлечение архивных записей о героях...</Text>
      </Stack>
    );
  }

  if (selectedClass) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<IconX size={16} />}
              onClick={() => setSelectedClass(null)}
              p={0}
              color="gray"
            >
              Назад к списку классов
            </Button>
            <Group gap="xs">
              {adminMode && (
                <Group gap={4} mr="xs">
                  <Button
                    size="xs"
                    variant="outline"
                    leftSection={<IconEdit size={14} />}
                    onClick={() => openEditor(selectedClass)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => handleDeleteClass(selectedClass.id)}
                  >
                    Удалить
                  </Button>
                </Group>
              )}
              <Badge color="red" size="lg">
                Кость хитов: d{selectedClass.hitDieSides}
              </Badge>
              <Badge color="blue" size="lg">
                Спасброски: {formatSavingThrows(selectedClass.savingThrows)}
              </Badge>
            </Group>
          </Group>

          <Title order={1}>{selectedClass.name}</Title>

          <Box mt="xs">
            <ArticleRenderer
              article={{
                title: '',
                content: parseDescriptionBlocks(selectedClass.description?.text || ''),
              }}
            />
          </Box>

          {/* Progressions Map Dashboard */}
          {selectedClass.progressions && selectedClass.progressions.length > 0 && (
            <Box mt="xl">
              <Title order={3} mb="md">
                Таблица развития класса
              </Title>
              <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
                <Table striped highlightOnHover verticalSpacing="xs">
                  <Table.Thead bg="var(--mantine-color-gray-light)">
                    <Table.Tr>
                      <Table.Th style={{ width: '80px' }}>Уровень</Table.Th>
                      <Table.Th style={{ width: '150px' }}>Бонус мастерства</Table.Th>
                      <Table.Th>Умения класса</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedClass.progressions.map((prog) => (
                      <Table.Tr key={prog.level}>
                        <Table.Td fw={700}>{prog.level}</Table.Td>
                        <Table.Td>+{prog.proficiencyBonus}</Table.Td>
                        <Table.Td>
                          {prog.classFeatures && prog.classFeatures.length > 0 ? (
                            <Group gap="xs">
                              {prog.classFeatures.map((feat, fIdx) => (
                                <Badge
                                  key={fIdx}
                                  variant="outline"
                                  color="gray"
                                  title={feat.description?.text}
                                >
                                  {feat.name}
                                </Badge>
                              ))}
                            </Group>
                          ) : (
                            <Text size="xs" c="dimmed" fs="italic">
                              Выдающихся умений нет
                            </Text>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            </Box>
          )}
        </Stack>
      </Container>
    );
  }

  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Классы персонажей</Title>
            <Text c="dimmed">Магические, боевые и сакральные пути героев</Text>
          </Stack>
          {adminMode && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => openEditor(null)}>
              Добавить класс
            </Button>
          )}
        </Group>

        <TextInput
          placeholder="Поиск классов персонажей..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ maxWidth: '400px' }}
        />

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredClasses.map((c) => (
            <Card
              key={c.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedClass(c)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" style={{ overflow: 'hidden' }}>
                  <IconShield
                    size={20}
                    style={{ color: 'var(--mantine-color-red-filled)', flexShrink: 0 }}
                  />
                  <Title order={4} lineClamp={1}>
                    {c.name}
                  </Title>
                </Group>
                <Group gap={4}>
                  {adminMode && (
                    <>
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditor(c);
                        }}
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={(e) => handleDeleteClass(c.id, e)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </>
                  )}
                  <ActionIcon variant="subtle" color="gray">
                    <IconEye size={14} />
                  </ActionIcon>
                </Group>
              </Group>
              <Group gap={4} mt="xs">
                <Badge size="xs" variant="light" color="red">
                  Hit Die: d{c.hitDieSides}
                </Badge>
                <Badge size="xs" variant="light" color="blue">
                  Спасброски: {formatSavingThrows(c.savingThrows)}
                </Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      {/* Admin Operations Modal Workspace */}
      <Modal
        opened={editorOpened}
        onClose={() => setEditorOpened(false)}
        title={editingClassId ? 'Редактирование параметров класса' : 'Создание нового класса'}
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
                    label="Название игрового класса"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <NumberInput
                    label="Кость хитов (Hit Die Sides)"
                    value={editHitDieSides}
                    onChange={(val) => setEditHitDieSides(Number(val))}
                    min={4}
                    max={12}
                    step={2}
                  />

                  <Box mt="xs">
                    <Text size="sm" fw={500} mb={6}>
                      Владение спасбросками (Saving Throws)
                    </Text>
                    <SimpleGrid cols={2} spacing="xs">
                      {SAVING_THROWS.map((flag) => (
                        <Checkbox
                          key={flag.value}
                          label={flag.label}
                          checked={(editSavesMask & flag.value) !== 0}
                          onChange={(e) =>
                            handleToggleSaveFlag(flag.value, e.currentTarget.checked)
                          }
                        />
                      ))}
                    </SimpleGrid>
                  </Box>

                  <Box mt="sm">
                    <Text size="sm" fw={500} mb={4}>
                      Текст детального описания и особенностей
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
                <Title order={2}>{editName || 'Название нового класса'}</Title>
                <Group gap="xs" mt="xs" mb="lg">
                  <Badge color="red">Кость хитов: d{editHitDieSides}</Badge>
                  <Badge color="blue">Спасброски: {formatSavingThrows(editSavesMask)}</Badge>
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
              onClick={handleSaveClass}
              loading={submitting}
            >
              Сохранить изменения
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
