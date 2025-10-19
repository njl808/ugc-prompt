import os
import json
import base64
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


class SecureAPIKeyManager:
    def __init__(self, config_dir: str = ".secure_config"):
        self.config_dir = Path(config_dir)
        self.config_dir.mkdir(exist_ok=True)
        self.key_file = self.config_dir / "api_keys.enc"
        self.salt_file = self.config_dir / "salt.key"

    def _generate_key_from_password(self, password: str) -> bytes:
        """Generate encryption key from password."""
        if self.salt_file.exists():
            with open(self.salt_file, "rb") as f:
                salt = f.read()
        else:
            salt = os.urandom(16)
            with open(self.salt_file, "wb") as f:
                f.write(salt)

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return base64.urlsafe_b64encode(kdf.derive(password.encode()))

    def store_api_key(self, service_name: str, api_key: str, password: str) -> bool:
        """Store API key encrypted with password."""
        try:
            key = self._generate_key_from_password(password)
            cipher_suite = Fernet(key)

            keys_data = {}
            if self.key_file.exists():
                try:
                    with open(self.key_file, "rb") as f:
                        encrypted_data = f.read()
                    decrypted_data = cipher_suite.decrypt(encrypted_data)
                    keys_data = json.loads(decrypted_data.decode())
                except Exception:
                    keys_data = {}

            keys_data[service_name] = api_key

            json_data = json.dumps(keys_data).encode()
            encrypted_data = cipher_suite.encrypt(json_data)

            with open(self.key_file, "wb") as f:
                f.write(encrypted_data)

            print(f"[OK] {service_name} API key stored securely!")
            return True

        except Exception as e:
            print(f"[ERROR] Error storing API key: {e}")
            return False

    def get_api_key(self, service_name: str, password: str | None = None) -> str | None:
        """Retrieve API key with password or environment fallback."""
        try:
            if not self.key_file.exists():
                return None

            env_key = os.environ.get(f"{service_name.upper()}_API_KEY")
            if env_key:
                return env_key

            if not password:
                password = os.environ.get("API_KEY_PASSWORD")
                if not password:
                    return None

            key = self._generate_key_from_password(password)
            cipher_suite = Fernet(key)

            with open(self.key_file, "rb") as f:
                encrypted_data = f.read()

            decrypted_data = cipher_suite.decrypt(encrypted_data)
            keys_data = json.loads(decrypted_data.decode())

            return keys_data.get(service_name)

        except Exception as e:
            print(f"[ERROR] Error retrieving API key: {e}")
            return None

    def list_stored_services(self, password: str) -> list[str]:
        """List all stored service names."""
        try:
            if not self.key_file.exists():
                return []

            key = self._generate_key_from_password(password)
            cipher_suite = Fernet(key)

            with open(self.key_file, "rb") as f:
                encrypted_data = f.read()

            decrypted_data = cipher_suite.decrypt(encrypted_data)
            keys_data = json.loads(decrypted_data.decode())

            return list(keys_data.keys())

        except Exception as e:
            print(f"[ERROR] Error listing services: {e}")
            return []

    def delete_api_key(self, service_name: str, password: str) -> bool:
        """Delete a stored API key."""
        try:
            if not self.key_file.exists():
                return False

            key = self._generate_key_from_password(password)
            cipher_suite = Fernet(key)

            with open(self.key_file, "rb") as f:
                encrypted_data = f.read()

            decrypted_data = cipher_suite.decrypt(encrypted_data)
            keys_data = json.loads(decrypted_data.decode())

            if service_name in keys_data:
                del keys_data[service_name]

                json_data = json.dumps(keys_data).encode()
                encrypted_data = cipher_suite.encrypt(json_data)

                with open(self.key_file, "wb") as f:
                    f.write(encrypted_data)

                print(f"[OK] {service_name} API key deleted!")
                return True
            else:
                print(f"[WARN] {service_name} not found in stored keys")
                return False

        except Exception as e:
            print(f"[ERROR] Error deleting API key: {e}")
            return False


# Global instance
api_key_manager = SecureAPIKeyManager()


def get_openai_api_key() -> str:
    """Get OpenAI API key from environment or secure storage, or raise."""
    env_key = os.environ.get("OPENAI_API_KEY")
    if env_key:
        return env_key

    password = os.environ.get("API_KEY_PASSWORD")
    if password:
        stored_key = api_key_manager.get_api_key("openai", password)
        if stored_key:
            return stored_key

    raise ValueError(
        "OpenAI API key not found. Please either:\n"
        "1. Set OPENAI_API_KEY environment variable, or\n"
        "2. Run 'python setup_api_keys.py' to store it securely, or\n"
        "3. Set API_KEY_PASSWORD environment variable if already stored"
    )


def get_openai_api_key_optional() -> str | None:
    """Get OpenAI API key without raising error if not found."""
    try:
        return get_openai_api_key()
    except ValueError:
        return None

