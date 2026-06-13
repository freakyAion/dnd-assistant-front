import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { getToken } from '../store/auth';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://localhost:7178/api',
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      notifications.show({
        title: 'Доступ ограничен',
        message: 'У вашего аккаунта нет прав администратора для выполнения этого действия.',
        color: 'red',
      });
    }
    return Promise.reject(error);
  }
);

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export const login = (data: LoginRequest) => client.post('/users/login', data);

export const register = (data: RegisterRequest) => client.post('/users/register', data);

export const getServerStatus = () => client.get('/serverstatus');

export enum RuleCategory {
  CoreMechanics = 0,
  Combat = 1,
  Adventuring = 2,
  Spellcasting = 3,
}

export interface Rule {
  id?: string;
  title: string;
  slug: string;
  category: RuleCategory;
  content: {
    blocks: any[];
  };
}

export const getRules = (category?: RuleCategory) =>
  client.get<Rule[]>('/rules', { params: { category } });

export const getRuleBySlug = (slug: string) => client.get<Rule>(`/rules/${slug}`);

export const createRule = (data: Omit<Rule, 'id'>) => client.post<Rule>('/rules', data);

export const updateRule = (id: string, data: Omit<Rule, 'id'>) =>
  client.put<Rule>(`/rules/${id}`, data);
export const deleteRule = (id: string) => client.delete(`/rules/${id}`);

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTimeValue: number;
  castingTimeType: string;
  rangeUnits: string;
  rangeValue?: number;
  aoeType?: string;
  aoeValue?: number;
  components: number;
  materialComponents?: string;
  durationUnits: string;
  requiresConcentration: boolean;
  description: {
    blocks: Array<{
      type: string;
      text?: string;
      damage?: string;
      damageType?: string;
      saveType?: string;
    }>;
  };
}

export enum ItemType {
  Armor = 0,
  Weapon = 1,
  AdventuringGear = 2,
  Tool = 3,
  Consumable = 4,
  Container = 5,
  WondrousItem = 6,
}

export enum ItemRarity {
  Mundane = 0,
  Common = 1,
  Uncommon = 2,
  Rare = 3,
  VeryRare = 4,
  Legendary = 5,
  Artifact = 6,
}

export enum DexBonusType {
  None = 0,
  Max2 = 1,
  Full = 2,
}

export enum WeaponDamageType {
  Bludgeoning = 0,
  Piercing = 1,
  Slashing = 2,
  Acid = 3,
  Cold = 4,
  Fire = 5,
  Force = 6,
  Lightning = 7,
  Necrotic = 8,
  Poison = 9,
  Psychic = 10,
  Radiant = 11,
  Thunder = 12,
}

export enum PropertyFlags {
  None = 0,
  Finesse = 1 << 0,
  Heavy = 1 << 1,
  Light = 1 << 2,
  Reach = 1 << 3,
  TwoHanded = 1 << 4,
  Versatile = 1 << 5,
  Thrown = 1 << 6,
  Ammunition = 1 << 7,
  Loading = 1 << 8,
}

export interface GameItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: { blocks: any[] };
  weight: number;
  costValue: number;
  costCurrency: number; // Enums map directly down to integer indexes
  requiresAttunement: boolean;
  attunementPrerequisites?: string;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
  acValue?: number;
  acDexBonusType?: DexBonusType;
  damageDiceQuantity?: number;
  damageDiceSides?: number;
  damageType?: WeaponDamageType;
  properties: PropertyFlags;
  containerCapacityWeight?: number;
  isConsumable: boolean;
  hasCharges: boolean;
  maxCharges?: number;
  chargeResetCondition?: string;
}

export const getItems = (type?: ItemType) => client.get<GameItem[]>('/items', { params: { type } });
export const getItemById = (id: string) => client.get<GameItem>(`/items/${id}`);
export const createItem = (data: Omit<GameItem, 'id'>) => client.post<GameItem>('/items', data);
export const updateItem = (id: string, data: Omit<GameItem, 'id'>) =>
  client.put<GameItem>(`/items/${id}`, data);
