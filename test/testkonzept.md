# Testkonzept

## Ziel

Dieses Testkonzept beschreibt, wie die wichtigsten Funktionen der Webanwendung
vor der Abgabe ueberprueft werden. Der Fokus liegt auf den fachlich und
technisch kritischen Bereichen:

- Brettlogik fuer Damen und Tuerme
- Authentifizierung und Sicherheitsfunktionen
- Speichern, Laden und Filtern von Spielständen

## Randbedingungen / Umfeld

- Projekt: 8-Damen- und 8-Tuerme Solver
- Testdatum Planung: 2026-04-24
- Betriebssystem: Linux 6.6.87.2-microsoft-standard-WSL2 x86_64
- Python-Version: 3.12.3
- Testwerkzeug: pytest 8.3.4
- Webtestmittel: Flask Test Client
- Datenbank im Test: isolierte SQLite-Testdatenbank pro Testlauf
- Testordner: `test/`

Die Tests werden absichtlich getrennt von der produktiven Datenbank
durchgefuehrt. Dadurch wird verhindert, dass echte Benutzerdaten oder
Spielstände verändert werden.

## Testmittel und Methoden

Es werden zwei voneinander unabhängige Testebenen eingesetzt:

1. Unit-Tests
   Diese prüfen einzelne Funktionen direkt, zum Beispiel Eingabevalidierung,
   Brettnormalisierung oder TOTP-Prüfung.
2. Integrations- und Routentests
   Diese prüfen das Zusammenspiel mehrerer Komponenten über HTTP-Routen, zum
   Beispiel Registrierung, Login, Validierung, Speichern und Laden.

Eingesetzte Mittel:

- `pytest` für die Testausführung und Bewertung
- Flask Test Client für Request/Response-Tests
- temporäre SQLite-Datenbank für isolierte Testdaten

## Testfälle (Drehbuch)

| ID | Ebene | Testziel | Testmethode / Eingabe | Erwartetes Resultat |
| --- | --- | --- | --- | --- |
| U-MAIN-01 | Unit | Brettgroesse absichern | `parse_board_size()` mit zu kleinen, zu grossen und ungültigen Werten | Werte werden korrekt auf den erlaubten Bereich begrenzt |
| U-MAIN-02 | Unit | Favoriten-Flag normalisieren | `parse_favorite_flag()` mit typischen truthy/falsy Werten | Nur definierte truthy Werte werden als `True` interpretiert |
| U-MAIN-03 | Unit | Ganze Zahlen robust verarbeiten | `parse_non_negative_int()` mit negativen und ungültigen Werten | Negative Werte werden auf 0 begrenzt, ungültige Werte fallen auf den Default zurück |
| U-MAIN-04 | Unit | Alte Speicherformate unterstützen | `normalize_board()` mit Legacy-Positionsliste | Es entsteht ein korrektes Brettmatrix-Format |
| U-MAIN-05 | Unit | Uneinheitliche Matrixwerte normalisieren | `normalize_board()` mit truthy/falsy Werten | Es entstehen nur 0- und 1-Werte |
| U-MAIN-06 | Unit | Damen-Solver fachlich absichern | `solve_queens(4)` | Es werden genau die gültigen 4x4-Loesungen gefunden |
| U-MAIN-07 | Unit | Turm-Trace prüfen | `build_rooks_trace(5)` | Es gibt pro Reihe genau einen Platzierungsschritt plus Abschluss |
| U-LOGIN-01 | Unit | Gültigen Username akzeptieren | `validate_username()` mit gültigem Namen | Rückgabe ist `None` |
| U-LOGIN-02 | Unit | Ungültigen Username ablehnen | `validate_username()` mit unerlaubten Zeichen | Es wird eine Fehlermeldung geliefert |
| U-LOGIN-03 | Unit | Zu kurzes Passwort ablehnen | `validate_password()` mit zu kurzem Passwort | Es wird die Mindestlängen-Fehlermeldung geliefert |
| U-LOGIN-04 | Unit | Zu langes Passwort ablehnen | `validate_password()` mit zu langem Passwort | Es wird die Maximalfehler-Meldung geliefert |
| U-LOGIN-05 | Unit | 2FA-Secret vereinheitlichen | `normalize_two_factor_secret()` und `format_two_factor_secret()` | Secret wird korrekt bereinigt und formatiert |
| U-LOGIN-06 | Unit | TOTP im Normalfall prüfen | `generate_totp_code()` + `verify_totp_code()` zur gleichen Zeit | Gültiger Code wird akzeptiert |
| U-LOGIN-07 | Unit | TOTP mit Zeitfenster prüfen | Code wird mit 30 Sekunden Abweichung geprüft | Gültiger Code wird wegen Validierungsfenster akzeptiert |
| U-LOGIN-08 | Unit | Fehlerhafte TOTP-Eingabe ablehnen | `verify_totp_code()` mit falschem Format | Ungültige Codes werden abgelehnt |
| I-APP-01 | Integration | Schutz geschützter Seite prüfen | `GET /dashboard` ohne Login | Weiterleitung auf Login |
| I-APP-02 | Integration | Registrierung prüfen | `POST /register` mit gültigen Daten | Benutzer wird erstellt und Weiterleitung auf Login erfolgt |
| I-APP-03 | Integration | Anti-Brute-Force prüfen | `POST /login` mit gesperrter IP | Login wird mit Sperrmeldung abgelehnt |
| I-APP-04 | Integration | Fachregel für Brett prüfen | `POST /check` für Dame und Turm auf diagonalem Feld | Dame: ungültig, Turm: gültig |
| I-APP-05 | Integration | Speichern und Laden prüfen | Login, danach `POST /save` und `GET /load/<id>` | Spielstand wird korrekt gespeichert und identisch geladen |
| I-APP-06 | Integration | Favoritenlogik prüfen | Login, Save-Point speichern, Favorit toggeln, gefiltert abfragen | Filter liefert nur entsprechend markierte Save-Points |

## Erwartete Ergebnisse

- Alle Unit-Tests müssen erfolgreich durchlaufen.
- Alle Integrations-Tests müssen erfolgreich durchlaufen.
- Keine produktiven Daten dürfen verändert werden.
- Fehler müssen in `pytest` klar sichtbar sein.
- Die Suite umfasst 21 konkrete Pytest-Testfälle auf zwei Ebenen.

## Durchführung

Die geplanten Tests werden mit `pytest` aus dem Projektwurzelverzeichnis
ausgeführt. Die konkrete Bewertung und das Resultat werden in
`test/testkonzept.md` festgehalten.
