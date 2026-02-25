# acht-damen-tuerme-problem
IDPA Arbeit im23a Kristian Anastasia und Jérôme

```
project-root/
│
├── app/
│   ├── __init__.py          # Flask App Factory
│   ├── config.py            # Konfiguration (DB, Secrets, etc.)
│   │
│   ├── models/              # Datenbankmodelle
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── tenant.py
│   │   ├── membership.py
│   │   └── solver_job.py
│   │
│   ├── routes/              # API/Endpoints
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   ├── tenant_routes.py
│   │   ├── solver_routes.py
│   │   └── job_routes.py
│   │
│   ├── services/            # Businesslogik (Solver etc.)
│   │   ├── __init__.py
│   │   ├── solver_service.py
│   │   └── auth_service.py
│   │
│   ├── templates/           # HTML (Jinja Templates)
│   │   ├── base.html
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   └── solver.html
│   │
│   ├── static/              # CSS, JS, Bilder
│       ├── css/
│       ├── js/
│       └── img/
│
├── tests/                   # optionale Tests
│
├── run.py                   # Startpunkt der Anwendung
├── requirements.txt
├── .env                     # DB-Zugangsdaten, Secrets
└── README.md
```