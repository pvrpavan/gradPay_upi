import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How do I send money?',
    a: 'Open the app → Tap "Send Money" → Search by phone or UPI ID → Enter amount → Confirm & Send.',
  },
  {
    q: 'How do I check my balance?',
    a: 'Tap "Balance" on the dashboard. Your current balance will appear instantly.',
  },
  {
    q: 'How does the expense tracker work?',
    a: 'It categorizes your expenses and shows them in visual charts. You can add expenses manually and set budgets.',
  },
  {
    q: 'How to scan a QR code?',
    a: 'Use the "Scanner" tab in the bottom navigation. Grant camera access and scan any UPI-compatible QR code.',
  },
  {
    q: 'Can I add more bank accounts?',
    a: 'Yes, in your profile settings you can link, switch, or remove UPI-enabled bank accounts anytime.',
  },
  {
    q: 'Is Gradious Pay safe?',
    a: 'Yes! Your PIN/OTP are handled securely. We follow full UPI security guidelines and encrypt all sensitive data.',
  },
  {
    q: 'How do reward points work?',
    a: 'Earn points by making transactions, referring friends, and using the app regularly. Points can be redeemed for cashback.',
  },
  {
    q: 'What is Student Mode?',
    a: 'Student Mode provides a simplified interface with budgeting tools specifically designed for students to manage expenses better.',
  },
];

export default function FAQs() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 animate-fadeIn">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 bg-[#f65e1d] text-white rounded-t-lg shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="bg-transparent border-none cursor-pointer text-white">
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-lg font-semibold">FAQ</h2>
        </div>
        <HelpCircle size={22} />
      </header>

      {/* FAQ List */}
      <div className="px-4 pt-4 pb-8 space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
              activeIndex === i ? 'shadow-md' : ''
            }`}
          >
            <button
              onClick={() => setActiveIndex(activeIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-4 bg-transparent border-none cursor-pointer text-left"
            >
              <span className="text-sm font-medium text-gray-700 pr-2">{faq.q}</span>
              <ChevronDown
                size={18}
                className={`text-[#f65e1d] flex-shrink-0 transition-transform duration-300 ${
                  activeIndex === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`px-4 text-sm text-gray-500 leading-relaxed transition-all duration-300 overflow-hidden ${
                activeIndex === i ? 'max-h-40 pb-4' : 'max-h-0'
              }`}
            >
              {faq.a}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
