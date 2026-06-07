// src/pages/WorldCreate.page.tsx
import { IconLock, IconWorld } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Group,
  Paper,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export function WorldCreatePage() {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      name: '',
      pitch: '',
      description: '',
      isPublic: false,
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Название должно быть не менее 3 символов' : null),
      pitch: (value) => (value.length > 500 ? 'Питч не должен превышать 500 символов' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    // Local simulation: Log the data that would hit the POST /api/worlds endpoint
    console.log('Building new world:', values);

    // Simulate successful creation and redirect back to the dashboard
    navigate('/worlds');
  };

  return (
    <Stack gap="lg" p="md" align="center">
      <Paper withBorder shadow="sm" p="xl" w={{ base: '100%', md: 800 }} radius="md">
        <Title order={2} mb="xs">
          Зарождение нового мира
        </Title>
        <Text c="dimmed" mb="xl">
          Определите фундаментальные законы и атмосферу вашего сеттинга.
        </Text>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              withAsterisk
              label="Название мира"
              placeholder="Например: Arcane Forge"
              size="md"
              {...form.getInputProps('name')}
            />

            <Textarea
              label="Короткое описание (Pitch)"
              description="Краткая выжимка (до 500 символов), передающая суть сеттинга."
              placeholder="Мрачный индустриальный мир, где магия течет по трубам..."
              minRows={3}
              {...form.getInputProps('pitch')}
            />

            <Textarea
              label="Глобальное описание"
              description="В MVP версии это простой текст. Позже здесь будет полноценный Rich Text Editor (JSON)."
              placeholder="Подробная история создания, пантеон богов, законы физики..."
              minRows={8}
              {...form.getInputProps('description')}
            />

            <Paper p="md" withBorder mt="sm">
              <Group justify="space-between">
                <div>
                  <Text fw={500}>Приватность сеттинга</Text>
                  <Text size="sm" c="dimmed">
                    Определяет, смогут ли другие пользователи платформы найти и читать открытые
                    материалы вашего мира.
                  </Text>
                </div>
                <Switch
                  size="lg"
                  onLabel={<IconWorld size={14} />}
                  offLabel={<IconLock size={14} />}
                  {...form.getInputProps('isPublic', { type: 'checkbox' })}
                />
              </Group>
            </Paper>

            <Group justify="flex-end" mt="xl">
              <Button variant="default" onClick={() => navigate('/worlds')}>
                Отменить
              </Button>
              <Button type="submit" color="indigo" size="md">
                Сотворить мир
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
