import { useEffect, useState } from 'react';
import {
  IconAlertTriangle,
  IconChevronLeft,
  IconSearch,
  IconShield,
  IconSword,
} from '@tabler/icons-react';
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  MultiSelect,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getItems, Item } from '../api/api';

const formatItemType = (type: string | number) => {
  const mapping: Record<string | number, string> = {
    0: 'Броня',
    1: 'Оружие',
    2: 'Снаряжение',
    3: 'Магический предмет',
  };
  return mapping[type] || String(type);
};

const formatRarityName = (rarity: string | number) => {
  const mapping: Record<string | number, string> = {
    0: 'Обычный',
    1: 'Необычный',
    2: 'Редкий',
    3: 'Очень редкий',
    4: 'Легендарный',
  };
  return mapping[rarity] || String(rarity);
};

const formatCurrencyName = (currency: string | number) => {
  const mapping: Record<string | number, string> = {
    0: 'мм',
    1: 'см',
    2: 'эм',
    3: 'зм',
    4: 'пм',
  };
  return mapping[currency] || String(currency);
};

const formatDamageType = (type: string | number) => {
  const mapping: Record<string | number, string> = {
    0: 'Дробящий',
    1: 'Колющий',
    2: 'Рубящий',
    3: 'Огонь',
    4: 'Холод',
    5: 'Электричество',
    6: 'Яд',
    7: 'Некротический',
    8: 'Психический',
    9: 'Излучение',
  };
  return mapping[type] || String(type);
};

export function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [rarityFilters, setRarityFilters] = useState<string[]>([]);

  // State for tracking inline detail selection
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    getItems()
      .then((res) => setItems(res.data))
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить снаряжение',
          color: 'red',
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilters.length === 0 || typeFilters.includes(i.type.toString());
    const matchesRarity = rarityFilters.length === 0 || rarityFilters.includes(i.rarity.toString());
    return matchesSearch && matchesType && matchesRarity;
  });

  const uniqueTypes = Array.from(new Set(items.map((i) => i.type))).map((t) => ({
    value: String(t),
    label: formatItemType(t),
  }));

  const uniqueRarities = Array.from(new Set(items.map((i) => i.rarity))).map((r) => ({
    value: String(r),
    label: formatRarityName(r),
  }));

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Инвентаризация арсенала...</Text>
      </Stack>
    );
  }

  // --- DETAILED INLINE VIEW ---
  if (selectedItem) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group>
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft size={16} />}
              onClick={() => setSelectedItem(null)}
              p={0}
            >
              Назад к снаряжению
            </Button>
          </Group>

          <Group justify="space-between" align="center">
            <Stack gap={0}>
              <Title order={1}>{selectedItem.name}</Title>
              <Group gap="xs" mt="xs">
                <Badge variant="light">{formatItemType(selectedItem.type)}</Badge>
                <Badge variant="outline" color="gray">
                  {formatRarityName(selectedItem.rarity)}
                </Badge>
              </Group>
            </Stack>
            <Stack gap={4} align="flex-end">
              <Text fw={700} size="xl" c="yellow.9">
                {selectedItem.costValue} {formatCurrencyName(selectedItem.costCurrency)}
              </Text>
              <Text size="sm" c="dimmed">
                {selectedItem.weight} фт.
              </Text>
            </Stack>
          </Group>

          {/* Conditional Layout Specs depending on item categories */}
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mt="md">
            {/* Weapon Parameters Block */}
            {selectedItem.damageDiceQuantity && (
              <Card withBorder padding="md" radius="sm">
                <Group gap="sm">
                  <IconSword size={24} style={{ color: 'var(--mantine-color-red-filled)' }} />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Боевой урон
                    </Text>
                    <Text fw={600} size="lg">
                      {selectedItem.damageDiceQuantity}d{selectedItem.damageDiceSides}{' '}
                      {formatDamageType(selectedItem.damageType || '')}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            )}

            {/* Armour Parameters Block */}
            {selectedItem.acValue && (
              <Card withBorder padding="md" radius="sm">
                <Group gap="sm">
                  <IconShield size={24} style={{ color: 'var(--mantine-color-blue-filled)' }} />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Класс Доспеха (AC)
                    </Text>
                    <Text fw={600} size="lg">
                      {selectedItem.acValue}{' '}
                      {selectedItem.acDexBonusType === 'None' ? '(Без Ловкости)' : '(+ Ловкость)'}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            )}

            {/* Strength Requirement Callout */}
            {selectedItem.strengthRequirement && selectedItem.strengthRequirement > 0 && (
              <Card withBorder padding="md" radius="sm">
                <Group gap="sm">
                  <IconAlertTriangle
                    size={24}
                    style={{ color: 'var(--mantine-color-orange-filled)' }}
                  />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Требование Силы
                    </Text>
                    <Text fw={600} size="lg">
                      Сила {selectedItem.strengthRequirement}+
                    </Text>
                  </Stack>
                </Group>
              </Card>
            )}
          </SimpleGrid>

          {/* Custom Property Flashes */}
          {selectedItem.stealthDisadvantage && (
            <Badge color="red" variant="light" size="lg" style={{ alignSelf: 'flex-start' }}>
              Помеха на Стелс (Stealth Disadvantage)
            </Badge>
          )}

          <Stack gap="sm" mt="md">
            <Title order={3}>Описание</Title>
            {selectedItem.description?.blocks?.map((block, idx) =>
              block.type === 'paragraph' ? (
                <Text key={idx} size="lg" style={{ lineHeight: 1.6 }}>
                  {block.text}
                </Text>
              ) : null
            )}
          </Stack>
        </Stack>
      </Container>
    );
  }

  // --- OVERVIEW GRID TABLE VIEW ---
  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Предметы и снаряжение</Title>
          <Text c="dimmed">Оружие, доспехи и предметы экипировки вашего отряда</Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          <TextInput
            placeholder="Поиск снаряжения..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <MultiSelect
            placeholder="Типы снаряжения"
            clearable
            data={uniqueTypes}
            value={typeFilters}
            onChange={setTypeFilters}
          />
          <MultiSelect
            placeholder="Редкость"
            clearable
            data={uniqueRarities}
            value={rarityFilters}
            onChange={setRarityFilters}
          />
        </SimpleGrid>

        <Table striped withTableBorder highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Название</Table.Th>
              <Table.Th style={{ width: 220 }}>Тип</Table.Th>
              <Table.Th style={{ width: 180 }}>Редкость</Table.Th>
              <Table.Th style={{ width: 150 }}>Стоимость</Table.Th>
              <Table.Th style={{ width: 120 }}>Вес</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredItems.map((item) => (
              <Table.Tr
                key={item.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedItem(item)}
              >
                <Table.Td>
                  <Stack gap={0}>
                    <Text fw={600}>{item.name}</Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {item.description?.blocks?.find((b) => b.type === 'paragraph')?.text ||
                        'Описание отсутствует...'}
                    </Text>
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="outline">
                    {formatItemType(item.type)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatRarityName(item.rarity)}</Text>
                </Table.Td>
                <Table.Td fw={600} c="yellow.9">
                  {item.costValue} {formatCurrencyName(item.costCurrency)}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{item.weight} фт.</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Container>
  );
}
