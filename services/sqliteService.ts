// --- SCHEMA DEFINITION & SEED DATA ---
const INITIAL_SCHEMA: Record<string, any[]> = {
  users: [
    { 
      id: 'master_admin_001', 
      name: 'Master Keeper', 
      role: 'admin', 
      status: 'active', 
      email: 'master@gylphcircle.com', 
      password: 'master123',
      biometric_id: null, 
      uses_biometrics: false,
      credits: 999999,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    { 
      id: 'demo_seeker_001', 
      name: 'Rakesh Seeker', 
      role: 'seeker', 
      status: 'active', 
      email: 'rakesh@example.com', 
      password: 'user123',
      credits: 150,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ],
  ui_themes: [
    { id: 'theme_default', name: 'Mystic Night', css_class: 'bg-[#0F0F23]', accent_color: 'text-amber-400', font_family: 'lora', status: 'active', created_at: new Date().toISOString() },
    { id: 'theme_solar', name: 'Royal Solar', css_class: 'bg-[#3b0303]', accent_color: 'text-gold-500', font_family: 'cinzel', status: 'inactive', created_at: new Date().toISOString() }
  ],
  image_assets: [
    { id: 'sacred_emblem', name: 'Primary Sacred Emblem', path: 'https://lh3.googleusercontent.com/d/1Mt-LsfsxuxNpGY0hholo8qkBv58S6VNO', tags: 'brand_logo,emblem', status: 'active' },
    { id: 'header_logo', name: 'Header Logo', path: 'https://lh3.googleusercontent.com/d/1Mt-LsfsxuxNpGY0hholo8qkBv58S6VNO', tags: 'header_logo', status: 'active' },
    { id: 'bg_mystic_night', name: 'Celestial Background', path: 'photo-1531162232855-369463387517', tags: 'background,home_bg', status: 'active' },
    { id: 'bg_ganesha', name: 'Ganesha Nebula', path: 'photo-1605333116398-1c39a3f898e3', tags: 'background,home_bg', status: 'active' },
    { id: 'bg_spiritual', name: 'Temple Silence', path: 'photo-1515524738708-327f6b0037a2', tags: 'background,home_bg', status: 'active' }
  ],
  services: [
    { id: 'calendar', name: 'Kalnirnaye Calendar', price: 0, description: 'Ancient Hindu Panchang with Tithi, Nakshatra, and Shubh Muhurats.', path: '/calendar', status: 'active', image: 'photo-1506784919141-14e4c93a3024' },
    { id: 'numerology', name: 'Numerology', price: 49.00, description: 'Uncover the secrets hidden in your name and birth date.', path: '/numerology', status: 'active', image: 'photo-1518133910546-b6c2fb7d79e3' },
    { id: 'astrology', name: 'Astrology', price: 99.00, description: 'Explore your destiny written in the stars and planets.', path: '/astrology', status: 'active', image: 'photo-1532667449560-72a95c8d381b' },
    { id: 'tarot', name: 'Tarot', price: 49.00, description: 'Draw a card and gain insight into your past, present, and future.', path: '/tarot', status: 'active', image: 'photo-1505537528343-4dc9b89823f6' },
    { id: 'palmistry', name: 'Palmistry', price: 49.00, description: 'Read the lines on your hand to understand your character and future.', path: '/palmistry', status: 'active', image: 'photo-1542553457-3f92a3449339' },
    { id: 'face-reading', name: 'Face Reading', price: 49.00, description: 'Discover what your facial features reveal about your personality.', path: '/face-reading', status: 'active', image: 'photo-1531746020798-e6953c6e8e04' },
    { id: 'ayurveda', name: 'Ayurvedic Dosha', price: 59.00, description: 'Analyze your body constitution (Prakriti) and get diet plans.', path: '/ayurveda', status: 'active', image: 'photo-1540553016722-983e48a2cd10' },
    { id: 'store', name: 'Vedic Store', price: 0, description: 'Authentic Rudraksha, Yantras, and Gemstones for your spiritual path.', path: '/store', status: 'active', image: 'photo-1600609842388-3e4b489d71c6' }
  ],
  config: [
      { id: 'app_title', key: 'title', value: 'Glyph Circle Backup', status: 'active'},
      { id: 'admin_secret_key', key: 'admin_portal_secret', value: '1509', status: 'active'},
      { id: 'card_hover_opacity', key: 'card_hover_opacity', value: '0.85', status: 'active'},
      { id: 'currency_default', key: 'currency', value: 'INR', status: 'active'},
      { id: 'support_email', key: 'contact_email', value: 'support@glyphcircle.com', status: 'active'}
  ],
  cloud_providers: [
    { id: 'gdrive_main', provider: 'Google Drive', name: 'Primary Drive', is_active: true, status: 'active' }
  ],
  payment_providers: [
    { id: 'rzp_main', name: 'Razorpay (India)', provider_type: 'razorpay', is_active: true, currency: 'INR', status: 'active', api_key: 'rzp_test_12345678', country_codes: 'IN,GLOBAL' }
  ],
  payment_methods: [
    { id: 'pm_paytm', provider_id: 'rzp_main', name: 'Paytm', logo_url: 'https://raw.githubusercontent.com/justpay/upi-icons/master/png/paytm.png', type: 'upi', status: 'active' },
    { id: 'pm_phonepe', provider_id: 'rzp_main', name: 'PhonePe', logo_url: 'https://raw.githubusercontent.com/justpay/upi-icons/master/png/phonepe.png', type: 'upi', status: 'active' },
    { id: 'pm_gpay', provider_id: 'rzp_main', name: 'Google Pay', logo_url: 'https://raw.githubusercontent.com/justpay/upi-icons/master/png/googlepay.png', type: 'upi', status: 'active' },
    { id: 'pm_bhim', provider_id: 'rzp_main', name: 'BHIM', logo_url: 'https://raw.githubusercontent.com/justpay/upi-icons/master/png/bhim.png', type: 'upi', status: 'active' }
  ],
  payment_config: [
    { id: 'pay_conf_01', account_email: 'billing@glyph.co', creditor_name: 'Glyph Circle', creditor_address: '123 Astral Plane, Cosmos', status: 'active' }
  ],
  store_items: [
    { id: 'item_rud_001', name: '5 Mukhi Rudraksha', price: 299, category: 'Rudraksha', image_url: 'photo-1590387120759-4f86a5578507', stock: 100, status: 'active', description: 'Sacred beads for mental clarity and protection.' },
    { id: 'item_yan_001', name: 'Shree Yantra (Brass)', price: 899, category: 'Yantras', image_url: 'photo-1605629232363-2591dd8b7623', stock: 15, status: 'active', description: 'Ancient sacred geometry for attracting prosperity and abundance.' },
    { id: 'item_cry_001', name: 'Amethyst Cluster', price: 1200, category: 'Crystals', image_url: 'photo-1615485290382-441e4d049cb5', stock: 8, status: 'active', description: 'Natural cluster for spiritual healing and meditation.' },
    { id: 'item_brac_001', name: '7 Chakra Bracelet', price: 350, category: 'Accessories', image_url: 'photo-1531162232855-369463387517', stock: 45, status: 'active', description: 'Balance your energies with natural semi-precious stones.' },
    { id: 'item_incense_001', name: 'Mysore Sandalwood', price: 150, category: 'Aromatherapy', image_url: 'photo-1602192103300-47e66756152e', stock: 200, status: 'active', description: 'Premium hand-rolled sticks for deep meditation.' }
  ],
  gemstones: [
    { id: 'gem_001', name: 'Ruby (Manik)', planet: 'Sun (Surya)', sanskrit: 'Manikya', benefits: 'Leadership, confidence, and authority.', image: 'photo-1551028150-64b9f398f678', status: 'active', mantra: 'Om Ghrini Suryaya Namah' },
    { id: 'gem_002', name: 'Pearl (Moti)', planet: 'Moon (Chandra)', sanskrit: 'Mukta', benefits: 'Emotional balance and peace of mind.', image: 'photo-1533444767776-be436bb09401', status: 'active', mantra: 'Om Shram Shreem Shraum Sah Chandraya Namah' },
    { id: 'gem_003', name: 'Emerald (Panna)', planet: 'Mercury (Budh)', sanskrit: 'Marakata', benefits: 'Communication, intellect, and business success.', image: 'photo-1615485290382-441e4d049cb5', status: 'active', mantra: 'Om Bum Budhaya Namah' },
    { id: 'gem_004', name: 'Yellow Sapphire', planet: 'Jupiter (Guru)', sanskrit: 'Pukhraj', benefits: 'Wisdom, wealth, and good fortune.', image: 'photo-1588444839799-eb00f490ba61', status: 'active', mantra: 'Om Gram Greem Graum Sah Gurave Namah' }
  ],
  featured_content: [
    { id: 'feat_001', title: 'Solar Transformation', text: 'A powerful transformation portal opens this week. Perform Sun meditation to align with your highest dharma.', image_url: 'photo-1532667449560-72a95c8d381b', status: 'active' },
    { id: 'feat_002', title: 'Mercury Retrograde', text: 'The planet of communication slows down. Revisit old projects and clear your speech with mantra yoga.', image_url: 'photo-1516339901600-2e1a62986307', status: 'active' }
  ],
  report_formats: [
    { id: 'fmt_parchment', name: 'Ancient Parchment', url: 'https://www.transparenttextures.com/patterns/handmade-paper.png', status: 'active' },
    { id: 'fmt_royal', name: 'Royal Decree', url: 'https://www.transparenttextures.com/patterns/pinstriped-suit.png', status: 'active' },
    { id: 'fmt_midnight', name: 'Midnight Scroll', url: 'https://www.transparenttextures.com/patterns/carbon-fibre.png', status: 'active' }
  ],
  readings: [
    { id: 'r_001', user_id: 'master_admin_001', type: 'tarot', title: 'The Lovers', content: 'Harmony and balance in relationships. A choice between two paths.', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), created_at: new Date().toISOString() },
    { id: 'r_002', user_id: 'master_admin_001', type: 'palmistry', title: 'Visionary Path', content: 'A strong head line indicates high analytical power and foresight.', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), created_at: new Date().toISOString() },
    { id: 'r_003', user_id: 'master_admin_001', type: 'astrology', title: 'Jupiter Transit', content: 'Prosperity returns as Jupiter enters your 9th house.', timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), created_at: new Date().toISOString() }
  ],
  transactions: [
    { id: 't_001', user_id: 'master_admin_001', amount: 49, status: 'success', description: 'Tarot Reading', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 't_002', user_id: 'master_admin_001', amount: 99, status: 'success', description: 'Full Natal Chart', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 't_003', user_id: 'demo_seeker_001', amount: 299, status: 'success', description: 'Rudraksha Purchase', created_at: new Date(Date.now() - 172800000).toISOString() }
  ],
  feedback: [
    { id: 'f_001', user_id: 'demo_seeker_001', rating: 5, comment: 'Incredibly accurate palm reading. Truly amazed.', status: 'active', created_at: new Date().toISOString() },
    { id: 'f_002', user_id: 'master_admin_001', rating: 4, comment: 'The UI is very intuitive and spiritual.', status: 'active', created_at: new Date().toISOString() }
  ],
  logs: [
    { id: 'l_001', event: 'ADMIN_LOGIN', details: 'Master Keeper accessed portal', timestamp: new Date().toISOString() },
    { id: 'l_002', event: 'DB_SYNC', details: 'Global assets aligned with cloud', timestamp: new Date(Date.now() - 50000).toISOString() }
  ],
  mood_entries: [
    { id: 'm_001', user_id: 'master_admin_001', mood: '🤩', moon_phase: 'Full Moon', notes: 'Feeling highly energetic and connected.', created_at: new Date().toISOString() }
  ],
  muhurat_queries: [],
  user_subscriptions: []
};

