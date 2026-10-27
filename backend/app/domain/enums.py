from enum import StrEnum


class Role(StrEnum):
    REQUESTER = "REQUESTER"
    ANALYST = "ANALYST"
    MANAGER = "MANAGER"


class CaseStatus(StrEnum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING_USER = "WAITING_USER"
    WAITING_PROVIDER = "WAITING_PROVIDER"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


class Priority(StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class CaseCategory(StrEnum):
    INCIDENT = "INCIDENT"
    REQUEST = "REQUEST"
    CHANGE = "CHANGE"


class EscalationStatus(StrEnum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"
