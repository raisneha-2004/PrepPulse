// Role presets with max 10 most important curated focus topics
export const ROLE_GROUPS = {
  'Full Stack Developer': [
    'React',
    'Node.js',
    'Express',
    'TypeScript',
    'Next.js',
    'PostgreSQL',
    'MongoDB',
    'REST APIs',
    'System Design',
    'Authentication & JWT'
  ],
  'Frontend Developer': [
    'React',
    'JavaScript',
    'TypeScript',
    'Next.js',
    'CSS & Tailwind CSS',
    'State Management',
    'Web Performance',
    'DOM & Browser APIs',
    'Accessibility (a11y)',
    'Frontend Testing'
  ],
  'Backend Developer': [
    'Node.js',
    'Express',
    'Python',
    'Java',
    'SQL & PostgreSQL',
    'MongoDB',
    'Redis & Caching',
    'System Design',
    'REST APIs',
    'Docker'
  ],
  'AI / ML Engineer': [
    'Python',
    'Machine Learning',
    'Deep Learning',
    'PyTorch & TensorFlow',
    'NLP',
    'LLMs & Transformers',
    'RAG',
    'Prompt Engineering',
    'Vector Databases',
    'MLOps'
  ],
  'DevOps / Cloud Engineer': [
    'CI/CD Pipelines',
    'Docker',
    'Kubernetes',
    'AWS Core Services',
    'Terraform & IaC',
    'Linux & Shell Scripting',
    'Monitoring & Grafana',
    'Cloud Security',
    'Networking & DNS',
    'System Architecture'
  ],
  'Data Engineer': [
    'SQL & Query Tuning',
    'Apache Spark',
    'Data Warehousing',
    'ETL & Pipelines',
    'Apache Kafka',
    'Data Modeling',
    'Apache Airflow',
    'Python',
    'dbt',
    'Distributed Systems'
  ],
  'Product / Engineering Manager': [
    'System Architecture',
    'Agile & Scrum',
    'Incident Management',
    'Tech Debt Prioritization',
    'Team Scaling',
    'Stakeholder Communication',
    'Roadmap Execution',
    'Resource Planning',
    'Engineering Metrics',
    'Risk Mitigation'
  ],
  'Mobile Developer': [
    'React Native',
    'Flutter',
    'Swift & iOS',
    'Kotlin & Android',
    'Mobile UI & UX',
    'State Management',
    'Offline Storage',
    'Push Notifications',
    'App Store Deployment',
    'Mobile Security'
  ],
  'QA & Automation Engineer': [
    'End-to-End Testing',
    'Unit & Integration Testing',
    'API Testing',
    'Selenium WebDriver',
    'Playwright & Cypress',
    'Performance Testing',
    'CI/CD Test Integration',
    'Test Case Design',
    'Bug Tracking',
    'Test Automation'
  ],
  'General / Other': [
    'Data Structures & Algorithms',
    'System Design',
    'Clean Code & SOLID',
    'REST APIs',
    'Database & SQL',
    'Git & GitHub',
    'Testing & Debugging',
    'Authentication',
    'Performance Optimization',
    'Networking Basics'
  ]
};

// Hand-picked curated topic groups for the "More topics" drawer
export const MORE_TOPIC_GROUPS = {
  'CS Fundamentals': [
    'Data Structures & Algorithms',
    'OOP',
    'DBMS & SQL',
    'Operating Systems',
    'Computer Networks',
    'System Design',
    'Design Patterns',
    'Git & GitHub'
  ],
  'Web': [
    'HTML & CSS',
    'JavaScript',
    'React',
    'Node.js',
    'Express',
    'REST APIs',
    'Authentication & JWT',
    'TypeScript'
  ],
  'AI & Data': [
    'Python',
    'Machine Learning',
    'Deep Learning',
    'NLP',
    'LLMs & Prompt Engineering',
    'RAG',
    'Vector Databases'
  ],
  'Cloud & DevOps': [
    'Docker',
    'Kubernetes',
    'CI/CD',
    'AWS Basics',
    'Linux',
    'Redis & Caching'
  ],
  'Mobile & QA': [
    'React Native',
    'Flutter',
    'API Testing',
    'Test Automation'
  ]
};

/**
 * Returns curated more topic groups with the role's own suggested topics filtered out
 * and any empty group dropped.
 * @param {string} role
 * @returns {Record<string, string[]>}
 */
export const getMoreTopics = (role) => {
  const roleKey = Object.keys(ROLE_GROUPS).find(
    (k) => k.toLowerCase() === role?.toLowerCase()
  ) || 'General / Other';

  const roleTopics = (ROLE_GROUPS[roleKey] || ROLE_GROUPS['General / Other']).map((t) =>
    t.toLowerCase()
  );

  const result = {};
  for (const [groupName, topics] of Object.entries(MORE_TOPIC_GROUPS)) {
    const filtered = topics.filter(
      (topic) => !roleTopics.includes(topic.toLowerCase())
    );
    if (filtered.length > 0) {
      result[groupName] = filtered;
    }
  }
  return result;
};
