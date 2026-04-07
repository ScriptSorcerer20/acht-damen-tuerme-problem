CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT 0,
    two_factor_secret VARCHAR(64)
);

CREATE TABLE login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address VARCHAR(45) NOT NULL,
    username VARCHAR(80) NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until DATETIME,
    last_failed_at DATETIME,
    CONSTRAINT uq_login_attempt_ip_username UNIQUE (ip_address, username)
);

CREATE TABLE game_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    board TEXT NOT NULL,
    mode TEXT NOT NULL,
    board_size INTEGER NOT NULL DEFAULT 8,
    save_name VARCHAR(80) NOT NULL DEFAULT 'Unnamed Save',
    save_note TEXT NOT NULL DEFAULT '',
    is_favorite BOOLEAN NOT NULL DEFAULT 0,
    step_count INTEGER NOT NULL DEFAULT 0,
    elapsed_seconds INTEGER NOT NULL DEFAULT 0,
    is_solved BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
