import AboutTemple from '@/components/web/home/AboutTemple'
import DailyDarshan from '@/components/web/home/DailyDarshan'
import DonationCTA from '@/components/web/home/DonationCTA'
import FAQ from '@/components/web/home/FAQ'
import GalleryPreview from '@/components/web/home/GalleryPreview'
import Hero from '@/components/web/home/Hero'
import QuickInfoBar from '@/components/web/home/QuickInfoBar'
import SevaRituals from '@/components/web/home/SevaRituals'
import Testimonials from '@/components/web/home/Testimonials'
import UpcomingFestivals from '@/components/web/home/UpcomingFestivals'
import React from 'react'

function page() {
  return (
    <div>
      <Hero/>
     <QuickInfoBar/>
     <AboutTemple/>
     <DailyDarshan/>
     <UpcomingFestivals/>
     <GalleryPreview/>
     {/* <SevaRituals/> */}
     <DonationCTA/>
     <Testimonials/>
     <FAQ/>
    </div>
  )
}

export default page
