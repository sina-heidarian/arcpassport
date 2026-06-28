import base64
import json
import logging
import os

import requests
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.models import QuestCompletion
from app.services.passport import build_passport_response

logger = logging.getLogger(__name__)

PASSPORT_NFT_NAME = "ArcPassport Builder Passport"
PASSPORT_NFT_DESCRIPTION = (
    "Soulbound builder identity for ArcPassport builders on Arc."
)
PASSPORT_NFT_IMAGE_PLACEHOLDER = "placeholder://arcpassport-builder-passport"
ARC_TESTNET_NETWORK_NAME = "ARC-TESTNET"

SELECTOR_NAME = "0x06fdde03"
SELECTOR_SYMBOL = "0x95d89b41"
SELECTOR_OWNER = "0x8da5cb5b"
SELECTOR_TOTAL_SUPPLY = "0x18160ddd"
SELECTOR_PASSPORT_OF = "0x5d1c2634"
SELECTOR_WALLET_TO_TOKEN_ID = "0x9c2806c7"
SELECTOR_TOKEN_ID_OF = "0x773c02d4"
SELECTOR_TOKEN_OF_OWNER = "0x294cdf0d"
SELECTOR_TOKEN_OF_OWNER_BY_INDEX = "0x2f745c59"
SELECTOR_TOKEN_URI = "0xc87b56dd"


class PassportNftReadError(RuntimeError):
    pass


class PassportNftMintError(RuntimeError):
    pass


def build_arcscan_address_url(address: str):
    return f"https://testnet.arcscan.app/address/{address}"


def build_arcscan_tx_url(tx_hash: str):
    return f"https://testnet.arcscan.app/tx/{tx_hash}"


def build_passport_nft_metadata(db: Session, wallet: str):
    """Build read-only NFT metadata from the current passport state."""
    passport = build_passport_response(db, wallet)
    achievements_unlocked = len([
        achievement
        for achievement in passport["achievements"]
        if achievement["unlocked"]
    ])
    normalized_wallet = wallet.lower()

    return {
        "name": f"{PASSPORT_NFT_NAME} #{short_wallet(wallet)}",
        "description": PASSPORT_NFT_DESCRIPTION,
        "image": build_metadata_image(passport),
        "external_url": f"{get_public_app_url()}/passport/{wallet}",
        "attributes": [
            {
                "trait_type": "Wallet",
                "value": normalized_wallet,
            },
            {
                "trait_type": "Level",
                "value": passport["level"],
            },
            {
                "trait_type": "XP",
                "value": passport["xp"],
            },
            {
                "trait_type": "Reputation",
                "value": passport["reputation"],
            },
            {
                "trait_type": "Rank",
                "value": passport["rank"],
            },
            {
                "trait_type": "Deployments",
                "value": passport["deployment_count"],
            },
            {
                "trait_type": "Deployment XP",
                "value": passport["deployment_xp"],
            },
            {
                "trait_type": "Quest XP",
                "value": passport["quest_xp"],
            },
            {
                "trait_type": "Check-in Streak",
                "value": passport["streak"],
            },
            {
                "trait_type": "Achievements Unlocked",
                "value": achievements_unlocked,
            },
        ],
    }


def build_passport_nft_token_uri(db: Session, wallet: str):
    metadata = build_passport_nft_metadata(db, wallet)
    metadata_json = json.dumps(metadata, separators=(",", ":"), ensure_ascii=False)
    encoded_metadata = base64.b64encode(
        metadata_json.encode("utf-8")
    ).decode("ascii")

    return {
        "wallet": wallet,
        "token_uri": f"data:application/json;base64,{encoded_metadata}",
    }


def short_wallet(wallet: str):
    if len(wallet) <= 10:
        return wallet

    return f"{wallet[:6]}...{wallet[-4:]}"


def get_public_app_url():
    return os.getenv("PUBLIC_APP_URL", "http://localhost:3000").rstrip("/")


