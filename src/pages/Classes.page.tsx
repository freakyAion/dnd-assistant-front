import { useEffect, useState } from 'react';
import {
  IconBook,
  IconChevronLeft,
  IconHeart,
  IconList,
  IconSearch,
  IconSword,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  MultiSelect,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ClassData, getClassById, getClasses } from '../api/api';

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

export function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [hitDiceFilters, setHitDiceFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>('progression');

  useEffect(() => {
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
  }, []);

  const handleSelectClass = (id: string) => {
    setDetailLoading(true);
    getClassById(id)
      .then((res) => {
        setSelectedClass(res.data);
        setActiveTab('progression');
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить детали класса',
          color: 'red',
        })
      )
      .finally(() => setDetailLoading(false));
  };

  const filteredClasses = classes.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesHitDice =
      hitDiceFilters.length === 0 || hitDiceFilters.includes(c.hitDieSides.toString());
    return matchesSearch && matchesHitDice;
  });

  const uniqueHitDiceOptions = Array.from(new Set(classes.map((c) => c.hitDieSides)))
    .sort((a, b) => a - b)
    .map((sides) => ({
      value: sides.toString(),
      label: `d${sides}`,
    }));

  const hasSpells = selectedClass?.progressions?.some(
    (p) => p.spellSlots && Object.keys(p.spellSlots).length > 0
  );

  const maxSpellLevel =
    selectedClass?.progressions?.reduce((max, p) => {
      if (!p.spellSlots) return max;
      const levels = Object.keys(p.spellSlots).map(Number);
      return Math.max(max, ...levels, 0);
    }, 0) || 0;

  if (loading || detailLoading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Сборка конфигураций классов...</Text>
      </Stack>
    );
  }

  // --- DETAILED INLINE VIEW ---
  if (selectedClass) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group>
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft size={16} />}
              onClick={() => setSelectedClass(null)}
              p={0}
            >
              Назад к классам
            </Button>
          </Group>

          <Group justify="space-between" align="center">
            {/* Target gap fixed to xs */}
            <Stack gap="xs">
              <Title order={1}>{selectedClass.name}</Title>
              <Text size="lg" c="dimmed">
                {selectedClass.description?.text}
              </Text>
            </Stack>
            <Group gap="xs">
              <Badge size="xl" variant="light" leftSection={<IconHeart size={14} />}>
                d{selectedClass.hitDieSides} Хит-дайс
              </Badge>
            </Group>
          </Group>

          <Tabs value={activeTab} onChange={setActiveTab} variant="outline" mt="md">
            <Tabs.List>
              <Tabs.Tab value="progression" leftSection={<IconList size={16} />}>
                Развитие класса
              </Tabs.Tab>
              {selectedClass.spells && selectedClass.spells.length > 0 && (
                <Tabs.Tab value="spells" leftSection={<IconBook size={16} />}>
                  Заклинания класса
                </Tabs.Tab>
              )}
            </Tabs.List>

            <Tabs.Panel value="progression" pt="md">
              <Table striped withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 80 }} ta="center">
                      Уровень
                    </Table.Th>
                    <Table.Th style={{ width: 120 }} ta="center">
                      Бонус мастерства
                    </Table.Th>
                    <Table.Th>Умения класса</Table.Th>
                    {hasSpells &&
                      Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map((lvl) => (
                        <Table.Th key={lvl} style={{ width: 60 }} ta="center">
                          {lvl} круг
                        </Table.Th>
                      ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedClass.progressions?.map((prog) => (
                    <Table.Tr key={prog.level}>
                      <Table.Td fw={700} ta="center">
                        {prog.level}
                      </Table.Td>
                      <Table.Td ta="center">+{prog.proficiencyBonus}</Table.Td>
                      <Table.Td>
                        <Stack gap="xs">
                          {prog.classFeatures?.map((f, i) => (
                            <div key={i}>
                              <Text fw={600} size="sm">
                                {f.name}
                              </Text>
                              {f.description?.text && (
                                <Text size="xs" c="dimmed">
                                  {f.description.text}
                                </Text>
                              )}
                            </div>
                          ))}
                          {(!prog.classFeatures || prog.classFeatures.length === 0) && (
                            <Text size="sm" c="dimmed">
                              —
                            </Text>
                          )}
                        </Stack>
                      </Table.Td>
                      {hasSpells &&
                        Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map((lvl) => {
                          const slots = prog.spellSlots?.[lvl] || 0;
                          return (
                            <Table.Td
                              key={lvl}
                              ta="center"
                              fw={slots > 0 ? 600 : 400}
                              c={slots > 0 ? undefined : 'dimmed'}
                            >
                              {slots > 0 ? slots : '—'}
                            </Table.Td>
                          );
                        })}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Tabs.Panel>

            <Tabs.Panel value="spells" pt="md">
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {selectedClass.spells?.map((spell) => (
                  <Card key={spell.id} withBorder padding="md" radius="md">
                    <Stack gap="xs">
                      <Group justify="space-between" wrap="nowrap">
                        <Title order={4} lineClamp={1}>
                          {spell.name}
                        </Title>
                        <Badge size="xs" color="blue">
                          {spell.level === 0 ? 'Заговор' : `${spell.level} lvl`}
                        </Badge>
                      </Group>
                      <Text size="xs" color="purple" fw={500}>
                        {formatSchoolName(spell.school)}
                      </Text>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {spell.description?.blocks?.find((b) => b.type === 'paragraph')?.text ||
                          'Описание отсутствует...'}
                      </Text>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    );
  }

  // --- OVERVIEW LIST VIEW ---
  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        {/* Target gap fixed to xs */}
        <Stack gap="xs">
          <Title order={1}>Классы персонажей</Title>
          <Text c="dimmed">
            Выберите базовый архетип вашего персонажа для просмотра таблицы умений и заклинаний
          </Text>
        </Stack>

        {/* Filters consolidated inline using SimpleGrid structure matching Spells and Items pages */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TextInput
            placeholder="Поиск класса..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <MultiSelect
            placeholder="Кости Хитов (Hit Dice)"
            clearable
            data={uniqueHitDiceOptions}
            value={hitDiceFilters}
            onChange={setHitDiceFilters}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredClasses.map((c) => (
            <Card
              key={c.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectClass(c.id)}
            >
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <IconSword size={20} style={{ color: 'var(--mantine-color-blue-filled)' }} />
                  <Title order={3}>{c.name}</Title>
                </Group>
                <Badge variant="light">d{c.hitDieSides}</Badge>
              </Group>
              <Text size="sm" c="dimmed" lineClamp={3}>
                {c.description?.text || 'Описание отсутствует...'}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
