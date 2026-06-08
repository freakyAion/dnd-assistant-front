import { useEffect, useState } from 'react';
import { Title, Text, Card, Stack, SimpleGrid, Badge, Group, Button, Loader, Container, TextInput, Divider } from '@mantine/core';
import { IconChevronLeft, IconSearch, IconBriefcase } from '@tabler/icons-react';
import { getBackgrounds, Background } from '../api/api';
import { notifications } from '@mantine/notifications';

export function BackgroundsPage() {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getBackgrounds()
      .then((res) => setBackgrounds(Array.isArray(res.data) ? res.data : []))
      .catch(() => notifications.show({ title: 'Ошибка', message: 'Не удалось загрузить предыстории', color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  const filteredBackgrounds = backgrounds.filter((b) => {
    if (!b || !b.name) return false;
    return b.name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Летопись прошлых заслуг и предысторий...</Text>
      </Stack>
    );
  }

  if (selectedBackground) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group>
            <Button variant="subtle" leftSection={<IconChevronLeft size={16} />} onClick={() => setSelectedBackground(null)} p={0}>
              Назад к предысториям
            </Button>
          </Group>

          <Stack gap="xs">
            <Title order={1}>{selectedBackground.name}</Title>
            <Text size="lg" c="dimmed">{selectedBackground.description?.text}</Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
            <Card withBorder padding="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Бонусные навыки (Skills)</Text>
              <Text fw={600} size="md" mt={4}>{selectedBackground.skillProficiencies || 'Отсутствуют'}</Text>
            </Card>
            <Card withBorder padding="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Инструменты / Языки</Text>
              <Text fw={600} size="md" mt={4}>{selectedBackground.languagesOrTools || 'Отсутствуют'}</Text>
            </Card>
          </SimpleGrid>

          <Divider my="sm" />

          <Stack gap="md">
            <Title order={2}>Умения предыстории</Title>
            {selectedBackground.features?.map((feature, idx) => (
              <Card key={feature.id || idx} withBorder padding="lg" bg="var(--mantine-color-gray-light)" radius="md">
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconBriefcase size={20} style={{ color: 'var(--mantine-color-blue-filled)' }} />
                    <Text fw={700} size="lg">{feature.name}</Text>
                  </Group>
                  <Text size="sm" style={{ lineHeight: 1.6 }}>{feature.description?.text}</Text>
                </Stack>
              </Card>
            ))}
            {(!selectedBackground.features || selectedBackground.features.length === 0) && (
              <Text c="dimmed">Особые умения для этой предыстории отсутствуют.</Text>
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
          <Title order={1}>Предыстории персонажей (Backgrounds)</Title>
          <Text c="dimmed">Кем ваш герой был до того, как стал искателем приключений?</Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TextInput 
            placeholder="Поиск предыстории..." 
            leftSection={<IconSearch size={16} />} 
            value={search} 
            onChange={(e) => setSearch(e.currentTarget.value)} 
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredBackgrounds.map((b) => (
            <Card key={b.id} shadow="sm" padding="lg" radius="md" withBorder style={{ cursor: 'pointer' }} onClick={() => setSelectedBackground(b)}>
              <Stack gap="xs">
                <Title order={3}>{b.name}</Title>
                {b.skillProficiencies && <Text size="xs" c="blue" fw={600}>Навыки: {b.skillProficiencies}</Text>}
                <Text size="sm" c="dimmed" lineClamp={3}>{b.description?.text || 'Нажмите для просмотра особенностей...'}</Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}