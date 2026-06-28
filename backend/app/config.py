import os
from dataclasses import dataclass


class ConfigError(RuntimeError):
    pass


def get_required_env(name: str) -> str:
    value = os.getenv(name)

    if not value:
        raise ConfigError(f"{name} is not configured")

    return value


def get_cors_origins() -> list[str]:
    raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:3001",
    )
    return [
        origin.strip()
        for origin in raw_origins.split(",")
        if origin.strip()
    ]


def get_bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)

    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    database_url: str
    circle_base_url: str
    circle_api_key: str | None
    circle_debug: bool
    arcpassport_sbt_address: str | None
    arc_testnet_rpc_url: str | None
    deployer_private_key: str | None
    cors_origins: list[str]
    log_level: str


settings = Settings(
    database_url=get_required_env("DATABASE_URL"),
    circle_base_url=os.getenv(
        "CIRCLE_BASE_URL",
        "https://api.circle.com",
    ),
    circle_api_key=os.getenv("CIRCLE_API_KEY"),
    circle_debug=get_bool_env("CIRCLE_DEBUG"),
    arcpassport_sbt_address=os.getenv("ARCPASSPORT_SBT_ADDRESS"),
    arc_testnet_rpc_url=os.getenv("ARC_TESTNET_RPC_URL"),
    deployer_private_key=os.getenv("DEPLOYER_PRIVATE_KEY"),
    cors_origins=get_cors_origins(),
    log_level=os.getenv("LOG_LEVEL", "INFO"),
)