export const deleteItem = (id: string) => client.delete(`/items/${id}`);

export interface ClassFeature {
  name: string;
  description: { text: string };
}

export interface ClassProgression {
  level: number;
  proficiencyBonus: number;
  spellSlots?: any;
  classFeatures: ClassFeature[];
}

export interface ClassData {
  id: string;
  name: string;
  hitDieSides: number;
  savingThrows: number;
  description: { text: string };
  progressions: ClassProgression[];
  spells: Spell[];
}

export const getClasses = () => client.get<ClassData[]>('/classes');
export const getClassById = (id: string) => client.get<ClassData>(`/classes/${id}`);

export const createClass = (data: Omit<ClassData, 'id' | 'progressions' | 'spells'>) =>
  client.post<ClassData>('/classes', data);

export const updateClass = (id: string, data: Omit<ClassData, 'id' | 'progressions' | 'spells'>) =>
  client.put<ClassData>(`/classes/${id}`, data);

export const deleteClass = (id: string) => client.delete(`/classes/${id}`);

export const getSpells = () => client.get<Spell[]>('/spells');

export const createSpell = (data: Omit<Spell, 'id'>) => client.post<Spell>('/spells', data);

export const updateSpell = (id: string, data: Omit<Spell, 'id'>) =>
  client.put<Spell>(`/spells/${id}`, data);

export const deleteSpell = (id: string) => client.delete(`/spells/${id}`);

export enum CreatureSize {
  Tiny = 0,
  Small = 1,
  Medium = 2,
  Large = 3,
}

export interface SpeciesTrait {
  id?: string;
  name: string;
  description: { blocks?: any[]; text?: string };
}

export interface Species {
  id: string;
  name: string;
  size: CreatureSize;
  baseSpeed: number;
  description: { blocks?: any[]; text?: string };
  traits: SpeciesTrait[];
}

export interface BackgroundFeature {
  id: string;
  name: string;
  description: { blocks?: any[]; text?: string };
}

export interface Background {
  id: string;
  name: string;
  description: { blocks?: any[]; text?: string };
  skillProficiencies: number[]; // Array of skill enum flags or indices
  features: BackgroundFeature[];
}

export const getSpecies = () => client.get<Species[]>('/characteroptions/species');
export const getBackgrounds = () => client.get<Background[]>('/characteroptions/backgrounds');

export const createSpecies = (data: Omit<Species, 'id' | 'traits'>) =>
  client.post<Species>('/characteroptions/species', data);
export const updateSpecies = (id: string, data: Omit<Species, 'id' | 'traits'>) =>
  client.put<Species>(`/characteroptions/species/${id}`, data);
export const deleteSpecies = (id: string) => client.delete(`/characteroptions/species/${id}`);

export const createBackground = (data: Omit<Background, 'id' | 'features'>) =>
  client.post<Background>('/characteroptions/backgrounds', data);
export const updateBackground = (id: string, data: Omit<Background, 'id' | 'features'>) =>
  client.put<Background>(`/characteroptions/backgrounds/${id}`, data);
export const deleteBackground = (id: string) =>
  client.delete(`/characteroptions/backgrounds/${id}`);

export enum Skill {
  Acrobatics = 0,
  AnimalHandling = 1,
  Arcana = 2,
  Athletics = 3,
  Deception = 4,
  History = 5,
  Insight = 6,
  Intimidation = 7,
  Investigation = 8,
  Medicine = 9,
  Nature = 10,
  Perception = 11,
  Performance = 12,
  Persuasion = 13,
  Religion = 14,
  SleightOfHand = 15,
  Stealth = 16,
  Survival = 17,
}

export interface CharacterItem {
  id: string;
  characterId: string;
  itemId: string;
  item: GameItem;
  quantity: number;
  isEquipped: boolean;
  isAttuned: boolean;
}

export interface CharacterSpell {
  id: string;
  characterId: string;
  spellId: string;
  spell: Spell;
  isPrepared: boolean;
  isAlwaysPrepared: boolean;
}

