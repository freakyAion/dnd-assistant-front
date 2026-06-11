import { useEffect, useState } from 'react';
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronLeft,
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconShield,
  IconSword,
  IconTrash,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  createItem,
  deleteItem,
  DexBonusType,
  GameItem,
  getItems,
  ItemRarity,
  ItemType,
  PropertyFlags,
  updateItem,
  WeaponDamageType,
} from '../api/api';
import { ArticleEditor } from '../components/ArticleEditor/ArticleEditor';
import { ArticleRenderer, Block } from '../components/ArticleRenderer/ArticleRenderer';
import { IsAdmin } from '../store/auth';

// --- DICTIONARY DIALS & TRANSLATIONS ---

export const TYPE_LABELS: Record<ItemType, string> = {
  [ItemType.Armor]: 'Доспех',
  [ItemType.Weapon]: 'Оружие',
  [ItemType.AdventuringGear]: 'Снаряжение для приключений',
  [ItemType.Tool]: 'Инструмент',
  [ItemType.Consumable]: 'Расходник',
  [ItemType.Container]: 'Контейнер',
  [ItemType.WondrousItem]: 'Чудесный предмет',
};

export const RARITY_LABELS: Record<ItemRarity, string> = {
  [ItemRarity.Mundane]: 'Обыденный',
  [ItemRarity.Common]: 'Обычный',
  [ItemRarity.Uncommon]: 'Необычный',
  [ItemRarity.Rare]: 'Редкий',
  [ItemRarity.VeryRare]: 'Очень редкий',
  [ItemRarity.Legendary]: 'Легендарный',
  [ItemRarity.Artifact]: 'Артефакт',
};

export const CURRENCY_LABELS: Record<number, string> = {
  0: 'мм',
  1: 'см',
  2: 'эм',
  3: 'зм',
  4: 'пм',
};

export const DAMAGE_LABELS: Record<WeaponDamageType, string> = {
  [WeaponDamageType.Bludgeoning]: 'Дробящий',
  [WeaponDamageType.Piercing]: 'Колющий',
  [WeaponDamageType.Slashing]: 'Рубящий',
  [WeaponDamageType.Acid]: 'Кислота',
  [WeaponDamageType.Cold]: 'Холод',
  [WeaponDamageType.Fire]: 'Огонь',
  [WeaponDamageType.Force]: 'Силовое поле',
  [WeaponDamageType.Lightning]: 'Молния',
  [WeaponDamageType.Necrotic]: 'Некротический',
  [WeaponDamageType.Poison]: 'Яд',
  [WeaponDamageType.Psychic]: 'Психический',
  [WeaponDamageType.Radiant]: 'Излучение',
  [WeaponDamageType.Thunder]: 'Звук',
};

export const PROPERTY_LABELS = [
  { value: 1 << 0, label: 'Фехтовальное (Finesse)' },
  { value: 1 << 1, label: 'Тяжелое (Heavy)' },
  { value: 1 << 2, label: 'Легкое (Light)' },
  { value: 1 << 3, label: 'Досягаемость (Reach)' },
  { value: 1 << 4, label: 'Двуручное (Two-Handed)' },
  { value: 1 << 5, label: 'Универсальное (Versatile)' },
  { value: 1 << 6, label: 'Метательное (Thrown)' },
  { value: 1 << 7, label: 'Боеприпасы (Ammunition)' },
  { value: 1 << 8, label: 'Перезарядка (Loading)' },
];

