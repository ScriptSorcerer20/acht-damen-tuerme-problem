# REST-API-Konzept

Dieses API-Konzept beschreibt die wichtigsten Schnittstellen der Anwendung zum Acht-Damen-und-Türme-Problem. Die API wird vom Dashboard verwendet, um Spielbretter zu prüfen, Loesungen zu berechnen und Spielstände zu speichern oder zu laden.

## Allgemeine Angaben

| Punkt | Beschreibung |
|---|---|
| Datenformat | JSON |
| Authentifizierung | Session-Cookie nach Login |
| Geschützte Endpunkte | Speicherstand-Funktionen benoetigen einen angemeldeten Benutzer |
| Brettgroesse | 4 bis 13 Felder pro Seite |
| Standard-Brettgroesse | 8 x 8 |
| Spielmodi | `queens` für Damen, `rooks` für Türme |

## Solver-API

| Methode | Pfad | Zweck | Parameter / Body | Authentifizierung |
|---|---|---|---|---|
| POST | `/check` | Prüft, ob eine Figur auf ein bestimmtes Feld gesetzt werden darf. | JSON: `board`, `row`, `col`, `mode` | Nein |
| GET | `/solve` | Gibt Loesungen für das Damenproblem zurück. | Query: `size` | Nein |
| GET | `/solve_trace` | Gibt eine Damen-Loesung Schritt für Schritt zurück. | Query: `size` | Nein |
| GET | `/solve_rooks` | Gibt eine gültige Turm-Loesung zurück. | Query: `size` | Nein |
| GET | `/solve_rooks_trace` | Gibt eine Turm-Loesung Schritt für Schritt zurück. | Query: `size` | Nein |

## Speicherstand-API

| Methode | Pfad | Zweck | Parameter / Body | Authentifizierung |
|---|---|---|---|---|
| POST | `/save` | Speichert den aktuellen Spielstand des angemeldeten Benutzers. | JSON: Spielbrett, Modus, Name, Notiz, Favorit, Schritte, Zeit, geloest | Ja |
| GET | `/save_points` | Listet alle gespeicherten Spielstände des angemeldeten Benutzers auf. | Optional: `mode`, `board_size`, `favorites_only`, `sort` | Ja |
| GET | `/load` | Lädt den neusten gespeicherten Spielstand. | Keine | Ja |
| GET | `/load/{id}` | Lädt einen bestimmten gespeicherten Spielstand. | Pfadparameter: `id` | Ja |
| POST | `/save_points/{id}/favorite` | Schaltet den Favoritenstatus eines Speicherstandes um. | Pfadparameter: `id` | Ja |
| DELETE | `/save_points/{id}` | Loescht einen bestimmten Speicherstand. | Pfadparameter: `id` | Ja |

## Login- und Seitenrouten

| Methode | Pfad | Zweck | Typ |
|---|---|---|---|
| GET / POST | `/register` | Neues Benutzerkonto erstellen. | Formularroute |
| GET / POST | `/login` | Benutzer anmelden. | Formularroute |
| GET / POST | `/login/verify` | Zwei-Faktor-Code prüfen. | Formularroute |
| GET / POST | `/login/settings` | Passwort und Zwei-Faktor-Authentifizierung verwalten. | Formularroute |
| POST | `/logout` | Benutzer abmelden. | Formularroute |
| GET | `/` | Startseite anzeigen. | Seitenroute |
| GET | `/dashboard` | Dashboard anzeigen. | Seitenroute |
| GET | `/privacy_policy` | Datenschutzerklärung anzeigen. | Seitenroute |
| GET | `/imprint` | Impressum anzeigen. | Seitenroute |

## Wichtige Request-Daten

| Feld | Verwendung | Beschreibung |
|---|---|---|
| `board` | `/check`, `/save` | Zweidimensionale Matrix des Spielbretts. `0` bedeutet leer, `1` bedeutet Figur. |
| `row` | `/check` | Zeile des zu prüfenden Feldes. |
| `col` | `/check` | Spalte des zu prüfenden Feldes. |
| `mode` | `/check`, `/save`, `/save_points` | Spielmodus: `queens` oder `rooks`. |
| `size` | Solver-Endpunkte | Gewünschte Brettgroesse. |
| `boardSize` | `/save` | Groesse des gespeicherten Spielbretts. |
| `saveName` | `/save` | Name des Speicherstandes. |
| `saveNote` | `/save` | Optionale Notiz zum Speicherstand. |
| `isFavorite` | `/save` | Gibt an, ob der Speicherstand als Favorit markiert ist. |
| `stepCount` | `/save` | Anzahl der ausgeführten Schritte. |
| `elapsedSeconds` | `/save` | Vergangene Spielzeit in Sekunden. |
| `isSolved` | `/save` | Gibt an, ob das Spiel geloest wurde. |

## Wichtige Response-Daten

| Feld | Verwendung | Beschreibung |
|---|---|---|
| `valid` | `/check` | Gibt zurück, ob der Zug erlaubt ist. |
| `status` | `/save`, `/save_points/{id}` | Statusmeldung, zum Beispiel `saved` oder `deleted`. |
| `save_point` | `/save` | Neu gespeicherter Spielstand. |
| `steps` | Trace-Endpunkte | Liste der einzelnen Loesungsschritte. |
| `solved` | Trace-Endpunkte | Gibt an, ob eine Loesung gefunden wurde. |
| `error` | Fehlerfälle | Fehlermeldung, zum Beispiel wenn ein Speicherstand nicht gefunden wurde. |

## Fehlerfälle

| Situation | Beispielantwort | HTTP-Status |
|---|---|---|
| Speicherstand existiert nicht oder gehoert einem anderen Benutzer. | `{ "error": "Save point not found" }` | 404 |
| Benutzer ist nicht angemeldet und ruft geschützte Route auf. | Weiterleitung zur Login-Seite | 302 |
| Ungültige Brettgroesse wird übergeben. | Wert wird auf erlaubten Bereich begrenzt. | 200 |