export interface Character {
  id: string;
  userID: string; // Fixed casing token
  isPublic: boolean;
  name: string;
  speciesID: string; // Fixed casing token
  species: Species;
  backgroundID: string; // Fixed casing token
  background: Background;
  classID: string; // Fixed casing token
  class: ClassData;
  level: number;
  experiencePoints: number;
  alignment: string;
  biography: string;
  age: string;
  height: string;
  weight: string;
  physicalAppearance: string;

  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  currentHitPoints: number;
  maxHitPoints: number;
  temporaryHitPoints: number;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
  currentSpeedOverride: number;
  activeConditions: any;

  customSkillProficiencies: number[];
  expendedSpellSlots: number[];
  inventory: CharacterItem[];
  spells: CharacterSpell[];
}

export interface CreateCharacterDto {
  name: string;
  speciesID: string;
  backgroundID: string;
  classID: string;
  alignment: string;
  biography: string;
  age: string;
  height: string;
  weight: string;
  physicalAppearance: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHitPoints: number;
}

export interface UpdateBioDto {
  alignment: string;
  biography: string;
  age: string;
  height: string;
  weight: string;
  physicalAppearance: string;
}

export interface UpdateVitalsDto {
  currentHitPoints: number;
  maxHitPoints: number;
  temporaryHitPoints: number;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
}
export interface UpdateInventoryDto {
  itemID: string;
  quantity: number;
  isEquipped: boolean;
  isAttuned: boolean;
}

// Added the core stats transfer schema payload contract matching your new endpoint
export interface UpdateCoreStatsDto {
  name: string;
  speciesID: string;
  backgroundID: string;
  classID: string;
  level: number;
  experiencePoints: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  currentSpeedOverride: number;
  customSkillProficiencies: number[];
}

export const getMyCharacters = () =>
  client.get<
    Array<{
      id: string;
      name: string;
      className: string;
      speciesName: string;
      level: number;
      alignment: string;
      isPublic: boolean;
    }>
  >('/characters');

export const getCharacterSheet = (id: string) => client.get<Character>(`/characters/${id}`);

export const createCharacter = (dto: CreateCharacterDto) =>
  client.post<Character>('/characters', dto);

export const updateCharacterVisibility = (id: string, isPublic: boolean) =>
  client.put(`/characters/${id}/visibility`, { isPublic });

export const updateCharacterBio = (id: string, dto: UpdateBioDto) =>
  client.put(`/characters/${id}/biography`, dto);

export const updateCharacterVitals = (id: string, dto: UpdateVitalsDto) =>
  client.put(`/characters/${id}/vitals`, dto);

export const updateCharacterInventory = (id: string, dto: UpdateInventoryDto) => {
  const token = localStorage.getItem('token');

  return client.put(
    `/characters/${id}/inventory`,
    {
      ItemID: dto.itemID,
      Quantity: dto.quantity,
      IsEquipped: dto.isEquipped,
      IsAttuned: dto.isAttuned,
    },
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  );
};

export const updateCharacterSpellSlots = (id: string, expendedSpellSlots: number[]) =>
  client.put(`/characters/${id}/spell-slots`, { expendedSpellSlots });

export const toggleSpellPreparation = (id: string, spellID: string, isPrepared: boolean) =>
  client.put(`/characters/${id}/spells/preparation`, { spellID, isPrepared });

export const updateCharacterCoreStats = (id: string, dto: UpdateCoreStatsDto) =>
  client.put(`/characters/${id}/core-stats`, dto);

export const deleteCharacter = (id: string) => client.delete(`/characters/${id}`);

export const getWizardClasses = () =>
  client.get<Array<{ id: string; name: string }>>('/characters/classes');

export const getWizardSpecies = () =>
  client.get<Array<{ id: string; name: string }>>('/characters/species');

export const getWizardBackgrounds = () =>
  client.get<Array<{ id: string; name: string }>>('/characters/backgrounds');

export interface RichTextContent {
  blocks: Array<{
    type: string;
    text?: string;
    damage?: string;
    damageType?: string;
    saveType?: string;
    style?: {
      bold?: boolean;
      italic?: boolean;
      color?: string;
    };
  }>;
}

