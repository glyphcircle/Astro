import { supabase } from './supabaseClient';

interface ProductMatch {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  category: string;
  confidence: number; // 0-100
  isExact: boolean;
}

interface CategoryConfig {
  category_name: string;
  display_name: string;
  default_image_url: string;
  default_price: number;
  description_template: string;
}

// Cache category configs to avoid repeated DB calls
let categoryConfigCache: Record<string, CategoryConfig> | null = null;

/**
 * Load all category configurations (cached)
 */
async function getCategoryConfigs(): Promise<Record<string, CategoryConfig>> {
  if (categoryConfigCache) {
    return categoryConfigCache;
  }

  try {
    const { data, error } = await supabase
      .from('product_category_config')
      .select('*')
      .eq('is_active', true);

    if (!error && data) {
      categoryConfigCache = {};
      data.forEach(config => {
        categoryConfigCache![config.category_name] = config;
      });
      console.log('✅ Category configs loaded:', Object.keys(categoryConfigCache).length);
      return categoryConfigCache;
    }
  } catch (error) {
    console.error('❌ Error loading category configs:', error);
  }

  // Fallback if DB fails
  return {};
}

/**
 * Get default image for category from database
 */
async function getDefaultImageForCategory(category: string): Promise<string> {
  try {
    const configs = await getCategoryConfigs();
    const config = configs[category];

    if (config?.default_image_url) {
      console.log('✅ Found default image for category:', category);
      return config.default_image_url;
    }

    // Fallback: Try generic 'spiritual-tools' category
    if (configs['spiritual-tools']?.default_image_url) {
      console.warn('⚠️ Using spiritual-tools fallback for:', category);
      return configs['spiritual-tools'].default_image_url;
    }

    // Final fallback
    console.warn('⚠️ No config found, using hardcoded fallback');
    return 'https://images.unsplash.com/photo-1615529182904-14819d19f5d4?w=400&h=300&fit=crop';

  } catch (error) {
    console.error('❌ Error fetching default image:', error);
    return 'https://images.unsplash.com/photo-1615529182904-14819d19f5d4?w=400&h=300&fit=crop';
  }
}

/**
 * Get default price for category
 */
async function getDefaultPriceForCategory(category: string): Promise<number> {
  try {
    const configs = await getCategoryConfigs();
    return configs[category]?.default_price || 499;
  } catch (error) {
    return 499;
  }
}

/**
 * Generate description from template
 */
async function generateDescription(productName: string, category: string): Promise<string> {
  try {
    const configs = await getCategoryConfigs();
    const template = configs[category]?.description_template;

    if (template) {
      return template.replace('{PRODUCT_NAME}', productName);
    }

    return `AI-suggested product: ${productName}. Awaiting admin review for proper details and pricing.`;
  } catch (error) {
    return `AI-suggested product: ${productName}. Awaiting admin review for proper details and pricing.`;
  }
}

/**
 * Smart product matching - finds products in store_items by name
 */
export async function findProductInStore(
  productName: string,
  category?: string
): Promise<ProductMatch | null> {
  
  if (!productName || productName.trim().length === 0) {
    console.warn('⚠️ Empty product name provided');
    return null;
  }

  const normalizedName = normalizeProductName(productName);
  const keywords = extractKeywords(productName);
  
  console.log('🔍 Searching store for:', { 
    original: productName, 
    normalized: normalizedName, 
    keywords 
  });

  try {
    // STEP 1: Try exact base_name match
    const { data: exactMatch, error: exactError } = await supabase
      .from('store_items')
      .select('*')
      .eq('base_name', normalizedName)
      .eq('status', 'active')
      .single();

    if (!exactError && exactMatch) {
      console.log('✅ Exact match found:', exactMatch.name);
      return {
        id: exactMatch.id,
        name: exactMatch.name,
        image_url: exactMatch.image_url,
        price: parseFloat(exactMatch.price),
        category: exactMatch.category,
        confidence: 100,
        isExact: true
      };
    }

    // STEP 2: Try keyword overlap matching
    if (keywords.length > 0) {
      const { data: keywordMatches, error: keywordError } = await supabase
        .from('store_items')
        .select('*')
        .overlaps('search_keywords', keywords)
        .eq('status', 'active')
        .limit(5);

      if (!keywordError && keywordMatches && keywordMatches.length > 0) {
        const scoredMatches = keywordMatches.map(item => {
          const matchedKeywords = keywords.filter(k => 
            item.search_keywords?.includes(k)
          ).length;
          const confidence = Math.round((matchedKeywords / keywords.length) * 100);
          
          return {
            ...item,
            confidence,
            matchedCount: matchedKeywords
          };
        });

        scoredMatches.sort((a, b) => b.confidence - a.confidence);
        const bestMatch = scoredMatches[0];

        if (bestMatch.confidence >= 50) {
          console.log('✅ Keyword match found:', bestMatch.name, `(${bestMatch.confidence}%)`);
          return {
            id: bestMatch.id,
            name: bestMatch.name,
            image_url: bestMatch.image_url,
            price: parseFloat(bestMatch.price),
            category: bestMatch.category,
            confidence: bestMatch.confidence,
            isExact: false
          };
        }
      }
    }

    // STEP 3: No match found - create placeholder
    console.log('⚠️ No match found, creating placeholder');
    const placeholder = await createPlaceholderProduct(productName, category);
    
    return placeholder;

  } catch (error) {
    console.error('❌ Product search error:', error);
    return null;
  }
}

