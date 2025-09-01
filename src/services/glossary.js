import { read, write } from './store'

const SK = 'hh_glossary_skills'
const LK = 'hh_glossary_locations'
const EK = 'hh_glossary_experience'
const DK = 'hh_glossary_domains'
const FK = 'hh_glossary_functions'

const DEFAULT_SKILLS = [
  'React','Next.js','React Native','Node.js','Express','JavaScript','TypeScript','HTML','CSS',
  'Java','Spring','Kotlin','Android','Swift','iOS','Objective-C',
  'Python','Django','Flask','FastAPI','Pandas','NumPy','Airflow',
  'Go','C#','.NET','C++','Ruby','Rails','PHP','Laravel',
  'SQL','PostgreSQL','MySQL','SQL Server','MongoDB','Redis','Elasticsearch','GraphQL','REST',
  'Docker','Kubernetes','AWS','Azure','GCP','Terraform','Ansible','CI/CD','Jenkins','GitHub Actions',
  'DevOps','SRE','QA','Automation Testing','Cypress','Playwright','Selenium','Jest','Vitest',
  'Big Data','Spark','Hadoop','Kafka','Hive','ETL','Data Engineering',
  'Data Science','Machine Learning','Deep Learning','NLP','Computer Vision','MLOps',
  'Tableau','Power BI','Excel','Looker','Metabase','Analytics',
  'Salesforce','SAP','Oracle','ServiceNow',
  'Figma','Adobe XD','Sketch','Illustrator','Photoshop','UI/UX','Interaction Design',
  'Product Management','Agile','Scrum','Jira','Confluence','Project Management','Business Analysis',
  'Marketing','SEO','SEM','Content','Copywriting','Email Marketing','Performance Marketing','Growth',
  'Sales','Business Development','Account Management','Lead Generation','Inside Sales',
  'Customer Support','Customer Success','Operations','Procurement','Vendor Management',
  'Finance','Accounting','Taxation','FP&A','Audit','Compliance','Legal'
];

const DEFAULT_LOCATIONS = [
  'Bengaluru, IN','Hyderabad, IN','Pune, IN','Mumbai, IN','Delhi, IN','Noida, IN','Gurugram, IN','Chennai, IN','Kolkata, IN','Ahmedabad, IN',
  'Jaipur, IN','Indore, IN','Nagpur, IN','Kochi, IN','Coimbatore, IN','Chandigarh, IN','Bhubaneswar, IN','Lucknow, IN','Surat, IN',
  'Remote'
];

const DEFAULT_EXPERIENCE = [
  '0-1 years','1-3 years','2-5 years','4-6 years','5-8 years','7-10 years','10-12 years','12-16 years','16-20 years','20-30 years','30+ years'
];

const DEFAULT_DOMAINS = [
  'IT & Software','SaaS','AI/ML','Cybersecurity','FinTech','BFSI','HealthTech','EdTech','E-commerce','Logistics & Supply Chain',
  'Manufacturing','Retail','Telecom','Media & Entertainment','Travel & Hospitality','Real Estate','Energy','Gaming','Agritech',
  'Automotive','Pharma/Biotech','Customer Support'
];

const DEFAULT_FUNCTIONS = [
  'Engineering','Product Management','Design','Data Science/Analytics','Quality Assurance','DevOps/SRE','IT Support',
  'Marketing','Growth/Performance','Content','Sales','Business Development','Customer Success','Operations','Supply Chain/Logistics',
  'Finance & Accounting','Human Resources','Recruitment/Talent Acquisition','Legal & Compliance','Administration',
  'Project/Program Management','Consulting','Research','Education/Training'
];

const uniqSorted = (arr)=> Array.from(new Set((arr||[]).map(s=>String(s).trim()).filter(Boolean))).sort((a,b)=> a.localeCompare(b))

const readList = (k, def)=> read(k) || def
const writeList = (k, arr)=> write(k, uniqSorted(arr||[]))

export const glossary = {
  skills(){ return readList(SK, DEFAULT_SKILLS) },
  setSkills(arr){ writeList(SK, arr) },

  locations(){ return readList(LK, DEFAULT_LOCATIONS) },
  setLocations(arr){ writeList(LK, arr) },

  experience(){ return readList(EK, DEFAULT_EXPERIENCE) },
  setExperience(arr){ writeList(EK, arr) },

  domains(){ return readList(DK, DEFAULT_DOMAINS) },
  setDomains(arr){ writeList(DK, arr) },

  functions(){ return readList(FK, DEFAULT_FUNCTIONS) },
  setFunctions(arr){ writeList(FK, arr) },
};

export const getGlossary = () => ({
  skills: glossary.skills(),
  locations: glossary.locations(),
  experience: glossary.experience(),
  domains: glossary.domains(),
  functions: glossary.functions(),
});

export const saveGlossary = (g={}) => {
  if(g.skills) glossary.setSkills(g.skills);
  if(g.locations) glossary.setLocations(g.locations);
  if(g.experience) glossary.setExperience(g.experience);
  if(g.domains) glossary.setDomains(g.domains);
  if(g.functions) glossary.setFunctions(g.functions);
};

export const resetGlossary = () => {
  glossary.setSkills(DEFAULT_SKILLS);
  glossary.setLocations(DEFAULT_LOCATIONS);
  glossary.setExperience(DEFAULT_EXPERIENCE);
  glossary.setDomains(DEFAULT_DOMAINS);
  glossary.setFunctions(DEFAULT_FUNCTIONS);
};