def build_metadata_image(passport: dict):
    svg = (
        "<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200' "
        "viewBox='0 0 1200 1200'>"
        "<rect width='1200' height='1200' fill='#050505'/>"
        "<rect x='80' y='80' width='1040' height='1040' rx='44' "
        "fill='#111827' stroke='#38bdf8' stroke-width='6'/>"
        "<text x='120' y='210' fill='#ffffff' font-family='Arial' "
        "font-size='64' font-weight='700'>ArcPassport</text>"
        "<text x='120' y='300' fill='#93c5fd' font-family='Arial' "
        "font-size='38'>Soulbound Builder Passport</text>"
        f"<text x='120' y='470' fill='#ffffff' font-family='Arial' "
        f"font-size='54'>Level {passport['level']}</text>"
        f"<text x='120' y='560' fill='#d1d5db' font-family='Arial' "
        f"font-size='42'>XP {passport['xp']}</text>"
        f"<text x='120' y='640' fill='#d1d5db' font-family='Arial' "
        f"font-size='42'>Reputation {passport['reputation']}</text>"
        f"<text x='120' y='720' fill='#d1d5db' font-family='Arial' "
        f"font-size='42'>Deployments {passport['deployment_count']}</text>"
        "</svg>"
    )
    encoded_svg = base64.b64encode(svg.encode("utf-8")).decode("ascii")

    return f"data:image/svg+xml;base64,{encoded_svg}"


def build_passport_nft_eligibility(db: Session, wallet: str):
    """Evaluate mint readiness without minting or touching the chain."""
    passport = build_passport_response(db, wallet)
    completed_quests = get_completed_quest_count(db, wallet)

    requirements = [
        {
            "label": "Reach Level 5",
            "met": passport["level"] >= 5,
            "current": passport["level"],
            "target": 5,
        },
        {
            "label": "Import or deploy one contract",
            "met": passport["deployment_count"] >= 1,
            "current": passport["deployment_count"],
            "target": 1,
        },
        {
            "label": "Complete one quest",
            "met": completed_quests >= 1,
            "current": completed_quests,
            "target": 1,
        },
    ]
    eligible = all(requirement["met"] for requirement in requirements)

    return {
        "eligible": eligible,
        "reason": (
            "Builder Passport mint architecture is ready."
            if eligible
            else "Complete the remaining requirements to prepare for minting."
        ),
        "requirements": requirements,
    }


def build_future_verifier_context(db: Session, wallet: str):
    """Prepare non-sensitive values a future mint verifier can sign or check."""
    metadata = build_passport_nft_metadata(db, wallet)
    eligibility = build_passport_nft_eligibility(db, wallet)

    return {
        "wallet": wallet.lower(),
        "eligible": eligibility["eligible"],
        "metadata_name": metadata["name"],
        "requirements": eligibility["requirements"],
    }


def get_passport_nft_status():
    contract_address = settings.arcpassport_sbt_address

    return {
        "configured": bool(contract_address),
        "contract_address": contract_address,
        "network": ARC_TESTNET_NETWORK_NAME,
        "explorer_url": (
            build_arcscan_address_url(contract_address)
            if contract_address
            else None
        ),
    }


def get_passport_nft_contract_info():
    contract_address = settings.arcpassport_sbt_address

    if not contract_address:
        raise PassportNftReadError("ARCPASSPORT_SBT_ADDRESS is not configured")

    if not settings.arc_testnet_rpc_url:
        raise PassportNftReadError("ARC_TESTNET_RPC_URL is not configured")

    logger.info("Reading ArcPassportSBT contract info address=%s", contract_address)

    return {
        "name": read_contract_string(contract_address, SELECTOR_NAME),
        "symbol": read_contract_string(contract_address, SELECTOR_SYMBOL),
        "owner": read_contract_address(contract_address, SELECTOR_OWNER),
        "totalSupply": read_optional_contract_uint(
            contract_address,
            SELECTOR_TOTAL_SUPPLY,
        ),
        "contract_address": contract_address,
        "network": ARC_TESTNET_NETWORK_NAME,
        "explorer_url": build_arcscan_address_url(contract_address),
    }


def get_passport_nft_ownership(wallet: str):
    contract_address = settings.arcpassport_sbt_address

    if not contract_address:
        raise PassportNftReadError("ARCPASSPORT_SBT_ADDRESS is not configured")

    if not settings.arc_testnet_rpc_url:
        raise PassportNftReadError("ARC_TESTNET_RPC_URL is not configured")

    token_id = read_passport_token_id(contract_address, wallet)
    token_uri = (
        read_optional_token_uri(contract_address, token_id)
        if token_id is not None
        else None
    )

    return {
        "wallet": wallet,
        "owns_passport": token_id is not None,
        "token_id": token_id,
        "token_uri": token_uri,
        "contract_address": contract_address,
        "explorer_url": build_arcscan_address_url(contract_address),
    }


