export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

const CONTACT_EMAIL = 'ernieblazze@gmail.com';

export const PRIVACY_POLICY: LegalDoc = {
  title: 'Privacy Policy',
  lastUpdated: 'June 2026',
  sections: [
    {
      heading: '1. Overview',
      body: [
        'RSU Post-UTME Practice ("we", "us") is a practice platform for the Rivers State University Post-UTME screening exam. This policy explains what information we collect, how we use it, and who we share it with.',
      ],
    },
    {
      heading: '2. Information We Collect',
      body: [
        'Account information: your email address and password, handled by our authentication provider, Supabase. We never see or store your raw password.',
        'Payment information: when you upgrade to paid access, payment is processed entirely by Paystack. We never see or store your card details — we only receive confirmation that a payment succeeded.',
        'Quiz progress: your answers, scores, and attempt history are stored locally in your own browser (local storage), not on our servers, unless a feature explicitly says otherwise.',
        'Usage analytics: we use Vercel Analytics and Microsoft Clarity to understand how visitors use the site (e.g. which pages are visited, anonymized session recordings). These tools do not identify you personally.',
      ],
    },
    {
      heading: '3. How We Use Your Information',
      body: [
        'To create and manage your account.',
        'To grant and track your access to paid content (free trial status, subscription expiry).',
        'To detect and prevent abuse of the platform.',
        'To improve the platform based on how it is actually used.',
      ],
    },
    {
      heading: '4. Third-Party Services',
      body: [
        'We rely on a small number of trusted providers to run this platform: Supabase (account authentication and database), Paystack (payment processing), Vercel (hosting and analytics), and Microsoft Clarity (anonymized usage analytics). Each provider processes data under their own privacy policy.',
      ],
    },
    {
      heading: '5. Data Retention',
      body: [
        'We keep your account information for as long as your account is active. You can request deletion of your account and associated data at any time by contacting us.',
      ],
    },
    {
      heading: '6. Your Rights',
      body: [
        'You can request access to, correction of, or deletion of your personal data at any time by emailing us at the address below.',
      ],
    },
    {
      heading: '7. Cookies & Local Storage',
      body: [
        'We use your browser’s local storage to save quiz progress and preferences (like dark mode). This data stays on your device and is not transmitted to us unless explicitly required by a feature.',
      ],
    },
    {
      heading: '8. Changes to This Policy',
      body: [
        'We may update this policy from time to time. Continued use of the platform after a change means you accept the updated policy.',
      ],
    },
    {
      heading: '9. Contact Us',
      body: [`Questions about this policy? Email us at ${CONTACT_EMAIL}.`],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDoc = {
  title: 'Terms of Service',
  lastUpdated: 'June 2026',
  sections: [
    {
      heading: '1. Acceptance of Terms',
      body: [
        'By using RSU Post-UTME Practice, you agree to these terms. If you do not agree, please do not use the platform.',
      ],
    },
    {
      heading: '2. Description of Service',
      body: [
        'This platform provides timed practice tests using past Post-UTME questions for Rivers State University, for exam preparation purposes only. This website is not officially affiliated with, endorsed by, or operated by Rivers State University.',
      ],
    },
    {
      heading: '3. Accounts',
      body: [
        'You must provide an accurate email address to create an account. You are responsible for keeping your password secure and for all activity under your account. Accounts are for individual use and should not be shared.',
      ],
    },
    {
      heading: '4. Free Trial & Paid Access',
      body: [
        'New accounts receive one free full practice test. After that, continued access requires a paid subscription at the price shown on the Upgrade page, currently ₦2,000 per year. Paid access is valid for one year from the date of payment and must be renewed afterward.',
      ],
    },
    {
      heading: '5. Payments & Refunds',
      body: [
        'Payments are processed securely through Paystack. [Owner note: refund policy to be finalized — currently, payments are treated as non-refundable once access has been granted, except where required by applicable law.]',
      ],
    },
    {
      heading: '6. Acceptable Use',
      body: [
        'You agree not to share your account with others, not to copy, scrape, or redistribute question content, and not to attempt to bypass any security or payment controls on the platform.',
      ],
    },
    {
      heading: '7. Disclaimer',
      body: [
        'Practice questions are compiled from past examination papers for revision purposes only. We do not guarantee admission, a specific score, or any particular exam outcome. While we take reasonable care, questions, answers, or explanations may occasionally contain errors.',
      ],
    },
    {
      heading: '8. Limitation of Liability',
      body: [
        'The platform is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.',
      ],
    },
    {
      heading: '9. Changes to These Terms',
      body: [
        'We may update these terms from time to time. Continued use of the platform after a change means you accept the updated terms.',
      ],
    },
    {
      heading: '10. Governing Law',
      body: ['These terms are governed by the laws of the Federal Republic of Nigeria.'],
    },
    {
      heading: '11. Contact Us',
      body: [`Questions about these terms? Email us at ${CONTACT_EMAIL}.`],
    },
  ],
};
