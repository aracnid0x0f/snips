import * as SQLite from 'expo-sqlite'

import { ALL_TABLES } from './schemas'

const db = SQLite.openDatabaseSync('snips.db')

export function initDatabase() {
    db.execSync(`PRAGMA foreign_keys = ON`)
    ALL_TABLES.forEach((statement) => {
        db.execSync(statement)
    })
}

// Customer related functions 

export function CreateCustomer(
    name:string,
    phone: string,
    gender: 'male' | 'female' | 'both',
    age_group: string
) {
    const result = db.runSync(`
            INSERT INTO customers (name, phone, gender, age_group) VALUES(?, ?, ?, ?);
        `, [name, phone, gender, age_group])

    const customerId = result.lastInsertRowId

    // Initialize blank measurements based on gender
    const measurementTable = gender === 'female' ? 'female_measurements' : 'male_measurements'
    db.runSync(`INSERT INTO ${measurementTable} (customer_id) VALUES (?);`, [customerId])

    return customerId
}

export function GetAllCustomers() {
    return db.getAllSync(`
            SELECT * from customers ORDER BY created_at DESC;
        `)
}

export function GetCustomer(id: number) {
    return db.getFirstSync(`
            SELECT * FROM customers WHERE id = ?
        `, [id])
}

export function UpdateCustomer(
    id: number,
    name: string,
    phone: string,
    gender: string,
    age_group: string
) {
    db.runSync(`
            UPDATE customers SET name = ?, phone = ?, gender = ?, age_group = ? WHERE id = ?;
        `, [name, phone, gender, age_group, id])
}

export function DeleteCustomer(id: number) {
    db.runSync(`
            DELETE FROM customers WHERE id = ?;
        `, [id])
}

// Measurement related functions

export function upsertMeasurment(
    table: 'female_measurements' | 'male_measurements',
    customer_id: number,
    fields: Record<string, number | null>,
    custom_fields: string = '[]',
) {
    const keys = Object.keys(fields)
    const values = Object.values(fields)

    const columns = ['customer_id', ...keys, 'custom_fields'].join(', ')
    const placeholders = ['?', ...keys.map(() => '?'), '?'].join(', ')
    const updates = keys.map((k) => `${k} = excluded.${k}`).join(', ')

    db.runSync(`
            INSERT INTO ${table} (${columns}) VALUEs (${placeholders})
            ON CONFLICT (customer_id) DO UPDATE SET ${updates},
            custom_fields = excluded.custom_fields,
            updated_at = datetime('now');
        `, [customer_id, ...values, custom_fields])
}

export function getMeasurment(
    table: 'female_measurements' | 'male_measurements',
    customer_id: number,
) {
    return db.getFirstSync(`
            SELECT * FROM ${table} WHERE customer_id = ?;
        `, [customer_id])
}

// Cloth relate functions
export function CreateCloth(
    customer_id: number,
    title: string,
    status: 'untouched' | 'cut' | 'sewn' | 'ready' | 'overdue',
    due_date: string
) {
    // 1. Get customer to know gender
    const customer = GetCustomer(customer_id) as any
    if (!customer) throw new Error("Customer not found")

    // 2. Fetch current measurements
    const table = customer.gender === 'female' ? 'female_measurements' : 'male_measurements'
    const measurements = db.getFirstSync(`SELECT * FROM ${table} WHERE customer_id = ?`, [customer_id]) as any
    
    // 3. Create snapshot (remove internal DB fields)
    const snapshot = { ...measurements }
    delete snapshot.id
    delete snapshot.customer_id
    delete snapshot.updated_at

    const measurement_snapshot = JSON.stringify({
        gender: customer.gender,
        measurements: snapshot,
        captured_at: new Date().toISOString()
    })

    const result = db.runSync(`
            INSERT INTO cloths (customer_id, title, status, due_date, measurement_snapshot)
            VALUES (?, ?, ?, ?, ?);
        `, [customer_id, title, status, due_date, measurement_snapshot])
    return result.lastInsertRowId
}

