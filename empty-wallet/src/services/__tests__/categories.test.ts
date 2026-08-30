import { CATEGORY_GROUPS, DEFAULT_CATEGORIES } from '../../constants/categories';
import { CategoryGroup } from '../../types';

describe('Category System & Constants', () => {
  const expectedGroups: CategoryGroup[] = [
    'food_drinks',
    'shopping',
    'housing',
    'transportation',
    'vehicle',
    'life_entertainment',
    'financial_expenses',
    'income',
    'others',
  ];

  it('should define all 9 macro category groups with required metadata', () => {
    expect(CATEGORY_GROUPS).toHaveLength(9);

    const groupIds = CATEGORY_GROUPS.map((g) => g.id);
    for (const expectedId of expectedGroups) {
      expect(groupIds).toContain(expectedId);
    }

    for (const group of CATEGORY_GROUPS) {
      expect(group.id).toBeTruthy();
      expect(group.label).toBeTruthy();
      expect(group.name).toBeTruthy();
      expect(group.icon).toBeTruthy();
      expect(group.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('should have default categories assigned to valid macro groups', () => {
    expect(DEFAULT_CATEGORIES.length).toBeGreaterThanOrEqual(25);

    const validGroupSet = new Set(expectedGroups);
    const categoryIds = new Set<string>();

    for (const cat of DEFAULT_CATEGORIES) {
      expect(validGroupSet.has(cat.group!)).toBe(true);
      expect(cat.name.trim().length).toBeGreaterThan(0);
      expect(cat.icon.trim().length).toBeGreaterThan(0);
      expect(cat.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(['expense', 'income']).toContain(cat.type);
      expect(categoryIds.has(cat.id)).toBe(false);
      categoryIds.add(cat.id);
    }
  });

  it('should contain categories for each of the 9 macro groups', () => {
    for (const group of expectedGroups) {
      const groupCategories = DEFAULT_CATEGORIES.filter((c) => c.group === group);
      expect(groupCategories.length).toBeGreaterThan(0);
    }
  });

  it('should correctly partition expense and income categories', () => {
    const incomeCats = DEFAULT_CATEGORIES.filter((c) => c.group === 'income');
    for (const cat of incomeCats) {
      expect(cat.type).toBe('income');
    }

    const foodCats = DEFAULT_CATEGORIES.filter((c) => c.group === 'food_drinks');
    for (const cat of foodCats) {
      expect(cat.type).toBe('expense');
    }
  });
});

