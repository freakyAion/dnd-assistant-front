import { useEffect, useState } from 'react';
import {
  IconCheck,
  IconChevronLeft,
  IconEdit,
  IconEye,
  IconNotebook,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Loader,
  Modal,
  MultiSelect,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  createRule,
  deleteRule,
  getRuleBySlug,
  getRules,
  Rule,
  RuleCategory,
  updateRule,
} from '../api/api';
import { ArticleEditor } from '../components/ArticleEditor/ArticleEditor';
import { ArticleRenderer, Block } from '../components/ArticleRenderer/ArticleRenderer';
import { IsAdmin } from '../store/auth';

// Explicit translation maps for backend integer enums
export const CATEGORY_LABELS: Record<RuleCategory, string> = {
  [RuleCategory.CoreMechanics]: 'Основные механики',
  [RuleCategory.Combat]: 'Боевая система',
  [RuleCategory.Adventuring]: 'Приключения и Исследование',
  [RuleCategory.Spellcasting]: 'Заклинания и Магия',
};

export const formatCategoryName = (category: RuleCategory | number): string => {
  return CATEGORY_LABELS[category as RuleCategory] || `Категория ${category}`;
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value, // Number index stringified for Mantine compatibility
  label,
}));

export function RulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [adminMode, setAdminMode] = useState(false);

  // Admin Workspace State Buffers
  const [editorOpened, setEditorOpened] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editCategory, setEditCategory] = useState<string>(String(RuleCategory.CoreMechanics));
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);

  const fetchRulesList = () => {
    setLoading(true);
    getRules()
      .then((res) => {
        setRules(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить книгу правил',
          color: 'red',
        })
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRulesList();
  }, []);

  // Recalculate context clearance dynamically on state transitions
  useEffect(() => {
    setAdminMode(IsAdmin());
  }, [rules, selectedRule]);

  // Generate automated safe slugs when typing out names for new items
  const handleTitleChange = (val: string) => {
    setEditTitle(val);
    if (!editingRuleId) {
      const simplified = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setEditSlug(simplified);
    }
  };

  const handleSelectRule = (slug: string) => {
    setDetailLoading(true);
    getRuleBySlug(slug)
      .then((res) => setSelectedRule(res.data))
      .catch(() =>
        notifications.show({
          title: 'Ошибка',
          message: 'Не удалось загрузить детальное описание правила',
          color: 'red',
        })
      )
      .finally(() => setDetailLoading(false));
  };

  const openEditor = (rule: Rule | null = null) => {
    if (rule) {
      setEditingRuleId(rule.id || null);
      setEditTitle(rule.title);
      setEditSlug(rule.slug);
      setEditCategory(String(rule.category));
      setEditBlocks(rule.content?.blocks || []);
    } else {
      setEditingRuleId(null);
      setEditTitle('');
      setEditSlug('');
      setEditCategory(String(RuleCategory.CoreMechanics));
      setEditBlocks([]);
    }
    setEditorOpened(true);
  };

  const handleSaveRule = async () => {
    if (!editTitle.trim() || !editSlug.trim()) {
      notifications.show({
        title: 'Ошибка',
        message: 'Заполните название и уникальный Slug',
        color: 'red',
      });
      return;
    }

    setSubmitting(true);
    const payload: Omit<Rule, 'id'> = {
      title: editTitle,
      slug: editSlug.toLowerCase().trim(),
      category: Number(editCategory) as RuleCategory,
      content: { blocks: editBlocks },
    };

    try {
      if (editingRuleId) {
        await updateRule(editingRuleId, payload);
        notifications.show({
          title: 'Успех',
          message: 'Правило успешно обновлено',
          color: 'green',
        });
      } else {
        await createRule(payload);
        notifications.show({
          title: 'Успех',
          message: 'Новая механика добавлена в книгу правил',
          color: 'green',
        });
      }
      setEditorOpened(false);
      setSelectedRule(null);
      fetchRulesList();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось зафиксировать изменения правила',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async (id: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    if (!window.confirm('Вы уверены, что хотите безвозвратно стереть это правило?')) return;

    try {
      await deleteRule(id);
      notifications.show({
        title: 'Удалено',
        message: 'Запись удалена из справочников механики',
        color: 'gray',
      });
      setSelectedRule(null);
      fetchRulesList();
    } catch {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось стереть выбранное правило',
        color: 'red',
      });
    }
  };

  const filteredRules = rules.filter((r) => {
    if (!r || !r.title) return false;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilters.length === 0 || categoryFilters.includes(String(r.category));
    return matchesSearch && matchesCategory;
  });

  if (loading || detailLoading) {
    return (
      <Stack align="center" justify="center" h="50vh">
        <Loader size="xl" />
        <Text c="dimmed">Загрузка свода правил системы...</Text>
      </Stack>
    );
  }

  // --- 1. DETAILED INLINE VIEW PANEL ---
  if (selectedRule) {
    return (
      <Container fluid p={0}>
        <Stack gap="lg">
          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<IconChevronLeft size={16} />}
              onClick={() => setSelectedRule(null)}
              p={0}
              color="gray"
            >
              Назад к списку правил
            </Button>

            {adminMode && (
              <Group gap="xs">
                <Button
                  size="xs"
                  variant="outline"
                  leftSection={<IconEdit size={14} />}
                  onClick={() => openEditor(selectedRule)}
                >
                  Редактировать
                </Button>
                {selectedRule.id && (
                  <Button
                    size="xs"
                    variant="outline"
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => handleDeleteRule(selectedRule.id!)}
                  >
                    Удалить
                  </Button>
                )}
              </Group>
            )}
          </Group>

          <Group justify="space-between" align="center">
            <Stack gap="xs">
              <Title order={1}>{selectedRule.title}</Title>
              <Group gap="xs">
                <Badge color="blue" size="lg">
                  {formatCategoryName(selectedRule.category)}
                </Badge>
                <Badge color="gray" size="sm" variant="outline">
                  Slug: {selectedRule.slug}
                </Badge>
              </Group>
            </Stack>
          </Group>

          <Box mt="md">
            {selectedRule.content?.blocks?.length > 0 ? (
              <ArticleRenderer
                article={{ title: '', content: selectedRule.content.blocks as Block[] }}
              />
            ) : (
              <Text c="dimmed" fs="italic">
                Содержимое правила пусто.
              </Text>
            )}
          </Box>
        </Stack>
      </Container>
    );
  }

  // --- 2. REGULAR OVERVIEW CARD GRID VIEW ---
  return (
    <Container fluid p={0}>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap="xs">
            <Title order={1}>Книга правил</Title>
            <Text c="dimmed">
              Справочник по основным механикам, правилам боя и исследованиям мира
            </Text>
          </Stack>
          {adminMode && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => openEditor(null)}>
              Добавить правило
            </Button>
          )}
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TextInput
            placeholder="Поиск правил по названию..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />

          <MultiSelect
            placeholder="Фильтр категорий"
            clearable
            searchable
            data={CATEGORY_OPTIONS}
            value={categoryFilters}
            onChange={setCategoryFilters}
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

                {adminMode && (
                  <Group gap={4} onClick={(e) => e.stopPropagation()}>
                    <ActionIcon variant="subtle" color="blue" onClick={() => openEditor(r)}>
                      <IconEdit size={14} />
                    </ActionIcon>
                    {r.id && (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={(e) => handleDeleteRule(r.id!, e)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                )}
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

      {/* --- 3. ADMIN RULE OPERATIONS WORKSPACE MODAL --- */}
      <Modal
        opened={editorOpened}
        onClose={() => setEditorOpened(false)}
        title={editingRuleId ? 'Редактирование игровой механики' : 'Создание нового правила'}
        size="100%"
        radius="md"
      >
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper p="md" withBorder radius="sm">
                <Title order={4} mb="sm">
                  Параметры правила
                </Title>
                <Stack gap="xs">
                  <TextInput
                    label="Название правила / Механики"
                    value={editTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Уникальный Slug ссылки (URL)"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    placeholder="core-dice-rolling"
                    disabled={!!editingRuleId} // Prevent rewriting live routing keys on active entries
                    required
                  />
                  <Select
                    label="Категория справочника"
                    data={CATEGORY_OPTIONS}
                    value={editCategory}
                    onChange={(val) => setEditCategory(val || String(RuleCategory.CoreMechanics))}
                  />

                  <Box mt="sm">
                    <Text size="sm" fw={500} mb={4}>
                      Детальный структурированный текст правила
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
                Живой предпросмотр структуры статьи:
              </Text>
              <Paper
                p="xl"
                withBorder
                radius="md"
                shadow="xs"
                style={{ minHeight: '450px', height: '100%' }}
              >
                <Title order={2}>{editTitle || 'Название правила'}</Title>
                <Group gap="xs" mt="xs" mb="lg">
                  <Badge color="blue">{formatCategoryName(Number(editCategory))}</Badge>
                  <Badge color="gray" variant="outline">
                    slug: {editSlug || '—'}
                  </Badge>
                </Group>

                <Box
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
              onClick={handleSaveRule}
              loading={submitting}
            >
              Сохранить правило
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
