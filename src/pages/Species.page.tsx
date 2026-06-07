// src/pages/Species.page.tsx
import { useState } from 'react';
import { IconAdjustmentsHorizontal, IconSearch } from '@tabler/icons-react';
import { Badge, Button, Card, Grid, Group, Stack, Text, TextInput, Title } from '@mantine/core';

const MOCK_SPECIES = [
  {
    id: '1',
    name: 'Гоблин',
    size: 'Маленький',
    speed: '30 фт.',
    bonuses: '+2 ЛВК, +1 ТЕЛ',
    tags: ['Монстровидный', 'PHB'],
  },
  {
    id: '2',
    name: 'Нага',
    size: 'Средний',
    speed: '30 фт., 30 фт. плавание',
    bonuses: '+2 СИЛ, +1 ИНТ',
    tags: ['Змеевидный', 'Amonkhet'],
  },
  {
    id: '3',
    name: 'Горгона',
    size: 'Средний',
    speed: '30 фт.',
    bonuses: '+2 ХАР, +1 ТЕЛ',
    tags: ['Монстровидный', 'Arcane Forge', 'Окаменение'],
  },
];

export function SpeciesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpecies = MOCK_SPECIES.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Stack gap="lg" p="md">
      <div>
        <Title order={2} mb="xs">
          Расы и Виды
        </Title>
        <Text c="dimmed">Доступные виды существ для создания персонажа</Text>
      </div>

      <Group>
        <TextInput
          placeholder="Поиск вида..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flexGrow: 1 }}
        />
        <Button variant="default" leftSection={<IconAdjustmentsHorizontal size={16} />}>
          Фильтры
        </Button>
      </Group>

      <Grid>
        {filteredSpecies.map((species) => (
          <Grid.Col key={species.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack justify="space-between" h="100%">
                <div>
                  <Text fw={500} size="lg" mb="sm">
                    {species.name}
                  </Text>

                  <Group gap="xs" mb="md">
                    <Badge color="teal" variant="light">
                      {species.size}
                    </Badge>
                    <Badge color="gray" variant="light">
                      {species.speed}
                    </Badge>
                  </Group>

                  <Text size="sm" mb="xs">
                    <b>Увеличение хар-к:</b> {species.bonuses}
                  </Text>
                </div>

                <Group gap="xs" mt="md">
                  {species.tags.map((tag) => (
                    <Badge key={tag} color="indigo" variant="dot" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
