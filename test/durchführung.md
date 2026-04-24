# Testdurchführung

## Durchführungsrahmen

- Datum: 2026-04-24
- Ausführung auf zwei Ebenen:
  - Unit-Tests
  - Integrations-/Routentests
- Werkzeug: `pytest 8.3.4`
- Testkommando:

```bash
PYTHONDONTWRITEBYTECODE=1 /tmp/acht-damen-test-venv/bin/pytest -q test
```

## Bewertung der durchgeführten Testfälle

| ID | Testfall | Ebene | Erwartung | Resultat | Bewertung | Nachvollziehbare Bewertung |
| --- | --- | --- | --- | --- | --- | --- |
| U-MAIN-01 | Brettgrösse wird begrenzt | Unit | Grenzwerte werden korrekt behandelt | Bestanden | OK | Kleine, grosse und ungültige Werte wurden korrekt auf den erlaubten Bereich abgebildet |
| U-MAIN-02 | Favoriten-Flag wird erkannt | Unit | Typische truthy Werte werden korrekt erkannt | Bestanden | OK | Die Hilfsfunktion unterschied erfolgreich zwischen gültigen truthy und anderen Werten |
| U-MAIN-03 | Nicht-negative Ganzzahlen werden abgesichert | Unit | Negative und ungültige Werte werden abgefangen | Bestanden | OK | Negative Werte wurden auf 0 begrenzt, ungültige Eingaben fielen auf den Default zurück |
| U-MAIN-04 | Legacy-Brett wird umgewandelt | Unit | Positionsliste wird zur Matrix | Bestanden | OK | Altes Speicherformat konnte verlustfrei in das aktülle Format übernommen werden |
| U-MAIN-05 | Matrixwerte werden normalisiert | Unit | Nur 0/1 bleiben übrig | Bestanden | OK | Truthy- und falsy-Werte wurden korrekt vereinheitlicht |
| U-MAIN-06 | Damen-Solver für 4x4 | Unit | Gültige Standardlösungen werden gefunden | Bestanden | OK | Der Solver lieferte die fachlich erwarteten zwei 4x4-Lösungen |
| U-MAIN-07 | Turm-Trace ist vollständig | Unit | Pro Reihe ein Schritt plus Abschluss | Bestanden | OK | Der Trace enthielt die erwartete Struktur für das Frontend |
| U-LOGIN-01 | Gültiger Username | Unit | Gültiger Name wird akzeptiert | Bestanden | OK | Ein Name im erlaubten Format wurde ohne Fehlermeldung akzeptiert |
| U-LOGIN-02 | Ungültiger Username | Unit | Fehlerhafte Zeichen werden abgelehnt | Bestanden | OK | Ein Name mit Leerzeichen/Sonderzeichen wurde korrekt abgewiesen |
| U-LOGIN-03 | Zu kurzes Passwort | Unit | Mindestlänge wird erzwungen | Bestanden | OK | Die Funktion lieferte die passende Fehlermeldung für zu kurze Passwörter |
| U-LOGIN-04 | Zu langes Passwort | Unit | Maximallänge wird erzwungen | Bestanden | OK | Auch überlange Passwörter wurden korrekt abgefangen |
| U-LOGIN-05 | 2FA-Secret-Normalisierung | Unit | Secret wird korrekt bereinigt und formatiert | Bestanden | OK | Schreibweisen mit Leerzeichen/Kleinschreibung wurden korrekt vereinheitlicht |
| U-LOGIN-06 | TOTP zur gleichen Zeit | Unit | Richtiger Code ist gültig | Bestanden | OK | Erzeugter Code wurde bei identischem Zeitpunkt akzeptiert |
| U-LOGIN-07 | TOTP mit Zeitfenster | Unit | Code bleibt im gültigen Nachbarfenster gültig | Bestanden | OK | Das erlaubte Zeitfenster funktionierte wie vorgesehen |
| U-LOGIN-08 | Fehlerhafte TOTP-Eingabe | Unit | Falsch formatierte Codes werden abgelehnt | Bestanden | OK | Nicht numerische oder zu kurze Eingaben wurden nicht akzeptiert |
| I-APP-01 | Dashboard ohne Login | Integration | Weiterleitung auf Login | Bestanden | OK | Die geschützte Route war ohne Authentifizierung nicht direkt erreichbar |
| I-APP-02 | Registrierung | Integration | Benutzer wird erstellt und umgeleitet | Bestanden | OK | Nach dem POST war der Benutzer in der Testdatenbank vorhanden |
| I-APP-03 | Login bei gesperrter IP | Integration | Sperrmeldung statt Login | Bestanden | OK | Die Anti-Brute-Force-Logik blockierte den Login im gesperrten Zeitraum korrekt |
| I-APP-04 | Dame vs. Turm bei Diagonale | Integration | Dame ungültig, Turm gültig | Bestanden | OK | Die Route `/check` setzte die unterschiedlichen Fachregeln korrekt um |
| I-APP-05 | Speichern und Laden | Integration | Spielstand bleibt konsistent | Bestanden | OK | Gespeicherter Spielstand konnte mit denselben Daten wieder geladen werden |
| I-APP-06 | Favoriten filtern | Integration | Nur markierte Save-Points erscheinen im Filter | Bestanden | OK | Das Umschalten des Favoritenstatus wirkte sich korrekt auf die Filterliste aus |

## Ergebnis

- Anzahl Testebenen: 2
- Anzahl dokumentierter Testfälle: 21
- Bestandene Testfälle: 21
- Nicht bestandene Testfälle: 0

Die Testdurchführung zeigt, dass die zentrale Fachlogik, die
Authentifizierungslogik und die wichtigsten Datenflüsse der Anwendung für die
Abgabe nachvollziehbar und erfolgreich überprüft wurden.

## Hinweis zu Warnungen

Beim Testlauf traten nur Warnungen auf, aber keine Fehler:

- DeprecationWarnings zu `datetime.utcnow()` in bestehendem Anwendungscode
- Pytest-Cache-Warnungen wegen schreibgeschütztem Dateisystem im Projektpfad

Diese Warnungen haben das Ergebnis der Testfälle nicht beeinflusst. Alle
geplanten und ausgeführten Tests wurden bestanden.