def mint_passport_nft(db: Session, wallet: str):
    validate_wallet_address(wallet)
    eligibility = build_passport_nft_eligibility(db, wallet)

    if not eligibility["eligible"]:
        raise PassportNftMintError("Wallet is not eligible to mint")

    ownership = get_passport_nft_ownership(wallet)

    if ownership["owns_passport"]:
        return {
            "success": True,
            "wallet": wallet,
            "tx_hash": None,
            "receipt_tx_hash": None,
            "block_number": None,
            "contract_address": ownership["contract_address"],
            "token_id": ownership["token_id"],
            "token_uri": ownership["token_uri"],
            "explorer_url": ownership["explorer_url"],
            "already_minted": True,
            "message": "Builder Passport already minted",
        }

    token_uri = build_passport_nft_token_uri(db, wallet)["token_uri"]
    mint_result = send_mint_transaction(wallet, token_uri)
    updated_ownership = get_passport_nft_ownership(wallet)

    return {
        "success": True,
        "wallet": wallet,
        "tx_hash": mint_result["tx_hash"],
        "receipt_tx_hash": mint_result["receipt_tx_hash"],
        "block_number": mint_result["block_number"],
        "contract_address": settings.arcpassport_sbt_address,
        "token_id": updated_ownership["token_id"],
        "token_uri": token_uri,
        "explorer_url": build_arcscan_tx_url(mint_result["tx_hash"]),
        "already_minted": False,
        "message": "Builder Passport minted",
    }


def send_mint_transaction(wallet: str, token_uri: str):
    if not settings.arcpassport_sbt_address:
        raise PassportNftMintError("ARCPASSPORT_SBT_ADDRESS is not configured")

    if not settings.arc_testnet_rpc_url:
        raise PassportNftMintError("ARC_TESTNET_RPC_URL is not configured")

    if not settings.deployer_private_key:
        raise PassportNftMintError("DEPLOYER_PRIVATE_KEY is not configured")

    try:
        from web3 import Web3
        from web3.exceptions import ContractLogicError
    except ImportError as error:
        raise PassportNftMintError("web3 dependency is not installed") from error

    web3 = Web3(Web3.HTTPProvider(settings.arc_testnet_rpc_url))

    if not web3.is_connected():
        raise PassportNftMintError("Arc Testnet RPC unavailable")

    contract_address = Web3.to_checksum_address(settings.arcpassport_sbt_address)
    builder_wallet = Web3.to_checksum_address(wallet)
    deployer = web3.eth.account.from_key(settings.deployer_private_key)
    contract = web3.eth.contract(
        address=contract_address,
        abi=[
            {
                "inputs": [
                    {"internalType": "address", "name": "builder", "type": "address"},
                    {"internalType": "string", "name": "metadataURI", "type": "string"},
                ],
                "name": "mintPassport",
                "outputs": [
                    {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
                ],
                "stateMutability": "nonpayable",
                "type": "function",
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "builder", "type": "address"},
                    {"internalType": "string", "name": "metadataURI", "type": "string"},
                ],
                "name": "mint",
                "outputs": [
                    {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
                ],
                "stateMutability": "nonpayable",
                "type": "function",
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "builder", "type": "address"},
                    {"internalType": "string", "name": "metadataURI", "type": "string"},
                ],
                "name": "safeMint",
                "outputs": [
                    {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
                ],
                "stateMutability": "nonpayable",
                "type": "function",
            }
        ],
    )

    try:
        mint_function = select_mint_function(
            contract,
            builder_wallet,
            token_uri,
            deployer.address,
        )
        nonce = web3.eth.get_transaction_count(deployer.address)
        chain_id = web3.eth.chain_id
        gas_estimate = mint_function.estimate_gas({"from": deployer.address})
        transaction = mint_function.build_transaction(
            {
                "from": deployer.address,
                "nonce": nonce,
                "chainId": chain_id,
                "gas": int(gas_estimate * 1.2),
                "gasPrice": web3.eth.gas_price,
            }
        )
        signed_transaction = web3.eth.account.sign_transaction(
            transaction,
            settings.deployer_private_key,
        )
        tx_hash_bytes = web3.eth.send_raw_transaction(
            signed_transaction.raw_transaction
        )
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash_bytes, timeout=180)
    except ContractLogicError as error:
        raise PassportNftMintError("Transaction reverted") from error
    except ValueError as error:
        message = str(error).lower()

        if "insufficient funds" in message:
            raise PassportNftMintError("Insufficient gas") from error

        if "revert" in message:
            raise PassportNftMintError("Transaction reverted") from error

        raise PassportNftMintError("RPC error while minting") from error

    if receipt.status != 1:
        raise PassportNftMintError("Transaction reverted")

    submitted_tx_hash = web3.to_hex(tx_hash_bytes)
    receipt_tx_hash = submitted_tx_hash
    block_number = None

    try:
        receipt_hash = receipt.get("transactionHash")
        if receipt_hash:
            receipt_tx_hash = web3.to_hex(receipt_hash)
        block_number = receipt.get("blockNumber")
    except AttributeError:
        receipt_hash = getattr(receipt, "transactionHash", None)
        if receipt_hash:
            receipt_tx_hash = web3.to_hex(receipt_hash)
        block_number = getattr(receipt, "blockNumber", None)

    return {
        "tx_hash": submitted_tx_hash,
        "receipt_tx_hash": receipt_tx_hash,
        "block_number": block_number,
    }


