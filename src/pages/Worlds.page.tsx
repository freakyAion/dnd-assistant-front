// src/pages/Worlds.page.tsx
import { useState } from 'react';
import { IconDots, IconGlobe, IconLock, IconPlus, IconWorld } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Menu,
  Stack,
  Text,
  Title,
} from '@mantine/core';

// Local mock data to visualize the root nodes
const MOCK_WORLDS = [
  {
    id: '1',
    name: 'Arcane Forge',
    pitch:
      'A high-magic industrial setting where alchemy and machinery collide, ruled by fractured syndicates.',
    isPublic: false,
    campaignCount: 3,
    npcCount: 42,
  },
  {
    id: '2',
    name: 'Shattered Isles',
    pitch:
      'An oceanic setting focused on survival, naval combat, and discovering ancient sunken ruins.',
    isPublic: true,
    campaignCount: 1,
    npcCount: 15,
  },
];

export function WorldsPage() {
  const [worlds] = useState(MOCK_WORLDS);

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2} mb="xs">
            Мои миры
          </Title>
          <Text c="dimmed">Глобальные сеттинги для ваших кампаний</Text>
        </div>
        <Button
          component={Link}
          to="/worlds/new"
          leftSection={<IconPlus size={16} />}
          color="indigo"
        >
          Создать мир
        </Button>
      </Group>

      <Grid>
        {worlds.map((world) => (
          <Grid.Col key={world.id} span={{ base: 12, md: 6, xl: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack justify="space-between" h="100%">
                <div>
                  <Group justify="space-between" mb="sm">
                    <Group gap="xs">
                      <IconGlobe size={24} color="gray" />
                      <Text fw={600} size="xl">
                        {world.name}
                      </Text>
                    </Group>
                    <Menu shadow="md" width={150}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item>Настройки мира</Menu.Item>
                        <Menu.Item color="red">Удалить</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>

                  <Group gap="xs" mb="md">
                    {world.isPublic ? (
                      <Badge leftSection={<IconWorld size={12} />} color="green" variant="light">
                        Публичный
                      </Badge>
                    ) : (
                      <Badge leftSection={<IconLock size={12} />} color="red" variant="light">
                        Приватный
                      </Badge>
                    )}
                    <Badge color="gray" variant="outline">
                      {world.campaignCount} Кампаний
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={3}>
                    {world.pitch}
                  </Text>
                </div>

                <Button
                  component={Link}
                  to={`/worlds/${world.id}`}
                  variant="light"
                  color="indigo"
                  fullWidth
                  mt="md"
                >
                  Войти в мир
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
