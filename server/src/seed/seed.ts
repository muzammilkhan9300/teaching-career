import mongoose from 'mongoose'
import { connectDb } from '../db/connect.js'
import { School } from '../models/School.js'
import { Vacancy } from '../models/Vacancy.js'
import { Candidate } from '../models/Candidate.js'
import { BlogPost } from '../models/BlogPost.js'

const schoolsSeed = [
  {
    name: 'Beacon School',
    city: 'Lahore',
    area: 'Gulberg',
    curriculum: 'O Level',
    tag: 'O Level',
    registered: true,
    photo: '/assets/images/School1.jpg',
    subjects: 'Mathematics, Physics, English',
    about:
      'Beacon School is a registered institution offering O Level education with a focus on Mathematics, Physics, and English. The school is known for its strong academic results and supportive learning environment in Gulberg, Lahore.',
  },
  {
    name: 'Greenwood Academy',
    city: 'Karachi',
    area: 'Clifton',
    curriculum: 'Cambridge',
    tag: 'A Level',
    registered: true,
    photo: '/assets/images/School2.jpg',
    subjects: 'English, Computer Science, Business Studies',
    about:
      'Greenwood Academy offers Cambridge curriculum education from Grade 1 to Grade 12, with a well-equipped campus in Clifton, Karachi and an emphasis on English, Computer Science, and Business Studies.',
  },
  {
    name: 'City Grammar School',
    city: 'Islamabad',
    area: 'F-8',
    curriculum: 'A Level',
    tag: 'Federal',
    registered: true,
    photo: '/assets/images/School3.jpg',
    subjects: 'Physics, Chemistry, Biology',
    about:
      'City Grammar School is known for its strong A Level Science program, based in F-8, Islamabad, with dedicated laboratories for Physics, Chemistry, and Biology.',
  },
  {
    name: 'The Learning Hub',
    city: 'Faisalabad',
    area: 'Model Town',
    curriculum: 'O Level',
    tag: 'O Level',
    registered: true,
    photo: '/assets/images/school-placeholder-1.jpg',
    subjects: 'Mathematics, English, ICT',
    about:
      'The Learning Hub is a growing O Level institution in Model Town, Faisalabad, focused on Mathematics, English, and ICT with modern teaching facilities.',
  },
  {
    name: 'Rising Star Academy',
    city: 'Multan',
    area: 'Cantt',
    curriculum: 'IB',
    tag: 'IB',
    registered: true,
    photo: '/assets/images/school-placeholder-2.jpg',
    subjects: 'Biology, Chemistry, Environmental Science',
    about:
      'Rising Star Academy delivers the IB Diploma Programme in Multan Cantt, with particular strength in Biology, Chemistry, and Environmental Science.',
  },
  {
    name: 'Sunrise Public School',
    city: 'Rawalpindi',
    area: 'Satellite Town',
    curriculum: 'Punjab Board',
    tag: 'Punjab Board',
    registered: true,
    photo: '/assets/images/school-placeholder-3.jpg',
    subjects: 'Urdu, English, Social Studies',
    about:
      'Sunrise Public School follows the Punjab Board curriculum in Satellite Town, Rawalpindi, with a focus on Urdu, English, and Social Studies for local students.',
  },
]

