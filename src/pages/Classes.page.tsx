// src/pages/Classes.page.tsx
import { useState } from 'react';
import { IconAdjustmentsHorizontal, IconSearch } from '@tabler/icons-react';
import { Badge, Button, Card, Grid, Group, Stack, Text, TextInput, Title } from '@mantine/core';

const MOCK_CLASSES = [
  {
    id: '1',
    name: 'Изобретатель',
    hitDie: 'd8',
    primaryAbility: 'Интеллект',
    saves: ['Интеллект', 'Телосложение'],
    source: 'Tasha',
    isHomebrew: false,
  },
  {
    id: '2',
    name: 'Мастер Рун',
    hitDie: 'd10',
    primaryAbility: 'Сила / Интеллект',
    saves: ['Сила', 'Интеллект'],
    source: 'Arcane Forge',
    isHomebrew: true,
  },
  {
    id: '3',
    name: 'Воин',
    hitDie: 'd10',
    primaryAbility: 'Сила / Ловкость',
    saves: ['Сила', 'Телосложение'],
    source: 'PHB',
    isHomebrew: false,
  },
];

export function ClassesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = MOCK_CLASSES.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Stack gap="lg" p="md">
      <div>
        <Title order={2} mb="xs">
          Классы
        </Title>
        <Text c="dimmed">Игровые классы и их базовые характеристики</Text>
      </div>

      <Group>
        <TextInput
          placeholder="Поиск класса..."
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
        {filteredClasses.map((cls) => (
          <Grid.Col key={cls.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack justify="space-between" h="100%">
                <div>
                  <Group justify="space-between" mb="xs">
                    <Text fw={500} size="lg">
                      {cls.name}
                    </Text>
                    {cls.isHomebrew && (
                      <Badge color="violet" variant="filled">
                        Homebrew
                      </Badge>
                    )}
                  </Group>
                  <Group gap="xs" mb="md">
                    <Badge color="red" variant="light">
                      HP: {cls.hitDie}
                    </Badge>
                    <Badge color="blue" variant="light">
                      {cls.primaryAbility}
                    </Badge>
                  </Group>
                  <Text size="sm" mb="xs">
                    <b>Спасброски:</b> {cls.saves.join(', ')}
                  </Text>
                </div>
                <Text size="xs" c="dimmed" mt="md" ta="right">
                  Источник: {cls.source}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
