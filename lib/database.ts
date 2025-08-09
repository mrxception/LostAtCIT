import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "sql12.freesqldatabase.com",
  user: process.env.DB_USER || "sql12794343",
  password: process.env.DB_PASSWORD || "txXreTayfU",
  database: process.env.DB_NAME || "sql12794343",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
}

let pool: mysql.Pool | null = null

export function getConnection() {
  if (!pool) {
    if (process.env.NODE_ENV === "development") {
      console.log("Creating new database pool with config:", {
        ...dbConfig,
        password: dbConfig.password ? "[HIDDEN]" : "empty",
      })
    }
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function query(sql: string, params: any[] = []) {
  try {
    const connection = getConnection()

    if (process.env.NODE_ENV === "development") {
      console.log("Executing query:", sql.substring(0, 100) + "...")
      console.log(
        "Query params:",
        params.map((p) => (typeof p === "string" && p.length > 50 ? p.substring(0, 50) + "..." : p)),
      )
    }

    const [results] = await connection.execute(sql, params)

    if (process.env.NODE_ENV === "development") {
      console.log("Query executed successfully")
    }

    return results
  } catch (error) {
    console.error("Database query error:", error)
    if (process.env.NODE_ENV === "development") {
      console.error("SQL:", sql)
      console.error("Params:", params)
    }
    throw error
  }
}

export async function transaction(callback: (connection: mysql.PoolConnection) => Promise<any>) {
  const connection = await getConnection().getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function testConnection() {
  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Testing database connection...")
    }
    const result = await query("SELECT 1 as test")
    if (process.env.NODE_ENV === "development") {
      console.log("Database connection successful:", result)
    }
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}
