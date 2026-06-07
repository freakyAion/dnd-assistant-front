// src/pages/WorldDashboard.page.tsx
import {
  IconBook,
  IconDots,
  IconMap2,
  IconPlus,
  IconSettings,
  IconSwords,
  IconUsers,
} from '@tabler/icons-react';
import { Link, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Menu,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { Article, ArticleRenderer } from '../components/ArticleRenderer/ArticleRenderer'; // Adjust import path

// Simulated JSONB Data for Arcane Forge
const MOCK_WORLD_ARTICLE: Article = {
  title: 'Arcane Forge',
  content: [
    {
      type: 'paragraph',
      spans: [
        {
          type: 'text',
          text: 'Высокомагический индустриальный сеттинг, где алхимия сплетается с тяжелой машинерией, а власть разделена между расколотыми синдикатами.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Глобальные механики' },
    {
      type: 'paragraph',
      spans: [
        { type: 'text', text: 'В этом мире действует переработанная ' },
        { type: 'colored', text: 'система алхимических зелий', color: 'violet' },
        { type: 'text', text: ', требующая особых ингредиентов и ' },
        { type: 'italic', text: 'инструментов алхимика' },
        {
          type: 'text',
          text: '. Магия не дается бесплатно — каждое мощное заклинание оставляет след на окружении.',
        },
      ],
    },
    { type: 'heading', level: 2, text: 'Основные фракции' },
    {
      type: 'paragraph',
      spans: [
        { type: 'text', text: 'Помимо классических рас, этот мир населяют нестандартные виды. ' },
        { type: 'link', text: 'Горгоны', href: '/books/species', external: false },
        { type: 'text', text: ' контролируют подземные торговые пути, а кочевники-' },
        { type: 'link', text: 'Наги', href: '/books/species', external: false },
        { type: 'text', text: ' господствуют в южных пустошах.' },
      ],
    },
  ],
};

export function WorldDashboardPage() {
  const { worldId } = useParams();

  // In a real app, use worldId to fetch data. For the MVP, we use the mock.

  return (
    <Stack gap="lg" p="md">
      {/* Header Section */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Group gap="sm" mb="xs">
            <Title order={1}>{MOCK_WORLD_ARTICLE.title}</Title>
            <Badge color="violet" variant="light">
              Кастомный сеттинг
            </Badge>
          </Group>
          <Text c="dimmed">ID Мира: {worldId || 'local-preview'}</Text>
        </div>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button variant="default" leftSection={<IconSettings size={16} />}>
              Управление миром
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconSettings size={14} />}>Редактировать описание</Menu.Item>
            <Menu.Item leftSection={<IconUsers size={14} />}>Настройки доступа</Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red">Удалить мир</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      {/* Main Navigation Tabs */}
      <Tabs defaultValue="overview" variant="pills" radius="md">
        <Tabs.List mb="xl">
          <Tabs.Tab value="overview" leftSection={<IconBook size={16} />}>
            Энциклопедия
          </Tabs.Tab>
          <Tabs.Tab value="campaigns" leftSection={<IconSwords size={16} />}>
            Кампании
          </Tabs.Tab>
          <Tabs.Tab value="atlas" leftSection={<IconMap2 size={16} />}>
            Атлас
          </Tabs.Tab>
          <Tabs.Tab value="npc" leftSection={<IconUsers size={16} />}>
            NPC и Фракции
          </Tabs.Tab>
        </Tabs.List>

        {/* Tab Content: Encyclopedia / Overview */}
        <Tabs.Panel value="overview">
          <Card shadow="sm" padding="xl" radius="md" withBorder>
            <ArticleRenderer article={MOCK_WORLD_ARTICLE} />
          </Card>
        </Tabs.Panel>

        {/* Tab Content: Campaigns Placeholder for MVP */}
        <Tabs.Panel value="campaigns">
          <Group justify="space-between" mb="md">
            <Title order={3}>Активные кампании</Title>
            <Button leftSection={<IconPlus size={16} />} color="indigo">
              Новая кампания
            </Button>
          </Group>
          <Grid>
            {/* Example Campaign Card */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text fw={500} size="lg">
                    Major Arcanas
                  </Text>
                  <Badge color="green" variant="dot">
                    В процессе
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                  Группа из 4 игроков расследует появление древних артефактов.
                </Text>
                <Group justify="space-between">
                  <Text size="sm">
                    Сессий: <b>12</b>
                  </Text>
                  <Button variant="light" size="xs">
                    Перейти
                  </Button>
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        {/* Tab Content: Atlas Placeholder */}
        <Tabs.Panel value="atlas">
          <Card
            shadow="none"
            bg="var(--mantine-color-gray-0)"
            p="xl"
            style={{ textAlign: 'center', borderRadius: '8px' }}
          >
            <IconMap2
              size={48}
              color="var(--mantine-color-gray-4)"
              style={{ marginBottom: '16px' }}
            />
            <Title order={4} c="dimmed">
              Карта мира пока пуста
            </Title>
            <Text c="dimmed" size="sm" mt="sm">
              Здесь будут отображаться связанные локации и интерактивная карта.
            </Text>
          </Card>
        </Tabs.Panel>

        {/* Tab Content: NPC Placeholder */}
        <Tabs.Panel value="npc">
          <Card
            shadow="none"
            bg="var(--mantine-color-gray-0)"
            p="xl"
            style={{ textAlign: 'center', borderRadius: '8px' }}
          >
            <IconUsers
              size={48}
              color="var(--mantine-color-gray-4)"
              style={{ marginBottom: '16px' }}
            />
            <Title order={4} c="dimmed">
              База данных NPC
            </Title>
            <Text c="dimmed" size="sm" mt="sm">
              Общий реестр всех персонажей, привязанных к этому миру, независимо от кампании.
            </Text>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
