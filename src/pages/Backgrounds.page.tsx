// src/pages/Backgrounds.page.tsx
import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { Badge, Card, Grid, Group, Stack, Text, TextInput, Title } from '@mantine/core';

const MOCK_BACKGROUNDS = [
  {
    id: '1',
    name: 'Алхимик-отступник',
    skills: ['Природа', 'Медицина'],
    tools: ['Инструменты алхимика'],
    feature: 'Скрытая лаборатория',
  },
  {
    id: '2',
    name: 'Гладиатор',
    skills: ['Акробатика', 'Выступление'],
    tools: ['Грим', 'Необычное оружие'],
    feature: 'Любимец публики',
  },
  {
    id: '3',
    name: 'Аколит',
    skills: ['Религия', 'Проницательность'],
    tools: ['Нет'],
    feature: 'Убежище верующих',
  },
];

export function BackgroundsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBgs = MOCK_BACKGROUNDS.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Stack gap="lg" p="md">
      <div>
        <Title order={2} mb="xs">
          Предыстории
        </Title>
        <Text c="dimmed">Прошлое персонажа и стартовые навыки</Text>
      </div>

      <TextInput
        placeholder="Поиск предыстории..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
      />

      <Grid>
        {filteredBgs.map((bg) => (
          <Grid.Col key={bg.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack justify="space-between" h="100%">
                <div>
                  <Text fw={500} size="lg" mb="sm">
                    {bg.name}
                  </Text>
                  <Text size="sm" mb="xs">
                    <b>Навыки:</b> {bg.skills.join(', ')}
                  </Text>
                  <Text size="sm" mb="xs">
                    <b>Инструменты:</b> {bg.tools.join(', ')}
                  </Text>
                  <Text size="sm" c="indigo" mt="sm">
                    <b>Умение:</b> {bg.feature}
                  </Text>
                </div>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
