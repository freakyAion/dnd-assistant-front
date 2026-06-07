// Matches the GuidEntity base and properties of your C# Character model
export interface CharacterCardData {
  id: string; // Will map to Guid ID on backend
  name: string;
  race: string; // Will map to RaceID lookup
  className: string; // Will map to StartingClassID lookup
  level: number;
  alignment: string;
  age: string;
  sex: string;
}

export const MOCK_PCS: CharacterCardData[] = [
  {
    id: '1',
    name: 'Вракс',
    race: 'Гоблин',
    className: 'Изобретатель',
    level: 5,
    alignment: 'Хаотично-нейтральный',
    age: '24',
    sex: 'М',
  },
  {
    id: '2',
    name: 'Ссет',
    race: 'Нага',
    className: 'Воин',
    level: 8,
    alignment: 'Законопослушно-злой',
    age: '112',
    sex: 'М',
  },
  {
    id: '3',
    name: 'Эвриала',
    race: 'Горгона',
    className: 'Чародей',
    level: 12,
    alignment: 'Истинно-нейтральный',
    age: 'Неизвестно',
    sex: 'Ж',
  },
  {
    id: '4',
    name: 'Кронк',
    race: 'Минотавр',
    className: 'Варвар',
    level: 3,
    alignment: 'Хаотично-добрый',
    age: '19',
    sex: 'М',
  },
  {
    id: '5',
    name: 'Зикс',
    race: 'Кобольд',
    className: 'Плут',
    level: 6,
    alignment: 'Законопослушно-нейтральный',
    age: '14',
    sex: 'М',
  },
  {
    id: '6',
    name: 'Грош',
    race: 'Орк',
    className: 'Паладин',
    level: 9,
    alignment: 'Законопослушно-добрый',
    age: '35',
    sex: 'М',
  },
];
