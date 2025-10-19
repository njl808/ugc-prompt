#!/usr/bin/env python3
"""
API Key Management Tool
Manage your stored API keys easily
"""

import getpass
import sys
from secure_config import SecureAPIKeyManager


def show_menu():
    print("\nAPI Key Manager")
    print("=" * 30)
    print("1. View stored services")
    print("2. Add/Update API key")
    print("3. Test OpenAI connection")
    print("4. Delete API key")
    print("5. Exit")
    print("-" * 30)


def get_password():
    return getpass.getpass("Enter master password: ")


def view_services(manager: SecureAPIKeyManager):
    password = get_password()
    services = manager.list_stored_services(password)

    if services:
        print(f"\nStored services: {', '.join(services)}")
    else:
        print("\nNo services stored yet")


def add_api_key(manager: SecureAPIKeyManager):
    password = get_password()

    print("\nAvailable services:")
    print("1. openai")
    print("2. other (custom)")

    choice = input("Select service (1-2): ").strip()

    if choice == "1":
        service_name = "openai"
    elif choice == "2":
        service_name = input("Enter service name: ").strip().lower()
    else:
        print("[ERROR] Invalid choice")
        return

    api_key = getpass.getpass(f"Enter {service_name} API key: ").strip()

    if manager.store_api_key(service_name, api_key, password):
        print(f"[OK] {service_name} API key stored successfully!")
    else:
        print(f"[ERROR] Failed to store {service_name} API key")


def test_openai_connection(manager: SecureAPIKeyManager):
    password = get_password()

    try:
        api_key = manager.get_api_key("openai", password)
        if not api_key:
            print("[ERROR] No OpenAI API key found")
            return

        print("Testing OpenAI connection...")

        from openai import OpenAI
        try:
            import httpx  # optional for proxy support
        except Exception:
            httpx = None

        proxy = (
            os.environ.get("OPENAI_HTTP_PROXY")
            or os.environ.get("HTTPS_PROXY")
            or os.environ.get("HTTP_PROXY")
        )
        if proxy and httpx is not None:
            client = OpenAI(api_key=api_key, http_client=httpx.Client(proxies=proxy))
        else:
            client = OpenAI(api_key=api_key)

        # Simple test request
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Say 'API key works!'"}],
            max_tokens=10
        )

        result = response.choices[0].message.content
        print(f"[OK] OpenAI API test successful!")
        print(f"Response: {result}")

    except Exception as e:
        print(f"[ERROR] OpenAI API test failed: {e}")


def delete_api_key(manager: SecureAPIKeyManager):
    password = get_password()

    services = manager.list_stored_services(password)
    if not services:
        print("[ERROR] No services stored")
        return

    print(f"\nStored services: {', '.join(services)}")
    service_name = input("Enter service name to delete: ").strip().lower()

    if service_name in services:
        confirm = input(f"Are you sure you want to delete '{service_name}'? (y/N): ")
        if confirm.lower() == 'y':
            if manager.delete_api_key(service_name, password):
                print(f"[OK] {service_name} deleted successfully!")
            else:
                print(f"[ERROR] Failed to delete {service_name}")
        else:
            print("[WARN] Deletion cancelled")
    else:
        print(f"[ERROR] Service '{service_name}' not found")


def main():
    manager = SecureAPIKeyManager()

    while True:
        try:
            show_menu()
            choice = input("Choose option (1-5): ").strip()

            if choice == "1":
                view_services(manager)
            elif choice == "2":
                add_api_key(manager)
            elif choice == "3":
                test_openai_connection(manager)
            elif choice == "4":
                delete_api_key(manager)
            elif choice == "5":
                print("Goodbye!")
                break
            else:
                print("[ERROR] Invalid choice, please try again")

        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"\n[ERROR] Error: {e}")


if __name__ == "__main__":
    main()
