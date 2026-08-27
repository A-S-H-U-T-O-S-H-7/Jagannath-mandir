"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  XCircle, AlertTriangle, RefreshCw, Home, 
  Mail, Phone, ArrowRight, Clock
} from "lucide-react";
import Link from "next/link";

function LoadingDonationFailed() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-[#F9F8F4] to-red-100 flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-[#0B3C5D]">Loading...</h3>
      </div>
    </div>
  );
}

function DonationFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadFailureDetails = async () => {
      const order_id = searchParams.get('order_id');
      const message = searchParams.get('message') || 'Payment failed. Please try again.';
      const failure_message = searchParams.get('failure_message') || message;
      const amount = searchParams.get('amount');
      const status_message = searchParams.get('status_message') || 'Failed';

      if (order_id) {
        try {
          const response = await fetch(`/api/donations/${encodeURIComponent(order_id)}`);
          const result = await response.json();

          if (!cancelled && response.ok && result.success && result.data) {
            setErrorInfo({
              order_id,
              message:
                result.data.failureMessage ||
                failure_message ||
                message,
              failure_message:
                result.data.failureMessage ||
                failure_message ||
                message,
              amount: result.data.amount || (amount ? parseInt(amount) : 0),
              status_message: result.data.status || status_message,
            });
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading failed donation details:', error);
        }
      }

      if (!cancelled) {
        setErrorInfo({
          order_id: order_id || 'Unknown',
          message,
          failure_message,
          amount: amount ? parseInt(amount) : 0,
          status_message,
        });
        setIsLoading(false);
      }
    };

    loadFailureDetails();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleTryAgain = () => router.push('/donate');
  const handleGoHome = () => router.push("/");

  if (isLoading || !errorInfo) {
    return <LoadingDonationFailed />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-[#F9F8F4] to-red-100 py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto shadow-2xl shadow-red-500/30"
          >
            <XCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-3xl md:text-4xl font-serif font-bold text-red-700 text-center"
          >
            Payment Failed
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-2 text-base md:text-lg text-[#555555] text-center max-w-lg mx-auto"
          >
            Unfortunately, your donation could not be processed.
            <br />
            <span className="text-sm">No amount has been charged to your account.</span>
          </motion.p>

          {/* Error Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-red-200 p-6 md:p-8 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Error Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#555555]">Order ID:</span>
                <span className="font-mono text-xs text-[#0B3C5D]">{errorInfo.order_id}</span>
              </div>
              {errorInfo.amount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#555555]">Amount:</span>
                  <span className="font-semibold text-red-700">₹{errorInfo.amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#555555]">Status:</span>
                <span className="font-medium text-red-600">{errorInfo.status_message}</span>
              </div>
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{errorInfo.failure_message || errorInfo.message}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[#555555]" />
                <span className="text-[#555555] text-xs">Attempted: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* Common Reasons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 border border-amber-200/50"
          >
            <h4 className="text-sm font-semibold text-amber-800 mb-3">Common Reasons for Payment Failure:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-700/80">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Insufficient balance in your account
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Daily/monthly transaction limit exceeded
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Incorrect OTP or transaction PIN
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Card expired or blocked
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Network connectivity issues
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Transaction session timeout
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center"
          >
            <button
              onClick={handleTryAgain}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0B3C5D] via-[#1A4A6A] to-[#D4AF37] text-white font-medium hover:shadow-xl shadow-lg shadow-[#0B3C5D]/20 hover:shadow-[#0B3C5D]/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base hover:scale-[1.02]"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="px-6 py-3 rounded-xl bg-white/80 border border-[#D4AF37]/30 text-[#0B3C5D] font-medium hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base hover:shadow-lg"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </button>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center text-xs text-[#555555]"
          >
            <p>Need help? Contact us at <a href="mailto:info@jagannathmandir.org" className="text-[#D4AF37] hover:underline">info@jagannathmandir.org</a></p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function DonationFailedPage() {
  return (
    <Suspense fallback={<LoadingDonationFailed />}>
      <DonationFailedContent />
    </Suspense>
  );
}