export function ItemsPage() {
  const [items, setItems] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [rarityFilters, setRarityFilters] = useState<string[]>([]);
  const [adminMode, setAdminMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);

  // Form Editor Windows Layout Buffers
  const [editorOpened, setEditorOpened] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<string>(String(ItemType.AdventuringGear));
  const [editRarity, setEditRarity] = useState<string>(String(ItemRarity.Common));
  const [editWeight, setEditWeight] = useState<number>(0);
  const [editCostValue, setEditCostValue] = useState<number>(0);
  const [editCostCurrency, setEditCostCurrency] = useState<string>('3'); // zmo by default
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);

  const [editRequiresAttunement, setEditRequiresAttunement] = useState(false);
  const [editAttunementPrereq, setEditAttunementPrereq] = useState('');
  const [editStrReq, setEditStrReq] = useState<number | undefined>(undefined);
  const [editStealthDisadv, setEditStealthDisadv] = useState(false);

  const [editAcValue, setEditAcValue] = useState<number | undefined>(undefined);
  const [editAcDexType, setEditAcDexType] = useState<string>(String(DexBonusType.Full));
  const [editDmgQty, setEditDmgQty] = useState<number | undefined>(undefined);
  const [editDmgSides, setEditDmgSides] = useState<number | undefined>(undefined);
  const [editDmgType, setEditDmgType] = useState<string>(String(WeaponDamageType.Bludgeoning));
  const [editPropsMask, setEditPropsMask] = useState<number>(0);

  const [editCapacity, setEditCapacity] = useState<number | undefined>(undefined);
  const [editIsConsumable, setEditIsConsumable] = useState(false);
  const [editHasCharges, setEditHasCharges] = useState(false);
  const [editMaxCharges, setEditMaxCharges] = useState<number | undefined>(undefined);
  const [editResetCondition, setEditResetCondition] = useState('');

  const fetchItemsList = () => {
    setLoading(true);
    getItems()
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить снаряжение',
          color: 'red',
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItemsList();
  }, []);

  useEffect(() => {
    setAdminMode(IsAdmin());
  }, [items, selectedItem]);

  const openEditor = (item: GameItem | null = null) => {
    if (item) {
      setEditingItemId(item.id);
      setEditName(item.name);
      setEditType(String(item.type));
      setEditRarity(String(item.rarity));
      setEditWeight(item.weight);
      setEditCostValue(item.costValue);
      setEditCostCurrency(String(item.costCurrency));
      setEditBlocks(item.description?.blocks || []);
      setEditRequiresAttunement(item.requiresAttunement);
      setEditAttunementPrereq(item.attunementPrerequisites || '');
      setEditStrReq(item.strengthRequirement ?? undefined);
      setEditStealthDisadv(item.stealthDisadvantage);
      setEditAcValue(item.acValue ?? undefined);
      setEditAcDexType(String(item.acDexBonusType ?? DexBonusType.Full));
      setEditDmgQty(item.damageDiceQuantity ?? undefined);
      setEditDmgSides(item.damageDiceSides ?? undefined);
      setEditDmgType(String(item.damageType ?? WeaponDamageType.Bludgeoning));
      setEditPropsMask(item.properties);
      setEditCapacity(item.containerCapacityWeight ?? undefined);
      setEditIsConsumable(item.isConsumable);
      setEditHasCharges(item.hasCharges);
      setEditMaxCharges(item.maxCharges ?? undefined);
      setEditResetCondition(item.chargeResetCondition || '');
    } else {
      setEditingItemId(null);
      setEditName('');
      setEditType(String(ItemType.AdventuringGear));
      setEditRarity(String(ItemRarity.Common));
      setEditWeight(0);
      setEditCostValue(0);
      setEditCostCurrency('3');
      setEditBlocks([]);
      setEditRequiresAttunement(false);
      setEditAttunementPrereq('');
      setEditStrReq(undefined);
      setEditStealthDisadv(false);
      setEditAcValue(undefined);
      setEditAcDexType(String(DexBonusType.Full));
      setEditDmgQty(undefined);
      setEditDmgSides(undefined);
      setEditDmgType(String(WeaponDamageType.Bludgeoning));
      setEditPropsMask(0);
      setEditCapacity(undefined);
      setEditIsConsumable(false);
      setEditHasCharges(false);
      setEditMaxCharges(undefined);
      setEditResetCondition('');
    }
    setEditorOpened(true);
  };

  const handleTogglePropFlag = (flag: number, checked: boolean) => {
    setEditPropsMask((prev) => (checked ? prev | flag : prev & ~flag));
  };

  const handleSaveItem = async () => {
    if (!editName.trim()) {
      notifications.show({ title: 'Ошибка', message: 'Введите название предмета', color: 'red' });
      return;
    }

    setSubmitting(true);
    const payload: Omit<GameItem, 'id'> = {
      name: editName,
      type: Number(editType) as ItemType,
      rarity: Number(editRarity) as ItemRarity,
      weight: editWeight,
      costValue: editCostValue,
      costCurrency: Number(editCostCurrency),
      description: { blocks: editBlocks },
      requiresAttunement: editRequiresAttunement,
      attunementPrerequisites: editRequiresAttunement ? editAttunementPrereq : undefined,
      strengthRequirement: Number(editType) === ItemType.Armor ? editStrReq : undefined,
      stealthDisadvantage: Number(editType) === ItemType.Armor ? editStealthDisadv : false,
      acValue: Number(editType) === ItemType.Armor ? editAcValue : undefined,
      acDexBonusType:
        Number(editType) === ItemType.Armor ? (Number(editAcDexType) as DexBonusType) : undefined,
      damageDiceQuantity: Number(editType) === ItemType.Weapon ? editDmgQty : undefined,
      damageDiceSides: Number(editType) === ItemType.Weapon ? editDmgSides : undefined,
      damageType:
        Number(editType) === ItemType.Weapon
          ? (Number(editDmgType) as WeaponDamageType)
          : undefined,
      properties: Number(editType) === ItemType.Weapon ? editPropsMask : 0,
      containerCapacityWeight: Number(editType) === ItemType.Container ? editCapacity : undefined,
      isConsumable: editIsConsumable,
      hasCharges: editHasCharges,
      maxCharges: editHasCharges ? editMaxCharges : undefined,
      chargeResetCondition: editHasCharges ? editResetCondition : undefined,
    };

    try {
      if (editingItemId) {
        await updateItem(editingItemId, payload);
        notifications.show({
          title: 'Успех',
          message: 'Предмет успешно отредактирован',
          color: 'green',
        });
      } else {
        await createItem(payload);
        notifications.show({
          title: 'Успех',
          message: 'Предмет сохранен в арсенал',
          color: 'green',
        });
      }
      setEditorOpened(false);
      setSelectedItem(null);
      fetchItemsList();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось сохранить предмет',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!window.confirm('Окончательно удалить этот предмет из базы?')) return;

    try {
      await deleteItem(id);
      notifications.show({ title: 'Успех', message: 'Предмет удален', color: 'gray' });
      setSelectedItem(null);
      fetchItemsList();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось завершить удаление',
        color: 'red',
      });
    }
  };

  const filteredItems = items.filter((i) => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilters.length === 0 || typeFilters.includes(String(i.type));
    const matchesRarity = rarityFilters.length === 0 || rarityFilters.includes(String(i.rarity));
    return matchesSearch && matchesType && matchesRarity;
  });

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Инвентаризация арсенала...</Text>
      </Stack>
    );
  }

  // --- 1. DETAILS INTERFACE SUMMARY VIEW ---
  if (selectedItem) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft size={16} />}
              onClick={() => setSelectedItem(null)}
              p={0}
              color="gray"
            >
              Назад к снаряжению
            </Button>
            {adminMode && (
              <Group gap="xs">
                <Button
                  size="xs"
                  variant="outline"
                  leftSection={<IconEdit size={14} />}
                  onClick={() => openEditor(selectedItem)}
                >
                  Редактировать
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => handleDeleteItem(selectedItem.id)}
                >
                  Удалить
                </Button>
              </Group>
            )}
          </Group>

          <Group justify="space-between" align="center">
            <Stack gap={0}>
              <Title order={1}>{selectedItem.name}</Title>
              <Group gap="xs" mt="xs">
                {/* Explicitly assert the exact enum types for indexing */}
                <Badge variant="light" color="blue">
                  {TYPE_LABELS[selectedItem.type as ItemType]}
                </Badge>
                <Badge variant="outline" color="gray">
                  {RARITY_LABELS[selectedItem.rarity as ItemRarity]}
                </Badge>
                {selectedItem.requiresAttunement && (
                  <Badge color="purple" variant="filled">
                    Настройка: {selectedItem.attunementPrerequisites || 'Требуется'}
                  </Badge>
                )}
                {selectedItem.isConsumable && <Badge color="teal">Расходник</Badge>}
              </Group>
            </Stack>
            <Stack gap={4} align="flex-end">
              {/* Map currency arrays explicitly using index lookup casting */}
              <Text fw={700} size="xl" c="yellow.9">
                {selectedItem.costValue} {CURRENCY_LABELS[selectedItem.costCurrency] || 'зм'}
              </Text>
              <Text size="sm" c="dimmed">
                {selectedItem.weight} фт.
              </Text>
            </Stack>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mt="md">
            {selectedItem.type === ItemType.Weapon && selectedItem.damageDiceQuantity && (
              <Card withBorder padding="md" radius="sm">
                <Group gap="sm">
                  <IconSword size={24} style={{ color: 'var(--mantine-color-red-filled)' }} />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Боевой урон
                    </Text>
                    <Text fw={600} size="lg">
                      {selectedItem.damageDiceQuantity}d{selectedItem.damageDiceSides}{' '}
                      {DAMAGE_LABELS[selectedItem.damageType as WeaponDamageType] || ''}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            )}

            {selectedItem.type === ItemType.Armor && selectedItem.acValue && (
              <Card withBorder padding="md" radius="sm">
                <Group gap="sm">
                  <IconShield size={24} style={{ color: 'var(--mantine-color-blue-filled)' }} />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Класс Доспеха (AC)
                    </Text>
                    <Text fw={600} size="lg">
                      {selectedItem.acValue}{' '}
                      {selectedItem.acDexBonusType === DexBonusType.None
                        ? '(Без ЛОВ)'
                        : selectedItem.acDexBonusType === DexBonusType.Max2
                          ? '(ЛОВ макс +2)'
                          : '(Полная ЛОВ)'}
                    </Text>
                  </Stack>
                </Group>
              </Card>
            )}

            {selectedItem.type === ItemType.Armor && selectedItem.strengthRequirement && (
              <Card withBorder padding="md" radius="sm">
                <Group gap="sm">
                  <IconAlertTriangle
                    size={24}
                    style={{ color: 'var(--mantine-color-orange-filled)' }}
                  />
                  <Stack gap={0}>
                    <Text size="xs" c="dimmed">
                      Требуемая Сила
                    </Text>
                    <Text fw={600} size="lg">
                      Сила {selectedItem.strengthRequirement}+
                    </Text>
                  </Stack>
                </Group>
              </Card>
            )}

            {selectedItem.hasCharges && (
              <Card withBorder padding="md" radius="sm">
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    Заряды предмета
                  </Text>
                  <Text fw={600} size="lg">
                    Макс: {selectedItem.maxCharges} зарядок
                  </Text>
                  <Text size="xs" c="dimmed">
                    Восстановление: {selectedItem.chargeResetCondition || 'Короткий/Длинный отдых'}
                  </Text>
                </Stack>
              </Card>
            )}

            {selectedItem.type === ItemType.Container && selectedItem.containerCapacityWeight && (
              <Card withBorder padding="md" radius="sm">
                <Stack gap={0}>
                  <Text size="xs" c="dimmed">
                    Вместимость контейнера
                  </Text>
                  <Text fw={600} size="lg">
                    {selectedItem.containerCapacityWeight} фт.
                  </Text>
                </Stack>
              </Card>
            )}
          </SimpleGrid>

          {selectedItem.type === ItemType.Weapon && selectedItem.properties > 0 && (
            <Group gap={4}>
              {PROPERTY_LABELS.filter((p) => (selectedItem.properties & p.value) !== 0).map((p) => (
                <Badge key={p.value} variant="light" color="gray">
                  {p.label}
                </Badge>
              ))}
            </Group>
          )}

          {selectedItem.stealthDisadvantage && (
            <Badge color="red" variant="light" size="lg" style={{ alignSelf: 'flex-start' }}>
              Помеха на Скрытность (Stealth Disadvantage)
            </Badge>
          )}

          <Box mt="md">
            <ArticleRenderer
              article={{ title: '', content: selectedItem.description?.blocks || [] }}
            />
          </Box>
        </Stack>
      </Container>
    );
  }

  // --- 2. GRID DIRECTORY ARCHIVE READOUTS ---
  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Предметы и снаряжение</Title>
            <Text c="dimmed">Оружие, доспехи и предметы экипировки вашего отряда</Text>
          </Stack>
          {adminMode && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => openEditor(null)}>
              Добавить предмет
            </Button>
          )}
        </Group>

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
            data={Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            value={typeFilters}
            onChange={setTypeFilters}
          />
          <MultiSelect
            placeholder="Редкость"
            clearable
            data={Object.entries(RARITY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
            value={rarityFilters}
            onChange={(values) => setRarityFilters(values)}
          />
        </SimpleGrid>

        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
          <Table striped highlightOnHover verticalSpacing="xs">
            <Table.Thead bg="var(--mantine-color-gray-light)">
              <Table.Tr>
                <Table.Th>Название</Table.Th>
                <Table.Th style={{ width: 220 }}>Тип</Table.Th>
                <Table.Th style={{ width: 180 }}>Редкость</Table.Th>
                <Table.Th style={{ width: 150 }}>Стоимость</Table.Th>
                <Table.Th style={{ width: 120 }}>Вес</Table.Th>
                {adminMode && <Table.Th style={{ width: 90 }}>Действия</Table.Th>}
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
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="outline" color="blue">
                      {TYPE_LABELS[item.type as ItemType]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{RARITY_LABELS[item.rarity as ItemRarity]}</Text>
                  </Table.Td>
                  <Table.Td fw={600} c="yellow.9">
                    {item.costValue} {CURRENCY_LABELS[item.costCurrency] || 'зм'}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{item.weight} фт.</Text>
                  </Table.Td>
                  {adminMode && (
                    <Table.Td onClick={(e) => e.stopPropagation()}>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon variant="subtle" color="blue" onClick={() => openEditor(item)}>
                          <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>

      {/* --- 3. DYNAMIC ADMIN CONFIGURATION ENTRY WINDOW --- */}
      <Modal
        opened={editorOpened}
        onClose={() => setEditorOpened(false)}
        title={editingItemId ? 'Редактирование параметров предмета' : 'Создание нового предмета'}
        size="100%"
        radius="md"
      >
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder radius="sm">
                <Title order={4} mb="sm">
                  Базовые спецификации
                </Title>
                <Stack gap="xs">
                  <TextInput
                    label="Название предмета"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <Group grow>
                    <Select
                      label="Тип снаряжения"
                      data={Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
                      value={editType}
                      onChange={(val) => setEditType(val || '2')}
                    />
                    <Select
                      label="Редкость"
                      data={Object.entries(RARITY_LABELS).map(([k, v]) => ({ value: k, label: v }))}
                      value={editRarity}
                      onChange={(val) => setEditRarity(val || '0')}
                    />
                  </Group>

                  <Group grow>
                    <NumberInput
                      label="Вес (фт.)"
                      value={editWeight}
                      onChange={(val) => setEditWeight(Number(val))}
                      min={0}
                      decimalScale={2}
                    />
                    <NumberInput
                      label="Цена"
                      value={editCostValue}
                      onChange={(val) => setEditCostValue(Number(val))}
                      min={0}
                    />
                    <Select
                      label="Валюта"
                      data={Object.entries(CURRENCY_LABELS).map(([k, v]) => ({
                        value: k,
                        label: v,
                      }))}
                      value={editCostCurrency}
                      onChange={(val) => setEditCostCurrency(val || '3')}
                    />
                  </Group>

                  <Divider
                    my="xs"
                    label="Особые механики настройки и зарядов"
                    labelPosition="center"
                  />
                  <Checkbox
                    label="Требует настройки (Requires Attunement)"
                    checked={editRequiresAttunement}
                    onChange={(e) => setEditRequiresAttunement(e.currentTarget.checked)}
                  />
                  {editRequiresAttunement && (
                    <TextInput
                      label="Условия настройки"
                      placeholder="Класс мага, Мудрость 13+ и т.д."
                      value={editAttunementPrereq}
                      onChange={(e) => setEditAttunementPrereq(e.target.value)}
                    />
                  )}

                  <Group grow>
                    <Checkbox
                      label="Имеет заряды"
                      checked={editHasCharges}
                      onChange={(e) => setEditHasCharges(e.currentTarget.checked)}
                    />
                    <Checkbox
                      label="Расходник (Уничтожается после использования)"
                      checked={editIsConsumable}
                      onChange={(e) => setEditIsConsumable(e.currentTarget.checked)}
                    />
                  </Group>
                  {editHasCharges && (
                    <Group grow>
                      <NumberInput
                        label="Макс Зарядов"
                        value={editMaxCharges}
                        onChange={(val) => setEditMaxCharges(val ? Number(val) : undefined)}
                        min={1}
                      />
                      <TextInput
                        label="Условие сброса зарядов"
                        placeholder="Каждый рассвет, Длинный отдых"
                        value={editResetCondition}
                        onChange={(e) => setEditResetCondition(e.target.value)}
                      />
                    </Group>
                  )}

                  {/* DYNAMIC FORMS SECTION: WEAPONS SPECIAL FIELDS */}
                  {Number(editType) === ItemType.Weapon && (
                    <Stack gap="xs">
                      <Divider
                        my="xs"
                        label="Боевые параметры оружия"
                        labelPosition="center"
                        color="red"
                      />
                      <Group grow>
                        <NumberInput
                          label="Кубики урона (Количество)"
                          value={editDmgQty}
                          onChange={(val) => setEditDmgQty(val ? Number(val) : undefined)}
                          min={1}
                        />
                        <NumberInput
                          label="Грани кубика (d4, d6, d8, d10, d12)"
                          value={editDmgSides}
                          onChange={(val) => setEditDmgSides(val ? Number(val) : undefined)}
                          min={4}
                          max={12}
                          step={2}
                        />
                        <Select
                          label="Тип урона"
                          data={Object.entries(DAMAGE_LABELS).map(([k, v]) => ({
                            value: k,
                            label: v,
                          }))}
                          value={editDmgType}
                          onChange={(val) => setEditDmgType(val || '0')}
                        />
                      </Group>
                      <Box>
                        <Text size="sm" fw={500} mb={4}>
                          Свойства оружия (Weapon Properties)
                        </Text>
                        <SimpleGrid cols={2} spacing="xs">
                          {PROPERTY_LABELS.map((p) => (
                            <Checkbox
                              key={p.value}
                              label={p.label}
                              checked={(editPropsMask & p.value) !== 0}
                              onChange={(e) =>
                                handleTogglePropFlag(p.value, e.currentTarget.checked)
                              }
                            />
                          ))}
                        </SimpleGrid>
                      </Box>
                    </Stack>
                  )}

                  {/* DYNAMIC FORMS SECTION: ARMORS SPECIAL FIELDS */}
                  {Number(editType) === ItemType.Armor && (
                    <Stack gap="xs">
                      <Divider
                        my="xs"
                        label="Защитные параметры доспеха"
                        labelPosition="center"
                        color="blue"
                      />
                      <Group grow>
                        <NumberInput
                          label="Показатель защиты (AC Value)"
                          value={editAcValue}
                          onChange={(val) => setEditAcValue(val ? Number(val) : undefined)}
                          min={10}
                          max={20}
                        />
                        <Select
                          label="Модификатор Ловкости"
                          data={[
                            { value: '0', label: 'Не добавляется' },
                            { value: '1', label: 'Ограничен (макс +2)' },
                            { value: '2', label: 'Добавляется полностью' },
                          ]}
                          value={editAcDexType}
                          onChange={(val) => setEditAcDexType(val || '2')}
                        />
                      </Group>
                      <Group grow>
                        <NumberInput
                          label="Минимальная Сила для ношения"
                          value={editStrReq}
                          onChange={(val) => setEditStrReq(val ? Number(val) : undefined)}
                          min={0}
                          placeholder="Нет"
                        />
                        <Checkbox
                          label="Дает помеху на Скрытность"
                          checked={editStealthDisadv}
                          onChange={(e) => setEditStealthDisadv(e.currentTarget.checked)}
                          mt="xl"
                        />
                      </Group>
                    </Stack>
                  )}

                  {/* DYNAMIC FORMS SECTION: CONTAINER WEIGHT SPECS */}
                  {Number(editType) === ItemType.Container && (
                    <Box>
                      <Divider
                        my="xs"
                        label="Объем хранилища"
                        labelPosition="center"
                        color="teal"
                      />
                      <NumberInput
                        label="Предельный переносимый вес (фт.)"
                        value={editCapacity}
                        onChange={(val) => setEditCapacity(val ? Number(val) : undefined)}
                        min={0}
                      />
                    </Box>
                  )}

                  <Box mt="sm">
                    <Text size="sm" fw={500} mb={4}>
                      Свойства, лор и эффекты предмета
                    </Text>
                    <ArticleEditor blocks={editBlocks} onChange={setEditBlocks} />
                  </Box>
                </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col
              span={{ base: 12, md: 6 }}
              style={{ borderLeft: '1px solid var(--mantine-color-default-border)' }}
            >
              <Text size="xs" c="dimmed" mb="xs">
                Живой предпросмотр инвентарной карточки:
              </Text>
              <Paper
                p="xl"
                withBorder
                radius="md"
                shadow="xs"
                style={{ minHeight: '400px', height: '100%' }}
              >
                <Group justify="space-between" align="flex-start">
                  <Stack gap={0}>
                    <Title order={2}>{editName || 'Название нового предмета'}</Title>
                    <Group gap="xs" mt="xs">
                      <Badge color="blue">{TYPE_LABELS[Number(editType) as ItemType]}</Badge>
                      <Badge color="gray" variant="outline">
                        {RARITY_LABELS[Number(editRarity) as ItemRarity]}
                      </Badge>
                      {editRequiresAttunement && <Badge color="purple">Настройка</Badge>}
                    </Group>
                  </Stack>
                  <Stack gap={0} align="flex-end">
                    <Text fw={700} size="lg" c="yellow.9">
                      {editCostValue} {CURRENCY_LABELS[Number(editCostCurrency)]}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {editWeight} фт.
                    </Text>
                  </Stack>
                </Group>
                <Box
                  mt="lg"
                  style={{
                    borderTop: '1px solid var(--mantine-color-default-border)',
                    paddingTop: '12px',
                  }}
                >
                  <ArticleRenderer article={{ title: '', content: editBlocks }} />
                </Box>
              </Paper>
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" color="gray" onClick={() => setEditorOpened(false)}>
              Отмена
            </Button>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={handleSaveItem}
              loading={submitting}
            >
              Сохранить снаряжение
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