export function GetClothByCustomer(customer_id: number) {
    return db.getAllSync(`
            SELECT * FROM cloths WHERE customer_id = ?
            ORDER BY due_date ASC;
        `, [customer_id])
}

export function GetClothById(id: number) {
    return db.getFirstSync(`
            SELECT * FROM cloths WHERE id = ?;
        `, [id])
}

export function UpdateClothStatus(
    id: number,
    status: 'untouched' | 'cut' | 'sewn' | 'ready' | 'overdue'
) {
    db.runSync(`
            UPDATE cloths SET status = ? WHERE id = ?;
        `, [status, id])
}

export function DeleteCloth(id: number) {
    db.runSync(`
            DELETE FROM cloths WHERE id = ?;
        `, [id])
}

export function UpdateCloth(
    id: number,
    title: string,
    status: 'untouched' | 'cut' | 'sewn' | 'ready' | 'overdue',
    due_date: string,
    fabric_photo_uri: string,
    design_ref_uri: string,
    measurement_snapshot: string,
) {
    db.runSync(`
            UPDATE cloths SET title = ?, status = ?, due_date = ?,
            fabric_photo_uri = ?, design_ref_uri = ?,
            measurement_snapshot = ?
            WHERE id = ?;
        `, [title, status, due_date, fabric_photo_uri, design_ref_uri, measurement_snapshot, id ])
}

export function GetActiveClothGroupedByCustomer() {
    return db.getAllSync(`
            SELECT cloths.*, customers.name as customer_name
            FROM cloths
            JOIN customers ON cloths.customer_id = customers.id
            WHERE cloths.status != 'ready'
            ORDER BY cloths.due_date DESC; 
        `)
}

// collections related functions
export function createCollection(name: string, due_date: string) {
  const result = db.runSync(
    `INSERT INTO collections (name, due_date) VALUES (?, ?)`,
    [name, due_date]
  )
  return result.lastInsertRowId
}

export function getAllCollections() {
  return db.getAllSync(`SELECT * FROM collections ORDER BY due_date ASC`)
}

export function getCollectionById(id: number) {
  return db.getFirstSync(`SELECT * FROM collections WHERE id = ?`, [id])
}

export function updateCollection(id: number, name: string, due_date: string) {
  db.runSync(
    `UPDATE collections SET name = ?, due_date = ? WHERE id = ?`,
    [name, due_date, id]
  )
}

export function deleteCollection(id: number) {
  db.runSync(`DELETE FROM collections WHERE id = ?`, [id])
}

export function addMemberToCollection(
  collection_id: number,
  customer_id: number
) {
  db.runSync(
    `INSERT OR IGNORE INTO collection_members (collection_id, customer_id)
     VALUES (?, ?)`,
    [collection_id, customer_id]
  )
}

export function removeMemberFromCollection(
  collection_id: number,
  customer_id: number
) {
  db.runSync(
    `DELETE FROM collection_members
     WHERE collection_id = ? AND customer_id = ?`,
    [collection_id, customer_id]
  )
}

export function getCollectionMembers(collection_id: number) {
  return db.getAllSync(
    `SELECT customers.*, collection_members.collected
     FROM collection_members
     JOIN customers ON collection_members.customer_id = customers.id
     WHERE collection_members.collection_id = ?`,
    [collection_id]
  )
}

export function toggleMemberCollected(
  collection_id: number,
  customer_id: number,
  collected: boolean
) {
  db.runSync(
    `UPDATE collection_members SET collected = ?
     WHERE collection_id = ? AND customer_id = ?`,
    [collected ? 1 : 0, collection_id, customer_id]
  )
}

export function getCustomerCollections(customer_id: number) {
  return db.getAllSync(
    `SELECT collections.*
     FROM collection_members
     JOIN collections ON collection_members.collection_id = collections.id
     WHERE collection_members.customer_id = ?`,
    [customer_id]
  )
}
