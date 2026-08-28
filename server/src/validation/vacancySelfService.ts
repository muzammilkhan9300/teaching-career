import { z } from 'zod'

export const selfServiceVacancySchema = z.object({
  title: z.string().min(2, 'Please enter a job title.'),
  subject: z.string().min(1, 'Please enter the subject.'),
  qualification: z.string().min(1, 'Please enter the required qualification.'),
  experience: z.string().min(1, 'Please enter the required experience.'),
  curriculum: z.string().min(1, 'Please enter the curriculum.'),
  employmentType: z.enum(['Full Time', 'Part Time']),
  salaryRange: z.string().min(1, 'Please enter a salary range.'),
  city: z.string().min(1, 'Please enter the city.'),
  area: z.string().min(1, 'Please enter the area.'),
  joiningDate: z.string().min(1, 'Please enter the expected joining date.'),
  teachersNeeded: z.coerce.number().int().min(1),
  description: z.string().min(1, 'Please enter a description.'),
  active: z.coerce.boolean().default(true),
})

export type SelfServiceVacancyInput = z.infer<typeof selfServiceVacancySchema>
