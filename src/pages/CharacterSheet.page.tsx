import { useEffect, useState } from 'react';
import {
  IconBook,
  IconBriefcase,
  IconCheck,
  IconChevronLeft,
  IconEdit,
  IconFileText,
  IconHeart,
  IconLock,
  IconShield,
  IconSword,
  IconWorld,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Drawer,
  Group,
  Loader,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  Character,
  getCharacterSheet,
  getItems,
  getSpells,
  getWizardBackgrounds,
  getWizardClasses,
  getWizardSpecies,
  toggleSpellPreparation,
  updateCharacterBio,
  updateCharacterCoreStats,
  updateCharacterInventory,
  updateCharacterSpellSlots,
  updateCharacterVisibility,
  updateCharacterVitals,
} from '../api/api';

// IMPORT YOUR CUSTOM EDITOR AND RENDERER HERE
import { ArticleEditor } from '../components/ArticleEditor/ArticleEditor'; // <-- Adjust path as needed
import { ArticleRenderer, Block } from '../components/ArticleRenderer/ArticleRenderer'; // <-- Adjust path as needed

const calculateModifier = (score: number) => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

interface DirectoryOption {
  value: string;
  label: string;
}

// --- ATTRIBUTE MAP WITH RUSSIAN FRONT LABELS ---
export const ATTRIBUTE_SKILLS_MAP: Record<string, Array<{ id: number; name: string }>> = {
  'Сила (STR)': [{ id: 0, name: 'Атлетика (Athletics)' }],
  'Ловкость (DEX)': [
    { id: 1, name: 'Акробатика (Acrobatics)' },
    { id: 2, name: 'Ловкость рук (Sleight of Hand)' },
    { id: 3, name: 'Скрытность (Stealth)' },
  ],
  'Интеллект (INT)': [
    { id: 4, name: 'Магия (Arcana)' },
    { id: 5, name: 'История (History)' },
    { id: 6, name: 'Анализ (Investigation)' },
    { id: 7, name: 'Природа (Nature)' },
    { id: 8, name: 'Религия (Religion)' },
  ],
  'Мудрость (WIS)': [
    { id: 9, name: 'Уход за животными (Animal Handling)' },
    { id: 10, name: 'Проницательность (Insight)' },
    { id: 11, name: 'Медицина (Medicine)' },
    { id: 12, name: 'Внимательность (Perception)' },
    { id: 13, name: 'Выживание (Survival)' },
  ],
  'Харизма (CHA)': [
    { id: 14, name: 'Обман (Deception)' },
    { id: 15, name: 'Запугивание (Intimidation)' },
    { id: 16, name: 'Выступление (Performance)' },
    { id: 17, name: 'Убеждение (Persuasion)' },
  ],
};

