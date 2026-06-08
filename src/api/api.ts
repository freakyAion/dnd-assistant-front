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