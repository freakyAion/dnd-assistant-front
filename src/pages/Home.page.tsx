// src/pages/Home.page.tsx
import {
  IconArrowRight,
  IconBook,
  IconClock,
  IconFlame,
  IconPlus,
  IconSwords,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';

// --- Mock Data ---
const STATS = [
  { title: 'Активные кампании', value: '3', icon: IconSwords, color: 'red' },
  { title: 'Создано миров', value: '2', icon: IconWorld, color: 'blue' },
  { title: 'NPC и Персонажи', value: '42', icon: IconUsers, color: 'grape' },
  { title: 'Статьи базы знаний', value: '128', icon: IconBook, color: 'teal' },
];

const ACTIVE_CAMPAIGNS = [
  {
    title: 'Major Arcanas',
    world: 'Arcane Forge',
    players: 4,
    nextSession: 'Четверг, 19:00',
    progress: 65,
  },
  {
    title: 'Пески Амонхета',
    world: 'Пустоши',
    players: 3,
    nextSession: 'Суббота, 14:00',
    progress: 30,
  },
];

const RECENT_WIKI = [
  { title: 'Алхимические зелья: Тир 2', category: 'Механики', time: '2 часа назад' },
  { title: 'Эвриала (Горгона Босс)', category: 'NPC', time: '5 часов назад' },
  { title: 'Синдикат Железного Лотоса', category: 'Организации', time: 'Вчера' },
  { title: 'Ссет (Нага Торговец)', category: 'NPC', time: 'Вчера' },
];

export function HomePage() {
  return (
    <Stack gap="xl" p="md">
      {/* Hero Section - Directly highlighting the diploma's thesis */}
      <Card shadow="sm" padding="xl" radius="md" withBorder>
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Badge color="indigo" variant="light" mb="sm">
              НРИ Инструментарий v0.1
            </Badge>
            <Title order={1} mb="xs">
              Добро пожаловать
            </Title>
            <Text c="dimmed" size="lg" mb="md" maw={600}>
              Интерактивный портал, объединяющий две важнейшие функции для проведения настольных
              ролевых игр: <b>структурированную базу знаний</b> и <b>инструмент ведения партий</b>.
            </Text>
            <Group>
              <Button
                component={Link}
                to="/worlds"
                leftSection={<IconSwords size={18} />}
                color="indigo"
              >
                К кампаниям
              </Button>
              <Button
                component={Link}
                to="/editor"
                variant="outline"
                leftSection={<IconBook size={18} />}
              >
                Открыть базу знаний
              </Button>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Group justify="flex-end">
              <ThemeIcon size={120} radius="100%" variant="light" color="indigo">
                <IconFlame size={60} />
              </ThemeIcon>
            </Group>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Quick Stats Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {STATS.map((stat) => (
          <Card key={stat.title} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed" fw={500}>
                {stat.title}
              </Text>
              <ThemeIcon color={stat.color} variant="light" size={38} radius="md">
                <stat.icon size={20} />
              </ThemeIcon>
            </Group>
            <Text fw={700} size="xl">
              {stat.value}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      {/* Split Content: Campaign Management vs Knowledge Base */}
      <Grid gutter="lg">
        {/* Left Column: Campaign Management */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Group justify="space-between" mb="md">
            <Title order={3}>Инструмент ведения партий</Title>
            <ActionIcon variant="light" color="indigo">
              <IconPlus size={18} />
            </ActionIcon>
          </Group>

          <Stack gap="md">
            {ACTIVE_CAMPAIGNS.map((campaign) => (
              <Card key={campaign.title} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mb="sm">
                  <div>
                    <Text fw={600} size="lg">
                      {campaign.title}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Мир: {campaign.world}
                    </Text>
                  </div>
                  <Badge color="green" variant="dot">
                    Следующая: {campaign.nextSession}
                  </Badge>
                </Group>

                <Group justify="space-between" mt="md" mb="xs">
                  <Text size="sm" c="dimmed">
                    Прогресс сюжета
                  </Text>
                  <Text size="sm" fw={500}>
                    {campaign.progress}%
                  </Text>
                </Group>
                <Progress value={campaign.progress} color="indigo" size="sm" radius="xl" />

                <Group justify="space-between" mt="md">
                  <Avatar.Group spacing="sm">
                    <Avatar radius="xl" color="blue">
                      В
                    </Avatar>
                    <Avatar radius="xl" color="teal">
                      С
                    </Avatar>
                    <Avatar radius="xl" color="grape">
                      Э
                    </Avatar>
                    <Avatar radius="xl">+1</Avatar>
                  </Avatar.Group>
                  <Button variant="light" size="xs" rightSection={<IconArrowRight size={14} />}>
                    Игровая комната
                  </Button>
                </Group>
              </Card>
            ))}
          </Stack>
        </Grid.Col>

        {/* Right Column: Knowledge Base */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Group justify="space-between" mb="md">
            <Title order={3}>База знаний</Title>
            <Button variant="subtle" size="xs">
              Смотреть все
            </Button>
          </Group>

          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="sm">
              {RECENT_WIKI.map((item, index) => (
                <Group
                  key={index}
                  justify="space-between"
                  wrap="nowrap"
                  style={{
                    borderBottom:
                      index !== RECENT_WIKI.length - 1
                        ? '1px solid var(--mantine-color-gray-8)'
                        : 'none',
                    paddingBottom: index !== RECENT_WIKI.length - 1 ? '12px' : '0',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {item.title}
                    </Text>
                    <Group gap="xs" mt={4}>
                      <Badge size="xs" variant="outline" color="gray">
                        {item.category}
                      </Badge>
                      <Group gap={4} c="dimmed">
                        <IconClock size={12} />
                        <Text size="xs">{item.time}</Text>
                      </Group>
                    </Group>
                  </div>
                  <ActionIcon variant="subtle" color="gray">
                    <IconArrowRight size={16} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>
            <Button
              fullWidth
              variant="light"
              color="gray"
              mt="md"
              leftSection={<IconPlus size={16} />}
            >
              Новая запись
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
