CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    board TEXT NOT NULL,             -- JSON String (z.B. "[0,4,7,5,2,6,1,3]")
    mode TEXT NOT NULL,              -- "queens" oder "rooks"
    board_size INTEGER NOT NULL DEFAULT 8,
    save_name VARCHAR(80) NOT NULL DEFAULT 'Unnamed Save',
    save_note TEXT NOT NULL DEFAULT '',
    is_favorite BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
