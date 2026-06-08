import { useEffect, useState } from 'react';
import { Title, Text, Card, Stack, SimpleGrid, Badge, Group, Button, Loader, Container, TextInput, MultiSelect, Divider } from '@mantine/core';
import { IconChevronLeft, IconSearch } from '@tabler/icons-react';
import { getSpecies, Species } from '../api/api';
import { notifications } from '@mantine/notifications';

// Helper function to map database size enum integers to human-readable names
const formatSizeName = (size: string | number) => {
  const mapping: Record<string | number, string> = {
    0: 'Крошечный (Tiny)',
    1: 'Маленький (Small)',
    2: 'Средний (Medium)',
    3: 'Большой (Large)',
  };
  return mapping[size] || String(size);
};

export function SpeciesPage() {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [sizeFilters, setSizeFilters] = useState<string[]>([]);

  useEffect(() => {
    getSpecies()
      .then((res) => setSpeciesList(Array.isArray(res.data) ? res.data : []))
      .catch(() => notifications.show({ title: 'Ошибка', message: 'Не удалось загрузить расы', color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  const filteredSpecies = speciesList.filter((s) => {
    if (!s || !s.name) return false;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesSize = sizeFilters.length === 0 || sizeFilters.includes(String(s.size));
    return matchesSearch && matchesSize;
  });

  const uniqueSizes = Array.from(new Set(speciesList.map((s) => s.size)))
    .filter((size) => size !== undefined && size !== null)
    .map((size) => ({
      value: String(size),
      label: formatSizeName(size),
    }));

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Загрузка генеалогического древа рас...</Text>
      </Stack>
    );
  }

  // --- DETAILED INLINE VIEW ---
  if (selectedSpecies) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group>
            <Button variant="subtle" leftSection={<IconChevronLeft size={16} />} onClick={() => setSelectedSpecies(null)} p={0}>
              Назад к расам
            </Button>
          </Group>

          <Group justify="space-between" align="center">
            <Stack gap="xs">
              <Title order={1}>{selectedSpecies.name}</Title>
              <Text size="lg" c="dimmed">{selectedSpecies.description?.text || 'Описание отсутствует...'}</Text>
            </Stack>
            <Group gap="xs">
              <Badge color="blue" size="xl">Размер: {formatSizeName(selectedSpecies.size)}</Badge>
              <Badge color="green" size="xl">Скорость: {selectedSpecies.speed} фт.</Badge>
            </Group>
          </Group>

          <Divider my="sm" />

          <Stack gap="md">
            <Title order={2}>Расовые особенности</Title>
            {selectedSpecies.traits?.map((trait, idx) => (
              <Card key={idx} withBorder padding="md" radius="sm">
                <Stack gap="xs">
                  <Text fw={700} size="lg" c="blue.8">{trait.name}</Text>
                  <Text size="sm" style={{ lineHeight: 1.6 }}>{trait.description?.text}</Text>
                </Stack>
              </Card>
            ))}
            {(!selectedSpecies.traits || selectedSpecies.traits.length === 0) && (
              <Text c="dimmed">У этой расы нет особых начальных черт.</Text>
            )}
          </Stack>
        </Stack>
      </Container>
    );
  }

  // --- OVERVIEW GRID VIEW ---
  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Расы и происхождения</Title>
          <Text c="dimmed">Выберите расу для вашего искателя приключений</Text>
        </Stack>

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
            value={Array.isArray(sizeFilters) ? sizeFilters.filter(v => typeof v === 'string').map(String) : []}
            onChange={(values) => setSizeFilters(values ? values.filter(v => typeof v === 'string') : [])}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredSpecies.map((s) => (
            <Card key={s.id} shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: 'pointer' }} onClick={() => setSelectedSpecies(s)}>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Title order={3}>{s.name}</Title>
                  <Badge variant="light">{formatSizeName(s.size)}</Badge>
                </Group>
                <Text size="sm" c="dimmed" lineClamp={3}>
                  {s.description?.text || 'Нажмите для просмотра деталей и расовых особенностей...'}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}