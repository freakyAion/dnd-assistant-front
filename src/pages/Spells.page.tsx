import { useEffect, useState } from 'react';
import { IconEye, IconSearch, IconSparkles, IconX } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  MultiSelect,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getSpells, Spell } from '../api/api';

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

export function SpellsPage() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Array states to track multiple selections from MultiSelect arrays
  const [levelFilters, setLevelFilters] = useState<string[]>([]);
  const [schoolFilters, setSchoolFilters] = useState<string[]>([]);

  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);

  useEffect(() => {
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
  }, []);

  // Multi-selection matching filter logic
  const filteredSpells = spells.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());

    // If the array is empty, we don't filter out anything; otherwise, check if it's included
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
            >
              Назад к свиткам
            </Button>
            <Group gap="xs">
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

          <Stack gap="sm" mt="md">
            {selectedSpell.description?.blocks?.map((block, idx) =>
              block.type === 'paragraph' ? (
                <Text key={idx} size="lg" style={{ lineHeight: 1.6 }}>
                  {block.text}
                </Text>
              ) : null
            )}
            {selectedSpell.materialComponents && (
              <Text
                size="sm"
                c="dimmed"
                bg="var(--mantine-color-gray-light)"
                p="xs"
                style={{ borderRadius: '4px' }}
              >
                <strong>Компоненты:</strong> {selectedSpell.materialComponents}
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
        <Stack gap="xs">
          <Title order={1}>Книга заклинаний</Title>
          <Text c="dimmed">Список доступных мистических и божественных заклинаний</Text>
        </Stack>

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
                <ActionIcon variant="subtle" color="gray">
                  <IconEye size={14} />
                </ActionIcon>
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
    </Container>
  );
}
