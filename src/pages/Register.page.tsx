import { useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { register } from '../api/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: {
      name: (val) => {
        if (val.length < 3) return 'Имя должно быть не менее 3 символов';
        if (val.length > 255) return 'Имя не может быть длиннее 255 символов';
        if (!/^[A-Za-z0-9_\- ]{3,255}$/.test(val))
          return 'Имя может содержать только буквы, цифры, пробелы, _ и -';
        return null;
      },
      email: (val) => (/^\S+@\S+\.\S+$/.test(val) ? null : 'Введите корректный email'),
      password: (val) => (val.length < 8 ? 'Пароль должен быть не менее 8 символов' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError('');
    try {
      await register(values);

      // Success Notification
      notifications.show({
        title: 'Регистрация успешна',
        message: 'Аккаунт создан! Теперь вы можете войти в систему.',
        color: 'green',
        icon: <IconCheck size={16} />,
        autoClose: 4000,
      });

      navigate('/login');
    } catch (err: any) {
      const serverMessage = err.response?.data?.message;
      setError(serverMessage || 'Ошибка регистрации. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack align="center" justify="center" h="100vh">
      <Paper p="xl" withBorder w={360}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Title order={2} ta="center">
              Регистрация
            </Title>
            {error && (
              <Text c="red" size="sm" ta="center">
                {error}
              </Text>
            )}
            <TextInput
              label="Имя"
              placeholder="Ваше имя"
              maxLength={255}
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Email"
              placeholder="Ваш email"
              maxLength={100}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Пароль"
              placeholder="Придумайте пароль"
              maxLength={100}
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={loading} fullWidth>
              Зарегистрироваться
            </Button>
            <Text size="sm" ta="center">
              Уже есть аккаунт?{' '}
              <Anchor component={Link} to="/login">
                Войти
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
