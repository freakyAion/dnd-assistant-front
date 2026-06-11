import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, Loader, Paper, Select, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import api, { getInviteDetails, joinCampaign } from '@/api/api';

export function JoinCampaignPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<{ id: string; name: string; worldName: string } | null>(
    null
  );
  const [characters, setCharacters] = useState<{ id: string; name: string }[]>([]);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);

    Promise.all([getInviteDetails(code), api.get<{ id: string; name: string }[]>('/characters')])
      .then(([inviteRes, charRes]) => {
        setInvite(inviteRes.data);
        setCharacters(charRes.data);
      })
      .catch(() => {
        notifications.show({
          title: 'Ошибка',
          message: 'Недействительный код приглашения или ошибка сети',
          color: 'red',
        });
        navigate('/worlds');
      })
      .finally(() => setLoading(false));
  }, [code, navigate]);

  const handleJoin = async () => {
    if (!code || !selectedChar) return;
    try {
      await joinCampaign(code, selectedChar);
      notifications.show({
        title: 'Успех',
        message: 'Вы успешно присоединились к приключению!',
        color: 'green',
      });
      navigate('/worlds');
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось вступить в кампанию. Возможно, персонаж уже добавлен.',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" mt="xl" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Проверка свитка приглашения...</Text>
      </Stack>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Paper withBorder p="xl" radius="md" shadow="sm">
        <Stack gap="md" align="center">
          <Title order={2}>Вступление в игру</Title>
          <Text size="lg" ta="center">
            Вас пригласили в кампанию <b>{invite?.name}</b> по миру <b>{invite?.worldName}</b>!
          </Text>

          <Select
            label="Выберите вашего персонажа для этой игры"
            placeholder="Выберите героя"
            data={characters.map((c) => ({ value: c.id, label: c.name }))}
            value={selectedChar}
            onChange={setSelectedChar}
            w="100%"
            required
          />

          <Button
            disabled={!selectedChar}
            onClick={handleJoin}
            color="green"
            size="md"
            fullWidth
            mt="md"
          >
            Подтвердить участие и войти
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
