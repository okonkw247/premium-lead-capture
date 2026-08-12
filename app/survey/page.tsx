'use client';

import React, { useState } from 'react';

// Question options definition
const Q1_OPTIONS = [
  'Student',
  'Working full-time',
  'Working part-time / freelancing',
  'Currently unemployed',
];

const Q2_OPTIONS = [
  'Money is tight right now',
  "Not sure it's actually for me",
  'Wanted to see more proof it works first',
  "Just haven't gotten around to it",
];

const Q3_OPTIONS = [
  'Within the last week',
  'Within the last month',
  'A few months ago',
  "Can't remember the last time",
];

export default function SurveyPage() {
  // Steps: 0 = Intro, 1 = Q1, 2 = Q2, 3 = Q3, 4 = Q4, 5 = Thank You (Final Screen)
  const [step, setStep] = useState<number>(0);

  // Form State
  const [status, setStatus] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [spendRecency, setSpendRecency] = useState<string>('');
  const [openResponse, setOpenResponse] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Navigation handlers
  const handleStart = () => {
    setErrorMsg('');
    setStep(1);
  };

  const handleSelectQ1 = (val: string) => {
    setStatus(val);
    setErrorMsg('');
    setStep(2);
  };

  const handleSelectQ2 = (val: string) => {
    setReason(val);
    setErrorMsg('');
    setStep(3);
  };

  const handleSelectQ3 = (val: string) => {
    setSpendRecency(val);
    setErrorMsg('');
    setStep(4);
  };

  const handleBack = () => {
    setErrorMsg('');
    if (step > 0) setStep((prev) => prev - 1);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validation check: all 4 questions required
    if (!status) {
      setErrorMsg('Please answer Question 1.');
      setStep(1);
      return;
    }
    if (!reason) {
      setErrorMsg('Please answer Question 2.');
      setStep(2);
      return;
    }
    if (!spendRecency) {
      setErrorMsg('Please answer Question 3.');
      setStep(3);
      return;
    }
    if (!openResponse || !openResponse.trim()) {
      setErrorMsg('Please answer Question 4 before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

      // Success -> move to Final Screen
      setStep(5);
    } catch (err: any) {
      console.error('Survey submission error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#F5F3EF] flex flex-col justify-between items-center px-4 py-8 md:py-12 selection:bg-[#D4AF37]/20">
      {/* Background Subtle Gradient Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent" />

      {/* Top Header / Progress Area */}
      <header className="w-full max-w-lg mx-auto z-10 flex flex-col items-center mb-2">
        {step >= 1 && step <= 4 ? (
          <div className="w-full space-y-2.5 animate-slide-fade">
            <div className="flex justify-between items-center text-xs tracking-wider uppercase font-semibold text-[#9E9B95]">
              <span>Question {step} of 4</span>
              <span className="text-[#D4AF37] font-bold bg-[#1C1A17] border border-[#2A2824] px-2.5 py-0.5 rounded-full shadow-sm tracking-normal">
                {step * 25}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#1C1A17] h-1.5 rounded-full overflow-hidden border border-[#2A2824]">
              <div
                className="bg-[#D4AF37] h-full transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                style={{ width: `${step * 25}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="h-6" /> // spacer
        )}
      </header>

      {/* Main Content Area */}
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
              if you saw Comeback: Unrecognizable and didn&apos;t join, I want to know why. No judgment, no pitch after this. Just trying to understand where people actually are. Takes 2 minutes.
            </p>
            <button
              onClick={handleStart}
              type="button"
              className="w-full py-4 px-6 bg-[#D4AF37] hover:bg-[#E3C165] active:scale-[0.99] text-[#0B0A09] font-bold rounded-xl transition-all duration-200 text-lg shadow-[0_4px_16px_rgba(212,175,55,0.25)] flex items-center justify-center space-x-2"
            >
              <span>Start</span>
              <svg
                className="w-5 h-5 text-[#0B0A09]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}

        {/* QUESTION 1 (Step 1) */}
        {step === 1 && (
          <div className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] leading-snug">
              Where are you right now?
            </h2>
            <div className="space-y-3">
              {Q1_OPTIONS.map((opt) => {
                const isSelected = status === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectQ1(opt)}
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
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#0B0A09]" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* QUESTION 2 (Step 2) */}
        {step === 2 && (
          <div className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] leading-snug">
                What&apos;s the main reason you haven&apos;t joined?
              </h2>
            </div>
            <div className="space-y-3">
              {Q2_OPTIONS.map((opt) => {
                const isSelected = reason === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectQ2(opt)}
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
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#0B0A09]" />
                      )}
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

        {/* QUESTION 3 (Step 3) */}
        {step === 3 && (
          <div className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] leading-snug">
              What did you last spend $17 or more on for yourself (not bills)?
            </h2>
            <div className="space-y-3">
              {Q3_OPTIONS.map((opt) => {
                const isSelected = spendRecency === opt;
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
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#0B0A09]" />
                      )}
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

        {/* QUESTION 4 (Step 4) */}
        {step === 4 && (
          <form
            onSubmit={handleSubmit}
            className="bg-[#141311] border border-[#2A2824] rounded-2xl p-6 sm:p-8 shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] animate-slide-fade space-y-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F3EF] leading-snug">
              Be honest — what would actually need to be true for you to join right now?
            </h2>

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

        {/* FINAL SCREEN (Step 5 - Thank You) */}
        {step === 5 && (
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
                Thanks for being real with me.
              </h1>
              <p className="text-[#9E9B95] text-base leading-relaxed font-normal max-w-md mx-auto">
                I read every response myself — if what you share means there&apos;s something I should build (payment plan, different tier, more proof), I&apos;ll act on it. No spam after this.
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

      {/* Footer Branding */}
      <footer className="w-full max-w-lg mx-auto z-10 text-center py-4">
        <p className="text-xs text-[#9E9B95]/60 tracking-wider">
          Adams X Project © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
