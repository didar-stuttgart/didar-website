/**
 * CMS Client — Fetch content with fallback to i18n
 *
 * Implements the fallback strategy:
 * CMS value → i18n safe fallback → safe placeholder
 */

import { createServerClient } from '@/lib/supabase';
import { t } from '@/lib/i18n';

/**
 * Fetch a single CMS content item by key
 * @param {string} key - CMS key like "homepage.hero.title"
 * @param {string} lang - Language code ('fa' or 'de')
 * @param {string} fallbackI18nKey - Optional i18n key for fallback
 * @returns {Promise<string>} - CMS content, i18n fallback, or placeholder
 */
export async function getCMSContent(key, lang, fallbackI18nKey = null) {
  try {
    const supabase = createServerClient();

    // Try to fetch from CMS
    const { data, error } = await supabase
      .from('cms_content')
      .select('content_fa, content_de')
      .eq('key', key)
      .eq('is_enabled', true)
      .single();

    if (!error && data) {
      // CMS value exists and is enabled
      const content = lang === 'fa' ? data.content_fa : data.content_de;
      if (content) {
        return content;
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch CMS content for key "${key}":`, err.message);
  }

  // Fallback to i18n if provided
  if (fallbackI18nKey) {
    const i18nValue = t(fallbackI18nKey, lang);
    if (i18nValue && i18nValue !== fallbackI18nKey) {
      return i18nValue;
    }
  }

  // Safe placeholder
  return `[${key}]`;
}

/**
 * Batch fetch multiple CMS items
 * @param {Array} items - Array of {key, lang, fallbackI18nKey}
 * @returns {Promise<Object>} - Results keyed by item key
 */
export async function getCMSContents(items) {
  const results = {};

  for (const item of items) {
    results[item.key] = await getCMSContent(item.key, item.lang, item.fallbackI18nKey);
  }

  return results;
}

/**
 * Fetch all CMS content for a specific page
 * @param {string} page - Page identifier like "homepage"
 * @returns {Promise<Array>} - All enabled CMS items for that page
 */
export async function getPageContent(page) {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('cms_content')
      .select('*')
      .eq('page', page)
      .eq('is_enabled', true)
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn(`Failed to fetch page content for "${page}":`, error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn(`Error in getPageContent for "${page}":`, err.message);
    return [];
  }
}
