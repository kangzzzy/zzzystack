-- Local test fixture only; production storage engine remains undecided.
PRAGMA foreign_keys=ON;
CREATE TABLE cycles(id TEXT PRIMARY KEY NOT NULL, step TEXT NOT NULL);
CREATE TABLE commands(
 id TEXT PRIMARY KEY NOT NULL CHECK(length(id) BETWEEN 1 AND 36),
 cycle_id TEXT NOT NULL REFERENCES cycles(id),
 payload TEXT NOT NULL,
 phase TEXT NOT NULL CHECK(phase IN ('REQUESTED','ACK','DONE','FAILED','UNKNOWN'))
);
CREATE TABLE reservations(
 resource TEXT PRIMARY KEY NOT NULL CHECK(resource IN ('D1','D2','R1')),
 command_id TEXT NOT NULL REFERENCES commands(id)
);
CREATE TABLE events(id TEXT PRIMARY KEY NOT NULL, command_id TEXT NOT NULL REFERENCES commands(id), action TEXT NOT NULL);
