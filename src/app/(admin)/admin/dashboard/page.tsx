// app/admin/dashboard/page.tsx
'use client';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-[#0B3C5D]">
        Admin <span className="text-[#D4AF37]">Dashboard</span>
      </h1>
      <p className="text-[#555555] mt-1">Welcome to the admin panel. Manage your temple from here.</p>
      
      {/* Dashboard content will be added later */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E3DD]/50">
          <p className="text-sm text-[#555555]">Total Events</p>
          <p className="text-2xl font-bold text-[#0B3C5D]">0</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E3DD]/50">
          <p className="text-sm text-[#555555]">Gallery Images</p>
          <p className="text-2xl font-bold text-[#0B3C5D]">0</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E3DD]/50">
          <p className="text-sm text-[#555555]">Submissions</p>
          <p className="text-2xl font-bold text-[#0B3C5D]">0</p>
        </div>
      </div>
    </div>
  );
}