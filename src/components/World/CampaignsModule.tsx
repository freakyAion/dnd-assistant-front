import { useEffect, useState } from 'react';
import { IconCalendar, IconCopy, IconLink, IconPlus, IconUsers } from '@tabler/icons-react';
import {
  Box,
  Button,
  Card,
  Code,
  Grid,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { Campaign, createCampaign, createSession, getCampaigns } from '@/api/api';

interface CampaignsModuleProps {
  worldId: string;
  isOwner: boolean;
}

export function CampaignsModule({ worldId, isOwner }: CampaignsModuleProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [sessionModalOpened, setSessionModalOpened] = useState(false);

  const [campaignName, setCampaignName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [sessionDate, setSessionDate] = useState<Date | null>(new Date());

  useEffect(() => {
    getCampaigns(worldId)
      .then((res) => {
        setCampaigns(res.data);
        if (res.data.length > 0) setSelectedCampaign(res.data[0]);
      })
      .catch(() => {
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить списки игровых столов.',
          color: 'red',
        });
      });
  }, [worldId]);

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) return;
    try {
      const res = await createCampaign({ name: campaignName, worldId });
      setCampaigns((prev) => [...prev, res.data]);
      setSelectedCampaign(res.data);
      setCampaignName('');
      setModalOpened(false);
      notifications.show({ title: 'Успех', message: 'Кампания запущена', color: 'green' });
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось создать игровую кампанию',
        color: 'red',
      });
    }
  };

  const handleCreateSession = async () => {
    if (!selectedCampaign || !sessionName.trim() || !sessionDate) return;
    try {
      const res = await createSession(selectedCampaign.id, {
        name: sessionName,
        scheduledAt: sessionDate,
      });
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === selectedCampaign.id ? { ...c, sessions: [...c.sessions, res.data] } : c
        )
      );
      setSelectedCampaign((prev) =>
        prev && prev.id === selectedCampaign.id
          ? { ...prev, sessions: [...prev.sessions, res.data] }
          : prev
      );
      setSessionName('');
      setSessionModalOpened(false);
      notifications.show({ title: 'Успех', message: 'Сессия добавлена', color: 'green' });
    } catch {
      notifications.show({ title: 'Ошибка', message: 'Не удалось сохранить сессию', color: 'red' });
    }
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(link);
    notifications.show({
      title: 'Скопировано',
      message: 'Ссылка отправлена в буфер обмена',
      color: 'blue',
    });
  };

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper withBorder p="md" radius="md">
          <Stack gap="sm">
            <Group justify="space-between">
              <Title order={4}>Игровые столы</Title>
              {isOwner && (
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={() => setModalOpened(true)}
                >
                  Создать
                </Button>
              )}
            </Group>
            {campaigns.length === 0 ? (
              <Text size="sm" c="dimmed">
                Нет запущенных кампаний.
              </Text>
            ) : (
              campaigns.map((c) => (
                <Card
                  key={c.id}
                  withBorder
                  onClick={() => setSelectedCampaign(c)}
                  style={{
                    cursor: 'pointer',
                    borderColor:
                      selectedCampaign?.id === c.id
                        ? 'var(--mantine-color-blue-filled)'
                        : undefined,
                  }}
                  p="sm"
                >
                  <Text fw={500}>{c.name}</Text>
                  <Text size="xs" c="dimmed">
                    Код: {c.inviteCode}
                  </Text>
                </Card>
              ))
            )}
          </Stack>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 8 }}>
        {selectedCampaign ? (
          <Stack gap="md">
            <Paper withBorder p="md" radius="md">
              <Group justify="space-between" align="center">
                <Box>
                  <Title order={3}>{selectedCampaign.name}</Title>
                  <Group gap="xs" mt={4}>
                    <IconLink size={14} color="gray" />
                    <Text size="xs" c="dimmed">
                      Ссылка для игроков:
                    </Text>
                    <Code
                      style={{ cursor: 'pointer' }}
                      onClick={() => copyInviteLink(selectedCampaign.inviteCode)}
                    >
                      {selectedCampaign.inviteCode} <IconCopy size={12} />
                    </Code>
                  </Group>
                </Box>
                {isOwner && (
                  <Button
                    leftSection={<IconCalendar size={16} />}
                    onClick={() => setSessionModalOpened(true)}
                  >
                    Добавить сессию
                  </Button>
                )}
              </Group>
            </Paper>

            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Paper withBorder p="md" radius="md" style={{ height: '100%' }}>
                  <Group gap="xs" mb="sm">
                    <IconUsers size={18} />
                    <Title order={4}>Участники</Title>
                  </Group>
                  {selectedCampaign.characters?.length === 0 ? (
                    <Text size="sm" c="dimmed">
                      За столом пока нет искателей приключений.
                    </Text>
                  ) : (
                    selectedCampaign.characters?.map((char) => (
                      <Card key={char.id} withBorder p="xs" mt="xs">
                        <Text size="sm" fw={500}>
                          {char.name}
                        </Text>
                      </Card>
                    ))
                  )}
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Paper withBorder p="md" radius="md" style={{ height: '100%' }}>
                  <Group gap="xs" mb="sm">
                    <IconCalendar size={18} />
                    <Title order={4}>История сессий</Title>
                  </Group>
                  {selectedCampaign.sessions?.length === 0 ? (
                    <Text size="sm" c="dimmed">
                      Нет запланированных игр.
                    </Text>
                  ) : (
                    selectedCampaign.sessions?.map((s) => (
                      <Card key={s.id} withBorder p="xs" mt="xs">
                        <Group justify="space-between">
                          <Box>
                            <Text size="sm" fw={500}>
                              #{s.sessionNumber} {s.name}
                            </Text>
                            {s.summary && (
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {s.summary}
                              </Text>
                            )}
                          </Box>
                          <Text size="xs" c="dimmed">
                            {new Date(s.scheduledAt).toLocaleDateString()}
                          </Text>
                        </Group>
                      </Card>
                    ))
                  )}
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        ) : (
          <Paper withBorder p="xl" radius="md" ta="center">
            <Text c="dimmed">Выберите или создайте игровую кампанию для начала работы.</Text>
          </Paper>
        )}
      </Grid.Col>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Новое приключение"
        centered
      >
        <Stack gap="sm">
          <TextInput
            label="Название кампании"
            placeholder="Хроники Забытых Королевств"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            required
          />
          <Button fullWidth onClick={handleCreateCampaign} mt="md">
            Создать стол
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={sessionModalOpened}
        onClose={() => setSessionModalOpened(false)}
        title="Запланировать сессию"
        centered
      >
        <Stack gap="sm">
          <TextInput
            label="Название сессии"
            placeholder="Сбор в таверне"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            required
          />
          <DateTimePicker
            label="Дата и время проведения"
            value={sessionDate}
            onChange={(value) => {
              if (!value) {
                setSessionDate(null);
              } else {
                setSessionDate(new Date(value));
              }
            }}
            required
          />
          <Button fullWidth onClick={handleCreateSession} mt="md">
            Зафиксировать дату
          </Button>
        </Stack>
      </Modal>
    </Grid>
  );
}