export function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [vitalsOpened, { open: openVitalsModal, close: closeVitalsModal }] = useDisclosure(false);
  const [statsModalOpened, { open: openStatsModal, close: closeStatsModal }] = useDisclosure(false);

  const [savingCore, setSavingCore] = useState(false);
  const [updatingVitals, setUpdatingVitals] = useState(false);

  const [classes, setClasses] = useState<DirectoryOption[]>([]);
  const [species, setSpecies] = useState<DirectoryOption[]>([]);
  const [backgrounds, setBackgrounds] = useState<DirectoryOption[]>([]);

  const [editName, setEditName] = useState('');
  const [editClass, setEditClass] = useState<string | null>(null);
  const [editSpecies, setEditSpecies] = useState<string | null>(null);
  const [editBackground, setEditBackground] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState<number>(1);
  const [editXp, setEditXp] = useState<number>(0);
  const [editSpeedOverride, setEditSpeedOverride] = useState<number>(0);

  // --- INVENTORY STATES ---
  const [globalItems, setGlobalItems] = useState<any[]>([]);
  const [selectedAddItem, setSelectedAddItem] = useState<string | null>(null);
  const [addItemQty, setAddItemQty] = useState<number>(1);
  const [inventorySyncLoading, setInventorySyncLoading] = useState<string | null>(null);

  // --- SPELLBOOK STATES ---
  const [globalSpells, setGlobalSpells] = useState<any[]>([]);
  const [selectedAddSpell, setSelectedAddSpell] = useState<string | null>(null);
  const [spellSyncLoading, setSpellSyncLoading] = useState<string | null>(null);
  const [localSpellSlots, setLocalSpellSlots] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [updatingSlots, setUpdatingSlots] = useState(false);

  const [editStr, setEditStr] = useState<number>(10);
  const [editDex, setEditDex] = useState<number>(10);
  const [editCon, setEditCon] = useState<number>(10);
  const [editInt, setEditInt] = useState<number>(10);
  const [editWis, setEditWis] = useState<number>(10);
  const [editCha, setEditCha] = useState<number>(10);
  const [editSkills, setEditSkills] = useState<string[]>([]);

  const [localCurrentHp, setLocalCurrentHp] = useState<number>(10);
  const [localMaxHp, setLocalMaxHp] = useState<number>(10);
  const [localTempHp, setLocalTempHp] = useState<number>(0);

  const [bioModalOpened, { open: openBioModal, close: closeBioModal }] = useDisclosure(false);
  const [editAge, setEditAge] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editAppearance, setEditAppearance] = useState('');
  
  const [editBiography, setEditBiography] = useState<Block[]>([]); 
  const [editAlignment, setEditAlignment] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const loadSheet = () => {
    if (!id) return;
    getCharacterSheet(id)
      .then((res) => {
        setCharacter(res.data);
        setIsPublic(res.data.isPublic);
        setLocalCurrentHp(res.data.currentHitPoints);
        setLocalMaxHp(res.data.maxHitPoints);
        setLocalTempHp(res.data.temporaryHitPoints);

        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          try {
            const tokenPayload = JSON.parse(atob(savedToken.split('.')[1]));
            const currentUserId =
              tokenPayload.sub ||
              tokenPayload.id ||
              tokenPayload.uid ||
              tokenPayload[
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
              ] ||
              tokenPayload['nameid'];

            const characterOwnerId = res.data.userID;

            if (characterOwnerId && currentUserId) {
              const matched =
                String(characterOwnerId).toLowerCase() === String(currentUserId).toLowerCase();
              setIsOwner(matched);
            } else {
              setIsOwner(false);
            }
          } catch (e) {
            console.error('Failed to parse owner token claims:', e);
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
  };

  useEffect(() => {
    loadSheet();

    getWizardClasses().then((res) =>
      setClasses(res.data.map((c) => ({ value: c.id, label: c.name })))
    );
    getWizardSpecies().then((res) =>
      setSpecies(res.data.map((s) => ({ value: s.id, label: s.name })))
    );
    getWizardBackgrounds().then((res) =>
      setBackgrounds(res.data.map((b) => ({ value: b.id, label: b.name })))
    );

    getItems()
      .then((res) => setGlobalItems(res.data))
      .catch(() => {});
    getSpells()
      .then((res) => setGlobalSpells(res.data))
      .catch(() => {}); // Sync global spells
  }, [id]);

  // Sync internal array states when character layout swaps over
  useEffect(() => {
    if (character?.expendedSpellSlots) {
      setLocalSpellSlots([...character.expendedSpellSlots]);
    }
  }, [character]);

  // --- HANDLERS: INVENTORY ---
  const handleSyncInventoryItem = async (
    itemID: string,
    quantity: number,
    isEquipped: boolean,
    isAttuned: boolean
  ) => {
    if (!id) return;
    setInventorySyncLoading(itemID);
    try {
      await updateCharacterInventory(id, { itemID, quantity, isEquipped, isAttuned });
      loadSheet();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить предмет инвентаря',
        color: 'red',
      });
    } finally {
      setInventorySyncLoading(null);
    }
  };

  const handleAddItemToBackpack = async () => {
    if (!selectedAddItem) return;
    const existingItem = character?.inventory?.find(
      (ci) => ci.itemId === selectedAddItem || ci.itemId === selectedAddItem
    );
    const targetQty = existingItem ? existingItem.quantity + addItemQty : addItemQty;
    const targetEquip = existingItem ? existingItem.isEquipped : false;
    const targetAttune = existingItem ? existingItem.isAttuned : false;

    setInventorySyncLoading(selectedAddItem);
    try {
      await updateCharacterInventory(id!, {
        itemID: selectedAddItem,
        quantity: targetQty,
        isEquipped: targetEquip,
        isAttuned: targetAttune,
      });
      setSelectedAddItem(null);
      setAddItemQty(1);
      notifications.show({ message: 'Предмет добавлен в рюкзак', color: 'green' });
      loadSheet();
    } catch {
      notifications.show({ title: 'Ошибка', message: 'Не удалось добавить предмет', color: 'red' });
    } finally {
      setInventorySyncLoading(null);
    }
  };

  const handleToggleSpellPrep = async (spellID: string, currentPrepState: boolean) => {
    if (!id) return;
    setSpellSyncLoading(spellID);
    try {
      await toggleSpellPreparation(id, spellID, !currentPrepState);
      loadSheet();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось изменить статус подготовки',
        color: 'red',
      });
    } finally {
      setSpellSyncLoading(null);
    }
  };

  const handleAddSpellToBook = async () => {
    if (!id || !selectedAddSpell) return;
    setSpellSyncLoading(selectedAddSpell);
    try {
      await toggleSpellPreparation(id, selectedAddSpell, true);
      setSelectedAddSpell(null);
      notifications.show({ message: 'Заклинание внесено в гримуар', color: 'purple' });
      loadSheet();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось добавить заклинание',
        color: 'red',
      });
    } finally {
      setSpellSyncLoading(null);
    }
  };

  const handleUpdateSpellSlotCount = async (slotLevelIndex: number, newValue: number) => {
    if (!id) return;
    const updatedSlots = [...localSpellSlots];
    updatedSlots[slotLevelIndex] = newValue;
    setLocalSpellSlots(updatedSlots);

    setUpdatingSlots(true);
    try {
      await updateCharacterSpellSlots(id, updatedSlots);
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить ячейки магии',
        color: 'red',
      });
    } finally {
      setUpdatingSlots(false);
    }
  };

  // --- HANDLERS: CORE STATS & VISIBILITY ---
  const handleVisibilityToggle = (checked: boolean) => {
    if (!id) return;
    setUpdatingVisibility(true);
    updateCharacterVisibility(id, checked)
      .then(() => {
        setIsPublic(checked);
        notifications.show({
          message: checked
            ? 'Персонаж теперь открыт по ссылке'
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

  const handleOpenCoreDrawer = () => {
    if (!character) return;
    setEditName(character.name);
    setEditClass(character.classID);
    setEditSpecies(character.speciesID);
    setEditBackground(character.backgroundID);
    setEditLevel(character.level);
    setEditXp(character.experiencePoints);
    openDrawer();
  };

  const handleOpenStatsModal = () => {
    if (!character) return;
    setEditSpeedOverride(character.currentSpeedOverride);
    setEditStr(character.strength);
    setEditDex(character.dexterity);
    setEditCon(character.constitution);
    setEditInt(character.intelligence);
    setEditWis(character.wisdom);
    setEditCha(character.charisma);
    setEditSkills(
      character.customSkillProficiencies ? character.customSkillProficiencies.map(String) : []
    );
    openStatsModal();
  };

  const handleSaveCoreStats = async () => {
    if (!id || !editName || !editClass || !editSpecies || !editBackground || !character) {
      notifications.show({
        title: 'Ошибка',
        message: 'Пожалуйста заполните базовые поля',
        color: 'red',
      });
      return;
    }

    setSavingCore(true);
    try {
      await updateCharacterCoreStats(id, {
        name: editName,
        classID: editClass,
        speciesID: editSpecies,
        backgroundID: editBackground,
        level: editLevel,
        experiencePoints: editXp,
        strength: character.strength,
        dexterity: character.dexterity,
        constitution: character.constitution,
        intelligence: character.intelligence,
        wisdom: character.wisdom,
        charisma: character.charisma,
        currentSpeedOverride: character.currentSpeedOverride,
        customSkillProficiencies: character.customSkillProficiencies || [],
      });
      notifications.show({ title: 'Успех', message: 'Данные персонажа обновлены', color: 'green' });
      closeDrawer();
      loadSheet();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить параметры',
        color: 'red',
      });
    } finally {
      setSavingCore(false);
    }
  };

  const handleSaveStatsModal = async () => {
    if (!id || !character) return;

    setSavingCore(true);
    try {
      await updateCharacterCoreStats(id, {
        name: character.name,
        classID: character.classID,
        speciesID: character.speciesID,
        backgroundID: character.backgroundID,
        level: character.level,
        experiencePoints: character.experiencePoints,
        strength: editStr,
        dexterity: editDex,
        constitution: editCon,
        intelligence: editInt,
        wisdom: editWis,
        charisma: editCha,
        currentSpeedOverride: editSpeedOverride,
        customSkillProficiencies: editSkills.map(Number),
      });
      notifications.show({
        title: 'Успех',
        message: 'Характеристики и навыки обновлены',
        color: 'green',
      });
      closeStatsModal();
      loadSheet();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить характеристики',
        color: 'red',
      });
    } finally {
      setSavingCore(false);
    }
  };

  const handleQuickHpSync = async () => {
    if (!id || !character) return;
    setUpdatingVitals(true);
    try {
      await updateCharacterVitals(id, {
        currentHitPoints: localCurrentHp,
        maxHitPoints: localMaxHp,
        temporaryHitPoints: localTempHp,
        deathSaveSuccesses: character.deathSaveSuccesses,
        deathSaveFailures: character.deathSaveFailures,
      });
      notifications.show({
        message: 'Жизненные показатели сохранены',
        color: 'green',
        autoClose: 1000,
      });
      loadSheet();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось синхронизировать здоровье',
        color: 'red',
      });
    } finally {
      setUpdatingVitals(false);
    }
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Считывание параметров листа персонажа...</Text>
      </Stack>
    );
  }

  if (!character) {
    return (
      <Text c="red" p="xl">
        Персонаж не найден или к нему ограничен доступ.
      </Text>
    );
  }

  const stats = [
    { label: 'Сила (STR)', score: character.strength },
    { label: 'Ловкость (DEX)', score: character.dexterity },
    { label: 'Телосложение (CON)', score: character.constitution },
    { label: 'Интеллект (INT)', score: character.intelligence },
    { label: 'Мудрость (WIS)', score: character.wisdom },
    { label: 'Харизма (CHA)', score: character.charisma },
  ];

  const flatSkillOptions = Object.values(ATTRIBUTE_SKILLS_MAP)
    .flat()
    .map((s) => ({ value: String(s.id), label: s.name }));

  const handleOpenBioModal = () => {
    if (!character) return;
    setEditAge(character.age || '');
    setEditHeight(character.height || '');
    setEditWeight(character.weight || '');
    setEditAppearance(character.physicalAppearance || '');
    setEditAlignment(character.alignment || '');

    // Parse the string from C# back into structural blocks for the frontend editor
    try {
      if (character.biography) {
        const parsed = JSON.parse(character.biography);
        setEditBiography(Array.isArray(parsed) ? parsed : []);
      } else {
        setEditBiography([]);
      }
    } catch {
      // Fallback if the database has old plain text notes stored in it
      setEditBiography([{ type: 'paragraph', text: character.biography, spans: [] }]);
    }
    openBioModal();
  };

  const handleSaveBio = async () => {
    if (!id || !character) return;
    setSavingBio(true);
    try {
      await updateCharacterBio(id, {
        age: editAge,
        height: editHeight,
        weight: editWeight,
        physicalAppearance: editAppearance,
        biography: JSON.stringify(editBiography), 
        alignment: editAlignment,
      });
      notifications.show({ title: 'Успех', message: 'Биография обновлена', color: 'green' });
      closeBioModal();
      loadSheet();
    } catch {
      notifications.show({ title: 'Ошибка', message: 'Не удалось обновить биографию', color: 'red' });
    } finally {
      setSavingBio(false);
    }
  };

  return (
    <Container fluid p={0}>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Button
            variant="subtle"
            leftSection={<IconChevronLeft size={16} />}
            onClick={() => navigate('/characters')}
            p={0}
            color="gray"
          >
            Назад к списку
          </Button>

          <Group gap="md">
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
        </Group>

        {/* --- IDENTITY BLOCK --- */}
        <Card
          bg="var(--mantine-color-gray-light)"
          p="xl"
          radius="md"
          withBorder={false}
          style={{ position: 'relative' }}
        >
          {isOwner && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="md"
              onClick={handleOpenCoreDrawer}
              style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}
            >
              <IconEdit size={18} />
            </ActionIcon>
          )}

          <Group justify="space-between" align="flex-end">
            <Stack gap="xs">
              <Title order={1} style={{ lineHeight: 1.1 }}>
                {character.name}
              </Title>
              <Group gap="xs">
                <Text fw={600} c="red.8" size="md">
                  {character.class?.name} {character.level} ур.
                </Text>
                <Text c="dimmed">|</Text>
                <Text fw={600} size="md">
                  {character.species?.name}
                </Text>
                <Text c="dimmed">|</Text>
                <Text size="sm" c="dimmed">
                  {character.alignment}
                </Text>
              </Group>
            </Stack>
            <Stack gap={2} style={{ textAlign: 'right' }}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts="0.5px">
                Опыт (XP)
              </Text>
              <Text fw={700} size="xl" style={{ lineHeight: 1 }}>
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

          {/* --- COMBAT & SKILLS TAB VIEW --- */}
          <Tabs.Panel value="combat" pt="md">
            <SimpleGrid cols={{ base: 1, md: 4 }} spacing="md">
              {/* LEFT SIDEBAR: ATTRIBUTES */}
              <Stack gap="xs" style={{ position: 'relative' }}>
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

              {/* RIGHT WORKSPACE: VITALS & SKILLS */}
              <Stack gap="md" style={{ gridColumn: 'span 3' }}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                  {/* HEALTH TRACKER CARD */}
                  <Card withBorder padding="md">
                    <Group justify="space-between" align="center" mb="xs">
                      <Text fw={700} c="red.9" size="sm">
                        Очки Здоровья (HP)
                      </Text>
                      <Group gap="xs" align="center">
                        <IconHeart size={18} style={{ color: 'var(--mantine-color-red-filled)' }} />
                        {isOwner && (
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={openVitalsModal}
                            title="Изменить Очки Здоровья"
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>
                    <Title order={2} mt="xs">
                      {character.currentHitPoints} / {character.maxHitPoints}
                    </Title>
                    {character.temporaryHitPoints > 0 && (
                      <Badge color="teal" size="sm" variant="light" mt={4}>
                        Временные: +{character.temporaryHitPoints} HP
                      </Badge>
                    )}
                  </Card>

                  {/* --- DYNAMIC ARMOR CLASS (AC) CARD --- */}
                  <Card
                    withBorder
                    padding="md"
                    bg="blue.0"
                    style={{ borderColor: 'var(--mantine-color-blue-light)' }}
                  >
                    <Group justify="space-between" align="center" mb="xs">
                      <Text fw={700} c="blue.9" size="sm">
                        Класс Доспеха (AC)
                      </Text>
                      <IconShield size={18} style={{ color: 'var(--mantine-color-blue-filled)' }} />
                    </Group>

                    {(() => {
                      const dexModifier = Math.floor((character.dexterity - 10) / 2);
                      const equippedArmor = character.inventory?.find(
                        (ci) => ci.isEquipped && ci.item?.type === 0
                      );
                      const equippedShield = character.inventory?.find(
                        (ci) => ci.isEquipped && ci.item?.name?.toLowerCase().includes('shield')
                      );

                      let baseAc = 10;
                      let appliedDex = dexModifier;

                      if (equippedArmor && equippedArmor.item?.acValue) {
                        baseAc = equippedArmor.item.acValue;
                        const dexType = equippedArmor.item.acDexBonusType;
                        if (dexType === 0) appliedDex = 0;
                        else if (dexType === 1) appliedDex = Math.min(dexModifier, 2);
                      }

                      const shieldBonus = equippedShield ? 2 : 0;
                      const totalAc = baseAc + appliedDex + shieldBonus;

                      return (
                        <Stack gap={2}>
                          <Title order={2}>{totalAc}</Title>
                          <Text size="xs" c="dimmed">
                            {equippedArmor
                              ? `${equippedArmor.item.name} (${baseAc})`
                              : 'Без доспехов (10)'}
                            {appliedDex !== 0 &&
                              ` + Мод. ЛОВ (${appliedDex >= 0 ? `+${appliedDex}` : appliedDex})`}
                            {shieldBonus > 0 && ' + Щит (+2)'}
                          </Text>
                        </Stack>
                      );
                    })()}
                  </Card>

                  {/* --- INTERACTIVE MOVEMENT SPEED CARD --- */}
                  <Card withBorder padding="md" style={{ position: 'relative' }}>
                    <Group justify="space-between" align="center" mb="xs">
                      <Text fw={700} c="gray.9" size="sm">
                        Скорость движения
                      </Text>
                      {isOwner && (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={handleOpenStatsModal}
                          title="Настроить скорость"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      )}
                    </Group>

                    <Title order={2} mt="xs">
                      {character.currentSpeedOverride > 0
                        ? character.currentSpeedOverride
                        : character.species?.baseSpeed || 30}{' '}
                      фт.
                    </Title>

                    <Text size="xs" c="dimmed">
                      {character.currentSpeedOverride > 0
                        ? `Модификатор (Базовая: ${character.species?.baseSpeed || 30} фт.)`
                        : 'Стандартная скорость расы'}
                    </Text>
                  </Card>
                </SimpleGrid>

                {/* SKILLS BOARD ROW */}
                <Card withBorder padding="md" radius="sm">
                  <Title order={3} mb="md">
                    Навыки и умения
                  </Title>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    {Object.entries(ATTRIBUTE_SKILLS_MAP).map(([attr, skillList]) => {
                      const score = attr.includes('Сила')
                        ? character.strength
                        : attr.includes('Ловкость')
                          ? character.dexterity
                          : attr.includes('Интеллект')
                            ? character.intelligence
                            : attr.includes('Мудрость')
                              ? character.wisdom
                              : character.charisma;
                      const baseMod = Math.floor((score - 10) / 2);
                      const profBonus = 2;

                      return (
                        <Paper
                          key={attr}
                          withBorder
                          p="xs"
                          bg="var(--mantine-color-gray-0)"
                          radius="xs"
                        >
                          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                            {attr}
                          </Text>
                          <Stack gap={4}>
                            {skillList.map((skill) => {
                              const isProficient = character.customSkillProficiencies?.includes(
                                skill.id
                              );
                              const finalMod = isProficient ? baseMod + profBonus : baseMod;
                              const formattedMod = finalMod >= 0 ? `+${finalMod}` : `${finalMod}`;

                              return (
                                <Group
                                  key={skill.id}
                                  justify="space-between"
                                  wrap="nowrap"
                                  p="xs"
                                  style={{
                                    background: '#fff',
                                    borderRadius: '4px',
                                    border: '1px solid var(--mantine-color-default-border)',
                                  }}
                                >
                                  <Group gap="xs" wrap="nowrap">
                                    <span
                                      style={{
                                        display: 'inline-block',
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: isProficient
                                          ? 'var(--mantine-color-blue-filled)'
                                          : 'transparent',
                                        border: '2px solid var(--mantine-color-blue-filled)',
                                      }}
                                    />
                                    <Text size="sm" fw={isProficient ? 600 : 400}>
                                      {skill.name}
                                    </Text>
                                  </Group>
                                  <Badge
                                    color={isProficient ? 'blue' : 'gray'}
                                    variant={isProficient ? 'filled' : 'light'}
                                    size="sm"
                                  >
                                    {formattedMod}
                                  </Badge>
                                </Group>
                              );
                            })}
                          </Stack>
                        </Paper>
                      );
                    })}
                  </SimpleGrid>
                </Card>

                {/* TRAITS & FEATURES CARD */}
                <Card withBorder padding="md">
                  <Title order={3} mb="sm">
                    Умения и особенности
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

          {/* --- INTERACTIVE INVENTORY MANAGEMENT SYSTEM TAB --- */}
          <Tabs.Panel value="inventory" pt="md">
            <Stack gap="md">
              {/* BACKPACK ADD ITEM UTILITY CARD ROW */}
              {isOwner && (
                <Card withBorder padding="md" radius="sm" bg="var(--mantine-color-gray-0)">
                  <Text size="sm" fw={700} mb="xs">
                    Добавить снаряжение в инвентарь
                  </Text>
                  <Group align="flex-end" grow>
                    <Select
                      label="Поиск предмета"
                      placeholder="Выберите оружие, доспехи или расходники..."
                      data={globalItems.map((i) => ({
                        value: i.id,
                        label: `${i.name} (${i.weight || 0} фт.)`,
                      }))}
                      value={selectedAddItem}
                      onChange={setSelectedAddItem}
                      searchable
                    />
                    <NumberInput
                      label="Количество"
                      value={addItemQty}
                      onChange={(v) => setAddItemQty(Number(v))}
                      min={1}
                      style={{ maxWidth: '120px' }}
                    />
                    <Button
                      color="blue"
                      onClick={handleAddItemToBackpack}
                      disabled={!selectedAddItem}
                    >
                      Положить в рюкзак
                    </Button>
                  </Group>
                </Card>
              )}

              {/* RENDER ACTIVE BACKPACK ITEMS CONTENT LIST */}
              <Card withBorder padding="md">
                <Title order={3} mb="md">
                  Содержимое рюкзака персонажа
                </Title>

                {!character.inventory || character.inventory.length === 0 ? (
                  <Text c="dimmed" size="sm" fs="italic" py="lg" style={{ textAlign: 'center' }}>
                    В рюкзаке вашего героя пока пусто. Добавьте предметы выше.
                  </Text>
                ) : (
                  <Stack gap="xs">
                    {character.inventory.map((ci) => {
                      const isArmor = ci.item?.type === 0;
                      const isShield = ci.item?.name?.toLowerCase().includes('shield');
                      const isEquippable = isArmor || isShield || ci.item?.type === 1;

                      const trueItemID = ci.itemId || ci.item?.id;

                      return (
                        <Group
                          key={ci.id}
                          justify="space-between"
                          p="xs"
                          style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                          wrap="wrap"
                        >
                          <Stack gap={2} style={{ flex: 1, minWidth: '200px' }}>
                            <Group gap="xs">
                              <Text fw={600}>{ci.item?.name || 'Неизвестный предмет'}</Text>
                              <Badge size="xs" color="gray" variant="outline">
                                {isArmor
                                  ? 'Доспех'
                                  : isShield
                                    ? 'Щит'
                                    : ci.item?.type === 1
                                      ? 'Оружие'
                                      : 'Предмет'}
                              </Badge>
                            </Group>
                            <Text size="xs" c="dimmed">
                              Вес: {ci.item?.weight || 0} фт. | Стоимость: {ci.item?.costValue || 0}{' '}
                              монет
                            </Text>
                          </Stack>

                          <Group gap="md" wrap="nowrap">
                            <Group gap={4} wrap="nowrap">
                              <ActionIcon
                                size="sm"
                                variant="default"
                                disabled={inventorySyncLoading !== null || !isOwner}
                                onClick={() =>
                                  handleSyncInventoryItem(
                                    trueItemID,
                                    ci.quantity - 1,
                                    ci.isEquipped,
                                    ci.isAttuned
                                  )
                                }
                              >
                                -
                              </ActionIcon>
                              <Text
                                size="sm"
                                style={{ width: '30px', textAlign: 'center' }}
                                fw={700}
                              >
                                {ci.quantity}
                              </Text>
                              <ActionIcon
                                size="sm"
                                variant="default"
                                disabled={inventorySyncLoading !== null || !isOwner}
                                onClick={() =>
                                  handleSyncInventoryItem(
                                    trueItemID,
                                    ci.quantity + 1,
                                    ci.isEquipped,
                                    ci.isAttuned
                                  )
                                }
                              >
                                +
                              </ActionIcon>
                            </Group>

                            {isEquippable && isOwner && (
                              <Switch
                                size="xs"
                                onLabel="Экипирован"
                                offLabel="В рюкзаке"
                                checked={ci.isEquipped}
                                disabled={inventorySyncLoading !== null}
                                onChange={(e) =>
                                  handleSyncInventoryItem(
                                    trueItemID,
                                    ci.quantity,
                                    e.currentTarget.checked,
                                    ci.isAttuned
                                  )
                                }
                              />
                            )}

                            {!isOwner && ci.isEquipped && (
                              <Badge color="blue" variant="filled">
                                Экипировано
                              </Badge>
                            )}

                            {isOwner && (
                              <ActionIcon
                                color="red"
                                variant="subtle"
                                size="sm"
                                disabled={inventorySyncLoading !== null}
                                onClick={() => handleSyncInventoryItem(trueItemID, 0, false, false)}
                              >
                                Удалить
                              </ActionIcon>
                            )}
                          </Group>
                        </Group>
                      );
                    })}
                  </Stack>
                )}
              </Card>
            </Stack>
          </Tabs.Panel>

          {/* --- INTERACTIVE SPELLBOOK & RESOURCE TRACKING TAB PANEL --- */}
          <Tabs.Panel value="spells" pt="md">
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              {/* LEFT COLUMN: LIVE SPELL SLOT RECOVERY TRACKERS */}
              <Stack gap="xs">
                <Card withBorder padding="md">
                  <Text fw={700} size="sm" mb="md" c="violet.9">
                    Использованные ячейки заклинаний
                  </Text>
                  <Stack gap="xs">
                    {localSpellSlots.map((expendedCount, idx) => (
                      <Group key={idx} justify="space-between" wrap="nowrap">
                        <Text size="xs" fw={600}>
                          Ячейки {idx + 1}-го круга
                        </Text>
                        <NumberInput
                          size="xs"
                          value={expendedCount}
                          onChange={(v) => handleUpdateSpellSlotCount(idx, Number(v))}
                          min={0}
                          max={4}
                          disabled={!isOwner || updatingSlots}
                          style={{ width: '70px' }}
                        />
                      </Group>
                    ))}
                  </Stack>
                </Card>
              </Stack>

              {/* RIGHT WORKSPACE COLUMN: CHOOSE KNOWLEDGE & MANAGE PREPARATION */}
              <Stack gap="md" style={{ gridColumn: 'span 2' }}>
                {isOwner && (
                  <Card withBorder padding="md" radius="sm" bg="var(--mantine-color-gray-0)">
                    <Text size="sm" fw={700} mb="xs">
                      Изучить новое заклинание
                    </Text>
                    <Group align="flex-end">
                      <Select
                        placeholder="Выберите мистическую формулу..."
                        data={globalSpells.map((s) => ({
                          value: s.id,
                          label: `Круг ${s.level || 0} • ${s.name}`,
                        }))}
                        value={selectedAddSpell}
                        onChange={setSelectedAddSpell}
                        searchable
                        style={{ flex: 1 }}
                      />
                      <Button
                        color="purple"
                        onClick={handleAddSpellToBook}
                        disabled={!selectedAddSpell || spellSyncLoading !== null}
                      >
                        Вписать в свиток
                      </Button>
                    </Group>
                  </Card>
                )}

                <Card withBorder padding="md">
                  <Title order={3} mb="md">
                    Известные и подготовленные заклинания
                  </Title>

                  {!character.spells || character.spells.length === 0 ? (
                    <Text c="dimmed" size="sm" fs="italic" py="lg" style={{ textAlign: 'center' }}>
                      В книге заклинаний пока нет записей. Добавьте новые формулы выше.
                    </Text>
                  ) : (
                    <Stack gap="xs">
                      {character.spells.map((cs) => {
                        const trueSpellID = cs.spellId || cs.spell?.id;

                        return (
                          <Group
                            key={cs.id}
                            justify="space-between"
                            p="xs"
                            style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
                            wrap="nowrap"
                          >
                            <Stack gap={2}>
                              <Group gap="xs">
                                <Text fw={600}>{cs.spell?.name || 'Заклинание'}</Text>
                                <Badge size="xs" color="purple" variant="light">
                                  Круг {cs.spell?.level || 0}
                                </Badge>
                              </Group>
                              <Text size="xs" c="dimmed">
                                Дистанция: {cs.spell?.rangeValue ? `${cs.spell.rangeValue} ` : ''}
                                {cs.spell?.rangeUnits || '—'} | Длительность:{' '}
                                {cs.spell?.requiresConcentration ? 'Конц., ' : ''}
                                {cs.spell?.durationUnits || '—'}
                              </Text>
                            </Stack>

                            <Group gap="md" wrap="nowrap">
                              {isOwner ? (
                                <Switch
                                  size="xs"
                                  onLabel="Подготовлено"
                                  offLabel="В книге"
                                  checked={cs.isPrepared}
                                  disabled={spellSyncLoading !== null}
                                  onChange={() => handleToggleSpellPrep(trueSpellID, cs.isPrepared)}
                                />
                              ) : (
                                cs.isPrepared && (
                                  <Badge color="purple" variant="filled">
                                    Подготовлено
                                  </Badge>
                                )
                              )}
                            </Group>
                          </Group>
                        );
                      })}
                    </Stack>
                  )}
                </Card>
              </Stack>
            </SimpleGrid>
          </Tabs.Panel>

          {/* --- BIOGRAPHY PANEL (UPDATED) --- */}
          <Tabs.Panel value="bio" pt="md">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Text fw={700} size="lg" c="gray.7">
                  Личные данные
                </Text>
                {isOwner && (
                  <Button
                    variant="light"
                    color="gray"
                    size="sm"
                    leftSection={<IconEdit size={16} />}
                    onClick={handleOpenBioModal}
                  >
                    Редактировать профиль
                  </Button>
                )}
              </Group>

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
                <Text size="sm" style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {character.physicalAppearance || 'Описание внешности отсутствует...'}
                </Text>
              </Card>

              {/* RENDERER COMPONENT INTEGRATION */}
              <Card withBorder padding="md">
                <Text fw={700} size="lg" mb="xs">
                  Предыстория и мотивы
                </Text>
                {character.biography ? (
                  (() => {
                    // Safe evaluation loop to parse database string rows for the structural renderer
                    let parsedContent: Block[] = [];
                    try {
                      const parsed = JSON.parse(character.biography);
                      parsedContent = Array.isArray(parsed) ? parsed : [];
                    } catch {
                      parsedContent = [{ type: 'paragraph', text: character.biography, spans: [] }];
                    }

                    return (
                      <ArticleRenderer 
                        article={{
                          title: '', // No title needed inside the layout tab panel row
                          content: parsedContent
                        }} 
                      />
                    );
                  })()
                ) : (
                  <Text size="sm" c="dimmed" fs="italic">
                    Биография не заполнена...
                  </Text>
                )}
              </Card>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* --- HP MODAL WINDOW --- */}
      <Modal
        opened={vitalsOpened}
        onClose={closeVitalsModal}
        title="Управление очками здоровья"
        radius="md"
      >
        <Stack gap="md">
          <Group grow>
            <NumberInput
              label="Текущее здоровье"
              value={localCurrentHp}
              onChange={(v) => setLocalCurrentHp(Number(v))}
              min={0}
              max={localMaxHp}
            />
            <NumberInput
              label="Максимальное здоровье"
              value={localMaxHp}
              onChange={(v) => setLocalMaxHp(Number(v))}
              min={1}
            />
          </Group>
          <NumberInput
            label="Временные Хит-Поинты (Temp HP)"
            value={localTempHp}
            onChange={(v) => setLocalTempHp(Number(v))}
            min={0}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" color="gray" onClick={closeVitalsModal}>
              Отмена
            </Button>
            <Button
              color="red"
              leftSection={<IconCheck size={16} />}
              onClick={async () => {
                await handleQuickHpSync();
                closeVitalsModal();
              }}
              loading={updatingVitals}
            >
              Применить изменения
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* --- LIGHTWEIGHT QUICK STATS & SKILLS MODAL WINDOW --- */}
      <Modal
        opened={statsModalOpened}
        onClose={closeStatsModal}
        title="Управление характеристиками и навыками"
        size="lg"
        radius="md"
      >
        <Stack gap="md">
          <SimpleGrid cols={2} spacing="xs">
            <NumberInput
              label="Сила (STR)"
              value={editStr}
              onChange={(v) => setEditStr(Number(v))}
              min={1}
              max={30}
            />
            <NumberInput
              label="Ловкость (DEX)"
              value={editDex}
              onChange={(v) => setEditDex(Number(v))}
              min={1}
              max={30}
            />
            <NumberInput
              label="Телосложение (CON)"
              value={editCon}
              onChange={(v) => setEditCon(Number(v))}
              min={1}
              max={30}
            />
            <NumberInput
              label="Интеллект (INT)"
              value={editInt}
              onChange={(v) => setEditInt(Number(v))}
              min={1}
              max={30}
            />
            <NumberInput
              label="Мудрость (WIS)"
              value={editWis}
              onChange={(v) => setEditWis(Number(v))}
              min={1}
              max={30}
            />
            <NumberInput
              label="Харизма (CHA)"
              value={editCha}
              onChange={(v) => setEditCha(Number(v))}
              min={1}
              max={30}
            />
          </SimpleGrid>

          <NumberInput
            label="Переопределение Скорости (фт.)"
            description="0 для использования расовой скорости персонажа"
            value={editSpeedOverride}
            onChange={(v) => setEditSpeedOverride(Number(v))}
            min={0}
          />

          <Divider label="Изученные навыки" labelPosition="center" my="xs" />
          <MultiSelect
            label="Владение навыками персонажа"
            placeholder="Выберите изученные навыки..."
            data={flatSkillOptions}
            value={editSkills}
            onChange={setEditSkills}
            searchable
            clearable
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" color="gray" onClick={closeStatsModal}>
              Отмена
            </Button>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={handleSaveStatsModal}
              loading={savingCore}
            >
              Сохранить изменения
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* --- BIOGRAPHY EDIT MODAL (UPDATED) --- */}
      <Modal
        opened={bioModalOpened}
        onClose={closeBioModal}
        title="Редактирование биографии"
        size="xl" // Expanding to size="xl" gives ArticleEditor more horizontal real estate
        radius="md"
      >
        <Stack gap="md">
          {/* Alignment Selector */}
          <Select
            label="Мировоззрение (Alignment)"
            placeholder="Выберите мировоззрение..."
            data={[
              'Законно-доброе',
              'Нейтрально-доброе',
              'Хаотично-доброе',
              'Законно-нейтральное',
              'Истинно-нейтральное',
              'Хаотично-нейтральное',
              'Законно-злое',
              'Нейтрально-злое',
              'Хаотично-злое',
              'Без мировоззрения',
            ]}
            value={editAlignment}
            onChange={(v) => setEditAlignment(v || '')}
            clearable
            searchable
          />

          <SimpleGrid cols={3} spacing="xs">
            <TextInput
              label="Возраст"
              placeholder="Например: 24"
              value={editAge}
              onChange={(e) => setEditAge(e.currentTarget.value)}
            />
            <TextInput
              label="Рост"
              placeholder="Например: 180 см"
              value={editHeight}
              onChange={(e) => setEditHeight(e.currentTarget.value)}
            />
            <TextInput
              label="Вес"
              placeholder="Например: 75 кг"
              value={editWeight}
              onChange={(e) => setEditWeight(e.currentTarget.value)}
            />
          </SimpleGrid>

          <Textarea
            label="Внешность"
            placeholder="Опишите шрамы, одежду, цвет глаз..."
            value={editAppearance}
            onChange={(e) => setEditAppearance(e.currentTarget.value)}
            minRows={4}
            autosize
          />

          <Stack gap={2}>
            <Text size="sm" fw={500}>
              Предыстория и мотивы
            </Text>
            <ArticleEditor
              blocks={editBiography}
              onChange={(updatedBlocks) => setEditBiography(updatedBlocks)}
            />
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" color="gray" onClick={closeBioModal}>
              Отмена
            </Button>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={handleSaveBio}
              loading={savingBio}
            >
              Сохранить изменения
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* --- MAIN IDENTITY DRAWER PANEL (CLASS/RACE/BACKGROUND) --- */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Редактирование параметров персонажа"
        position="right"
        size="md"
        padding="xl"
      >
        <Stack gap="md">
          <TextInput
            label="Имя героя"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Group grow>
            <Select
              label="Класс"
              data={classes}
              value={editClass}
              onChange={setEditClass}
              required
              searchable
            />
            <Select
              label="Раса"
              data={species}
              value={editSpecies}
              onChange={setEditSpecies}
              required
              searchable
            />
          </Group>

          <Select
            label="Предыстория"
            data={backgrounds}
            value={editBackground}
            onChange={setEditBackground}
            required
            searchable
          />

          <Group grow>
            <NumberInput
              label="Уровень"
              value={editLevel}
              onChange={(v) => setEditLevel(Number(v))}
              min={1}
              max={20}
            />
            <NumberInput
              label="Опыт (XP)"
              value={editXp}
              onChange={(v) => setEditXp(Number(v))}
              min={0}
            />
          </Group>

          <Button
            color="green"
            mt="xl"
            leftSection={<IconCheck size={16} />}
            onClick={handleSaveCoreStats}
            loading={savingCore}
          >
            Сохранить изменения
          </Button>
        </Stack>
      </Drawer>
    </Container>
  );
}