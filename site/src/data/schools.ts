import type { School } from '@/types'

export const schools: School[] = [
  {
    id: 's1',
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
    id: 's2',
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
    id: 's3',
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
    id: 's4',
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
    id: 's5',
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
    id: 's6',
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
