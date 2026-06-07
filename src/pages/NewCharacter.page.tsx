import { useState } from 'react';
import { IconArrowLeft, IconArrowRight, IconDeviceFloppy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Stepper,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';

export function NewCharacterPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  // Form Field States
  const [name, setName] = useState('');
  const [level, setLevel] = useState<number | string>(1);
  const [sex, setSex] = useState('');
  const [age, setAge] = useState('');

  // Lookup IDs
  const [startingClassID, setStartingClassID] = useState<string | null>(null);
  const [raceID, setRaceID] = useState<string | null>(null);
  const [backgroundID, setBackgroundID] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<string | null>(null);

  // Appearance & Narrative blocks
  const [hairColour, setHairColour] = useState('');
  const [eyeColour, setEyeColour] = useState('');
  const [backstory, setBackstory] = useState('');

  // Client-side UI validation guards
  const isNameInvalid = name.trim().length < 3 || name.trim().length > 255;
  const isFirstStepInvalid = isNameInvalid || !sex;
  const isSecondStepInvalid = !startingClassID || !raceID || !alignment;

  // Safe navigation bounds fixes
  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stops the form from seeing the click as a submit event
    setActiveStep((current) => (current < 2 ? current + 1 : current));
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveStep((current) => (current > 0 ? current - 1 : current));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      level: Number(level),
      startingClassID,
      raceID,
      backgroundID,
      sex,
      age,
      alignment,
      hairColour,
      eyeColour,
      backstory,
    };

    console.log('Submitting data package via client.ts wrapper:', payload);
    navigate('/characters');
  };

  return (
    <Box style={{ width: '100%' }} p="xs">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate('/characters')}
        mb="md"
      >
        Отмена
      </Button>

      <Title order={2} mb="xl">
        Создание нового персонажа
      </Title>

      <form onSubmit={handleSubmit}>
        {/* Fixed: Dropped breakpoint from root properties to prevent engine crash errors */}
        <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}>
          {/* STEP 0: IDENTITY */}
          <Stepper.Step label="Личность" description="Базовые данные">
            <Card withBorder radius="md" p="xl" mt="md" shadow="sm">
              <Stack gap="md">
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <TextInput
                      label="Имя персонажа"
                      placeholder="Вракс, Ссет, Эвриала..."
                      required
                      value={name}
                      onChange={(e) => setName(e.currentTarget.value)}
                      error={
                        name && isNameInvalid ? 'Имя должно содержать от 3 до 255 символов' : null
                      }
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <NumberInput
                      label="Уровень"
                      min={1}
                      max={20}
                      required
                      value={level}
                      onChange={setLevel}
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Пол"
                      placeholder="М / Ж / Неизвестно"
                      required
                      value={sex}
                      onChange={(e) => setSex(e.currentTarget.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Возраст"
                      placeholder="Например: 24, 112"
                      value={age}
                      onChange={(e) => setAge(e.currentTarget.value)}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          </Stepper.Step>

          {/* STEP 1: RPG STATS */}
          <Stepper.Step label="Игровые параметры" description="Выбор расы и класса">
            <Card withBorder radius="md" p="xl" mt="md" shadow="sm">
              <Stack gap="md">
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="Раса"
                      placeholder="Выберите расу"
                      required
                      data={[
                        { value: 'guid-goblin-1111', label: 'Гоблин' },
                        { value: 'guid-naga-2222', label: 'Нага' },
                        { value: 'guid-gorgon-3333', label: 'Горгона' },
                        { value: 'guid-orc-4444', label: 'Орк' },
                      ]}
                      value={raceID}
                      onChange={setRaceID}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="Игровой класс"
                      placeholder="Выберите класс"
                      required
                      data={[
                        { value: 'guid-artificer-1111', label: 'Изобретатель' },
                        { value: 'guid-fighter-2222', label: 'Воин' },
                        { value: 'guid-sorcerer-3333', label: 'Чародей' },
                        { value: 'guid-barbarian-4444', label: 'Варвар' },
                      ]}
                      value={startingClassID}
                      onChange={setStartingClassID}
                    />
                  </Grid.Col>
                </Grid>

                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="Мировоззрение"
                      placeholder="Выберите мировоззрение"
                      required
                      data={[
                        { value: '0', label: 'Законопослушно-добрый' },
                        { value: '1', label: 'Законопослушно-нейтральный' },
                        { value: '2', label: 'Законопослушно-злой' },
                        { value: '3', label: 'Истинно-нейтральный' },
                        { value: '4', label: 'Хаотично-нейтральный' },
                        { value: '5', label: 'Хаотично-добрый' },
                      ]}
                      value={alignment}
                      onChange={setAlignment}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="Предыстория"
                      placeholder="Выберите предысторию"
                      data={[
                        { value: 'guid-bg-noble', label: 'Благородный' },
                        { value: 'guid-bg-hermit', label: 'Отшельник' },
                      ]}
                      value={backgroundID}
                      onChange={setBackgroundID}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>
          </Stepper.Step>

          {/* STEP 2: NARRATIVE DETAILS */}
          <Stepper.Step label="Внешность и Биография" description="Детализация истории">
            <Card withBorder radius="md" p="xl" mt="md" shadow="sm">
              <Stack gap="md">
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Цвет волос"
                      placeholder="Черные, седые, отсутствуют..."
                      value={hairColour}
                      onChange={(e) => setHairColour(e.currentTarget.value)}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput
                      label="Цвет глаз"
                      placeholder="Желтые, красные, зеленые..."
                      value={eyeColour}
                      onChange={(e) => setEyeColour(e.currentTarget.value)}
                    />
                  </Grid.Col>
                </Grid>

                <Textarea
                  label="Предыстория персонажа"
                  placeholder="Опишите прошлое вашего персонажа, его цели и мотивы..."
                  minRows={5}
                  value={backstory}
                  onChange={(e) => setBackstory(e.currentTarget.value)}
                />
              </Stack>
            </Card>
          </Stepper.Step>
        </Stepper>

        {/* STEPPER NAVIGATION CONTROLS */}
        <Group justify="flex-end" mt="xl">
          {activeStep !== 0 && (
            <Button
              type="button" // Explicitly prevent form submission
              variant="default"
              onClick={handlePrevStep}
              leftSection={<IconArrowLeft size={16} />}
            >
              Назад
            </Button>
          )}

          {activeStep < 2 ? (
            <Button
              type="button" // Fixes the form reset when clicking next step
              onClick={handleNextStep}
              rightSection={<IconArrowRight size={16} />}
              disabled={activeStep === 0 ? isFirstStepInvalid : isSecondStepInvalid}
            >
              Далее
            </Button>
          ) : (
            <Button
              type="submit" // Only the final button is allowed to submit the form
              color="green"
              leftSection={<IconDeviceFloppy size={16} />}
            >
              Сохранить персонажа
            </Button>
          )}
        </Group>
      </form>
    </Box>
  );
}
