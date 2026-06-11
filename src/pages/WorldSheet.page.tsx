import { useEffect, useState } from 'react';
import {
  IconArrowLeft,
  IconBook,
  IconCalendar,
  IconClock,
  IconMapPins,
  IconUsers,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Container, Group, Loader, Stack, Tabs, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CampaignsModule } from '@/components/World/CampaignsModule';
import { HistoryModule } from '@/components/World/HistoryModule';
import { LocationsModule } from '@/components/World/LocationsModule';
import { NpcsModule } from '@/components/World/NPCsModule';
import { WorldDescriptionModule } from '@/components/World/WorldDescriptionModule';
import { getUserId } from '@/store/auth';
import { getWorldDetails, World } from '../api/api';
import { ArticleRenderer, Block } from '../components/ArticleRenderer/ArticleRenderer';

export function WorldSheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [world, setWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUserId = getUserId(); // Fetch the active user's ID
  const isOwner = world?.ownerID === currentUserId;

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getWorldDetails(id)
      .then((res) => setWorld(res.data))
      .catch(() => {
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить данные мира. Возможно, у вас нет доступа.',
          color: 'red',
        });
        navigate('/worlds');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <Stack align="center" justify="center" mt="xl" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Чтение свитков...</Text>
      </Stack>
    );
  }

  if (!world) return <Text>Мир не найден</Text>;

  return (
    <Container fluid p={0}>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/worlds')}
              p={0}
              w="fit-content"
              color="gray"
            >
              К списку миров
            </Button>
            <Title order={1}>{world.name}</Title>
            <Group gap="xs">
              <Badge color={world.isPublic ? 'green' : 'gray'}>
                {world.isPublic ? 'Открытый' : 'Приватный'}
              </Badge>
            </Group>
          </Stack>
        </Group>

        <Tabs defaultValue="lore" variant="outline" radius="md">
          <Tabs.List>
            <Tabs.Tab value="lore" leftSection={<IconBook size={16} />}>
              Описание
            </Tabs.Tab>
            <Tabs.Tab value="locations" leftSection={<IconMapPins size={16} />}>
              Локации ({world.locations?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="npcs" leftSection={<IconUsers size={16} />}>
              NPC ({world.npcs?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconClock size={16} />}>
              История ({world.historicalEvents?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="campaigns" leftSection={<IconCalendar size={16} />}>
              Игровые столы
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="lore" pt="xl">
            <WorldDescriptionModule
              worldId={world.id}
              initialDescription={world.description}
              isOwner={isOwner}
              onDescriptionUpdated={(updatedDesc) => {
                setWorld((prev) => {
                  if (!prev) return null;
                  return { ...prev, description: updatedDesc };
                });
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="locations" pt="xl">
            <LocationsModule
              worldId={world.id}
              initialLocations={world.locations || []}
              initialMapUrl={world.mapImageUrl}
              isOwner={isOwner}
            />
          </Tabs.Panel>

          <Tabs.Panel value="npcs" pt="xl">
            <NpcsModule
              worldId={world.id}
              initialNpcs={world.npcs || []}
              isOwner={isOwner}
              onNpcAdded={(newNpc) => {
                setWorld((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    npcs: [...(prev.npcs || []), newNpc],
                  };
                });
              }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="xl">
            <HistoryModule
              worldId={world.id}
              initialEvents={world.historicalEvents || []}
              isOwner={isOwner}
            />
          </Tabs.Panel>

          <Tabs.Panel value="campaigns" pt="xl">
            <CampaignsModule worldId={world.id} isOwner={isOwner} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