def select_mint_function(contract, builder_wallet: str, token_uri: str, sender: str):
    candidates = [
        contract.functions.mintPassport(builder_wallet, token_uri),
        contract.functions.mint(builder_wallet, token_uri),
        contract.functions.safeMint(builder_wallet, token_uri),
    ]
    last_error = None

    for candidate in candidates:
        try:
            candidate.estimate_gas({"from": sender})
            return candidate
        except Exception as error:
            last_error = error

    raise PassportNftMintError("No compatible mint function is available") from last_error


def read_passport_token_id(contract_address: str, wallet: str):
    encoded_wallet = encode_address(wallet)
    encoded_zero = encode_uint(0)
    calls = [
        f"{SELECTOR_PASSPORT_OF}{encoded_wallet}",
        f"{SELECTOR_WALLET_TO_TOKEN_ID}{encoded_wallet}",
        f"{SELECTOR_TOKEN_ID_OF}{encoded_wallet}",
        f"{SELECTOR_TOKEN_OF_OWNER}{encoded_wallet}",
        f"{SELECTOR_TOKEN_OF_OWNER_BY_INDEX}{encoded_wallet}{encoded_zero}",
    ]

    for call_data in calls:
        try:
            token_id = read_contract_uint(contract_address, call_data)
        except PassportNftReadError:
            continue

        if token_id > 0:
            return token_id

    return None


def read_optional_token_uri(contract_address: str, token_id: int):
    try:
        return read_contract_string(
            contract_address,
            f"{SELECTOR_TOKEN_URI}{encode_uint(token_id)}",
        )
    except PassportNftReadError:
        return None


def read_optional_contract_uint(contract_address: str, selector: str):
    try:
        return read_contract_uint(contract_address, selector)
    except PassportNftReadError:
        return None


def read_contract_string(contract_address: str, selector: str):
    return decode_abi_string(eth_call(contract_address, selector))


def read_contract_address(contract_address: str, selector: str):
    result = strip_0x(eth_call(contract_address, selector))

    if len(result) < 64:
        raise PassportNftReadError("Contract address response is malformed")

    return f"0x{result[-40:]}"


def read_contract_uint(contract_address: str, selector: str):
    result = strip_0x(eth_call(contract_address, selector))

    if not result:
        raise PassportNftReadError("Contract uint response is empty")

    return int(result, 16)


def eth_call(contract_address: str, data: str):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_call",
        "params": [
            {
                "to": contract_address,
                "data": data,
            },
            "latest",
        ],
    }

    try:
        response = requests.post(
            settings.arc_testnet_rpc_url,
            json=payload,
            timeout=10,
        )
        response.raise_for_status()
    except requests.RequestException as error:
        raise PassportNftReadError("Arc Testnet RPC request failed") from error

    body = response.json()

    if body.get("error"):
        message = body["error"].get("message", "Contract read failed")
        raise PassportNftReadError(message)

    result = body.get("result")

    if not result or result == "0x":
        raise PassportNftReadError("Contract read returned empty data")

    return result


def decode_abi_string(value: str):
    data = strip_0x(value)

    if len(data) < 128:
        raise PassportNftReadError("Contract string response is malformed")

    length = int(data[64:128], 16)
    raw_value = data[128:128 + length * 2]

    return bytes.fromhex(raw_value).decode("utf-8")


def strip_0x(value: str):
    return value[2:] if value.startswith("0x") else value


def encode_address(address: str):
    clean_address = strip_0x(address).lower()

    if len(clean_address) != 40:
        raise PassportNftReadError("Wallet address is malformed")

    return clean_address.rjust(64, "0")


def encode_uint(value: int):
    return hex(value)[2:].rjust(64, "0")


def validate_wallet_address(wallet: str):
    clean_wallet = strip_0x(wallet)

    if len(clean_wallet) != 40:
        raise PassportNftMintError("Invalid wallet address")

    try:
        int(clean_wallet, 16)
    except ValueError as error:
        raise PassportNftMintError("Invalid wallet address") from error


def get_completed_quest_count(db: Session, wallet: str):
    return (
        db.query(func.count(QuestCompletion.id))
        .filter(QuestCompletion.wallet == wallet.lower())
        .scalar()
        or 0
    )
