#!/usr/bin/env python3
"""
Development management script for CryptoVault
Provides easy commands for common development tasks
"""

import subprocess
import sys
import os
import argparse

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return False

def start_services():
    """Start all Docker services"""
    return run_command("docker-compose up -d", "Starting all services")

def stop_services():
    """Stop all Docker services"""
    return run_command("docker-compose down", "Stopping all services")

def restart_services():
    """Restart all Docker services"""
    stop_services()
    return start_services()

def view_logs(service=None):
    """View logs for a specific service or all services"""
    if service:
        command = f"docker-compose logs -f {service}"
        description = f"Viewing logs for {service}"
    else:
        command = "docker-compose logs -f"
        description = "Viewing logs for all services"
    
    print(f"🔍 {description} (Press Ctrl+C to exit)")
    try:
        subprocess.run(command, shell=True, check=True)
    except KeyboardInterrupt:
        print("\n👋 Log viewing stopped")

def check_status():
    """Check the status of all services"""
    return run_command("docker-compose ps", "Checking service status")

def test_health():
    """Test the health endpoint"""
    return run_command("python test_phase1.py", "Running health tests")

def build_backend():
    """Rebuild the backend service"""
    return run_command("docker-compose build backend", "Building backend service")

def shell_backend():
    """Open a shell in the backend container"""
    print("🐚 Opening shell in backend container...")
    try:
        subprocess.run("docker-compose exec backend /bin/bash", shell=True, check=True)
    except subprocess.CalledProcessError:
        print("❌ Failed to open shell. Is the backend service running?")

def main():
    parser = argparse.ArgumentParser(description="CryptoVault Development Management")
    parser.add_argument("command", choices=[
        "start", "stop", "restart", "status", "logs", "test", "build", "shell"
    ], help="Command to execute")
    parser.add_argument("--service", help="Service name for logs command")
    
    args = parser.parse_args()
    
    print("🔐 CryptoVault Development Manager")
    print("=" * 40)
    
    if args.command == "start":
        start_services()
    elif args.command == "stop":
        stop_services()
    elif args.command == "restart":
        restart_services()
    elif args.command == "status":
        check_status()
    elif args.command == "logs":
        view_logs(args.service)
    elif args.command == "test":
        test_health()
    elif args.command == "build":
        build_backend()
    elif args.command == "shell":
        shell_backend()
    
    print("\n✨ Command completed!")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        print("🔐 CryptoVault Development Manager")
        print("=" * 40)
        print("Available commands:")
        print("  start   - Start all services")
        print("  stop    - Stop all services") 
        print("  restart - Restart all services")
        print("  status  - Check service status")
        print("  logs    - View logs (use --service for specific service)")
        print("  test    - Run health tests")
        print("  build   - Rebuild backend service")
        print("  shell   - Open shell in backend container")
        print("\nExample: python dev.py start")
        sys.exit(1)
    
    main()
