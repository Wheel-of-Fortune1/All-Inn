// Allows us to query the database using NodeJS


import dotenv from "dotenv"

// Load env file.

dotenv.config()

import pg from "pg"

const { Pool } = pg;

// Create connection to the database.

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

// Test if database connection is working locally.

export async function databaseTest() {
    const client = await pool.connect()
    console.log("Connected to: ", client.database)
    client.release()
}

// Database alteration functions.

export async function getAllPlayers() {
    const result = await pool.query(
        "SELECT * FROM players"
    )
    return result.rows
}

export async function getPlayer(username) {
    const result = await pool.query(
        "SELECT * FROM players WHERE username = $1", [username] 
    )

    // console.log(result.rows[0])

    return result.rows[0]


    // Info can then be accessed. I.e, player = getPlayer("Thomas"), chips = player.chips
    // Can return undefined if there is no player.

}

export async function addPlayer(username, password, chips = 1000) {
    const result = await pool.query (
        "INSERT INTO players (username, password, chips) VALUES ($1, $2, $3) RETURNING *", [username, password, chips]
    )
    return result.rows[0]
}

export async function removePlayer(username) {
    const result = await pool.query(
        "DELETE FROM players WHERE username = $1", [username]
    )
    return 0
}

export async function updatePlayer(username, fields) {
    const entries = Object.entries(fields);

    // Confirm that we have sent any data to be changed.

    if (entries.length === 0) return null;

    // Create a string using all of the keys we are setting.

    const setString = entries.map(([key], i) => `${key} = $${i + 1}`).join(", ");

    // List all values with username at the end so it can be subbed into the query request.

    const values = [...entries.map(([, val]) => val), username];

    const result = await pool.query(
        `UPDATE players SET ${setString} WHERE username = $${entries.length + 1} RETURNING *`,
        values
    );

    return result.rows[0];
}