declare global {
  interface Window {
    initSqlJs: (config: any) => Promise<any>;
  }
}

const IDB_CONFIG = {
  DB_NAME: 'GlyphCircleStorage_V4', 
  STORE_NAME: 'sqlite_store',
  KEY: 'main_db_binary'
};

const idbAdapter = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(IDB_CONFIG.DB_NAME, 1); 
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_CONFIG.STORE_NAME)) {
          db.createObjectStore(IDB_CONFIG.STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(request.error);
    });
  },
  save: async (data: Uint8Array) => {
    try {
      const db = await idbAdapter.open();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_CONFIG.STORE_NAME, 'readwrite');
        const store = tx.objectStore(IDB_CONFIG.STORE_NAME);
        const req = store.put(data, IDB_CONFIG.KEY);
        tx.oncomplete = () => resolve();
        req.onerror = (e) => reject(req.error);
      });
    } catch (err) { console.error("IDB Save Error:", err); }
  },
  load: async (): Promise<Uint8Array | null> => {
    try {
      const db = await idbAdapter.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_CONFIG.STORE_NAME, 'readonly');
        const store = tx.objectStore(IDB_CONFIG.STORE_NAME);
        const req = store.get(IDB_CONFIG.KEY);
        req.onsuccess = () => resolve(req.result instanceof Uint8Array ? req.result : (req.result ? new Uint8Array(req.result) : null));
        req.onerror = () => reject(req.error);
      });
    } catch (err) { return null; }
  }
};

