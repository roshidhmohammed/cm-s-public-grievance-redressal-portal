export const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Departments', to: '/departments' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
]

export const faqs = [
  {
    question: 'How do I submit a grievance?',
    answer: 'Create an account as a citizen, select the relevant district and category, and describe the issue along with supporting documents if needed.',
  },
  {
    question: 'How can I track my grievance?',
    answer: 'Use the grievance reference number provided after submission to search the status and view updates from the CMO and departments.',
  },
  {
    question: 'What is the role of the department assignment?',
    answer: 'Complaints are assigned to the relevant department based on the subject matter so that the issue reaches the most appropriate authority.',
  },
  {
    question: 'How are grievances resolved?',
    answer: 'Departments investigate, submit action reports, and the CMO reviews final outcomes before closure and citizen feedback.',
  },
  {
    question: 'Can I provide feedback after resolution?',
    answer: 'Yes, once the grievance reaches a resolved state, citizens can share feedback about satisfaction and the outcome.',
  },
  {
    question: 'What if my grievance is rejected?',
    answer: 'A rejected grievance includes the reason and the citizen may follow the guidance provided by the backend workflow or resubmit if appropriate.',
  },
]

export const processSteps = [
  'Submit grievance with district, category and details.',
  'CMO reviews and routes it to the right department.',
  'Department investigates and submits action report.',
  'CMO reviews outcome and closes the case with resolution.',
]

export const faqPreview = [
  'How do I submit a grievance?',
  'How can I track my complaint?',
  'Why is my grievance assigned to a department?',
]

export const lifecycle = [
  'Submission by citizen',
  'CMO review',
  'Department assignment',
  'Department investigation',
  'Action Taken Report submission',
  'CMO review',
  'Resolution',
  'Citizen feedback',
]

export const districts = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 'Idukki',
  'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod',
]
export const categories = ['Infrastructure', 'Health', 'Education', 'Public Services', 'Water & Sanitation', 'Transport', 'Other']

export const statuses = [
  'SUBMITTED', 'UNDER_CMO_REVIEW', 'FORWARDED_TO_DEPARTMENT', 'UNDER_DEPARTMENT_REVIEW', 'UNDER_REVIEW', 'IN_PROGRESS',
  'ACTION_REPORT_SUBMITTED', 'UNDER_CMO_RESOLUTION_REVIEW', 'RESOLVED', 'REJECTED',
  'RETURNED_FOR_FURTHER_ACTION',
]