import { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, PhoneCall, ChevronDown, ChevronUp } from 'lucide-react';

const SupportCenter = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How is the Placement Readiness Score calculated?',
      a: 'Your score is a weighted average of your technical assessments (40%), verbal grammar evaluations (30%), aptitude scores (20%), and resume analysis scores (10%).'
    },
    {
      q: 'Can I retake assessments if I score low?',
      a: 'Yes! Most assessments can be retaken after a cooldown period of 24 hours. The dashboard will show your highest score.'
    },
    {
      q: 'Is my video recorded during Speech Analyzer sessions?',
      a: 'No, the Speech Analyzer only records and analyzes audio frequencies, volume fluctuations, and pacing to give you communication metrics. We do not store or transmit raw files.'
    },
    {
      q: 'How long does the Resume Analyzer take?',
      a: 'The analyzer uses an instant parser that scans your resume keywords and layouts, delivering detailed recommendations in less than 5 seconds.'
    }
  ];

  return (
    <div className="p-8 pb-12 max-w-6xl">
      <header className="mb-8">
        <div className="text-sm text-gray-400 font-medium mb-2">Main Menu / <span className="text-gray-900">Support Center</span></div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Help & Support</h1>
        <p className="text-gray-500 mt-2">Find answers to common questions or reach out to our team for assistance.</p>
      </header>

      {/* Grid of contact cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
          <p className="text-sm text-gray-500 mb-4">Drop us a line anytime</p>
          <a href="mailto:support@interviewiq.ai" className="text-sm font-semibold text-purple-600 hover:underline">support@interviewiq.ai</a>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Live Chat</h3>
          <p className="text-sm text-gray-500 mb-4">Available 9 AM - 6 PM EST</p>
          <button className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition-colors">Start Chat</button>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Phone Helpline</h3>
          <p className="text-sm text-gray-500 mb-4">Urgent placement queries</p>
          <span className="text-sm font-semibold text-gray-900">+1 (800) 555-0199</span>
        </div>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-gray-400" /> Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex justify-between items-center font-semibold text-gray-900 hover:bg-gray-50 transition-colors text-left"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
