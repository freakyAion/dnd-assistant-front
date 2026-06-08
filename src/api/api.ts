import axios from 'axios';
import { getToken } from '../store/auth';

const client = axios.create({
  baseURL: 'https://localhost:7178/api',
  withCredentials: true,
});

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

export interface Rule {
  title: string;
  slug: string;
  category: 'General' | 'Combat' | 'Character' | 'Magic'; // Aligns with your backend RuleCategory enum strings
  content: {
    blocks: Array<{
      type: 'heading' | 'paragraph' | 'mechanics';
      text?: string;
      damage?: string;
      damageType?: string;
      saveType?: string;
    }>;
  };
}

export const getRules = (category?: string) =>
  client.get<Rule[]>('/rules', { params: { category } });

export const getRuleBySlug = (slug: string) => client.get<Rule>(`/rules/${slug}`);

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

export interface Item {
  id: string;
  name: string;
  type: string;
  rarity: string;
  weight: number;
  costValue: number;
  costCurrency: string;
  damageDiceQuantity?: number;
  damageDiceSides?: number;
  damageType?: string;
  acValue?: number;
  acDexBonusType?: string;
  strengthRequirement?: number;
  stealthDisadvantage: boolean;
  description: { blocks: Array<{ type: string; text?: string }> };
}

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

export const getSpells = () => client.get<Spell[]>('/spells');
export const getItems = () => client.get<Item[]>('/items');
export const getClasses = () => client.get<ClassData[]>('/classes');
export const getClassById = (id: string) => client.get<ClassData>(`/classes/${id}`);

export interface Species {
  id: string;
  name: string;
  size: string;
  speed: number;
  description: { text: string };
  traits: Array<{ name: string; description: { text: string } }>;
}

export interface BackgroundFeature {
  id: string;
  name: string;
  description: { text: string };
}

export interface Background {
  id: string;
  name: string;
  description: { text: string };
  skillProficiencies: string;
  languagesOrTools?: string;
  features: BackgroundFeature[];
}

export const getSpecies = () => client.get<Species[]>('/characteroptions/species');
export const getBackgrounds = () => client.get<Background[]>('/characteroptions/backgrounds');

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
  item: Item;
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
  userId: string;
  isPublic: boolean;
  name: string;
  speciesId: string;
  species: Species;
  backgroundId: string;
  background: Background;
  classId: string;
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
  activeConditions: string[];

  customSkillProficiencies: Skill[];
  expendedSpellSlots: number[];
  inventory: CharacterItem[];
  spells: CharacterSpell[];
}

export interface CreateCharacterDto {
  name: string;
  speciesId: string;
  backgroundId: string;
  classId: string;
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
  itemId: string;
  quantity: number;
  isEquipped: boolean;
  isAttuned: boolean;
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
      isPublic: boolean; // <-- Add this property right here
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

export const updateCharacterInventory = (id: string, dto: UpdateInventoryDto) =>
  client.put(`/characters/${id}/inventory`, dto);

export const updateCharacterSpellSlots = (id: string, expendedSpellSlots: number[]) =>
  client.put(`/characters/${id}/spell-slots`, { expendedSpellSlots });

export const toggleSpellPreparation = (id: string, spellId: string, isPrepared: boolean) =>
  client.put(`/characters/${id}/spells/preparation`, { spellId, isPrepared });

export const deleteCharacter = (id: string) => client.delete(`/characters/${id}`);

export const getWizardClasses = () => 
  client.get<Array<{ id: string; name: string }>>('/characters/classes');

export const getWizardSpecies = () => 
  client.get<Array<{ id: string; name: string }>>('/characters/species');

export const getWizardBackgrounds = () => 
  client.get<Array<{ id: string; name: string }>>('/characters/backgrounds');