import { useState, useRef } from 'react';
import { Badge, Button, Card, Group, Loader, Modal, SimpleGrid, Stack, Text, TextInput, Title, FileButton, Box, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMapPin, IconPlus, IconUpload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { addLocation, Location, uploadImage, updateWorldMap } from '../../api/api';

interface LocationsModuleProps {
  worldId: string;
  initialLocations: Location[];
  initialMapUrl?: string;
  isOwner: boolean;
}

export function LocationsModule({ worldId, initialLocations, initialMapUrl, isOwner }: LocationsModuleProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [mapUrl, setMapUrl] = useState<string | undefined>(initialMapUrl);
  const [uploadingMap, setUploadingMap] = useState(false);
  
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [coordX, setCoordX] = useState<number | undefined>();
  const [coordY, setCoordY] = useState<number | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  const handleMapUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingMap(true);
    try {
      const uploadRes = await uploadImage(file);
      const url = uploadRes.data.url;
      
      // Update the URL format so the frontend fetches it properly from the .NET host
      const fullUrl = `https://localhost:7178${url}`;
      await updateWorldMap(worldId, fullUrl);
      
      setMapUrl(fullUrl);
      notifications.show({ message: 'Карта успешно загружена!', color: 'green' });
    } catch {
      notifications.show({ title: 'Ошибка', message: 'Не удалось загрузить карту.', color: 'red' });
    } finally {
      setUploadingMap(false);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isOwner) return;
    
    // Calculate percentage relative to image dimensions for responsiveness
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCoordX(x);
    setCoordY(y);
    open();
  };

  const handleAddLocation = () => {
    if (!name.trim() || !type.trim()) {
      notifications.show({ title: 'Ошибка', message: 'Укажите название и тип.', color: 'red' });
      return;
    }

    setSubmitting(true);
    addLocation(worldId, {
      name,
      type,
      x: coordX,
      y: coordY,
      description: { blocks: [] },
    })
      .then((res) => {
        notifications.show({ message: 'Локация успешно добавлена!', color: 'green' });
        setLocations((prev) => [...prev, res.data]);
        closeModal();
      })
      .catch(() => notifications.show({ title: 'Ошибка', message: 'Сбой при добавлении.', color: 'red' }))
      .finally(() => setSubmitting(false));
  };

  const closeModal = () => {
    close();
    setName('');
    setType('');
    setCoordX(undefined);
    setCoordY(undefined);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text c="dimmed">Кликайте по карте, чтобы добавить новые точки интереса.</Text>
        {isOwner && (
          <Group>
            <FileButton onChange={handleMapUpload} accept="image/png,image/jpeg,image/webp">
              {(props) => (
                <Button {...props} leftSection={<IconUpload size={16} />} variant="outline" loading={uploadingMap}>
                  {mapUrl ? 'Обновить карту' : 'Загрузить карту'}
                </Button>
              )}
            </FileButton>
            {!mapUrl && (
              <Button leftSection={<IconPlus size={16} />} onClick={open} variant="light">
                Добавить без карты
              </Button>
            )}
          </Group>
        )}
      </Group>

      {mapUrl ? (
        <Box style={{ position: 'relative', width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--mantine-color-default-border)' }}>
          <img 
            ref={imageRef}
            src={mapUrl} 
            alt="Карта мира" 
            style={{ display: 'block', width: '100%', height: 'auto', cursor: isOwner ? 'crosshair' : 'default' }} 
            onClick={handleMapClick}
          />
          {locations.map((loc) => (
            loc.x != null && loc.y != null && (
              <Tooltip key={loc.id} label={`${loc.name} (${loc.type})`} withArrow>
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: `${loc.x}%`, 
                    top: `${loc.y}%`, 
                    transform: 'translate(-50%, -100%)',
                    cursor: 'pointer'
                  }}
                >
                  <IconMapPin size={32} color="var(--mantine-color-red-filled)" style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))' }}/>
                </div>
              </Tooltip>
            )
          ))}
        </Box>
      ) : (
        <Card withBorder padding="xl" radius="md" style={{ textAlign: 'center' }}>
          <Text c="dimmed">Карта мира не загружена.</Text>
        </Card>
      )}

      {locations.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mt="xl">
          {locations.map((loc) => (
            <Card key={loc.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Group wrap="nowrap" align="flex-start">
                <IconMapPin size={24} style={{ color: 'var(--mantine-color-red-filled)', marginTop: 4 }} />
                <Stack gap={4}>
                  <Title order={4} lineClamp={1}>{loc.name}</Title>
                  <Badge variant="dot" color="gray" size="sm">
                    {loc.type}
                  </Badge>
                </Stack>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      <Modal opened={opened} onClose={closeModal} title="Новая локация" radius="md">
        <Stack gap="md">
          {coordX != null && coordY != null && (
            <Text size="sm" c="dimmed">Координаты: {coordX.toFixed(1)}%, {coordY.toFixed(1)}%</Text>
          )}
          <TextInput label="Название" placeholder="например, Уотердип" required value={name} onChange={(e) => setName(e.currentTarget.value)} />
          <TextInput label="Тип" placeholder="например, Город, Таверна, Лес" required value={type} onChange={(e) => setType(e.currentTarget.value)} />
          <Button color="green" onClick={handleAddLocation} loading={submitting} mt="md">
            Сохранить точку
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}