export interface World {
  id: string;
  name: string;
  ownerID: string;
  description: RichTextContent;
  isPublic: boolean;
  campaigns?: any[];
  npcs?: any[];
  mapImageUrl?: string;
  locations?: Location[];
  historicalEvents?: any[];
}

export interface WorldSummary {
  id: string;
  name: string;
  isPublic: boolean;
  campaignCount: number;
}

export interface CreateWorldDto {
  name: string;
  isPublic: boolean;
  description?: RichTextContent;
}

export const getWorldDetails = (id: string) => client.get<World>(`/worlds/${id}`);

export const createWorld = (dto: CreateWorldDto) => client.post<World>('/worlds', dto);

export const getMyWorlds = () => client.get<WorldSummary[]>('/worlds');

export const getJoinedWorlds = () => client.get<WorldSummary[]>('/worlds/joined');

export interface Location {
  id: string;
  worldId: string;
  name: string;
  type: string;
  description: RichTextContent;
  parentLocationId?: string;
  x?: number;
  y?: number;
}

export interface CreateLocationDto {
  name: string;
  type: string;
  description?: RichTextContent;
  parentLocationId?: string;
  x?: number;
  y?: number;
}

export const addLocation = (worldId: string, dto: CreateLocationDto) =>
  client.post<Location>(`/worlds/${worldId}/locations`, dto);

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken(); // Get the token directly

  return client.post<{ url: string }>('/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
};

export const updateWorldMap = (id: string, mapImageUrl: string) =>
  client.put<World>(`/worlds/${id}/map`, { mapImageUrl });

export interface Npc {
  id: string;
  worldId: string;
  name: string;
  race: string;
  occupation: string;
  alignment: string;
  description: RichTextContent;
  isSecret: boolean;
}

export interface CreateNpcDto {
  name: string;
  race: string;
  occupation: string;
  alignment: string;
  description?: RichTextContent;
  isSecret: boolean;
}

export const addNpc = (worldId: string, dto: CreateNpcDto) =>
  client.post<Npc>(`/worlds/${worldId}/npcs`, dto);

export const updateNpc = (worldId: string, npcId: string, dto: CreateNpcDto) =>
  client.put<Npc>(`/worlds/${worldId}/npcs/${npcId}`, dto);

export const updateWorldDescription = (id: string, description: RichTextContent) =>
  client.put(`/worlds/${id}/description`, { description });

export interface HistoryEvent {
  id: string;
  name: string;
  dateOrEra: string;
  description: {
    blocks: any[];
  };
}

export const addHistoryEvent = (
  worldId: string,
  data: { name: string; dateOrEra: string; description?: any }
) => client.post(`/worlds/${worldId}/history`, data);

export const deleteHistoryEvent = (eventId: string) => client.delete(`/worlds/history/${eventId}`);

export const updateHistoryEvent = (
  eventId: string,
  data: { name: string; dateOrEra: string; description?: any }
) => client.put(`/worlds/history/${eventId}`, data);

export interface Campaign {
  id: string;
  name: string;
  worldID: string;
  dungeonMasterID: string;
  inviteCode: string;
  notes: string;
  characters: { id: string; name: string }[];
  sessions: Session[];
}

export interface Session {
  id: string;
  name: string;
  campaignID: string;
  sessionNumber: number;
  scheduledAt: string;
  summary: string;
}

export const getCampaigns = (worldId: string) =>
  client.get<Campaign[]>(`/campaigns/world/${worldId}`);
export const createCampaign = (data: { name: string; worldId: string }) =>
  client.post<Campaign>('/campaigns', data);
export const getInviteDetails = (code: string) =>
  client.get<{ id: string; name: string; worldName: string }>(`/campaigns/invite/${code}`);
export const joinCampaign = (code: string, characterId: string) =>
  client.post(`/campaigns/invite/${code}/join`, { characterId });
export const createSession = (campaignId: string, data: { name: string; scheduledAt: Date }) =>
  client.post<Session>(`/campaigns/${campaignId}/sessions`, data);