/**
 * Create placeholder product for admin review
 */
async function createPlaceholderProduct(
  productName: string,
  category?: string
): Promise<ProductMatch | null> {
  
  const normalizedName = normalizeProductName(productName);
  const keywords = extractKeywords(productName);
  const guessedCategory = category || guessCategory(productName);
  const fallbackImage = await getDefaultImageForCategory(guessedCategory);
  const defaultPrice = await getDefaultPriceForCategory(guessedCategory);
  const description = await generateDescription(productName, guessedCategory);

  try {
    // Check if already exists as placeholder
    const { data: existing } = await supabase
      .from('store_items')
      .select('*')
      .eq('base_name', normalizedName)
      .eq('is_ai_suggested', true)
      .single();

    if (existing) {
      console.log('⚠️ Placeholder already exists:', existing.name);
      return {
        id: existing.id,
        name: existing.name,
        image_url: existing.image_url,
        price: parseFloat(existing.price),
        category: existing.category,
        confidence: 0,
        isExact: false
      };
    }

    // Create new placeholder
    const { data: newProduct, error } = await supabase
      .from('store_items')
      .insert([{
        name: productName,
        base_name: normalizedName,
        search_keywords: keywords,
        category: guessedCategory,
        price: defaultPrice,
        description: description,
        stock: 0,
        image_url: fallbackImage,
        status: 'inactive', // Inactive until admin reviews
        is_ai_suggested: true,
        needs_admin_review: true
      }])
      .select()
      .single();

    if (!error && newProduct) {
      console.log('✅ Placeholder created:', newProduct.id);
      
      await notifyAdminNewProduct(productName, newProduct.id);
      
      return {
        id: newProduct.id,
        name: newProduct.name,
        image_url: newProduct.image_url,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        confidence: 0,
        isExact: false
      };
    }

    return null;

  } catch (error) {
    console.error('❌ Error creating placeholder:', error);
    return null;
  }
}

/**
 * Normalize product name
 */
function normalizeProductName(name: string): string {
  let cleaned = name.toLowerCase();
  cleaned = cleaned.replace(/\d+\s*(gm|gram|kg|ml|piece|pcs|beads|pieces)/gi, '');
  cleaned = cleaned.replace(/[^a-z ]/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

/**
 * Extract keywords from product name
 */
function extractKeywords(name: string): string[] {
  const cleaned = name.toLowerCase().replace(/[^a-z ]/g, '');
  const words = cleaned.split(/\s+/).filter(w => w.length > 3);
  return [...new Set(words)];
}

/**
 * Guess category from product name
 */
function guessCategory(name: string): string {
  const nameLower = name.toLowerCase();
  
  if (nameLower.match(/crystal|quartz|stone|gem|aventurine|amethyst|citrine|tourmaline|pyrite|carnelian|rhodonite|selenite|labradorite|obsidian|jade|turquoise|moonstone|sunstone|fluorite|agate|jasper|onyx|coral|moonga|ruby|emerald|sapphire|diamond|pearl|moti|pukhraj|neelam|panna|manik|gomed|hessonite/)) return 'crystals';
  
  if (nameLower.match(/mala|beads|rudraksha|tulsi|sandalwood|rosewood|108|prayer/)) return 'malas';
  
  if (nameLower.match(/yantra|mandala|sri|shree|lakshmi|ganesh|durga|hanuman|saraswati|kali|shiva/)) return 'yantras';
  
  if (nameLower.match(/incense|dhoop|agarbatti|stick|cone|frankincense|myrrh|sandalwood|rose|jasmine|nag champa|patchouli|sage|camphor|loban/)) return 'incense';
  
  if (nameLower.match(/oil|essence|attar|perfume|fragrance|aroma|essential/)) return 'oils';
  
  if (nameLower.match(/diya|lamp|candle|holder|burner|bowl|plate|bell|ghanta|conch|shankh|kalash|trishul|damaru/)) return 'spiritual-tools';
  
  if (nameLower.match(/book|guide|manual|scripture|bhagavad|gita|veda|upanishad|purana|tantra/)) return 'books';
  
  if (nameLower.match(/bracelet|pendant|necklace|ring|earring|anklet|chain|locket|jewelry|jewellery/)) return 'jewelry';
  
  return 'spiritual-tools';
}

/**
 * Notify admin about new AI-suggested product
 */
async function notifyAdminNewProduct(productName: string, productId: string): Promise<void> {
  try {
    await supabase
      .from('admin_notifications')
      .insert([{
        type: 'new_product_review',
        title: 'New Product Needs Review',
        message: `AI suggested product: "${productName}". Please review and update details.`,
        priority: 'medium',
        is_read: false,
        metadata: {
          product_id: productId,
          product_name: productName,
          source: 'ai_recommendation'
        }
      }]);
    
    console.log('📧 Admin notified about new product');
  } catch (error) {
    console.error('❌ Failed to notify admin:', error);
  }
}

// Export helper to clear cache (useful for admin panel)
export function clearCategoryConfigCache(): void {
  categoryConfigCache = null;
  console.log('🔄 Category config cache cleared');
}
