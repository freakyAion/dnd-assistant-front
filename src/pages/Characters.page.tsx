import { useEffect, useState } from 'react';
import { IconEye, IconLock, IconTrash, IconUserPlus, IconWorld } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  Textarea,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  createCharacter,
  deleteCharacter,
  getMyCharacters,
  getWizardBackgrounds,
  getWizardClasses,
  getWizardSpecies,
} from '../api/api';

interface CharacterSummary {
  id: string;
  name: string;
  className: string;
  speciesName: string;
  level: number;
  alignment: string;
  isPublic: boolean;
}

interface DirectoryOption {
  value: string;
  label: string;
}

export function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Wizard Modal State Control Hooks
  const [opened, { open, close }] = useDisclosure(false);
  const [activeStep, setActiveStep] = useState(0);

  // Directory Pool Data Arrays
  const [classes, setClasses] = useState<DirectoryOption[]>([]);
  const [species, setSpecies] = useState<DirectoryOption[]>([]);
  const [backgrounds, setBackgrounds] = useState<DirectoryOption[]>([]);

  // Wizard Creation Form States
  const [formName, setFormName] = useState('');
  const [formClass, setFormClass] = useState<string | null>(null);
  const [formSpecies, setFormSpecies] = useState<string | null>(null);
  const [formBackground, setFormBackground] = useState<string | null>(null);
  const [formAlignment, setFormAlignment] = useState<string | null>('True Neutral');

  // Base D&D Ability values standard array defaults
  const [str, setStr] = useState<number>(10);
  const [dex, setDex] = useState<number>(10);
  const [con, setCon] = useState<number>(10);
  const [int, setIntel] = useState<number>(10);
  const [wis, setWis] = useState<number>(10);
  const [cha, setCha] = useState<number>(10);
  const [hp, setHp] = useState<number>(10);

  // RP biography details
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [appearance, setAppearance] = useState('');

  const fetchCharacters = () => {
    getMyCharacters()
      .then((res) => {
        setCharacters(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить персонажей',
          color: 'red',
        })
      )
      .finally(() => setLoading(false));
  };

  // Pre-fetch handbook elements so lists are instantly ready inside selects
  const loadWizardDirectories = () => {
    getWizardClasses().then((res) => {
      setClasses(res.data.map((c) => ({ value: c.id, label: c.name })));
    });

    getWizardSpecies().then((res) => {
      setSpecies(res.data.map((s) => ({ value: s.id, label: s.name })));
    });

    getWizardBackgrounds().then((res) => {
      setBackgrounds(res.data.map((b) => ({ value: b.id, label: b.name })));
    });
  };

  useEffect(() => {
    fetchCharacters();
    loadWizardDirectories();
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Вы уверены, что хотите окончательно удалить этого персонажа?')) return;

    deleteCharacter(id)
      .then(() => {
        notifications.show({ message: 'Персонаж успешно удален', color: 'green' });
        fetchCharacters();
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось произвести удаление',
          color: 'red',
        })
      );
  };

  const handleCreateSubmit = () => {
    if (!formName || !formClass || !formSpecies || !formBackground) {
      notifications.show({
        title: 'Ошибка',
        message: 'Пожалуйста, заполните обязательные параметры персонажа',
        color: 'red',
      });
      return;
    }

    createCharacter({
      name: formName,
      classId: formClass,
      speciesId: formSpecies,
      backgroundId: formBackground,
      alignment: formAlignment || 'True Neutral',
      biography: bio,
      age: age,
      height: height,
      weight: weight,
      physicalAppearance: appearance,
      strength: str,
      dexterity: dex,
      constitution: con,
      intelligence: int,
      wisdom: wis,
      charisma: cha,
      maxHitPoints: hp,
    })
      .then((res) => {
        notifications.show({ message: 'Персонаж успешно добавлен!', color: 'green' });
        close();

        // Reset local wizard fields
        setFormName('');
        setFormClass(null);
        setFormSpecies(null);
        setFormBackground(null);
        setFormAlignment('True Neutral');
        setStr(10);
        setDex(10);
        setCon(10);
        setIntel(10);
        setWis(10);
        setCha(10);
        setHp(10);
        setBio('');
        setAge('');
        setHeight('');
        setWeight('');
        setAppearance('');
        setActiveStep(0);

        navigate(`/characters/${res.data.id}`);
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось завершить создание персонажа',
          color: 'red',
        })
      );
  };

  if (loading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Загрузка списка персонажей...</Text>
      </Stack>
    );
  }

  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Персонажи</Title>
            <Text c="dimmed">
              Управляйте своими героями или создайте нового искателя приключений
            </Text>
          </Stack>
          <Button leftSection={<IconUserPlus size={16} />} onClick={open}>
            Создать персонажа
          </Button>
        </Group>

        {characters.length === 0 ? (
          <Card withBorder padding="xl" radius="md" style={{ textAlign: 'center' }}>
            <Text c="dimmed" size="lg" mb="md">
              У вас пока нет созданных персонажей.
            </Text>
            <Button variant="light" onClick={open}>
              Запустить мастер создания
            </Button>
          </Card>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            {characters.map((char) => (
              <Card
                key={char.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/characters/${char.id}`)}
              >
                <Stack gap="xs">
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Stack gap={2}>
                      <Title order={3} lineClamp={1}>
                        {char.name}
                      </Title>
                      <Group gap={4}>
                        {char.isPublic ? (
                          <Badge size="xs" color="green" leftSection={<IconWorld size={10} />}>
                            Доступен по ссылке
                          </Badge>
                        ) : (
                          <Badge size="xs" color="gray" leftSection={<IconLock size={10} />}>
                            Приватный
                          </Badge>
                        )}
                      </Group>
                    </Stack>
                    <Badge variant="filled" color="blue">
                      Ур. {char.level}
                    </Badge>
                  </Group>

                  <Group gap="xs" mt="xs">
                    <Badge variant="light" color="gray">
                      {char.speciesName}
                    </Badge>
                    <Badge variant="light" color="red">
                      {char.className}
                    </Badge>
                    <Badge variant="light" color="violet">
                      {char.alignment}
                    </Badge>
                  </Group>

                  <Group justify="space-between" mt="md">
                    <Button variant="subtle" size="xs" leftSection={<IconEye size={14} />} p={0}>
                      Открыть лист
                    </Button>
                    <Tooltip label="Удалить">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={(e) => handleDelete(e, char.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>

      {/* --- CHARACTER CREATION WIZARD MODAL --- */}
      <Modal opened={opened} onClose={close} title="Мастер создания героя" size="lg" radius="md">
        <Stack gap="md">
          <Stepper active={activeStep} onStepClick={setActiveStep} size="sm">
            <Stepper.Step label="Имя и происхождение" description="Базовые параметры">
              <Stack gap="sm" mt="md">
                <TextInput
                  label="Имя героя"
                  placeholder="Например: Люциус Тенебрей"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.currentTarget.value)}
                />
                <Select
                  label="Игровой класс"
                  placeholder="Выберите класс"
                  data={classes}
                  required
                  value={formClass}
                  onChange={setFormClass}
                  searchable
                />
                <Select
                  label="Раса"
                  placeholder="Выберите расу"
                  data={species}
                  required
                  value={formSpecies}
                  onChange={setFormSpecies}
                  searchable
                />
                <Select
                  label="Предыстория"
                  placeholder="Выберите предысторию"
                  data={backgrounds}
                  required
                  value={formBackground}
                  onChange={setFormBackground}
                  searchable
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Характеристики" description="Атрибуты">
              <Stack gap="xs" mt="md">
                <Text size="sm" c="dimmed">
                  Укажите стартовые числовые значения характеристик персонажа:
                </Text>
                <SimpleGrid cols={2} spacing="xs">
                  <NumberInput
                    label="Сила (STR)"
                    value={str}
                    onChange={(v) => setStr(Number(v))}
                    min={1}
                    max={30}
                  />
                  <NumberInput
                    label="Ловкость (DEX)"
                    value={dex}
                    onChange={(v) => setDex(Number(v))}
                    min={1}
                    max={30}
                  />
                  <NumberInput
                    label="Телосложение (CON)"
                    value={con}
                    onChange={(v) => setCon(Number(v))}
                    min={1}
                    max={30}
                  />
                  <NumberInput
                    label="Интеллект (INT)"
                    value={int}
                    onChange={(v) => setIntel(Number(v))}
                    min={1}
                    max={30}
                  />
                  <NumberInput
                    label="Мудрость (WIS)"
                    value={wis}
                    onChange={(v) => setWis(Number(v))}
                    min={1}
                    max={30}
                  />
                  <NumberInput
                    label="Харизма (CHA)"
                    value={cha}
                    onChange={(v) => setCha(Number(v))}
                    min={1}
                    max={30}
                  />
                </SimpleGrid>
                <Divider my="xs" />
                <NumberInput
                  label="Максимальное здоровье (Max HP)"
                  value={hp}
                  onChange={(v) => setHp(Number(v))}
                  min={1}
                  max={500}
                />
              </Stack>
            </Stepper.Step>

            <Stepper.Step label="Детали" description="Личность и внешность">
              <Stack gap="sm" mt="md">
                <Select
                  label="Мировоззрение (Alignment)"
                  placeholder="Выберите мировоззрение"
                  data={[
                    'Lawful Good',
                    'Neutral Good',
                    'Chaotic Good',
                    'Lawful Neutral',
                    'True Neutral',
                    'Chaotic Neutral',
                    'Lawful Evil',
                    'Neutral Evil',
                    'Chaotic Evil',
                  ]}
                  value={formAlignment}
                  onChange={setFormAlignment}
                />
                <SimpleGrid cols={3} spacing="xs">
                  <TextInput
                    label="Возраст"
                    placeholder="25 лет"
                    value={age}
                    onChange={(e) => setAge(e.currentTarget.value)}
                  />
                  <TextInput
                    label="Рост"
                    placeholder="180 см"
                    value={height}
                    onChange={(e) => setHeight(e.currentTarget.value)}
                  />
                  <TextInput
                    label="Вес"
                    placeholder="75 кг"
                    value={weight}
                    onChange={(e) => setWeight(e.currentTarget.value)}
                  />
                </SimpleGrid>
                <Textarea
                  label="Внешний вид"
                  placeholder="Шрамы, примечательные элементы одежды, цвет глаз..."
                  rows={2}
                  value={appearance}
                  onChange={(e) => setAppearance(e.currentTarget.value)}
                />
                <Textarea
                  label="Биография"
                  placeholder="Опишите краткую предысторию вашего искателя приключений..."
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.currentTarget.value)}
                />
              </Stack>
            </Stepper.Step>
          </Stepper>

          <Group justify="space-between" mt="xl">
            <Button
              variant="default"
              onClick={() => setActiveStep((current) => (current > 0 ? current - 1 : current))}
              disabled={activeStep === 0}
            >
              Назад
            </Button>
            {activeStep < 2 ? (
              <Button
                onClick={() => setActiveStep((current) => (current < 2 ? current + 1 : current))}
              >
                Далее
              </Button>
            ) : (
              <Button color="green" onClick={handleCreateSubmit}>
                Создать персонажа
              </Button>
            )}
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