class SqliteService {
  private db: any = null;
  private SQL: any = null;
  private isReady: boolean = false;
  private savePromise: Promise<void> = Promise.resolve();
  private initPromise: Promise<void> | null = null;

  constructor() {}

  async init() {
    if (this.isReady) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
        try {
          if (!window.initSqlJs) return;

          this.SQL = await window.initSqlJs({
            locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
          });

          let binaryDb = await idbAdapter.load();

          if (binaryDb) {
            try {
                this.db = new this.SQL.Database(binaryDb);
            } catch (e) {
                this.db = new this.SQL.Database();
            }
          } else {
            this.db = new this.SQL.Database();
          }

          await this.runSchemaMigration(true);
          this.isReady = true;
        } catch (err) {
          console.error("SQLite Init Failed:", err);
        }
    })();

    return this.initPromise;
  }

  /**
   * Drops all tables and re-seeds the database.
   */
  async factoryReset() {
      if (!this.db) return;
      Object.keys(INITIAL_SCHEMA).forEach(table => {
          try { this.db.run(`DROP TABLE IF EXISTS ${table}`); } catch (e) {}
      });
      await this.runSchemaMigration(true);
      await this.saveToStorage();
  }

  exportDatabaseBlob(): Blob | null {
      if (!this.db) return null;
      try {
          const binary = this.db.export();
          return new Blob([binary], { type: 'application/x-sqlite3' });
      } catch (e) {
          return null;
      }
  }

  private async runSchemaMigration(isFreshDb: boolean) {
    let schemaChanged = false;
    Object.keys(INITIAL_SCHEMA).forEach(tableName => {
      const sample = INITIAL_SCHEMA[tableName][0];
      let tableExists = false;
      try {
          this.db.exec(`SELECT count(*) FROM ${tableName}`);
          tableExists = true;
      } catch (e) {
          if (sample) {
              const columns = Object.keys(sample);
              const columnDefs = columns.map(k => {
                  const val = sample[k];
                  let type = 'TEXT';
                  if (typeof val === 'number') type = Number.isInteger(val) ? 'INTEGER' : 'REAL';
                  return k === 'id' ? `${k} ${type} PRIMARY KEY` : `${k} ${type}`;
              });
              this.db.run(`CREATE TABLE ${tableName} (${columnDefs.join(', ')})`);
          } else {
              this.db.run(`CREATE TABLE ${tableName} (id TEXT PRIMARY KEY, status TEXT)`);
          }
          schemaChanged = true;
          tableExists = true;
      }

      if (tableExists && sample) {
          const res = this.db.exec(`PRAGMA table_info(${tableName})`);
          const existingCols = res[0].values.map((row: any) => row[1]);
          const columns = Object.keys(sample);
          
          columns.forEach(col => {
              if (!existingCols.includes(col)) {
                  let type = 'TEXT';
                  const val = sample[col];
                  if (typeof val === 'number') type = Number.isInteger(val) ? 'INTEGER' : 'REAL';
                  try {
                      this.db.run(`ALTER TABLE ${tableName} ADD COLUMN ${col} ${type}`);
                      schemaChanged = true;
                  } catch (err) {}
              }
          });
      }

      try {
          const countRes = this.db.exec(`SELECT count(*) as c FROM ${tableName}`);
          const count = countRes[0].values[0][0];
          // ALWAYS Seed if empty
          if (count === 0 && INITIAL_SCHEMA[tableName].length > 0) {
              this.populateTable(tableName, INITIAL_SCHEMA[tableName]);
              schemaChanged = true;
          }
      } catch (e) {}
    });

    if (schemaChanged || isFreshDb) {
        await this.saveToStorage();
    }
  }

  private populateTable(tableName: string, records: any[]) {
      if (records.length === 0) return;
      const columns = Object.keys(records[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      
      records.forEach(record => {
          const values = columns.map(col => {
              const val = record[col];
              if (val === undefined || val === null) return null;
              if (typeof val === 'object') return JSON.stringify(val);
              return val;
          });
          try { this.db.run(insertSql, values); } catch (e) {}
      });
  }

  exec(sql: string): any[] {
    if (!this.db) return [];
    try {
        const res = this.db.exec(sql);
        if (res.length > 0) {
            const columns = res[0].columns;
            const values = res[0].values;
            return values.map((row: any[]) => {
                const obj: any = {};
                columns.forEach((col: string, i: number) => {
                    try {
                        const val = row[i];
                        if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                            obj[col] = JSON.parse(val);
                        } else {
                            obj[col] = val;
                        }
                    } catch {
                        obj[col] = row[i];
                    }
                });
                return obj;
            });
        }
        return [];
    } catch (e) { return []; }
  }

  getAll(tableName: string) { return this.exec(`SELECT * FROM ${tableName}`); }

  getById(tableName: string, id: string | number) {
    const idVal = typeof id === 'string' ? `'${id}'` : id;
    const res = this.exec(`SELECT * FROM ${tableName} WHERE id = ${idVal}`);
    return res[0] || null;
  }

  async insert(tableName: string, data: any) {
    if(!this.db) return null;
    try {
        const columns = Object.keys(data);
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        const values = columns.map(k => {
            const val = data[k];
            if (val === undefined || val === null) return null;
            if (typeof val === 'object') return JSON.stringify(val);
            if (typeof val === 'boolean') return val ? 1 : 0;
            return val;
        });
        this.db.run(sql, values);
        await this.saveToStorage(); 
        return data;
    } catch (e) { return null; }
  }

  async update(tableName: string, id: string | number, data: any) {
    if(!this.db) return;
    try {
        const keys = Object.keys(data);
        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
        const values = keys.map(k => {
            const val = data[k];
            if (val === undefined || val === null) return null;
            if (typeof val === 'object') return JSON.stringify(val);
            if (typeof val === 'boolean') return val ? 1 : 0;
            return val;
        });
        values.push(id);
        this.db.run(sql, values);
        await this.saveToStorage(); 
    } catch (e) { }
  }

  private async saveToStorage() {
    if (this.db) {
        this.savePromise = this.savePromise.then(async () => {
            try {
                const data = this.db.export();
                await idbAdapter.save(data);
            } catch (e) { console.error("CRITICAL: Failed to save DB", e); }
        });
        return this.savePromise;
    }
  }
}

export const sqliteService = new SqliteService();