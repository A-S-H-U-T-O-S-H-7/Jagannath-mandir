"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CheckCircle, Home, User, Mail, 
  Download, ArrowRight, Clock, Shield,
  Calendar, IndianRupee, FileText,
  Heart, Sparkles
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

// Loading component
function LoadingDonationSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8] flex items-center justify-center px-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center max-w-md w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D4AF37] border-t-transparent mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-[#0B3C5D]">Loading donation details...</h3>
      </div>
    </div>
  );
}

function DonationSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [donationData, setDonationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let cancelled = false;

    const loadDonation = async () => {
      const orderId = searchParams.get('order_id');

      if (!orderId) {
        router.replace('/donate/failed?message=Missing donation reference');
        return;
      }

      try {
        const response = await fetch(`/api/donations/${encodeURIComponent(orderId)}`);
        const result = await response.json();

        if (cancelled) return;

        if (!response.ok || !result.success || !result.data) {
          router.replace(
            `/donate/failed?order_id=${encodeURIComponent(orderId)}&message=${encodeURIComponent(result.error || 'Donation not found')}`
          );
          return;
        }

        if (result.data.status !== 'completed') {
          router.replace(
            `/donate/failed?order_id=${encodeURIComponent(orderId)}&message=${encodeURIComponent('Payment was not completed')}&status_message=${encodeURIComponent(result.data.status)}`
          );
          return;
        }

        setDonationData({
          id: result.data.id,
          amount: result.data.amount,
          donorName: result.data.donorName,
          email: result.data.email,
          transactionId: result.data.transactionId,
          date: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          status: result.data.status,
        });
      } catch (error) {
        console.error('Error loading donation:', error);
        if (!cancelled) {
          router.replace(
            `/donate/failed?order_id=${encodeURIComponent(orderId)}&message=${encodeURIComponent('Unable to verify donation')}`
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDonation();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  useEffect(() => {
    if (!isLoading && countdown === 0) {
      router.push('/');
    }
  }, [countdown, isLoading, router]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLoading]);

  const handleDownloadReceipt = async () => {
    if (!donationData) return;
    
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      
      // Create receipt element
      const receiptElement = document.createElement('div');
      receiptElement.innerHTML = `
        <div style="font-family: 'Georgia', serif; padding: 40px; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; border: 2px solid #D4AF37;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0B3C5D; font-size: 28px; margin: 0;">🏛️ Jagannath Mandir</h1>
            <p style="color: #555555; font-size: 14px; margin-top: 5px;">Serving devotees with devotion</p>
            <p style="color: #D4AF37; font-size: 12px; margin-top: 2px;">Reg. No: 345529 | PAN: AAJTS7550E</p>
          </div>
          <hr style="border: 1px solid #D4AF37; margin: 15px 0;">
          <h2 style="color: #0B3C5D; text-align: center; font-size: 18px; margin-bottom: 20px;">Donation Receipt</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px; background: #F5F0EA; padding: 15px; border-radius: 8px;">
            <div><strong style="color: #0B3C5D;">Donation ID:</strong></div>
            <div style="color: #555555;">${donationData.id}</div>
            <div><strong style="color: #0B3C5D;">Amount:</strong></div>
            <div style="color: #D4AF37; font-weight: bold;">₹${donationData.amount.toLocaleString()}</div>
            <div><strong style="color: #0B3C5D;">Donor:</strong></div>
            <div style="color: #555555;">${donationData.donorName}</div>
            <div><strong style="color: #0B3C5D;">Email:</strong></div>
            <div style="color: #555555;">${donationData.email}</div>
            <div><strong style="color: #0B3C5D;">Date:</strong></div>
            <div style="color: #555555;">${donationData.date}</div>
            <div><strong style="color: #0B3C5D;">Transaction ID:</strong></div>
            <div style="color: #555555; font-size: 12px; word-break: break-all;">${donationData.transactionId}</div>
          </div>
          <hr style="border: 1px solid #D4AF37; margin: 15px 0;">
          <div style="text-align: center; color: #555555; font-size: 12px;">
            <p style="margin: 0;">This donation is eligible for <strong style="color: #0B3C5D;">80G Tax Exemption</strong> under section 80G of the IT Act, 1961.</p>
            <p style="margin: 10px 0 0 0; font-weight: bold; color: #0B3C5D; font-size: 16px;">🙏 May Lord Jagannath bless you!</p>
          </div>
          <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #999;">
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(receiptElement);
      
      const canvas = await html2canvas(receiptElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      document.body.removeChild(receiptElement);
      
      const imageData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`donation-receipt-${donationData.id}.pdf`);
      
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  if (isLoading || !donationData) {
    return <LoadingDonationSuccess />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0EA] via-[#F9F8F4] to-[#F0F4F8] py-8 md:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.3, 
              type: "spring", 
              stiffness: 200, 
              damping: 20 
            }}
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#0B3C5D] via-[#1A4A6A] to-[#D4AF37] flex items-center justify-center mx-auto shadow-2xl shadow-[#0B3C5D]/30"
          >
            <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/30"
            />
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 rounded-full border-4 border-[#0B3C5D]/20"
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-3xl md:text-4xl font-serif font-bold text-[#0B3C5D] text-center"
          >
            Thank You for Your Donation! 🙏
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-2 text-base md:text-lg text-[#555555] text-center max-w-lg mx-auto"
          >
            Your generosity helps maintain the temple and serve devotees.
          </motion.p>

          {/* Donation Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#D4AF37]/30 p-6 md:p-8 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#0B3C5D]">Donation Summary</h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                ✅ Confirmed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#555555]">Amount</span>
                  <span className="ml-auto font-bold text-[#0B3C5D] text-lg">₹{donationData.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#555555]">Donor</span>
                  <span className="ml-auto font-medium text-[#0B3C5D]">{donationData.donorName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#555555]">Email</span>
                  <span className="ml-auto font-medium text-[#0B3C5D]">{donationData.email}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#555555]">Date</span>
                  <span className="ml-auto font-medium text-[#0B3C5D]">{donationData.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#555555]">Transaction ID</span>
                  <span className="ml-auto font-mono text-xs text-[#0B3C5D]">{donationData.transactionId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-[#555555]">Status</span>
                  <span className="ml-auto font-medium text-green-600">✓ Completed</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#D4AF37]/20">
              <p className="text-xs text-[#555555] flex items-center justify-center gap-1.5">
                <span className="text-[#D4AF37]">📋</span>
                This donation is eligible for <span className="font-semibold text-[#0B3C5D]">80G Tax Exemption</span>
              </p>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-[#0B3C5D]/5 to-[#D4AF37]/10 border border-[#D4AF37]/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0B3C5D]">What happens next?</p>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[#555555]">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#D4AF37]" />
                    <span>You will receive a confirmation email within 10 minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#555555]">
                    <Shield className="w-3.5 h-3.5 flex-shrink-0 text-[#D4AF37]" />
                    <span>Tax exemption certificate will be emailed within 7 business days</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#555555]">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#D4AF37]" />
                    <span>Your contribution supports temple maintenance and community services</span>
                  </div>
                </div>
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
              onClick={handleDownloadReceipt}
              className="px-6 py-3 rounded-xl bg-white/80 border border-[#D4AF37]/30 text-[#0B3C5D] font-medium hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base hover:shadow-lg"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              Download Receipt
            </button>
            
            <Link href="/">
              <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#0B3C5D] via-[#1A4A6A] to-[#D4AF37] text-white font-medium hover:shadow-xl shadow-lg shadow-[#0B3C5D]/20 hover:shadow-[#0B3C5D]/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base hover:scale-[1.02]">
                <Home className="w-4 h-4" />
                Go to Home
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>

          {/* Auto Redirect */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 text-xs text-[#555555]/50 flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3 h-3" />
            Redirecting to home in {countdown}s...
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
            />
          </motion.p>

          {/* Floating Blessings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0 }}
              animate={{ 
                y: [-20, -60, -100],
                opacity: [0, 1, 0],
                x: [i * 20 - 20, i * 30 - 30, i * 20 - 20]
              }}
              transition={{ 
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
              className="absolute pointer-events-none"
              style={{ 
                left: `${30 + i * 20}%`,
                top: `${20 + i * 10}%`
              }}
            >
              <span className="text-2xl">🙏</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={<LoadingDonationSuccess />}>
      <DonationSuccessContent />
    </Suspense>
  );
}