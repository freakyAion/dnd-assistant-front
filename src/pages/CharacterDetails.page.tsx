import { useEffect, useState } from 'react';
import { IconArrowLeft, IconMessage, IconShield, IconUser } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { CharacterCardData, MOCK_PCS } from '../types/character';

export function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<CharacterCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacterData = () => {
      setLoading(true);
      setTimeout(() => {
        const found = MOCK_PCS.find((pc) => pc.id === id);
        setCharacter(found || null);
        setLoading(false);
      }, 150);
    };

    fetchCharacterData();
  }, [id]);

  if (loading) return <Text p="md">Загрузка листа персонажа...</Text>;
  if (!character)
    return (
      <Text p="md" c="red">
        Персонаж не найден или удален.
      </Text>
    );

  return (
    // Replaced Container with Box set to 100% width and minimal padding
    <Box style={{ width: '100%' }} p="xs">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate('/characters/me')}
        mb="md"
      >
        Назад к списку
      </Button>

      {/* Grid grow option ensures items expand naturally across the available space */}
      <Grid gutter="md" grow>
        {/* LEFT COLUMN: HERO SUMMARY */}
        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
          <Card withBorder radius="md" padding="xl" shadow="sm" h="100%">
            <Stack align="center" gap="xs">
              <Paper
                radius="xl"
                p="md"
                withBorder
                style={{ backgroundColor: 'var(--mantine-color-gray-light)' }}
              >
                <IconUser size={48} />
              </Paper>
              <Title order={2} ta="center">
                {character.name}
              </Title>
              <Text c="dimmed" size="sm">
                {character.alignment}
              </Text>

              <Group gap="xs" mt="sm">
                <Badge color="grape" size="lg" variant="light">
                  {character.race}
                </Badge>
                <Badge color="blue" size="lg" variant="light">
                  {character.className} {character.level}
                </Badge>
              </Group>
            </Stack>

            <Divider my="xl" />

            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">
                  Пол:
                </Text>
                <Text size="sm">{character.sex}</Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={500} c="dimmed">
                  Возраст:
                </Text>
                <Text size="sm">{character.age}</Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        {/* RIGHT COLUMN: CORE CHARACTERISTICS & STORY DETAILS */}
        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
          <Stack gap="md" h="100%">
            <Card withBorder radius="md" padding="lg" shadow="sm">
              <Group mb="md" gap="xs">
                <IconShield size={20} />
                <Title order={4}>Внешность и особенности</Title>
              </Group>
              <Text size="sm" c="dimmed">
                Поля внешности, цвета волос и глаз будут обрабатываться динамически через JSONB
                столбцы С# моделей.
              </Text>
            </Card>

            <Card withBorder radius="md" padding="lg" shadow="sm" style={{ flexGrow: 1 }}>
              <Group mb="md" gap="xs">
                <IconMessage size={20} />
                <Title order={4}>Предыстория (Backstory)</Title>
              </Group>
              <Text size="sm" style={{ lineHeight: 1.6 }}>
                Здесь будет отображаться текстовое содержимое предыстории вашего персонажа,
                подгружаемое напрямую из базы данных PostgreSQL.
              </Text>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
