// Riot Games Data Dragon API Service - Optimized & Cached

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';
const FALLBACK_PATCH = '14.10.1';
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

// In-memory cache for ultra-fast component switching
let cachedPatch = null;
let cachedChampionsList = null;
const cachedChampionDetails = new Map();

function getStorage(key) {
  try {
    const raw = localStorage.getItem(`lol_cd_${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(`lol_cd_${key}`);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function setStorage(key, data) {
  try {
    localStorage.setItem(`lol_cd_${key}`, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  } catch {
    // Storage quota or private mode fallback
  }
}

/**
 * Fetches the latest League of Legends game version (patch).
 */
export async function getLatestPatch(forceRefresh = false) {
  if (!forceRefresh && cachedPatch) return cachedPatch;
  
  if (!forceRefresh) {
    const local = getStorage('patch');
    if (local) {
      cachedPatch = local;
      return local;
    }
  }

  try {
    const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const versions = await res.json();
    if (Array.isArray(versions) && versions.length > 0) {
      cachedPatch = versions[0];
      setStorage('patch', cachedPatch);
      return cachedPatch;
    }
  } catch (err) {
    console.warn('Fallback to cached or default patch:', err);
  }

  cachedPatch = cachedPatch || FALLBACK_PATCH;
  return cachedPatch;
}

/**
 * Fetches the list of all champions for a given patch.
 */
export async function getChampionList(patch, forceRefresh = false) {
  if (!forceRefresh && cachedChampionsList) return cachedChampionsList;

  const activePatch = patch || (await getLatestPatch());
  
  if (!forceRefresh) {
    const local = getStorage(`champions_${activePatch}`);
    if (local && Array.isArray(local) && local.length > 0) {
      cachedChampionsList = local;
      return local;
    }
  }

  try {
    const res = await fetch(`${DDRAGON_BASE}/cdn/${activePatch}/data/en_US/champion.json`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    
    // Sort champions alphabetically by name
    const list = Object.values(json.data).sort((a, b) => a.name.localeCompare(b.name));
    cachedChampionsList = list;
    setStorage(`champions_${activePatch}`, list);
    return list;
  } catch (err) {
    console.error('Error fetching champion list:', err);
    throw err;
  }
}

/**
 * Fetches full details for a specific champion including spells, passive, and stats.
 */
export async function getChampionDetails(championId, patch) {
  const activePatch = patch || (await getLatestPatch());
  const cacheKey = `${activePatch}_${championId}`;

  if (cachedChampionDetails.has(cacheKey)) {
    return cachedChampionDetails.get(cacheKey);
  }

  const local = getStorage(`champ_${cacheKey}`);
  if (local) {
    cachedChampionDetails.set(cacheKey, local);
    return local;
  }

  try {
    const res = await fetch(`${DDRAGON_BASE}/cdn/${activePatch}/data/en_US/champion/${championId}.json`);
    if (!res.ok) throw new Error(`Champion ${championId} fetch error: ${res.status}`);
    const json = await res.json();
    const data = json.data[championId];
    
    if (data) {
      cachedChampionDetails.set(cacheKey, data);
      setStorage(`champ_${cacheKey}`, data);
      return data;
    }
    throw new Error(`Champion data missing for ${championId}`);
  } catch (err) {
    console.error(`Error loading details for ${championId}:`, err);
    throw err;
  }
}

/**
 * Official Riot Cooldown calculation formula:
 * Reduced Cooldown = Base Cooldown * (100 / (100 + Ability Haste))
 */
export function calculateCooldown(baseCooldown, abilityHaste = 0) {
  if (baseCooldown === undefined || baseCooldown === null || isNaN(baseCooldown)) {
    return 0;
  }
  const haste = Math.max(0, Number(abilityHaste) || 0);
  const factor = 100 / (100 + haste);
  const reduced = baseCooldown * factor;
  return Number(reduced.toFixed(2));
}

/**
 * Equivalent Cooldown Reduction percentage
 * CDR% = (Ability Haste / (100 + Ability Haste)) * 100
 */
export function abilityHasteToCdr(abilityHaste = 0) {
  const haste = Math.max(0, Number(abilityHaste) || 0);
  if (haste === 0) return 0;
  const cdr = (haste / (100 + haste)) * 100;
  return Number(cdr.toFixed(1));
}

/**
 * Cast Frequency Multiplier (e.g. 50 AH = 1.5x casts, 100 AH = 2.0x casts)
 */
export function getCastMultiplier(abilityHaste = 0) {
  const haste = Math.max(0, Number(abilityHaste) || 0);
  const mult = 1 + (haste / 100);
  return Number(mult.toFixed(2));
}

/**
 * Image URL helpers
 */
export function getChampionIconUrl(championId, patch) {
  return `${DDRAGON_BASE}/cdn/${patch}/img/champion/${championId}.png`;
}

export function getSpellIconUrl(spellImageFull, patch) {
  return `${DDRAGON_BASE}/cdn/${patch}/img/spell/${spellImageFull}`;
}

export function getPassiveIconUrl(passiveImageFull, patch) {
  return `${DDRAGON_BASE}/cdn/${patch}/img/passive/${passiveImageFull}`;
}

export function getChampionSplashUrl(championId, skinNum = 0) {
  return `${DDRAGON_BASE}/cdn/img/champion/splash/${championId}_${skinNum}.jpg`;
}
