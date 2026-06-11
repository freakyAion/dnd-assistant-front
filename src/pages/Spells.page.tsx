import { useEffect, useState } from 'react';
import {
  IconCheck,
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconSparkles,
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
import { createSpell, deleteSpell, getSpells, Spell, updateSpell } from '../api/api';
import { ArticleEditor } from '../components/ArticleEditor/ArticleEditor';
import { ArticleRenderer, Block } from '../components/ArticleRenderer/ArticleRenderer';
import { IsAdmin } from '../store/auth';

const formatCastingTimeType = (type: string | number) => {
  const mapping: Record<string | number, string> = {
    0: 'Действие',
    Action: 'Действие',
    1: 'Бонусное действие',
    BonusAction: 'Бонусное действие',
    2: 'Реакция',
    Reaction: 'Реакция',
    3: 'Минута',
    Minute: 'Минута',
    4: 'Час',
    Hour: 'Час',
  };
  return mapping[type] || String(type);
};

const formatSchoolName = (school: string | number) => {
  const mapping: Record<string | number, string> = {
    0: 'Ограждение (Abjuration)',
    1: 'Вызов (Conjuration)',
    2: 'Прорицание (Divination)',
    3: 'Очарование (Enchantment)',
    4: 'Воплощение (Evocation)',
    5: 'Иллюзия (Illusion)',
    6: 'Некромантия (Necromancy)',
    7: 'Преобразование (Transmutation)',
  };
  return mapping[school] || String(school);
};

// TODO: Write this out in Russian

const SCHOOL_OPTIONS = [
  { value: 'Abjuration', label: 'Ограждение (Abjuration)' },
  { value: 'Conjuration', label: 'Вызов (Conjuration)' },
  { value: 'Divination', label: 'Прорицание (Divination)' },
  { value: 'Enchantment', label: 'Очарование (Enchantment)' },
  { value: 'Evocation', label: 'Воплощение (Evocation)' },
  { value: 'Illusion', label: 'Иллюзия (Illusion)' },
  { value: 'Necromancy', label: 'Некромантия (Necromancy)' },
  { value: 'Transmutation', label: 'Преобразование (Transmutation)' },
];

const CASTING_TIME_OPTIONS = [
  { value: 'Action', label: 'Действие' },
  { value: 'BonusAction', label: 'Бонусное действие' },
  { value: 'Reaction', label: 'Реакция' },
  { value: 'Minute', label: 'Минута' },
  { value: 'Hour', label: 'Час' },
];

const RANGE_UNIT_OPTIONS = [
  { value: 'Self', label: 'На себя (Self)' },
  { value: 'Touch', label: 'Касание (Touch)' },
  { value: 'Feet', label: 'Футы (Feet)' },
  { value: 'Miles', label: 'Мили (Miles)' },
  { value: 'Sight', label: 'В пределах видимости (Sight)' },
  { value: 'Unlimited', label: 'Неограниченная (Unlimited)' },
];

const DURATION_UNIT_OPTIONS = [
  { value: 'Instantaneous', label: 'Мгновенная' },
  { value: 'Round', label: 'Раунд' },
  { value: 'Minute', label: 'Минута' },
  { value: 'Hour', label: 'Час' },
  { value: 'Day', label: 'День' },
  { value: 'UntilDispelled', label: 'Пока не рассеется' },
];

export function SpellsPage() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const adminMode = IsAdmin();

  const [levelFilters, setLevelFilters] = useState<string[]>([]);
  const [schoolFilters, setSchoolFilters] = useState<string[]>([]);
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

  // Admin Upsert Form States
  const [editorOpened, setEditorOpened] = useState(false);
  const [editingSpellId, setEditingSpellId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editName, setEditName] = useState('');
  const [editLevel, setEditLevel] = useState<number>(0);
  const [editSchool, setEditSchool] = useState('Evocation');
  const [editCastingValue, setEditCastingValue] = useState<number>(1);
  const [editCastingType, setEditCastingType] = useState('Action');
  const [editRangeUnits, setEditRangeUnits] = useState('Feet');
  const [editRangeValue, setEditRangeValue] = useState<number | undefined>(60);
  const [editDurationUnits, setEditDurationUnits] = useState('Instantaneous');
  const [editConcentration, setEditConcentration] = useState(false);
  const [editMaterial, setEditMaterial] = useState('');
  const [editBlocks, setEditBlocks] = useState<any[]>([]);

  const fetchSpellsList = () => {
    setLoading(true);
    getSpells()
      .then((res) => setSpells(res.data))
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить заклинания',
          color: 'red',
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSpellsList();
  }, []);

  const openEditor = (spell: Spell | null = null) => {
    if (spell) {
      setEditingSpellId(spell.id);
      setEditName(spell.name);
      setEditLevel(spell.level);
      setEditSchool(String(spell.school));
      setEditCastingValue(spell.castingTimeValue);
      setEditCastingType(spell.castingTimeType);
      setEditRangeUnits(spell.rangeUnits);
      setEditRangeValue(spell.rangeValue);
      setEditDurationUnits(spell.durationUnits);
      setEditConcentration(spell.requiresConcentration);
      setEditMaterial(spell.materialComponents || '');
      setEditBlocks(spell.description?.blocks || []);
    } else {
      setEditingSpellId(null);
      setEditName('');
      setEditLevel(0);
      setEditSchool('Evocation');
      setEditCastingValue(1);
      setEditCastingType('Action');
      setEditRangeUnits('Feet');
      setEditRangeValue(60);
      setEditDurationUnits('Instantaneous');
      setEditConcentration(false);
      setEditMaterial('');
      setEditBlocks([]);
    }
    setEditorOpened(true);
  };

  const handleSaveSpell = async () => {
    if (!editName.trim()) {
      notifications.show({ title: 'Ошибка', message: 'Введите название заклинания', color: 'red' });
      return;
    }

    setSubmitting(true);
    const payload: Omit<Spell, 'id'> = {
      name: editName,
      level: editLevel,
      school: editSchool,
      castingTimeValue: editCastingValue,
      castingTimeType: editCastingType,
      rangeUnits: editRangeUnits,
      rangeValue: editRangeValue,
      components: editMaterial.trim() ? 7 : 3, // Simplistic flags fallback if custom picker isn't rendered
      materialComponents: editMaterial.trim() ? editMaterial : undefined,
      durationUnits: editDurationUnits,
      requiresConcentration: editConcentration,
      description: { blocks: editBlocks },
    };

    try {
      if (editingSpellId) {
        await updateSpell(editingSpellId, payload);
        notifications.show({
          title: 'Успех',
          message: 'Манускрипт заклинания успешно обновлен',
          color: 'green',
        });
      } else {
        await createSpell(payload);
        notifications.show({
          title: 'Успех',
          message: 'Новое знание добавлено в книгу магии',
          color: 'green',
        });
      }
      setEditorOpened(false);
      setSelectedSpell(null);
      fetchSpellsList();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось сохранить заклинание',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSpell = async (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!window.confirm('Вы уверены, что хотите навсегда стереть это заклинание из архивов?'))
      return;

    try {
      await deleteSpell(id);
      notifications.show({
        title: 'Стерто',
        message: 'Заклинание удалено из общей базы знаний',
        color: 'gray',
      });
      setSelectedSpell(null);
      fetchSpellsList();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить заклинание',
        color: 'red',
      });
    }
  };

  const filteredSpells = spells.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilters.length === 0 || levelFilters.includes(s.level.toString());
    const matchesSchool = schoolFilters.length === 0 || schoolFilters.includes(s.school.toString());
    return matchesSearch && matchesLevel && matchesSchool;
  });

  const uniqueSchools = Array.from(new Set(spells.map((s) => s.school))).map((s) => ({
    value: String(s),
    label: formatSchoolName(s),
  }));

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Сортировка магических свитков...</Text>
      </Stack>
    );
  }

  if (selectedSpell) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<IconX size={16} />}
              onClick={() => setSelectedSpell(null)}
              p={0}
              color="gray"
            >
              Назад к свиткам
            </Button>
            <Group gap="xs">
              {adminMode && (
                <Group gap={4} mr="xs">
                  <Button
                    size="xs"
                    variant="outline"
                    leftSection={<IconEdit size={14} />}
                    onClick={() => openEditor(selectedSpell)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => handleDeleteSpell(selectedSpell.id)}
                  >
                    Удалить
                  </Button>
                </Group>
              )}
              <Badge color="purple" size="lg">
                {formatSchoolName(selectedSpell.school)}
              </Badge>
              <Badge color="blue" size="lg">
                {selectedSpell.level === 0 ? 'Заговор' : `${selectedSpell.level} Уровень`}
              </Badge>
              {selectedSpell.requiresConcentration && (
                <Badge color="red" size="lg">
                  Концентрация
                </Badge>
              )}
            </Group>
          </Group>

          <Title order={1}>{selectedSpell.name}</Title>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm" mt="xs">
            <Card withBorder padding="xs" radius="sm">
              <Text size="xs" c="dimmed">
                Время накладывания
              </Text>
              <Text fw={600}>
                {selectedSpell.castingTimeValue}{' '}
                {formatCastingTimeType(selectedSpell.castingTimeType)}
              </Text>
            </Card>
            <Card withBorder padding="xs" radius="sm">
              <Text size="xs" c="dimmed">
                Дистанция
              </Text>
              <Text fw={600}>
                {selectedSpell.rangeUnits === 'Touch'
                  ? 'Касание'
                  : `${selectedSpell.rangeValue || ''} ${selectedSpell.rangeUnits}`}
              </Text>
            </Card>
            <Card withBorder padding="xs" radius="sm">
              <Text size="xs" c="dimmed">
                Длительность
              </Text>
              <Text fw={600}>{selectedSpell.durationUnits}</Text>
            </Card>
            <Card withBorder padding="xs" radius="sm">
              <Text size="xs" c="dimmed">
                Область действия
              </Text>
              <Text fw={600}>
                {selectedSpell.aoeType
                  ? `${selectedSpell.aoeType} (${selectedSpell.aoeValue} фт)`
                  : 'Одиночная цель'}
              </Text>
            </Card>
          </SimpleGrid>

          <Box mt="md">
            {selectedSpell.description?.blocks?.length > 0 ? (
              <ArticleRenderer
                article={{ title: '', content: selectedSpell.description.blocks as Block[] }}
              />
            ) : (
              <Text c="dimmed" fs="italic">
                Описание отсутствует.
              </Text>
            )}

            {selectedSpell.materialComponents && (
              <Text
                size="sm"
                c="dimmed"
                bg="var(--mantine-color-gray-light)"
                p="xs"
                mt="md"
                style={{ borderRadius: '4px' }}
              >
                <strong>Компоненты:</strong> {selectedSpell.materialComponents}
              </Text>
            )}
          </Box>
        </Stack>
      </Container>
    );
  }

  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Книга заклинаний</Title>
            <Text c="dimmed">Список доступных мистических и божественных заклинаний</Text>
          </Stack>
          {adminMode && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => openEditor(null)}>
              Добавить заклинание
            </Button>
          )}
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3, md: 3 }} spacing="sm">
          <TextInput
            placeholder="Поиск заклинаний..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <MultiSelect
            placeholder="Уровни заклинаний"
            clearable
            data={[
              { value: '0', label: 'Заговор (0)' },
              { value: '1', label: '1-й уровень' },
              { value: '2', label: '2-й уровень' },
              { value: '3', label: '3-й уровень' },
              { value: '4', label: '4-й уровень' },
              { value: '5', label: '5-й уровень' },
              { value: '6', label: '6-й уровень' },
              { value: '7', label: '7-й уровень' },
              { value: '8', label: '8-й уровень' },
              { value: '9', label: '9-й уровень' },
            ]}
            value={levelFilters}
            onChange={setLevelFilters}
          />
          <MultiSelect
            placeholder="Школы магии"
            clearable
            data={uniqueSchools}
            value={schoolFilters}
            onChange={setSchoolFilters}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredSpells.map((s) => (
            <Card
              key={s.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedSpell(s)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" style={{ overflow: 'hidden' }}>
                  <IconSparkles
                    size={20}
                    style={{ color: 'var(--mantine-color-purple-filled)', flexShrink: 0 }}
                  />
                  <Title order={4} lineClamp={1}>
                    {s.name}
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
                          openEditor(s);
                        }}
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={(e) => handleDeleteSpell(s.id, e)}
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
                <Badge size="xs" variant="light" color="purple">
                  {formatSchoolName(s.school)}
                </Badge>
                <Badge size="xs" variant="light" color="blue">
                  {s.level === 0 ? 'Заговор' : `${s.level} lvl`}
                </Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>

      {/* Admin Creator Workspace Modal */}
      <Modal
        opened={editorOpened}
        onClose={() => setEditorOpened(false)}
        title={editingSpellId ? 'Редактирование заклинания' : 'Добавление заклинания в базу'}
        size="100%"
        radius="md"
      >
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder radius="sm">
                <Title order={4} mb="sm">
                  Параметры заклинания
                </Title>
                <Stack gap="xs">
                  <TextInput
                    label="Название заклинания"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <Group grow>
                    <NumberInput
                      label="Круг заклинания"
                      value={editLevel}
                      onChange={(val) => setEditLevel(Number(val))}
                      min={0}
                      max={9}
                    />
                    <Select
                      label="Школа магии"
                      value={editSchool}
                      data={SCHOOL_OPTIONS}
                      onChange={(val) => setEditSchool(val || 'Evocation')}
                    />
                  </Group>
                  <Group grow>
                    <NumberInput
                      label="Время (Значение)"
                      value={editCastingValue}
                      onChange={(val) => setEditCastingValue(Number(val))}
                      min={1}
                    />
                    <Select
                      label="Тип времени наложения"
                      value={editCastingType}
                      data={CASTING_TIME_OPTIONS}
                      onChange={(val) => setEditCastingType(val || 'Action')}
                    />
                  </Group>
                  <Group grow>
                    <Select
                      label="Единицы дистанции"
                      value={editRangeUnits}
                      data={RANGE_UNIT_OPTIONS}
                      onChange={(val) => setEditRangeUnits(val || 'Feet')}
                    />
                    <NumberInput
                      label="Значение дистанции"
                      value={editRangeValue}
                      onChange={(val) => setEditRangeValue(val ? Number(val) : undefined)}
                      min={0}
                    />
                  </Group>
                  <Group grow>
                    <Select
                      label="Длительность"
                      value={editDurationUnits}
                      data={DURATION_UNIT_OPTIONS}
                      onChange={(val) => setEditDurationUnits(val || 'Instantaneous')}
                    />
                    <TextInput
                      label="Материальные компоненты"
                      value={editMaterial}
                      placeholder="кусочек шерсти"
                      onChange={(e) => setEditMaterial(e.target.value)}
                    />
                  </Group>

                  <Checkbox
                    label="Требует концентрацию"
                    checked={editConcentration}
                    onChange={(e) => setEditConcentration(e.currentTarget.checked)}
                    mt="xs"
                  />

                  <Box mt="xs">
                    <Text size="sm" fw={500} mb={4}>
                      Текст описания заклинания
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
                Живой предпросмотр элемента библиотечной карточки:
              </Text>
              <Paper
                p="xl"
                withBorder
                radius="md"
                shadow="xs"
                style={{ minHeight: '400px', height: '100%' }}
              >
                <Title order={2}>{editName || 'Название заклинания'}</Title>
                <Group gap="xs" mt="xs" mb="md">
                  <Badge color="purple">{formatSchoolName(editSchool)}</Badge>
                  <Badge color="blue">{editLevel === 0 ? 'Заговор' : `${editLevel} Уровень`}</Badge>
                  {editConcentration && <Badge color="red">Концентрация</Badge>}
                </Group>

                <SimpleGrid cols={2} mb="lg">
                  <Text size="sm">
                    <b>Время наложения:</b> {editCastingValue}{' '}
                    {formatCastingTimeType(editCastingType)}
                  </Text>
                  <Text size="sm">
                    <b>Дистанция:</b>{' '}
                    {editRangeUnits === 'Touch'
                      ? 'Касание'
                      : `${editRangeValue || ''} ${editRangeUnits}`}
                  </Text>
                  <Text size="sm">
                    <b>Длительность:</b> {editDurationUnits}
                  </Text>
                </SimpleGrid>

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
              onClick={handleSaveSpell}
              loading={submitting}
            >
              Сохранить в книгу
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
