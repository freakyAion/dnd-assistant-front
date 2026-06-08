import { useEffect, useState } from 'react';
import { IconChevronLeft, IconEye, IconNotebook, IconSearch } from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Loader,
  MultiSelect,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { getRuleBySlug, getRules, Rule } from '../api/api';

const formatCategoryName = (category: string | number) => {
  const mapping: Record<string | number, string> = {
    0: 'Общие правила',
    1: 'Боевая система', // If it was showing '1', it becomes 'Боевая система' now
    2: 'Персонаж',
    3: 'Магия',
    // Keep string fallbacks just in case your backend swaps them dynamically
    General: 'Общие правила',
    Combat: 'Боевая система',
    Character: 'Персонаж',
    Magic: 'Магия',
  };
  return mapping[category] || String(category);
};

export function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);

  useEffect(() => {
    getRules()
      .then((res) => {
        // Sanity check incoming array data
        setRules(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить правила',
          color: 'red',
        })
      )
      .finally(() => setLoading(false));
  }, []);

  const handleSelectRule = (slug: string) => {
    setDetailLoading(true);
    getRuleBySlug(slug)
      .then((res) => setSelectedRule(res.data))
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить описание правила',
          color: 'red',
        })
      )
      .finally(() => setDetailLoading(false));
  };

  const filteredRules = rules.filter((r) => {
    if (!r || !r.title) return false;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilters.length === 0 || categoryFilters.includes(r.category);
    return matchesSearch && matchesCategory;
  });

  // Safe unique option generation with non-string values dropped entirely
  const uniqueCategories = Array.from(new Set(rules.map((r) => r.category)))
    .filter((cat) => typeof cat === 'string' && cat.trim() !== '')
    .map((cat) => ({
      value: String(cat),
      label: formatCategoryName(cat),
    }));

  if (loading || detailLoading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Загрузка свода правил...</Text>
      </Stack>
    );
  }

  // --- DETAILED INLINE VIEW ---
  if (selectedRule) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group>
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft size={16} />}
              onClick={() => setSelectedRule(null)}
              p={0}
            >
              Назад к правилам
            </Button>
          </Group>

          <Group justify="space-between" align="center">
            <Stack gap="xs">
              <Title order={1}>{selectedRule.title}</Title>
              <Badge color="blue" size="lg" style={{ alignSelf: 'flex-start' }}>
                {formatCategoryName(selectedRule.category)}
              </Badge>
            </Stack>
          </Group>

          <Stack gap="sm" mt="md">
            {selectedRule.content?.blocks?.map((block, idx) =>
              block.type === 'paragraph' || block.type === 'heading' ? (
                <Text
                  key={idx}
                  size={block.type === 'heading' ? 'xl' : 'lg'}
                  fw={block.type === 'heading' ? 700 : 400}
                  style={{ lineHeight: 1.6 }}
                >
                  {block.text}
                </Text>
              ) : null
            )}
          </Stack>
        </Stack>
      </Container>
    );
  }

  // --- OVERVIEW GRID VIEW ---
  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1}>Книга правил</Title>
          <Text c="dimmed">Справочник по основным механикам, правилам боя и состояниям</Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TextInput
            placeholder="Поиск правил..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          
          <MultiSelect
            placeholder="Категории механик"
            clearable
            searchable
            data={uniqueCategories}
            // Defensively convert array input down to strict string elements to prevent internal crashes
            value={Array.isArray(categoryFilters) 
              ? categoryFilters.filter(val => typeof val === 'string').map(val => String(val)) 
              : []
            }
            // Strict sanitization of values received from change events
            onChange={(values) => {
              if (!values || !Array.isArray(values)) {
                setCategoryFilters([]);
              } else {
                setCategoryFilters(values.filter(val => typeof val === 'string'));
              }
            }}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredRules.map((r) => (
            <Card
              key={r.slug}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectRule(r.slug)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" style={{ overflow: 'hidden' }}>
                  <IconNotebook
                    size={20}
                    style={{ color: 'var(--mantine-color-blue-filled)', flexShrink: 0 }}
                  />
                  <Title order={4} lineClamp={1}>
                    {r.title}
                  </Title>
                </Group>
                <ActionIcon variant="subtle" color="gray">
                  <IconEye size={14} />
                </ActionIcon>
              </Group>
              <Group gap={4} mt="xs">
                <Badge size="xs" variant="light" color="blue">
                  {formatCategoryName(r.category)}
                </Badge>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}