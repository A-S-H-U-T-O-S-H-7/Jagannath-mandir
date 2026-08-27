'use client';

import React from 'react';
import { format } from 'date-fns';

interface DonationReceiptProps {
  donation: any;
}

const DonationReceipt = ({ donation }: DonationReceiptProps) => {
  const orderId = donation?.id || "N/A";
  
  const name = donation?.donorDetails?.name ||
               donation?.donorName ||
               "N/A";
  
  const mobile = donation?.donorDetails?.mobile ||
                 donation?.mobile ||
                 "N/A";
  
  const amount = donation?.amount || donation?.donationAmount || "0";
  
  const pan = donation?.pan || "N/A";
  
  const address = donation?.donorDetails?.address ||
                  donation?.address ||
                  "N/A";

  let date = 'Unknown';
  try {
    if (donation.createdAt) {
      let dateObj = donation.createdAt;
      if (donation.createdAt.toDate && typeof donation.createdAt.toDate === 'function') {
        dateObj = donation.createdAt.toDate();
      } else if (donation.createdAt.seconds) {
        dateObj = new Date(donation.createdAt.seconds * 1000);
      }
      if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
        date = format(dateObj, 'MMM dd, yyyy \'at\' hh:mm a');
      }
    }
  } catch (error) {
    console.warn('Error formatting date:', error);
    date = 'Unknown';
  }

  const receiptNumber = orderId;
  const receiptDate = date;
  const donorName = name;
  const donorPhone = mobile;
  const donorPan = pan;
  const donorAddress = address;
  const donationAmount = amount;
  const paymentMode = donation?.paymentMode || "Online";

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white" id="donation-receipt">
      <div className="border-2 border-[#D4AF37] rounded-lg p-6 bg-white shadow-lg">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-green-600 font-bold text-xs sm:text-sm bg-green-50 px-3 py-1 rounded">
              Reg. No.: 345529
            </span>
            <h1 className="text-[#0B3C5D] font-bold text-xl sm:text-2xl tracking-wider">RECEIPT</h1>
            <span className="text-green-600 font-bold text-xs sm:text-sm bg-green-50 px-3 py-1 rounded">
              PAN No.: AAJTS7550E
            </span>
          </div>
        </div>

        {/* Organization Info */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#0B3C5D] flex items-center justify-center text-white text-3xl">
                🏛️
              </div>
            </div>
            
            <div className="flex-grow text-center sm:text-left">
              <h2 className="text-[#0B3C5D] font-bold text-lg sm:text-xl mb-2">Jagannath Mandir</h2>
              <div className="text-[#555555] text-xs sm:text-sm leading-relaxed">
                <p className="mb-1 font-semibold">
                  Donations are Income Tax exempted under section 80G of IT Act.
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 text-xs">
                  <span>331, Vardhman Tower, Preet Vihar, New Delhi-110092</span>
                  <span className="hidden sm:inline">|</span>
                  <span>info@jagannathmandir.org | www.jagannathmandir.org</span>
                </div>
                <div className="mt-1 text-xs">
                  <span className="font-medium">Bank:</span> Jagannath Mandir Trust | 
                  <span className="font-medium"> A/c:</span> 083101002804 | 
                  <span className="font-medium"> IFSC:</span> ICIC0000831
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-lg border border-[#D4AF37]/30 flex items-center justify-center bg-[#F5F0EA]">
                <span className="text-4xl">🙏</span>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="space-y-0">
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="text-gray-800 p-3 border border-gray-300 bg-gray-50">
              <span className="font-bold text-sm">Receipt No:</span> 
              <span className="text-sm ml-2">{receiptNumber}</span>
            </div>
            <div className="text-gray-800 p-3 border border-gray-300 bg-gray-50 sm:text-right">
              <span className="font-bold text-sm">Date:</span> 
              <span className="text-sm ml-2">{receiptDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="p-3 text-gray-800 border border-gray-300 bg-gray-50">
              <span className="font-bold text-sm">Donor Name:</span> 
              <span className="text-sm ml-2">{donorName}</span>
            </div>
            <div className="p-3 text-gray-800 border border-gray-300 bg-gray-50">
              <span className="font-bold text-sm">Phone:</span> 
              <span className="text-sm ml-2">{donorPhone}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="p-3 border text-gray-800 border-gray-300 bg-gray-50">
              <span className="font-bold text-sm">PAN:</span> 
              <span className="text-sm ml-2">{donorPan}</span>
            </div>
            <div className="p-3 text-gray-800 border border-gray-300 bg-gray-50">
              <span className="font-bold text-sm">Address:</span> 
              <span className="text-sm ml-2">{donorAddress}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="text-gray-800 p-3 border border-gray-300 bg-gray-50">
              <span className="font-bold text-sm">Amount:</span> 
              <span className="font-semibold text-sm ml-2 text-[#D4AF37]">₹{donationAmount}/-</span>
            </div>
            <div className="text-gray-800 p-3 border border-gray-300 bg-gray-50">
              <span className="font-bold text-sm">Payment Mode:</span> 
              <span className="text-emerald-500 font-semibold text-sm ml-2">{paymentMode}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-end gap-2">
          <p className="text-xs text-gray-600 order-2 sm:order-1">
            * Receipt is valid subject to realization of payment
          </p>
          
          <div className="text-center sm:text-right order-1 sm:order-2">
            <p className="font-bold text-gray-800 text-sm mb-2">For Jagannath Mandir Trust</p>
            <div className="border-t border-gray-400 pt-1 min-w-32">
              <p className="font-bold text-xs text-gray-700">Authorised Signatory</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-[#0B3C5D] font-semibold">🙏 May Lord Jagannath bless you!</p>
        </div>
      </div>
    </div>
  );
};

export default DonationReceipt;