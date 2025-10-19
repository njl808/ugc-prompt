#!/usr/bin/env python3
"""
Easy setup script for securely storing API keys
Run this once to store your OpenAI API key safely
"""

import getpass
import sys
from secure_config import SecureAPIKeyManager


def main():
    print("Secure API Key Setup")
    print("=" * 40)

    manager = SecureAPIKeyManager()

    # Get master password
    print("\n1. First, create a master password to encrypt your API keys:")
    print("   (This password will be used to encrypt/decrypt your keys)")

    while True:
        password = getpass.getpass("Enter master password: ")
        if len(password) < 8:
            print("[ERROR] Password must be at least 8 characters long")
            continue

        confirm_password = getpass.getpass("Confirm master password: ")
        if password != confirm_password:
            print("[ERROR] Passwords don't match, try again")
            continue

        break

    # Get OpenAI API key
    print("\n2. Enter your OpenAI API key:")
    print("   (Get it from: https://platform.openai.com/api-keys)")

    while True:
        api_key = getpass.getpass("OpenAI API Key: ").strip()
        if not api_key:
            print("[ERROR] API key cannot be empty")
            continue

        if not api_key.startswith('sk-'):
            print("[ERROR] OpenAI API keys should start with 'sk-'")
            continue

        break

    # Store the API key
    print("\n3. Storing API key securely...")

    if manager.store_api_key("openai", api_key, password):
        print("\n[OK] Setup complete!")
        print("\nYour API key is now stored securely and encrypted.")
        print("\nTo use it in your application:")
        print("1. Set environment variable: API_KEY_PASSWORD=your_master_password")
        print("2. Or the app will prompt for password when needed")

        # Test retrieval
        print("\n4. Testing retrieval...")
        retrieved_key = manager.get_api_key("openai", password)
        if retrieved_key == api_key:
            print("[OK] Test successful - API key can be retrieved correctly!")
        else:
            print("[ERROR] Test failed - something went wrong")
            return 1

    else:
        print("[ERROR] Failed to store API key")
        return 1

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n[WARN] Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Error during setup: {e}")
        sys.exit(1)

