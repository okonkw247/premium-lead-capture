'use client';

import React, { useState } from 'react';

const Q3_OPTIONS = [
  'Student',
  'Working full-time',
  'Working part-time / freelancing',
  'Currently unemployed',
];

const Q4_OPTIONS = [
  'Money is tight right now',
  "Not sure it's actually for me",
  'Wanted to see more proof it works first',
  "Just haven't gotten around to it",
];

const Q5_OPTIONS = [
  'This week',
  'This month',
  'A few months back',
  "Honestly can't remember",
];

export default function SurveyPage() {
  // Steps: 0 = Intro, 1 = Q1 (Contact), 2 = Q2 (Country), 3 = Q3 (Status), 4 = Q4 (Reason), 5 = Q5 (Recency), 6 = Q6 (Open), 7 = Final
  const [step, setStep] = useState<number>(0);

  // Form State
  const [name, setName] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [spendRecency, setSpendRecency] = useState<string>('');
  const [openResponse, setOpenResponse] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const TOTAL_QUESTIONS = 6;

  // Handlers
  const handleStart = () => {
    setErrorMsg('');
    setStep(1);
  };

  const handleNextQ1 = () => {
    if (!name.trim() || !whatsapp.trim()) {
      setErrorMsg('Please enter your name and WhatsApp number to continue.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleNextQ2 = () => {
    if (!country.trim()) {
      setErrorMsg('Please enter your country to continue.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleSelectQ3 = (val: string) => {
    setStatus(val);
    setErrorMsg('');
    setStep(4);
  };

  const handleSelectQ4 = (val: string) => {
    setReason(val);
    setErrorMsg('');
    setStep(5);
  };

  const handleSelectQ5 = (val: string) => {
    setSpendRecency(val);
    setErrorMsg('');
    setStep(6);
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !whatsapp.trim() || !country.trim() || !status || !reason || !spendRecency || !openResponse.trim()) {
      setErrorMsg('Please answer all required questions before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          country: country.trim(),
          status,
          reason,
          spend_recency: spendRecency,
          open_response: openResponse.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to submit response.');
      }

      setStep(7);
    } catch (err: any) {
      console.error('Survey submission error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F5F3EF] flex flex-col justify-between items-center px-4 py-8 md:py-12 selection:bg-[#D4AF37]/20">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

      {/* Progress Header */}
      <header className="w-full max-w-lg mx-auto z-10 flex flex-col items-center mb-2">
        {step >= 1 && step <= TOTAL_QUESTIONS ? (
          <div className="w-full space-y-2.5 animate-slide-fade">
            <div className="flex justify-between items-center text-xs tracking-wider uppercase font-semibold text-[#9E9B95]">
              <span>Question {step} of {TOTAL_QUESTIONS}</span>
              <span className="text-[#D4AF37] font-bold bg-[#1C1A17] border border-[#2A2824] px-2.5 py-0.5 rounded-full shadow-sm tracking-normal">
                {step === TOTAL_QUESTIONS ? '✓ Complete' : `${Math.round((step / TOTAL_QUESTIONS) * 100)}%`}
              </span>
            </div>
            <div className="w-full bg-[#1C1A17] h-1.5 rounded-full overflow-hidden border border-[#2A2824]">
              <div
                className="bg-[#D4AF37] h-full transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                style={{ width: `${(step / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="h-6" />
        )}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-lg mx-auto my-auto py-6 z-10">
        {/* INTRO SCREEN (Step 0) */}
        {step === 0 && (
          <div className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
                Comeback: Unrecognizable
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F3EF]">
                Real talk —
              </h1>
            </div>
            <p className="text-[#9E9B95] text-base sm:text-lg leading-relaxed font-normal">
              if you saw Comeback: Unrecognizable and didn&apos;t join, I want to know why. No judgment, no pitch after this. Just trying to understand where you actually are. Takes 2 minutes.
            </p>
            <button
              onClick={handleStart}
              type="button"
              className="w-full py-4 px-6 bg-[#D4AF37] hover:bg-[#E3C165] active:scale-[0.99] text-[#0B0A09] font-bold rounded-xl transition-all duration-200 text-lg shadow-[0_4px_16px_rgba(212,175,55,0.25)] flex items-center justify-center space-x-2"
            >
              <span>Start</span>
              <svg className="w-5 h-5 text-[#0B0A09]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}

        {/* QUESTION 1 — CONTACT (Step 1) */}
        {step === 1 && (
          <div className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] leading-snug">
                What&apos;s your name and WhatsApp number?
              </h2>
              <p className="text-[#9E9B95] text-sm">(so I can actually follow up, not just collect data)</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9E9B95]">Name <span className="text-[#D4AF37]">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrorMsg(''); }}
                  placeholder="Your full name"
                  className="w-full p-4 rounded-xl bg-[#1C1A17] border border-[#2A2824] text-[#F5F3EF] placeholder-[#9E9B95]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9E9B95]">WhatsApp Number <span className="text-[#D4AF37]">*</span></label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => { setWhatsapp(e.target.value); setErrorMsg(''); }}
                  placeholder="+234 800 000 0000"
                  className="w-full p-4 rounded-xl bg-[#1C1A17] border border-[#2A2824] text-[#F5F3EF] placeholder-[#9E9B95]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-base"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#9E9B95]">Email <span className="text-[#9E9B95]/60 normal-case font-normal">(optional)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-4 rounded-xl bg-[#1C1A17] border border-[#2A2824] text-[#F5F3EF] placeholder-[#9E9B95]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-base"
                />
              </div>
            </div>

            {errorMsg && <p className="text-red-400 text-sm font-medium animate-pulse">{errorMsg}</p>}

            <button
              type="button"
              onClick={handleNextQ1}
              className="w-full py-4 px-6 bg-[#D4AF37] hover:bg-[#E3C165] active:scale-[0.99] text-[#0B0A09] font-bold rounded-xl transition-all duration-200 text-lg shadow-[0_4px_16px_rgba(212,175,55,0.25)]"
            >
              Next →
            </button>
          </div>
        )}

        {/* QUESTION 2 — COUNTRY (Step 2) */}
        {step === 2 && (
          <div className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] leading-snug">
              Where are you from?
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#9E9B95]">Country <span className="text-[#D4AF37]">*</span></label>
              <input
                type="text"
                value={country}
                onChange={(e) => { setCountry(e.target.value); setErrorMsg(''); }}
                placeholder="e.g. Nigeria, Ghana, UK..."
                className="w-full p-4 rounded-xl bg-[#1C1A17] border border-[#2A2824] text-[#F5F3EF] placeholder-[#9E9B95]/50 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-base"
              />
            </div>

            {errorMsg && <p className="text-red-400 text-sm font-medium animate-pulse">{errorMsg}</p>}

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleNextQ2}
                className="w-full py-4 px-6 bg-[#D4AF37] hover:bg-[#E3C165] active:scale-[0.99] text-[#0B0A09] font-bold rounded-xl transition-all duration-200 text-lg shadow-[0_4px_16px_rgba(212,175,55,0.25)]"
              >
                Next →
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-semibold uppercase tracking-wider text-[#9E9B95] hover:text-[#F5F3EF] transition-colors flex items-center space-x-1 pt-1"
              >
                <span>← Back</span>
              </button>
            </div>
          </div>
        )}

        {/* QUESTION 3 — STATUS (Step 3) */}
        {step === 3 && (
          <div className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] leading-snug">
              Where are you right now?
            </h2>
            <div className="space-y-3">
              {Q3_OPTIONS.map((opt) => {
                const isSelected = status === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectQ3(opt)}
                    className={`w-full text-left p-4 rounded-xl border text-base font-medium transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#F5F3EF] shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                        : 'bg-[#1C1A17] border-[#2A2824] text-[#F5F3EF] hover:border-[#D4AF37]/60 hover:bg-[#1C1A17]/80'
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37]'
                          : 'border-[#2A2824] group-hover:border-[#D4AF37]/60'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#0B0A09]" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-semibold uppercase tracking-wider text-[#9E9B95] hover:text-[#F5F3EF] transition-colors flex items-center space-x-1 pt-2"
            >
              <span>← Back</span>
            </button>
          </div>
        )}

        {/* QUESTION 4 — REASON (Step 4) */}
        {step === 4 && (
          <div className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] leading-snug">
              Real reason you haven&apos;t joined yet — no sugarcoating
            </h2>
            <div className="space-y-3">
              {Q4_OPTIONS.map((opt) => {
                const isSelected = reason === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectQ4(opt)}
                    className={`w-full text-left p-4 rounded-xl border text-base font-medium transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#F5F3EF] shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                        : 'bg-[#1C1A17] border-[#2A2824] text-[#F5F3EF] hover:border-[#D4AF37]/60 hover:bg-[#1C1A17]/80'
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37]'
                          : 'border-[#2A2824] group-hover:border-[#D4AF37]/60'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#0B0A09]" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-semibold uppercase tracking-wider text-[#9E9B95] hover:text-[#F5F3EF] transition-colors flex items-center space-x-1 pt-2"
            >
              <span>← Back</span>
            </button>
          </div>
        )}

        {/* QUESTION 5 — RECENCY (Step 5) */}
        {step === 5 && (
          <div className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] leading-snug">
              Last thing you spent $17+ on for yourself (not bills)
            </h2>
            <div className="space-y-3">
              {Q5_OPTIONS.map((opt) => {
                const isSelected = spendRecency === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectQ5(opt)}
                    className={`w-full text-left p-4 rounded-xl border text-base font-medium transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#F5F3EF] shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                        : 'bg-[#1C1A17] border-[#2A2824] text-[#F5F3EF] hover:border-[#D4AF37]/60 hover:bg-[#1C1A17]/80'
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37]'
                          : 'border-[#2A2824] group-hover:border-[#D4AF37]/60'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#0B0A09]" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-semibold uppercase tracking-wider text-[#9E9B95] hover:text-[#F5F3EF] transition-colors flex items-center space-x-1 pt-2"
            >
              <span>← Back</span>
            </button>
          </div>
        )}

        {/* QUESTION 6 — OPEN (Step 6) */}
        {step === 6 && (
          <form
            onSubmit={handleSubmit}
            className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6"
          >
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] leading-snug">
                What would actually need to be true for you to say yes right now?
              </h2>
              <p className="text-[#9E9B95] text-sm">Be real with me.</p>
            </div>

            <textarea
              required
              rows={4}
              value={openResponse}
              onChange={(e) => {
                setOpenResponse(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Tell me honestly..."
              className="w-full p-4 rounded-xl bg-[#1C1A17] border border-[#2A2824] text-[#F5F3EF] placeholder-[#9E9B95]/60 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none text-base"
            />

            {errorMsg && (
              <p className="text-red-400 text-sm font-medium animate-pulse">
                {errorMsg}
              </p>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !openResponse.trim()}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-200 text-lg flex items-center justify-center space-x-2 ${
                  openResponse.trim() && !isSubmitting
                    ? 'bg-[#D4AF37] hover:bg-[#E3C165] active:scale-[0.99] text-[#0B0A09] shadow-[0_4px_16px_rgba(212,175,55,0.25)]'
                    : 'bg-[#2A2824] text-[#9E9B95] cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-[#0B0A09]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <span>Submit Response</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="text-xs font-semibold uppercase tracking-wider text-[#9E9B95] hover:text-[#F5F3EF] transition-colors flex items-center space-x-1 pt-1"
              >
                <span>← Back</span>
              </button>
            </div>
          </form>
        )}

        {/* FINAL SCREEN (Step 7 - Thank You) */}
        {step === 7 && (
          <div className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <svg
                className="w-6 h-6 text-[#D4AF37]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F3EF]">
                Appreciate you being real with me.
              </h1>
              <p className="text-[#9E9B95] text-base leading-relaxed font-normal max-w-md mx-auto">
                I read every one of these myself. If what you shared means I need to build a payment plan or a smaller version of this — I will. Talk soon.
              </p>
            </div>

            <div className="pt-2 border-t border-[#2A2824]/60">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                Comeback: Unrecognizable
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg mx-auto z-10 text-center py-4">
        <p className="text-xs text-[#9E9B95]/60 tracking-wider">
          Adams X Project © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
