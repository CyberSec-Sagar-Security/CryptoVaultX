"""
CryptoVault - Master Test Runner
=================================
Runs all test suites and generates comprehensive report.
"""

import os
import sys
import time
from datetime import datetime
from pathlib import Path

# Add tests directory to path
sys.path.insert(0, os.path.dirname(__file__))

def print_header():
    """Print test runner header."""
    print("\n" + "╔" + "═" * 78 + "╗")
    print("║" + " " * 20 + "CRYPTOVAULT COMPREHENSIVE TEST SUITE" + " " * 22 + "║")
    print("╚" + "═" * 78 + "╝")
    print(f"\nTest Execution Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()

def print_module_header(module_name, description):
    """Print module test header."""
    print("\n" + "┌" + "─" * 78 + "┐")
    print(f"│  {module_name:74}│")
    print(f"│  {description:74}│")
    print("└" + "─" * 78 + "┘\n")

def run_encryption_tests():
    """Run encryption/decryption tests."""
    print_module_header("MODULE 1: ENCRYPTION & DECRYPTION", "Testing encryption with various file types and sizes")
    
    try:
        import test_encryption
        test_encryption.run_encryption_tests()
        return True
    except Exception as e:
        print(f"✗ Error running encryption tests: {str(e)}")
        return False

def run_key_management_tests():
    """Run key management tests."""
    print_module_header("MODULE 2: KEY MANAGEMENT", "Testing key generation, storage, and lifecycle")
    
    try:
        import test_key_management
        test_key_management.run_key_management_tests()
        return True
    except Exception as e:
        print(f"✗ Error running key management tests: {str(e)}")
        return False

def run_sharing_permission_tests():
    """Run sharing permission tests."""
    print_module_header("MODULE 3: SHARING & PERMISSIONS", "Testing access control and file sharing")
    
    print("NOTE: This test requires the backend API to be running.")
    print("      Make sure Flask backend is running on localhost:5000")
    print()
    response = input("Backend is running? (y/n): ").strip().lower()
    
    if response == 'y':
        try:
            import test_sharing_permissions
            test_sharing_permissions.run_sharing_tests()
            return True
        except Exception as e:
            print(f"✗ Error running sharing tests: {str(e)}")
            return False
    else:
        print("⊗ SKIPPED - Backend not running")
        return None

def run_security_tests():
    """Run security vulnerability tests."""
    print_module_header("MODULE 4: SECURITY TESTING", "Testing for vulnerabilities and attack vectors")
    
    print("NOTE: This test requires the backend API to be running.")
    print("      Make sure Flask backend is running on localhost:5000")
    print()
    response = input("Backend is running? (y/n): ").strip().lower()
    
    if response == 'y':
        try:
            import test_security
            test_security.run_security_tests()
            return True
        except Exception as e:
            print(f"✗ Error running security tests: {str(e)}")
            return False
    else:
        print("⊗ SKIPPED - Backend not running")
        return None

def run_integrity_tests():
    """Run data integrity tests."""
    print_module_header("MODULE 5: DATA INTEGRITY", "Testing data corruption detection and checksums")
    
    try:
        import test_data_integrity
        test_data_integrity.run_integrity_tests()
        return True
    except Exception as e:
        print(f"✗ Error running integrity tests: {str(e)}")
        return False

def print_final_summary(results, start_time):
    """Print final test summary."""
    end_time = time.time()
    elapsed = end_time - start_time
    
    print("\n" + "╔" + "═" * 78 + "╗")
    print("║" + " " * 30 + "FINAL TEST SUMMARY" + " " * 30 + "║")
    print("╚" + "═" * 78 + "╝")
    print()
    
    print(f"Test Execution Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total Execution Time: {elapsed:.2f} seconds")
    print()
    
    print("Module Results:")
    print("=" * 80)
    
    modules = [
        ("Module 1: Encryption & Decryption", results[0]),
        ("Module 2: Key Management", results[1]),
        ("Module 3: Sharing & Permissions", results[2]),
        ("Module 4: Security Testing", results[3]),
        ("Module 5: Data Integrity", results[4])
    ]
    
    for module_name, result in modules:
        if result is True:
            status = "✓ PASSED"
        elif result is False:
            status = "✗ FAILED"
        else:
            status = "⊗ SKIPPED"
        
        print(f"{module_name:50} {status}")
    
    print()
    
    # Calculate statistics
    passed = sum(1 for r in results if r is True)
    failed = sum(1 for r in results if r is False)
    skipped = sum(1 for r in results if r is None)
    total = len(results)
    
    print("Overall Statistics:")
    print("-" * 80)
    print(f"Total Modules: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Skipped: {skipped}")
    
    if passed + failed > 0:
        success_rate = (passed / (passed + failed)) * 100
        print(f"Success Rate: {success_rate:.1f}%")
    
    print()
    
    if failed > 0:
        print("⚠️  Some tests failed. Please review the detailed output above.")
    elif skipped > 0:
        print("ℹ️  Some tests were skipped. Run with backend to execute all tests.")
    else:
        print("✓ All tests passed successfully!")
    
    print("\n" + "=" * 80)
    print()

def save_test_report(results, start_time):
    """Save test results to a file."""
    try:
        report_file = Path("test_results.txt")
        end_time = time.time()
        
        with open(report_file, 'w') as f:
            f.write("=" * 80 + "\n")
            f.write("CRYPTOVAULT - TEST EXECUTION REPORT\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Duration: {end_time - start_time:.2f} seconds\n\n")
            
            f.write("MODULE RESULTS:\n")
            f.write("-" * 80 + "\n")
            
            modules = [
                "Module 1: Encryption & Decryption",
                "Module 2: Key Management",
                "Module 3: Sharing & Permissions",
                "Module 4: Security Testing",
                "Module 5: Data Integrity"
            ]
            
            for i, module_name in enumerate(modules):
                result = results[i]
                if result is True:
                    status = "PASSED"
                elif result is False:
                    status = "FAILED"
                else:
                    status = "SKIPPED"
                f.write(f"{module_name}: {status}\n")
            
            f.write("\n" + "=" * 80 + "\n")
            
            passed = sum(1 for r in results if r is True)
            failed = sum(1 for r in results if r is False)
            skipped = sum(1 for r in results if r is None)
            
            f.write(f"\nTotal Modules: {len(results)}\n")
            f.write(f"Passed: {passed}\n")
            f.write(f"Failed: {failed}\n")
            f.write(f"Skipped: {skipped}\n")
            
            if passed + failed > 0:
                success_rate = (passed / (passed + failed)) * 100
                f.write(f"Success Rate: {success_rate:.1f}%\n")
        
        print(f"✓ Test report saved to: {report_file.absolute()}")
        
    except Exception as e:
        print(f"⚠️  Failed to save report: {str(e)}")

def main():
    """Main test runner."""
    print_header()
    
    start_time = time.time()
    results = []
    
    # Run all test modules
    results.append(run_encryption_tests())
    results.append(run_key_management_tests())
    results.append(run_sharing_permission_tests())
    results.append(run_security_tests())
    results.append(run_integrity_tests())
    
    # Print summary
    print_final_summary(results, start_time)
    
    # Save report
    save_test_report(results, start_time)
    
    # Return exit code
    if any(r is False for r in results):
        sys.exit(1)  # Some tests failed
    else:
        sys.exit(0)  # All tests passed or skipped

if __name__ == "__main__":
    main()
