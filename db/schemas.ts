export const CREATE_CUSTOMERS_TABLE = `
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    gender TEXT NOT NULL,
    age_group TEXT NOT NULL DEFAULT 'adult',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`

export const CREATE_FEMALE_MEASUREMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS female_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL UNIQUE,
    bust REAL,
    waist REAL,
    hip REAL,
    shoulder_width REAL,
    sleeve_length REAL,
    back_length REAL,
    dress_length REAL,
    neck REAL,
    blouse_length REAL,
    under_bust REAL,
    arm_round REAL,
    custom_fields TEXT DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );
`

export const CREATE_MALE_MEASUREMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS male_measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL UNIQUE,
    chest REAL,
    waist REAL,
    shoulder_width REAL,
    sleeve_length REAL,
    neck REAL,
    trouser_length REAL,
    shirt_length REAL,
    arm_round REAL,
    ankle REAL,
    custom_fields TEXT DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );
`

export const CREATE_CLOTHS_TABLE = `
  CREATE TABLE IF NOT EXISTS cloths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'untouched',
    due_date TEXT,
    fabric_photo_uri TEXT,
    design_ref_uri TEXT,
    measurement_snapshot TEXT DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );
`

export const CREATE_COLLECTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    due_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`

export const CREATE_COLLECTION_MEMBERS_TABLE = `
  CREATE TABLE IF NOT EXISTS collection_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    collected INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  );
`

export const ALL_TABLES = [
  CREATE_CUSTOMERS_TABLE,
  CREATE_FEMALE_MEASUREMENTS_TABLE,
  CREATE_MALE_MEASUREMENTS_TABLE,
  CREATE_CLOTHS_TABLE,
  CREATE_COLLECTIONS_TABLE,
  CREATE_COLLECTION_MEMBERS_TABLE,
]
