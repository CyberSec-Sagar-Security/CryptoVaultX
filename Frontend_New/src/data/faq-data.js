// FAQ Data for CryptoVault
// This file contains all the frequently asked questions and their answers

export const faqData = [
  {
    category: "General Questions",
    items: [
      {
        question: "What is CryptoVault?",
        answer: "CryptoVault is a secure file storage solution that encrypts your files before storing them in the cloud. This ensures that your sensitive data remains private and protected even if the server is compromised."
      },
      {
        question: "How secure is CryptoVault?",
        answer: "CryptoVault uses end-to-end encryption to protect your files. This means that files are encrypted on your device before being uploaded, and only you have access to the encryption keys needed to decrypt them."
      },
      {
        question: "What types of files can I store in CryptoVault?",
        answer: "You can store any type of file in CryptoVault, including documents, images, videos, and more. There are no restrictions on file types."
      },
      {
        question: "Is there a storage limit?",
        answer: "Yes, free accounts have a 5GB storage limit. Premium accounts have higher limits depending on your subscription plan."
      }
    ]
  },
  {
    category: "Account Management",
    items: [
      {
        question: "How do I create an account?",
        answer: "Click on the \"Sign Up\" button on the login page and fill out the registration form with your email and a strong password."
      },
      {
        question: "How do I reset my password?",
        answer: "On the login page, click \"Forgot Password\" and follow the instructions sent to your registered email address."
      },
      {
        question: "Can I change my email address?",
        answer: "Yes, you can change your email address in the account settings section after logging in."
      },
      {
        question: "How do I delete my account?",
        answer: "You can delete your account in the account settings section. Note that this will permanently delete all your files and shared links."
      }
    ]
  },
  {
    category: "File Management",
    items: [
      {
        question: "How do I upload files?",
        answer: "After logging in, navigate to the Dashboard and click the \"Upload\" button. Select the files you want to upload from your device."
      },
      {
        question: "What happens if I upload a file with the same name?",
        answer: "If you upload a file with the same name as an existing file, CryptoVault will add a number suffix to the new file (e.g., \"document(1).pdf\")."
      },
      {
        question: "Can I organize my files into folders?",
        answer: "Yes, you can create folders in the Dashboard to organize your files. Simply click \"New Folder\" and provide a name."
      },
      {
        question: "How do I download my files?",
        answer: "Click on the file you want to download, then click the \"Download\" button. The file will be decrypted and downloaded to your device."
      },
      {
        question: "Can I preview files without downloading them?",
        answer: "Yes, common file types like PDFs, images, and text documents can be previewed directly in the browser after they are securely decrypted."
      }
    ]
  },
  {
    category: "Encryption and Security",
    items: [
      {
        question: "How does the encryption work?",
        answer: "CryptoVault uses AES-256 encryption to protect your files. The encryption happens in your browser before the file is uploaded to the server."
      },
      {
        question: "Where are my encryption keys stored?",
        answer: "Your encryption keys are derived from your password and are never stored on our servers in their original form. A key derivation function is used to generate the keys when you log in."
      },
      {
        question: "What if I forget my password? Can I still access my files?",
        answer: "If you forget your password and reset it, you'll receive a recovery key that can help decrypt your files. Without this recovery process, files cannot be decrypted without the original password."
      },
      {
        question: "Is my data encrypted during transmission?",
        answer: "Yes, all data transmitted between your device and our servers is encrypted using TLS (Transport Layer Security)."
      }
    ]
  },
  {
    category: "File Sharing",
    items: [
      {
        question: "How do I share a file with someone?",
        answer: "Click on the file you want to share, then click the \"Share\" button. Enter the recipient's email address and set permissions."
      },
      {
        question: "Can I control what shared users can do with my files?",
        answer: "Yes, you can set permissions to either \"Read Only\" or \"Read and Write\" when sharing a file."
      },
      {
        question: "How do I stop sharing a file?",
        answer: "Go to the \"Shared\" section, find the file you want to stop sharing, and click \"Revoke\" next to the recipient's name."
      },
      {
        question: "Can I set an expiration date for shared links?",
        answer: "Yes, when sharing a file, you can set an optional expiration date after which the shared link will no longer work."
      },
      {
        question: "Will the person I share with need a CryptoVault account?",
        answer: "Yes, recipients need a CryptoVault account to access shared files. If they don't have an account, they'll be prompted to create one when accessing the shared link."
      }
    ]
  },
  {
    category: "Troubleshooting",
    items: [
      {
        question: "Why can't I upload files?",
        answer: "Check your internet connection and make sure you haven't exceeded your storage limit. Also, ensure the file isn't too large (maximum file size is 2GB)."
      },
      {
        question: "Why is file encryption/decryption taking a long time?",
        answer: "Encryption and decryption happen on your device and depend on your device's processing power. Large files may take longer to process."
      },
      {
        question: "What should I do if I see an error message?",
        answer: "If you encounter an error, try refreshing the page first. If the problem persists, check our status page or contact support with the error details."
      },
      {
        question: "The application is running slowly. What can I do?",
        answer: "Try clearing your browser cache, using a different browser, or checking if your internet connection is stable."
      }
    ]
  },
  {
    category: "Mobile Access",
    items: [
      {
        question: "Can I access CryptoVault on my mobile device?",
        answer: "Yes, CryptoVault is fully responsive and can be accessed through your mobile device's web browser."
      },
      {
        question: "Is there a mobile app for CryptoVault?",
        answer: "Currently, CryptoVault is available as a web application. Mobile apps for iOS and Android are planned for future releases."
      }
    ]
  },
  {
    category: "Technical Support",
    items: [
      {
        question: "How do I contact support?",
        answer: "You can contact support by clicking on the \"Help\" section and selecting \"Contact Support,\" or by emailing support@cryptovault.example.com."
      },
      {
        question: "Is there a community forum for users?",
        answer: "Yes, you can join our community forum at community.cryptovault.example.com to connect with other users and share tips."
      },
      {
        question: "Where can I report bugs or suggest features?",
        answer: "You can report bugs or suggest features through the \"Feedback\" option in the Help section or by emailing feedback@cryptovault.example.com."
      }
    ]
  }
];

export default faqData;
