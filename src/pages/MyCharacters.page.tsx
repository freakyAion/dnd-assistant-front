import { useState } from 'react';
import {
  IconAdjustmentsHorizontal,
  IconDots,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Drawer,
  Grid,
  Group,
  Menu,
  RangeSlider,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MOCK_PCS } from '../types/character'; // Clean import

export function CharactersPage() {
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<[number, number]>([1, 20]);

  const filteredPCs = MOCK_PCS.filter((pc) => {
    const matchesSearch =
      pc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pc.race.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass ? pc.className === filterClass : true;
    const matchesLevel = pc.level >= filterLevel[0] && pc.level <= filterLevel[1];
    return matchesSearch && matchesClass && matchesLevel;
  });

  return (
    <Stack gap="lg" p="md">
      <Drawer opened={opened} onClose={close} title="Фильтры персонажей" position="right">
        <Stack gap="md">
          <Select
            label="Класс"
            placeholder="Выберите класс"
            data={['Изобретатель', 'Воин', 'Чародей', 'Варвар', 'Плут', 'Паладин']}
            value={filterClass}
            onChange={setFilterClass}
            clearable
          />
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Уровень ({filterLevel[0]} - {filterLevel[1]})
            </Text>
            <RangeSlider min={1} max={20} value={filterLevel} onChange={setFilterLevel} />
          </Box>
          <Button
            variant="outline"
            mt="xl"
            onClick={() => {
              setFilterClass(null);
              setFilterLevel([1, 20]);
            }}
          >
            Сбросить фильтры
          </Button>
        </Stack>
      </Drawer>

      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={2} mb="xs">
            Мои персонажи
          </Title>
          <Text c="dimmed">Управление вашими игровыми персонажами (PC)</Text>
        </div>
        <Button
          component={Link}
          to="/characters/new"
          leftSection={<IconPlus size={16} />}
          color="indigo"
        >
          Создать персонажа
        </Button>
      </Group>

      <Group>
        <TextInput
          placeholder="Поиск по имени или расе..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flexGrow: 1 }}
        />
        <Button
          variant="default"
          leftSection={<IconAdjustmentsHorizontal size={16} />}
          onClick={open}
        >
          Фильтры
        </Button>
      </Group>

      <Grid>
        {filteredPCs.map((pc) => (
          <Grid.Col key={pc.id} span={{ base: 12, sm: 6, md: 4, xl: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Stack justify="space-between" h="100%">
                <div>
                  <Group justify="space-between" mb="xs" align="flex-start">
                    {/* CLICK INTERACTION LINK */}
                    <Text
                      fw={500}
                      size="lg"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/characters/${pc.id}`)}
                    >
                      {pc.name}
                    </Text>

                    <Menu shadow="md" width={160} position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconPencil size={14} />}
                          onClick={() => navigate(`/characters/${pc.id}/edit`)}
                        >
                          Редактировать
                        </Menu.Item>
                        <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                          Удалить
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>

                  <Group gap="xs" mb="md">
                    <Badge color="grape" variant="light">
                      {pc.race}
                    </Badge>
                    <Badge color="blue" variant="light">
                      {pc.className} {pc.level}
                    </Badge>
                  </Group>

                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                      Пол: {pc.sex} | Возраст: {pc.age}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Мировоззрение: {pc.alignment}
                    </Text>
                  </Stack>
                </div>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
}