const vacanciesSeed = [
  {
    schoolName: 'Beacon School',
    title: 'Mathematics Teacher — O Level',
    subject: 'Mathematics',
    qualification: "Bachelor's or higher",
    experience: '2+ Years',
    curriculum: 'O Level',
    employmentType: 'Full Time' as const,
    salaryRange: 'PKR 40,000 – 60,000',
    city: 'Lahore',
    area: 'Gulberg',
    joiningDate: 'Immediate',
    teachersNeeded: 1,
    description:
      'Beacon School is looking for an experienced Mathematics teacher for O Level classes. The role covers Grade 9 and 10 Mathematics with a focus on exam preparation.',
    active: true,
  },
  {
    schoolName: 'Greenwood Academy',
    title: 'English Teacher — Middle School',
    subject: 'English',
    qualification: "Master's preferred",
    experience: '1+ Years',
    curriculum: 'Cambridge',
    employmentType: 'Full Time' as const,
    salaryRange: 'PKR 35,000 – 50,000',
    city: 'Karachi',
    area: 'Clifton',
    joiningDate: 'Within 2 weeks',
    teachersNeeded: 2,
    description: 'Greenwood Academy needs English teachers for Grade 6-8. Good communication skills and classroom management experience preferred.',
    active: true,
  },
  {
    schoolName: 'City Grammar School',
    title: 'Physics Teacher — A Level',
    subject: 'Physics',
    qualification: "Master's in Physics",
    experience: '3+ Years',
    curriculum: 'A Level',
    employmentType: 'Part Time' as const,
    salaryRange: 'PKR 25,000 – 35,000',
    city: 'Islamabad',
    area: 'F-8',
    joiningDate: 'Next term',
    teachersNeeded: 1,
    description: 'City Grammar School is hiring a part-time A Level Physics teacher for the upcoming term.',
    active: true,
  },
  {
    schoolName: 'The Learning Hub',
    title: 'Computer Science Teacher — ICT',
    subject: 'Computer Science',
    qualification: "Bachelor's in CS or related field",
    experience: '2+ Years',
    curriculum: 'O Level',
    employmentType: 'Full Time' as const,
    salaryRange: 'PKR 45,000 – 65,000',
    city: 'Faisalabad',
    area: 'Model Town',
    joiningDate: 'Immediate',
    teachersNeeded: 1,
    description:
      'The Learning Hub is seeking a Computer Science / ICT teacher to handle Grade 9-10 O Level classes, including practical lab sessions.',
    active: true,
  },
  {
    schoolName: 'Rising Star Academy',
    title: 'Biology Teacher — IB Programme',
    subject: 'Biology',
    qualification: "Master's in Biology",
    experience: '3+ Years',
    curriculum: 'IB',
    employmentType: 'Full Time' as const,
    salaryRange: 'PKR 50,000 – 70,000',
    city: 'Multan',
    area: 'Cantt',
    joiningDate: 'Next term',
    teachersNeeded: 1,
    description:
      'Rising Star Academy is looking for a Biology teacher experienced with the IB curriculum to lead Diploma Programme classes.',
    active: true,
  },
]

const candidatesSeed = [
  {
    name: 'Muhammad Ali',
    role: 'Mathematics Teacher',
    city: 'Lahore',
    area: 'Punjab',
    qualification: 'M.Phil Mathematics',
    experience: '5 Years Experience',
    tags: ['School Teaching', 'O Level, A Level'],
    verified: true,
    photo: '/assets/images/candidate-muhammad-ali.jpg',
  },
  {
    name: 'Ayesha Khan',
    role: 'English Teacher',
    city: 'Islamabad',
    area: 'ICT',
    qualification: 'M.A English Literature',
    experience: '4 Years Experience',
    tags: ['School Teaching', 'O Level'],
    verified: true,
    photo: '/assets/images/candidate-ayesha-khan.jpg',
  },
  {
    name: 'Usman Tariq',
    role: 'Physics Teacher',
    city: 'Rawalpindi',
    area: 'Punjab',
    qualification: 'M.Sc Physics',
    experience: '6 Years Experience',
    tags: ['School Teaching', 'O Level, A Level'],
    verified: true,
    photo: '/assets/images/candidate-usman-tariq.jpg',
  },
  {
    name: 'Sana Fatima',
    role: 'Biology Teacher',
    city: 'Faisalabad',
    area: 'Punjab',
    qualification: 'M.Sc Biology',
    experience: '3 Years Experience',
    tags: ['School Teaching', 'O Level'],
    verified: true,
    photo: '/assets/images/candidate-sana-fatima.jpg',
  },
  {
    name: 'Bilal Ahmed',
    role: 'Chemistry Teacher',
    city: 'Karachi',
    area: 'Sindh',
    qualification: 'M.Sc Chemistry',
    experience: '4 Years Experience',
    tags: ['School Teaching', 'O Level, A Level'],
    verified: true,
    photo: '',
  },
  {
    name: 'Hina Noreen',
    role: 'Urdu Teacher',
    city: 'Multan',
    area: 'Punjab',
    qualification: 'M.A Urdu',
    experience: '2 Years Experience',
    tags: ['School Teaching', 'Primary, Middle'],
    verified: true,
    photo: '/assets/images/candidate-hina-noreen.jpg',
  },
  {
    name: 'Hamza Saeed',
    role: 'Computer Science Teacher',
    city: 'Lahore',
    area: 'Punjab',
    qualification: 'BS Computer Science',
    experience: '5 Years Experience',
    tags: ['School & Home Tuition', 'All Levels'],
    verified: true,
    photo: '/assets/images/candidate-hamza-saeed.jpg',
  },
  {
    name: 'Sarah Javed',
    role: 'Home Tutor (Mathematics)',
    city: 'Gujranwala',
    area: 'Punjab',
    qualification: 'BS Mathematics',
    experience: '3 Years Experience',
    tags: ['Home Tuition', 'Primary to Matric'],
    verified: true,
    photo: '/assets/images/candidate-sarah-javed.jpg',
  },
]

