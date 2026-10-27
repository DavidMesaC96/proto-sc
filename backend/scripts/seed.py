"""Datos de demostración equivalentes a prisma/seed.ts.

Uso (desde backend/):  python -m scripts.seed
"""

import random
import unicodedata
from datetime import timedelta

from app.domain.entities import new_id, utcnow
from app.domain.enums import CaseCategory, CaseStatus, Priority, Role
from app.infrastructure.database import SessionLocal
from app.infrastructure.models import (
    CaseModel,
    CaseUpdateModel,
    EscalationModel,
    ProviderModel,
    SessionModel,
    UserModel,
)
from app.infrastructure.security import BcryptPasswordHasher

DOMAIN = "sistecredito.com"
PASSWORD = "password123"

REQUESTERS = [
    "María García", "Juan López", "Ana Martínez", "Carlos Rodríguez",
    "Sofía Pérez", "Diego Fernández", "Elena González", "Pablo Sánchez",
]
ANALYSTS = ["David Mesacortes", "Laura Moreno", "Felipe Gutiérrez", "Camila Torres"]
DEPARTMENTS = [
    "Recursos Humanos", "Tecnología", "Finanzas", "Operaciones",
    "Marketing", "Legal", "Logística", "Calidad",
]
PROVIDERS = [
    ("Telco Solutions", "Telecomunicaciones", "support@telco.com", "+57 1 2345678"),
    ("CloudTech Services", "Infraestructura", "support@cloudtech.com", "+57 1 9876543"),
    ("SecureNet", "Seguridad", "support@securenet.com", "+57 1 5555555"),
    ("DataFlow Corp", "Integración", "support@dataflow.com", "+57 1 4444444"),
    ("Licencias SAS", "LICENSING", "soporte@licencias.com", "6011234567"),
    ("TechService Mantenimiento", "MAINTENANCE", "soporte@techservice.com", "6019876543"),
]
TITLES = [
    "Error al acceder al sistema de nómina",
    "Solicitud de nuevo usuario en Active Directory",
    "Servidor de correo no responde",
    "Necesito acceso a base de datos de clientes",
    "Fallo en integración con SAP",
    "Problema con VPN corporativa",
    "Solicitud de aumento de cuota de almacenamiento",
    "Error en reportes de facturación",
    "Necesito cambiar contraseña de acceso",
    "Problema de conectividad en oficina central",
    "Solicitud de instalación de software",
    "Fallo en backup automático",
    "Error en sistema de inventario",
    "Necesito acceso a archivos compartidos",
    "Problema con impresora de red",
    "Caída de aplicación crítica",
    "Solicitud de configuración de email",
    "Error en proceso de compras",
    "Necesito acceso a portal de clientes",
    "Problema de sincronización de datos",
]
DESCRIPTIONS = [
    "No puedo acceder a la aplicación. Recibo error 403 Forbidden. Necesito acceso urgente.",
    "Necesito crear un usuario nuevo para el personal recientemente contratado.",
    "El servicio está caído hace aproximadamente 2 horas.",
    "Requiero permisos de lectura/escritura en las tablas especificadas.",
    "La integración dejó de funcionar después de la actualización.",
    "No puedo conectarme a través de la VPN, aparece error de autenticación.",
    "Mi espacio en el servidor está al máximo, necesito espacio adicional.",
    "Los reportes no se generan correctamente desde ayer.",
    "Olvidé mi contraseña y necesito resetearla urgentemente.",
    "Algunos departamentos no pueden conectarse a internet.",
    "Necesito instalar una herramienta específica en mi máquina.",
    "El backup de anoche no se completó correctamente.",
    "El sistema muestra datos inconsistentes en el inventario.",
    "Perdí acceso a las carpetas compartidas después de la reorganización.",
    "La impresora no responde desde esta mañana.",
    "La aplicación se cerró sin previo aviso y afecta a 50+ usuarios.",
    "No me llegan los correos corporativos después de cambiar de máquina.",
    "El módulo de compras está lento y genera timeouts.",
    "El portal no me permite ingresar con mis credenciales.",
    "Los datos no se actualizan en tiempo real como debería.",
]
ESTIMATED = {Priority.CRITICAL: 2, Priority.HIGH: 8}


def to_email(name: str) -> str:
    ascii_name = unicodedata.normalize("NFD", name.lower()).encode("ascii", "ignore").decode()
    return f"{'.'.join(ascii_name.split())}@{DOMAIN}"


def main() -> None:
    password_hash = BcryptPasswordHasher().hash(PASSWORD)
    now = utcnow()

    with SessionLocal() as db:
        for model in (EscalationModel, CaseUpdateModel, CaseModel, SessionModel,
                      ProviderModel, UserModel):
            db.query(model).delete()

        def make_user(name: str, role: Role, department: str) -> UserModel:
            user = UserModel(
                id=new_id(), name=name, email=to_email(name),
                password_hash=password_hash, role=role.value, department=department,
            )
            db.add(user)
            return user

        requesters = [make_user(n, Role.REQUESTER, random.choice(DEPARTMENTS)) for n in REQUESTERS]
        analysts = [make_user(n, Role.ANALYST, "Mesa de Servicios") for n in ANALYSTS]
        manager = make_user("Carlos Responsable", Role.MANAGER, "Tecnología")

        providers = [
            ProviderModel(id=new_id(), name=n, type=t, email=e, phone=p)
            for n, t, e, p in PROVIDERS
        ]
        db.add_all(providers)
        db.flush()

        statuses, priorities, categories = list(CaseStatus), list(Priority), list(CaseCategory)
        for i in range(100):
            requester, analyst = random.choice(requesters), random.choice(analysts)
            status, priority = random.choice(statuses), random.choice(priorities)
            created = now - timedelta(days=random.randint(1, 60))
            case = CaseModel(
                id=new_id(),
                title=f"{TITLES[i % len(TITLES)]} #{i + 1}",
                description=DESCRIPTIONS[i % len(DESCRIPTIONS)],
                category=random.choice(categories).value,
                priority=priority.value,
                status=status.value,
                requester_id=requester.id,
                assigned_to_id=analyst.id,
                estimated_time=ESTIMATED.get(priority, 24),
                created_at=created,
                updated_at=created,
                closed_at=created + timedelta(days=1) if status == CaseStatus.CLOSED else None,
            )
            db.add(case)
            db.flush()

            if random.random() > 0.5:
                for j in range(random.randint(1, 3)):
                    author = analyst if random.random() > 0.3 else requester
                    db.add(CaseUpdateModel(
                        id=new_id(), case_id=case.id, author_id=author.id,
                        message=f"Actualización: {j + 1}. Trabajando en la resolución.",
                        new_status=status.value,
                        created_at=created + timedelta(hours=12 * (j + 1)),
                    ))

            if random.random() > 0.7 and status in (CaseStatus.WAITING_PROVIDER, CaseStatus.IN_PROGRESS):
                db.add(EscalationModel(
                    id=new_id(), case_id=case.id, provider_id=random.choice(providers).id,
                    status="PENDING" if status == CaseStatus.WAITING_PROVIDER else "RESOLVED",
                    notes="Escalado al proveedor externo para resolución especializada.",
                ))

        db.commit()

    print("Seed completado: 8 solicitantes, 4 analistas, 1 responsable, 6 proveedores, 100 casos")
    print(f"Analista: david.mesacortes@{DOMAIN} / {PASSWORD}")
    print(f"Manager:  carlos.responsable@{DOMAIN} / {PASSWORD}")


if __name__ == "__main__":
    main()
