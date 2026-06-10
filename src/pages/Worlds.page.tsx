import { useEffect, useState } from 'react';
import { IconGlobe, IconLock, IconPlus, IconSwords, IconWorld } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { createWorld, getJoinedWorlds, getMyWorlds, WorldSummary } from '../api/api';

export function WorldsPage() {
  const [myWorlds, setMyWorlds] = useState<WorldSummary[]>([]);
  const [joinedWorlds, setJoinedWorlds] = useState<WorldSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [opened, { open, close }] = useDisclosure(false);
  const [formName, setFormName] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchWorlds = () => {
    setLoading(true);
    Promise.all([getMyWorlds(), getJoinedWorlds()])
      .then(([myRes, joinedRes]) => {
        setMyWorlds(Array.isArray(myRes.data) ? myRes.data : []);
        setJoinedWorlds(Array.isArray(joinedRes.data) ? joinedRes.data : []);
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить ваши миры.',
          color: 'red',
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorlds();
  }, []);

  const handleCreateSubmit = () => {
    if (!formName.trim()) {
      notifications.show({
        title: 'Ошибка',
        message: 'Пожалуйста, укажите название мира.',
        color: 'red',
      });
      return;
    }

    setSubmitting(true);
    createWorld({
      name: formName,
      isPublic: formIsPublic,
      description: { blocks: [] },
    })
      .then((res) => {
        notifications.show({ message: 'Мир успешно создан!', color: 'green' });
        close();
        setFormName('');
        setFormIsPublic(false);
        navigate(`/worlds/${res.data.id}`);
      })
      .catch(() =>
        notifications.show({ title: 'Ошибка', message: 'Не удалось создать мир.', color: 'red' })
      )
      .finally(() => setSubmitting(false));
  };

  const renderWorldGrid = (worlds: WorldSummary[], emptyMessage: string) => {
    if (worlds.length === 0) {
      return (
        <Card withBorder padding="xl" radius="md" style={{ textAlign: 'center' }}>
          <Text c="dimmed" size="lg">
            {emptyMessage}
          </Text>
        </Card>
      );
    }

    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {worlds.map((world) => (
          <Card
            key={world.id}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/worlds/${world.id}`)}
          >
            <Stack gap="xs">
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Stack gap={2}>
                  <Group gap="xs" align="center">
                    <IconGlobe size={20} style={{ color: 'var(--mantine-color-blue-filled)' }} />
                    <Title order={3} lineClamp={1}>
                      {world.name}
                    </Title>
                  </Group>
                  <Group gap={4} mt={4}>
                    {world.isPublic ? (
                      <Badge size="xs" color="green" leftSection={<IconWorld size={10} />}>
                        Открытый
                      </Badge>
                    ) : (
                      <Badge size="xs" color="gray" leftSection={<IconLock size={10} />}>
                        Приватный
                      </Badge>
                    )}
                  </Group>
                </Stack>
              </Group>
              <Badge variant="light" color="violet" mt="sm">
                Активных кампаний: {world.campaignCount}
              </Badge>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>
    );
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Синхронизация временных линий...</Text>
      </Stack>
    );
  }

  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Миры</Title>
            <Text c="dimmed">
              Управляйте настройками своих кампаний или исследуйте миры, в которых играете.
            </Text>
          </Stack>
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Создать мир
          </Button>
        </Group>

        <Tabs defaultValue="dm" variant="outline" radius="md">
          <Tabs.List>
            <Tabs.Tab value="dm" leftSection={<IconGlobe size={16} />}>
              Мои миры (Мастер)
            </Tabs.Tab>
            <Tabs.Tab value="player" leftSection={<IconSwords size={16} />}>
              Присоединенные миры (Игрок)
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dm" pt="xl">
            {renderWorldGrid(myWorlds, 'Вы еще не создали ни одного мира.')}
          </Tabs.Panel>

          <Tabs.Panel value="player" pt="xl">
            {renderWorldGrid(joinedWorlds, 'Вы еще не присоединились ни к одной кампании.')}
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <Modal opened={opened} onClose={close} title="Создание нового мира" radius="md">
        <Stack gap="md">
          <TextInput
            label="Название мира"
            placeholder="например, Забытые Королевства, Эксандрия"
            required
            value={formName}
            onChange={(e) => setFormName(e.currentTarget.value)}
          />
          <Switch
            label="Сделать мир открытым"
            description="Позволяет другим игрокам видеть открытую историю и лор вашего мира."
            checked={formIsPublic}
            onChange={(e) => setFormIsPublic(e.currentTarget.checked)}
          />
          <Button color="green" onClick={handleCreateSubmit} loading={submitting} mt="md">
            Создать мир
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
}