const blogPostsSeed = [
  {
    slug: 'teaching-jobs-in-pakistan',
    title: 'Teaching Jobs in Pakistan: What Schools Look For',
    excerpt: 'A simple guide to what schools in Pakistan look for when hiring new teachers, and how to prepare your profile.',
    category: 'Careers',
    date: '2026-01-10',
    body: [
      'Schools in Pakistan usually look for three things in a new teacher: the right qualification, relevant experience, and good communication with students.',
      'If you are just starting out, focus on getting your degree and any teaching certificates ready. Schools also value teachers who can explain difficult topics in a simple way.',
      'Keep your registration details updated on TeachingCareer so schools can find you when a role matching your subject and experience opens up.',
    ],
  },
  {
    slug: 'how-schools-can-find-teachers',
    title: 'How Schools Can Find the Right Teachers Faster',
    excerpt: 'Tips for schools on writing clear vacancy details so TeachingCareer can match the right candidates quickly.',
    category: 'For Schools',
    date: '2026-01-15',
    body: [
      'The clearer your vacancy details, the faster TeachingCareer can match you with suitable candidates.',
      'Include the subject, class levels, required qualification, and experience level. Mention if the role is full-time or part-time, and your expected joining date.',
      'Schools that provide complete requirements usually receive better-matched candidates within days.',
    ],
  },
  {
    slug: 'improve-your-teacher-profile',
    title: 'How Teachers Can Improve Their TeachingCareer Profile',
    excerpt: 'Simple steps teachers can take to make their profile stand out to schools and academies.',
    category: 'Careers',
    date: '2026-01-20',
    body: [
      'A complete profile helps schools understand your background quickly.',
      'Add your highest qualification, subjects you can teach, and your experience details. If you have taught before, mention the subjects and classes clearly.',
      'A professional photo (optional) also helps schools put a face to your application.',
    ],
  },
  {
    slug: 'home-tuition-guidance',
    title: 'A Simple Guide to Home Tuition in Pakistan',
    excerpt: 'What parents should know before hiring a home tutor, and how TeachingCareer helps with the process.',
    category: 'For Parents',
    date: '2026-01-25',
    body: [
      'Home tuition works best when parents are clear about the subject, class level, and schedule they need.',
      'TeachingCareer reviews your requirements and suggests suitable tutors based on subject, location, and availability.',
      'For safety, tutors offering home tuition are asked to provide a Police Verification Certificate before being presented for home tuition opportunities.',
    ],
  },
  {
    slug: 'teacher-verification-explained',
    title: 'How TeachingCareer Verifies Teachers',
    excerpt: 'An overview of the verification steps TeachingCareer follows before presenting a candidate to a school or parent.',
    category: 'Trust & Safety',
    date: '2026-02-01',
    body: [
      'TeachingCareer reviews the qualification documents and experience details every candidate submits during registration.',
      'For home tuition candidates, a Police Verification Certificate is required before the candidate becomes eligible for home tuition opportunities.',
      'This review process helps schools and parents feel confident about the candidates they connect with.',
    ],
  },
  {
    slug: 'career-advice-for-teachers',
    title: 'Career Advice for Teachers Starting Out',
    excerpt: 'Practical advice for new teachers on building experience and finding the right first teaching role.',
    category: 'Careers',
    date: '2026-02-05',
    body: [
      'Your first teaching role does not have to be your dream job — it is a chance to build experience.',
      'Consider part-time or home tuition roles alongside school applications if you are early in your career.',
      'Keep learning — attending workshops or short courses related to your subject can make your profile stronger over time.',
    ],
  },
]

async function seed() {
  await connectDb()

  await Promise.all([
    School.deleteMany({}),
    Vacancy.deleteMany({}),
    Candidate.deleteMany({}),
    BlogPost.deleteMany({}),
  ])

  const schools = await School.insertMany(schoolsSeed)
  const schoolIdByName = new Map(schools.map((s) => [s.name, s._id]))

  await Vacancy.insertMany(
    vacanciesSeed.map(({ schoolName, ...rest }) => ({
      ...rest,
      school: schoolName,
      schoolId: schoolIdByName.get(schoolName),
    })),
  )

  await Candidate.insertMany(candidatesSeed)
  await BlogPost.insertMany(blogPostsSeed)

  console.log(
    `[seed] inserted ${schools.length} schools, ${vacanciesSeed.length} vacancies, ${candidatesSeed.length} candidates, ${blogPostsSeed.length} blog posts`,
  )

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('[seed] failed', err)
  process.exit(1)
})
