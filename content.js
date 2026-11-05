/* ==========================================================================
   YOUR SITE'S CONTENT. Edit this file to change your info, links, pictures,
   and resume. It belongs to the website (the lab never overwrites it), so you
   can edit it right on GitHub: open the file, click the pencil, change the
   text between the quotes, and commit.

   Rules of thumb:
   - Keep the quotes and the commas at the ends of lines.
   - To add a bullet, copy a line like 'Did a thing.', and paste it below.
   - To add a job, copy a whole { ... }, block in "experience" and edit it.
   ========================================================================== */

window.SITE = {

  /* ---------- You ---------- */
  profile: {
    name: 'Sneha Sundar',
    // Middle dots (·) between the roles, not periods.
    role: 'designer · researcher · builder',
    email: 'sneha.sundar.designs@gmail.com',
    linkedin: 'https://www.linkedin.com/in/sneha-sundararajan/',
    medium: 'https://medium.com/@sneha_s',
  },

  /* ---------- Pictures (files in the images/ folder) ----------
     Large photos load slowly: keep these under about 1 MB. The web/ copies
     are resized versions of your originals. */
  images: {
    octopus: 'images/web/octopus.png',
    portrait: 'images/web/profilepic.png',
    // The three Philosophy panels on the Work page, in order:
    // Ask the right questions, Find the right users, Track the right metrics.
    philosophy: [
      'images/philosophy1.png',
      'images/philosophy2.png',
      'images/philosophy3.png',
    ],
  },

  /* ---------- Resume (the resume sticker opens it) ---------- */
  resume: {
    // Link to your resume PDF (a file in this folder like 'resume.pdf', or a full https:// link).
    // Leave it empty ('') and the Download button saves this page as a PDF instead.
    pdf: '',

    experience: [
      {
        title: 'Product Designer, Palo Alto Networks',
        dates: '2026 – Current',
        bullets: [
          'Integrating certificate lifecycle management into firewall management services, driving $500M+ revenue potential through bundled adoption.',
          'Leading product migration of Next-Generation Trust Protection, enabling enterprise scale and $340M upsell opportunity.',
        ],
      },
      {
        title: 'Product Designer, Venafi/CyberArk',
        dates: '2023 – 2026',
        bullets: [
          'Set design direction for a workload identity platform (SPIFFE), scaling secure management to 100M+ workloads.',
          'Derived a persona-led, data-informed decision making framework that sharpened roadmap focus and accelerated delivery of high-impact initiatives.',
          'Led design of Notification System, achieving 92% adoption.',
          'Defined a shared error-handling model across platform services, reducing time to value by 62%.',
          'Led accessibility standards across a 500+ person organization.',
        ],
      },
      {
        title: 'Product Designer, Misc',
        dates: '2022 – 2023',
        bullets: [
          'Worked on various opportunities across areas like medical devices, educational technology, non-profit fundraising, etc.',
        ],
      },
    ],

    education: [
      { school: 'IIT Roorkee', detail: 'Electronics and Communication Engineering' },
    ],

    recommendations: [
      {
        quote: 'Sneha has an excellent approach to user research and understanding the problem, as well as a strong eye for designing new solutions. In the short time with us at DonorSee, she was able to make a big contribution and her designs have played a key role in improving our performance.',
        by: 'Cian Condon, DonorSee',
      },
    ],

    certifications: [
      'IDEO Prototyping with AI · 2026',
      'Google UX Design Specialization · 2023',
      'Google Project Management Specialization · 2023',
    ],
  },
};
