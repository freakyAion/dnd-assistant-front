import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { login } from '../api/api';
import { saveToken } from '../store/auth';
import { useState } from 'react';

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (val) => (/^\S+@\S+\.\S+$/.test(val) ? null : 'Введите корректный email'),
      password: (val) => val.length < 6 ? 'Пароль должен быть не менее 6 символов' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError('');
    try {
      const res = await login(values);
      saveToken(res.data.accessToken);
      navigate('/');
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack align="center" justify="center" h="100vh">
      <Paper p="xl" withBorder w={360}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Title order={2} ta="center">Вход</Title>
            {error && <Text c="red" size="sm">{error}</Text>}
            <TextInput
              label="Email"
              placeholder="Ваш email"
              maxLength={100}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Пароль"
              placeholder="Ваш пароль"
              maxLength={100}
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={loading} fullWidth>
              Войти
            </Button>
            <Text size="sm" ta="center">
              Нет аккаунта?{' '}
              <Anchor component={Link} to="/register">Зарегистрироваться</Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}