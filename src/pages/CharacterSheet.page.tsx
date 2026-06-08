import { useEffect, useState } from 'react';
import {
  IconBook,
  IconBriefcase,
  IconChevronLeft,
  IconFileText,
  IconHeart,
  IconLock,
  IconShield,
  IconSword,
  IconWorld,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Character, getCharacterSheet, updateCharacterVisibility } from '../api/api';

const calculateModifier = (score: number) => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  useEffect(() => {
    if (!id) return;

    getCharacterSheet(id)
      .then((res) => {
        setCharacter(res.data);
        setIsPublic(res.data.isPublic);

        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          try {
            const payload = JSON.parse(atob(savedToken.split('.')[1]));
            const currentUserId =
              payload.sub ||
              payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
            setIsOwner(res.data.userId === currentUserId);
          } catch {
            setIsOwner(false);
          }
        }
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить лист персонажа или доступ ограничен',
          color: 'red',
        })
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleVisibilityToggle = (checked: boolean) => {
    if (!id) return;
    setUpdatingVisibility(true);
    updateCharacterVisibility(id, checked)
      .then(() => {
        setIsPublic(checked);
        notifications.show({
          message: checked
            ? 'Персонаж теперь открыт для просмотра по ссылке'
            : 'Персонаж скрыт от внешних пользователей',
          color: 'green',
        });
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось обновить настройки приватности',
          color: 'red',
        })
      )
      .finally(() => setUpdatingVisibility(false));
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Считывание параметров листа персонажа...</Text>
      </Stack>
    );
  }

  if (!character)
    return (
      <Text c="red" p="xl">
        Персонаж не найден или к нему ограничен доступ.
      </Text>
    );

  const stats = [
    { label: 'Сила (STR)', score: character.strength },
    { label: 'Ловкость (DEX)', score: character.dexterity },
    { label: 'Телосложение (CON)', score: character.constitution },
    { label: 'Интеллект (INT)', score: character.intelligence },
    { label: 'Мудрость (WIS)', score: character.wisdom },
    { label: 'Харизма (CHA)', score: character.charisma },
  ];

  return (
    <Container fluid p={0}>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={16} />}
            onClick={() => navigate('/characters')}
            p={0}
          >
            Назад к списку
          </Button>

          {isOwner ? (
            <Switch
              checked={isPublic}
              disabled={updatingVisibility}
              label={isPublic ? 'Публичный доступ включен' : 'Приватный режим'}
              thumbIcon={
                isPublic ? (
                  <IconWorld size={12} color="green" />
                ) : (
                  <IconLock size={12} color="gray" />
                )
              }
              onChange={(e) => handleVisibilityToggle(e.currentTarget.checked)}
            />
          ) : (
            <Badge color="violet" size="lg" variant="light">
              Режим просмотра по ссылке
            </Badge>
          )}
        </Group>

        {/* --- IDENTITY BLOCK --- */}
        <Card bg="var(--mantine-color-gray-light)" p="md" radius="md" withBorder={false}>
          <Group justify="space-between" align="flex-end">
            <Stack gap="xs">
              <Title order={1}>{character.name}</Title>
              <Group gap="xs">
                <Text fw={600} c="red.8">
                  {character.class?.name} {character.level} ур.
                </Text>
                <Text c="dimmed">|</Text>
                <Text fw={600}>{character.species?.name}</Text>
                <Text c="dimmed">|</Text>
                <Text size="sm" c="dimmed">
                  {character.alignment}
                </Text>
              </Group>
            </Stack>
            <Stack gap={2} style={{ textAlign: 'right' }}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Опыт (XP)
              </Text>
              <Text fw={700} size="xl">
                {character.experiencePoints}
              </Text>
            </Stack>
          </Group>
        </Card>

        <Tabs defaultValue="combat">
          <Tabs.List>
            <Tabs.Tab value="combat" leftSection={<IconSword size={14} />}>
              Бой и Навыки
            </Tabs.Tab>
            <Tabs.Tab value="inventory" leftSection={<IconBriefcase size={14} />}>
              Инвентарь
            </Tabs.Tab>
            <Tabs.Tab value="spells" leftSection={<IconBook size={14} />}>
              Заклинания
            </Tabs.Tab>
            <Tabs.Tab value="bio" leftSection={<IconFileText size={14} />}>
              Биография
            </Tabs.Tab>
          </Tabs.List>

          {/* --- COMBAT SHEET VIEW --- */}
          <Tabs.Panel value="combat" pt="md">
            <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
              <Stack gap="xs">
                {stats.map((s) => (
                  <Card
                    key={s.label}
                    withBorder
                    padding="xs"
                    radius="sm"
                    style={{ textAlign: 'center' }}
                  >
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                      {s.label}
                    </Text>
                    <Title order={2} my={2}>
                      {s.score}
                    </Title>
                    <Badge variant="light" size="sm">
                      {calculateModifier(s.score)}
                    </Badge>
                  </Card>
                ))}
              </Stack>

              <Stack gap="md" style={{ gridColumn: 'span 3' }}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                  <Card
                    withBorder
                    padding="md"
                    bg="red.0"
                    style={{ borderColor: 'var(--mantine-color-red-light)' }}
                  >
                    <Group justify="space-between">
                      <Text fw={700} c="red.9">
                        Хит-Поинты (HP)
                      </Text>
                      <IconHeart size={18} style={{ color: 'var(--mantine-color-red-filled)' }} />
                    </Group>
                    <Title order={2} mt="xs">
                      {character.currentHitPoints} / {character.maxHitPoints}
                    </Title>
                  </Card>

                  <Card withBorder padding="md" bg="blue.0">
                    <Group justify="space-between">
                      <Text fw={700} c="blue.9">
                        Класс Доспеха (AC)
                      </Text>
                      <IconShield size={18} style={{ color: 'var(--mantine-color-blue-filled)' }} />
                    </Group>
                    <Title order={2} mt="xs">
                      {10 + Math.floor((character.dexterity - 10) / 2)}
                    </Title>
                  </Card>

                  <Card withBorder padding="md" style={{ textAlign: 'center' }}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Скорость
                    </Text>
                    <Title order={2} mt="xs">
                      {character.currentSpeedOverride > 0 ? character.currentSpeedOverride : 30} фт.
                    </Title>
                  </Card>
                </SimpleGrid>

                <Card withBorder padding="md">
                  <Title order={3} mb="sm">
                    Врожденные особенности и черты
                  </Title>
                  <Stack gap="xs">
                    {character.species?.traits?.map((t: any, idx: number) => (
                      <Text key={idx} size="sm">
                        <Text component="span" fw={700} c="blue">
                          {t.name}:
                        </Text>{' '}
                        {t.description?.text}
                      </Text>
                    ))}
                    {character.background?.features?.map((f: any, idx: number) => (
                      <Text key={idx} size="sm">
                        <Text component="span" fw={700} c="green">
                          {f.name}:
                        </Text>{' '}
                        {f.description?.text}
                      </Text>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </SimpleGrid>
          </Tabs.Panel>

          {/* --- INVENTORY PANELS --- */}
          <Tabs.Panel value="inventory" pt="md">
            <Card withBorder padding="md">
              <Title order={3} mb="sm">
                Содержимое рюкзака
              </Title>
              {!character.inventory || character.inventory.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Инвентарь пуст.
                </Text>
              ) : (
                <Stack gap="xs">
                  {character.inventory.map((ci) => (
                    <Group
                      key={ci.id}
                      justify="space-between"
                      p="xs"
                      style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                    >
                      <Group gap="xs">
                        <Text fw={600}>{ci.item?.name}</Text>
                        <Badge size="xs" variant="outline">
                          x{ci.quantity}
                        </Badge>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              )}
            </Card>
          </Tabs.Panel>

          {/* --- SPELLBOOK PANEL --- */}
          <Tabs.Panel value="spells" pt="md">
            <Card withBorder padding="md">
              <Title order={3} mb="sm">
                Книга заклинаний
              </Title>
              {!character.spells || character.spells.length === 0 ? (
                <Text c="dimmed" size="sm">
                  Нет известных заклинаний.
                </Text>
              ) : (
                <Stack gap="xs">
                  {character.spells.map((cs) => (
                    <Group
                      key={cs.id}
                      justify="space-between"
                      p="xs"
                      style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                    >
                      <Text fw={600}>{cs.spell?.name}</Text>
                    </Group>
                  ))}
                </Stack>
              )}
            </Card>
          </Tabs.Panel>

          {/* --- BIOGRAPHY PANEL --- */}
          <Tabs.Panel value="bio" pt="md">
            <Stack gap="md">
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                <Card withBorder padding="xs">
                  <Text size="xs" c="dimmed">
                    Возраст
                  </Text>
                  <Text fw={600}>{character.age || '—'}</Text>
                </Card>
                <Card withBorder padding="xs">
                  <Text size="xs" c="dimmed">
                    Рост
                  </Text>
                  <Text fw={600}>{character.height || '—'}</Text>
                </Card>
                <Card withBorder padding="xs">
                  <Text size="xs" c="dimmed">
                    Вес
                  </Text>
                  <Text fw={600}>{character.weight || '—'}</Text>
                </Card>
              </SimpleGrid>

              <Card withBorder padding="md">
                <Text fw={700} size="lg" mb="xs">
                  Внешность
                </Text>
                <Text size="sm" style={{ lineHeight: 1.6 }}>
                  {character.physicalAppearance || 'Описание внешности отсутствует...'}
                </Text>
              </Card>

              <Card withBorder padding="md">
                <Text fw={700} size="lg" mb="xs">
                  Предыстория и мотивы
                </Text>
                <Text size="sm" style={{ lineHeight: 1.6 }}>
                  {character.biography || 'Биография не заполнена...'}
                </Text>
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
