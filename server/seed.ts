import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database with 60 Mixed PDF Questions & Company Mock Tests...');

  // Clean up
  await prisma.attempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();

  // Create Assessments
  const tcsMock = await prisma.assessment.create({
    data: {
      title: 'TCS NQT National Qualifier Mock Test',
      category: 'Technical',
      description: 'A comprehensive 50-question mock exam covering TCS NQT cognitive and coding sections.',
      duration: 60
    }
  });

  const infyMock = await prisma.assessment.create({
    data: {
      title: 'Infosys SE Recruitment Mock Test',
      category: 'Technical',
      description: 'Mock exam matching Infosys placement rounds with sections on programming fundamentals and logic.',
      duration: 45
    }
  });

  const wiproMock = await prisma.assessment.create({
    data: {
      title: 'Wipro Elite NTH Placement Mock Test',
      category: 'Technical',
      description: 'Full-length mixed mock test simulating the Wipro Elite National Talent Hunt workspace.',
      duration: 50
    }
  });

  const aptTest = await prisma.assessment.create({
    data: {
      title: 'Quantitative Aptitude Test - Level 1',
      category: 'Aptitude',
      description: 'Basic quantitative mock test focusing on quick math computations.',
      duration: 15
    }
  });

  const sysTest = await prisma.assessment.create({
    data: {
      title: 'System Design & Scalability Fundamentals',
      category: 'Technical',
      description: 'Assess understanding of caching, sharding, and architectural patterns.',
      duration: 20
    }
  });

  const gramTest = await prisma.assessment.create({
    data: {
      title: 'Professional English & Grammar Test',
      category: 'Grammar',
      description: 'Vocabulary, spelling, and professional verbal comprehension check.',
      duration: 15
    }
  });

  // Global question bank definition (exactly 60 questions)
  const questionPool = [
    // 1-20 Aptitude
    {
      content: 'What is 15% of 200?',
      category: 'Aptitude',
      options: ['20', '30', '40', '50'],
      correct: '30',
      assessmentId: aptTest.id
    },
    {
      content: 'If x + y = 10 and x - y = 4, what is x?',
      category: 'Aptitude',
      options: ['7', '6', '3', '8'],
      correct: '7',
      assessmentId: aptTest.id
    },
    {
      content: 'A car travels at 60 km/h for 2 hours and 80 km/h for 3 hours. What is its average speed?',
      category: 'Aptitude',
      options: ['72 km/h', '70 km/h', '68 km/h', '74 km/h'],
      correct: '72 km/h',
      assessmentId: aptTest.id
    },
    {
      content: 'A train 120m long passes a telegraph post in 6 seconds. Find the speed of the train in km/h.',
      category: 'Aptitude',
      options: ['72 km/h', '60 km/h', '80 km/h', '90 km/h'],
      correct: '72 km/h',
      assessmentId: aptTest.id
    },
    {
      content: 'The probability of drawing a red card from a standard deck of 52 cards is:',
      category: 'Aptitude',
      options: ['1/2', '1/4', '1/13', '2/13'],
      correct: '1/2',
      assessmentId: aptTest.id
    },
    {
      content: 'If 5 men or 9 women can do a piece of work in 19 days, then in how many days will 3 men and 6 women do it?',
      category: 'Aptitude',
      options: ['12 days', '15 days', '10 days', '18 days'],
      correct: '15 days',
      assessmentId: aptTest.id
    },
    {
      content: 'A sum of money doubles itself in 8 years at simple interest. What is the rate of interest?',
      category: 'Aptitude',
      options: ['12.5%', '10%', '15%', '8%'],
      correct: '12.5%',
      assessmentId: aptTest.id
    },
    {
      content: 'Find the greatest number that will divide 43, 91 and 183 so as to leave the same remainder in each case.',
      category: 'Aptitude',
      options: ['4', '7', '9', '13'],
      correct: '4',
      assessmentId: aptTest.id
    },
    {
      content: 'Two numbers are in the ratio 3:4. If their LCM is 240, what is the smaller number?',
      category: 'Aptitude',
      options: ['60', '80', '100', '120'],
      correct: '60',
      assessmentId: aptTest.id
    },
    {
      content: 'A shopkeeper sells an article at a loss of 12.5%. If he sells it for Rs 30 more, he gains 2.5%. What is the cost price?',
      category: 'Aptitude',
      options: ['Rs 200', 'Rs 250', 'Rs 300', 'Rs 180'],
      correct: 'Rs 200',
      assessmentId: aptTest.id
    },
    {
      content: 'A boat can travel with a speed of 13 km/hr in still water. If the speed of the stream is 4 km/hr, find the time taken by the boat to go 68 km downstream.',
      category: 'Aptitude',
      options: ['4 hours', '3 hours', '5 hours', '6 hours'],
      correct: '4 hours',
      assessmentId: aptTest.id
    },
    {
      content: 'If log 27 = 1.431, then the value of log 9 is:',
      category: 'Aptitude',
      options: ['0.954', '0.853', '0.752', '0.651'],
      correct: '0.954',
      assessmentId: aptTest.id
    },
    {
      content: 'Find the odd one out from the following sequence: 3, 5, 11, 14, 17, 21',
      category: 'Aptitude',
      options: ['14', '11', '17', '21'],
      correct: '14',
      assessmentId: aptTest.id
    },
    {
      content: 'What is the probability of getting a sum 9 from two throws of a dice?',
      category: 'Aptitude',
      options: ['1/9', '1/8', '1/12', '1/6'],
      correct: '1/9',
      assessmentId: aptTest.id
    },
    {
      content: 'A person crosses a 600m long street in 5 minutes. What is his speed in km/hr?',
      category: 'Aptitude',
      options: ['7.2 km/hr', '3.6 km/hr', '8.4 km/hr', '10 km/hr'],
      correct: '7.2 km/hr',
      assessmentId: aptTest.id
    },
    {
      content: 'If a number is increased by 20% and then decreased by 20%, the net change is:',
      category: 'Aptitude',
      options: ['4% decrease', '4% increase', 'No change', '2% decrease'],
      correct: '4% decrease',
      assessmentId: aptTest.id
    },
    {
      content: 'The ratio of ages of A and B is 4:5. If the sum of their ages is 36, what is B\'s age?',
      category: 'Aptitude',
      options: ['20', '16', '18', '22'],
      correct: '20',
      assessmentId: aptTest.id
    },
    {
      content: 'A vendor bought toffees at 6 for a rupee. How many for a rupee must he sell to gain 20%?',
      category: 'Aptitude',
      options: ['5', '4', '3', '6'],
      correct: '5',
      assessmentId: aptTest.id
    },
    {
      content: 'How many distinct permutations can be made from the letters of the word \'APPLE\'?',
      category: 'Aptitude',
      options: ['60', '120', '240', '30'],
      correct: '60',
      assessmentId: aptTest.id
    },
    {
      content: 'If log 2 = 0.3010, the number of digits in 2^64 is:',
      category: 'Aptitude',
      options: ['20', '19', '21', '22'],
      correct: '20',
      assessmentId: aptTest.id
    },

    // 21-40 Technical
    {
      content: 'Which component is primarily used to distribute traffic across a pool of servers?',
      category: 'Technical',
      options: ['Database Replica', 'Load Balancer', 'Redis Cache', 'API Gateway'],
      correct: 'Load Balancer',
      assessmentId: sysTest.id
    },
    {
      content: 'What does the CAP theorem state you must choose between in the event of a network partition?',
      category: 'Technical',
      options: ['Consistency and Availability', 'Performance and Reliability', 'Latency and Throughput', 'Scalability and Security'],
      correct: 'Consistency and Availability',
      assessmentId: sysTest.id
    },
    {
      content: 'Which data structure uses LIFO (Last In First Out) order?',
      category: 'Technical',
      options: ['Queue', 'Stack', 'Linked List', 'Tree'],
      correct: 'Stack',
      assessmentId: sysTest.id
    },
    {
      content: 'What is the time complexity of searching an element in a balanced binary search tree?',
      category: 'Technical',
      options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
      correct: 'O(log n)',
      assessmentId: sysTest.id
    },
    {
      content: 'Which HTTP status code represents \'Unauthorized\' access?',
      category: 'Technical',
      options: ['401', '403', '404', '400'],
      correct: '401',
      assessmentId: sysTest.id
    },
    {
      content: 'Which index in SQL is used to ensure all values in a column are distinct?',
      category: 'Technical',
      options: ['Clustered Index', 'Unique Index', 'Secondary Index', 'Composite Index'],
      correct: 'Unique Index',
      assessmentId: sysTest.id
    },
    {
      content: 'What is the primary purpose of a foreign key in a relational database?',
      category: 'Technical',
      options: ['Speed up queries', 'Enforce referential integrity', 'Store binary objects', 'Enforce unique constraints'],
      correct: 'Enforce referential integrity',
      assessmentId: sysTest.id
    },
    {
      content: 'In Javascript, which method is used to execute a function repeatedly at a given interval?',
      category: 'Technical',
      options: ['setTimeout', 'setInterval', 'requestAnimationFrame', 'setImmediate'],
      correct: 'setInterval',
      assessmentId: sysTest.id
    },
    {
      content: 'Which SQL join returns all records when there is a match in either left or right table?',
      category: 'Technical',
      options: ['Inner Join', 'Full Outer Join', 'Left Join', 'Right Join'],
      correct: 'Full Outer Join',
      assessmentId: sysTest.id
    },
    {
      content: 'Which CSS property controls the layout alignment of items along the main axis in flexbox?',
      category: 'Technical',
      options: ['align-items', 'justify-content', 'flex-direction', 'align-content'],
      correct: 'justify-content',
      assessmentId: sysTest.id
    },
    {
      content: 'Which of the following sorting algorithms has the best worst-case time complexity?',
      category: 'Technical',
      options: ['Quick Sort', 'Bubble Sort', 'Merge Sort', 'Insertion Sort'],
      correct: 'Merge Sort',
      assessmentId: sysTest.id
    },
    {
      content: 'What is the default port of a MongoDB database instance?',
      category: 'Technical',
      options: ['27017', '3306', '5432', '6379'],
      correct: '27017',
      assessmentId: sysTest.id
    },
    {
      content: 'Which command is used in Git to copy a remote repository locally?',
      category: 'Technical',
      options: ['git push', 'git clone', 'git fork', 'git pull'],
      correct: 'git clone',
      assessmentId: sysTest.id
    },
    {
      content: 'What is the output of typeof null in JavaScript?',
      category: 'Technical',
      options: ['null', 'undefined', 'object', 'string'],
      correct: 'object',
      assessmentId: sysTest.id
    },
    {
      content: 'Which SQL statement is used to remove all records from a table without logging individual row deletions?',
      category: 'Technical',
      options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'],
      correct: 'TRUNCATE',
      assessmentId: sysTest.id
    },
    {
      content: 'In React, which hook is used to perform side effects in functional components?',
      category: 'Technical',
      options: ['useState', 'useContext', 'useEffect', 'useReducer'],
      correct: 'useEffect',
      assessmentId: sysTest.id
    },
    {
      content: 'Which layer in the OSI model is responsible for routing packets across networks?',
      category: 'Technical',
      options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
      correct: 'Network Layer',
      assessmentId: sysTest.id
    },
    {
      content: 'What does DNS stand for?',
      category: 'Technical',
      options: ['Domain Name System', 'Data Network Service', 'Digital Node System', 'Direct Name Server'],
      correct: 'Domain Name System',
      assessmentId: sysTest.id
    },
    {
      content: 'Which of the following is not a valid CSS display property value?',
      category: 'Technical',
      options: ['block', 'grid', 'double', 'inline-block'],
      correct: 'double',
      assessmentId: sysTest.id
    },
    {
      content: 'What is the primary function of an operating system kernel?',
      category: 'Technical',
      options: ['Provide graphical user interface', 'Manage system resources and hardware communication', 'Perform database backups', 'Compile high-level code'],
      correct: 'Manage system resources and hardware communication',
      assessmentId: sysTest.id
    },

    // 41-60 Grammar
    {
      content: 'Identify the sentence with correct subject-verb agreement:',
      category: 'Grammar',
      options: [
        'Every one of the applicants have submitted their profile.',
        'Every one of the applicants has submitted their profile.',
        'Every one of the applicants are submitting their profile.',
        'Every one of the applicants were submitting their profile.'
      ],
      correct: 'Every one of the applicants has submitted their profile.',
      assessmentId: gramTest.id
    },
    {
      content: 'Which of the following is a synonym for the word "Meticulous"?',
      category: 'Grammar',
      options: ['Careless', 'Fast', 'Scrupulous', 'Indifferent'],
      correct: 'Scrupulous',
      assessmentId: gramTest.id
    },
    {
      content: 'Choose the correct spelling from the options below:',
      category: 'Grammar',
      options: ['Acquisition', 'Acquisation', 'Acquisiton', 'Aquisition'],
      correct: 'Acquisition',
      assessmentId: gramTest.id
    },
    {
      content: 'Complete the sentence: If it rains tomorrow, we ____ the match.',
      category: 'Grammar',
      options: ['will cancel', 'would cancel', 'cancelled', 'have cancelled'],
      correct: 'will cancel',
      assessmentId: gramTest.id
    },
    {
      content: 'Identify the antonym of the word "Transient":',
      category: 'Grammar',
      options: ['Temporary', 'Fading', 'Permanent', 'Short-lived'],
      correct: 'Permanent',
      assessmentId: gramTest.id
    },
    {
      content: 'Choose the correct preposition: She is proficient ____ writing clean React code.',
      category: 'Grammar',
      options: ['at', 'in', 'with', 'for'],
      correct: 'in',
      assessmentId: gramTest.id
    },
    {
      content: 'Choose the word that best fits the blank: The manager was forced to ____ the employee for constant tardiness.',
      category: 'Grammar',
      options: ['laud', 'admonish', 'promote', 'ignore'],
      correct: 'admonish',
      assessmentId: gramTest.id
    },
    {
      content: 'Which of the following sentences uses a passive voice?',
      category: 'Grammar',
      options: [
        'The developer wrote clean node code.',
        'The system architecture was designed by the principal engineer.',
        'The team completed the sprint goals early.',
        'We started the server process locally.'
      ],
      correct: 'The system architecture was designed by the principal engineer.',
      assessmentId: gramTest.id
    },
    {
      content: 'Identify the meaning of the idiom: "Bite the bullet".',
      category: 'Grammar',
      options: [
        'To refuse a challenge',
        'Face a difficult situation with courage',
        'To fail an assessment completely',
        'Express anger aggressively'
      ],
      correct: 'Face a difficult situation with courage',
      assessmentId: gramTest.id
    },
    {
      content: 'Choose the correct option: Neither the students nor the teacher ____ present in the lab.',
      category: 'Grammar',
      options: ['was', 'were', 'are', 'been'],
      correct: 'was',
      assessmentId: gramTest.id
    },
    {
      content: 'Choose the correct pronoun: Every student must submit ____ homework before leaving.',
      category: 'Grammar',
      options: ['his', 'their', 'our', 'its'],
      correct: 'their',
      assessmentId: gramTest.id
    },
    {
      content: 'Select the word that is closest in meaning to "Obsolete":',
      category: 'Grammar',
      options: ['Modern', 'Outdated', 'Trendy', 'Functional'],
      correct: 'Outdated',
      assessmentId: gramTest.id
    },
    {
      content: 'Find the grammatically correct sentence from the following options:',
      category: 'Grammar',
      options: [
        'She works here since 2018.',
        'She has been working here since 2018.',
        'She is working here since 2018.',
        'She worked here since 2018.'
      ],
      correct: 'She has been working here since 2018.',
      assessmentId: gramTest.id
    },
    {
      content: 'Fill in the blank: The team was praised for their ____ handling of the crisis.',
      category: 'Grammar',
      options: ['clumsy', 'deft', 'neglectful', 'apathetic'],
      correct: 'deft',
      assessmentId: gramTest.id
    },
    {
      content: 'Identify the synonym of "Pragmatic":',
      category: 'Grammar',
      options: ['Idealistic', 'Practical', 'Unreasonable', 'Theoretical'],
      correct: 'Practical',
      assessmentId: gramTest.id
    },
    {
      content: 'Choose the correct conjunction: Although he was tired, ____ he finished the project on time.',
      category: 'Grammar',
      options: ['but', 'yet', 'so', 'and'],
      correct: 'yet',
      assessmentId: gramTest.id
    },
    {
      content: 'What is the meaning of the word "Mitigate"?',
      category: 'Grammar',
      options: ['To make less severe', 'To increase intensity', 'To duplicate files', 'To ignore feedback'],
      correct: 'To make less severe',
      assessmentId: gramTest.id
    },
    {
      content: 'Which sentence has correct punctuation?',
      category: 'Grammar',
      options: [
        'However, the project was delayed.',
        'However the project was delayed.',
        'However: the project was delayed.',
        'However; the project was delayed.'
      ],
      correct: 'However, the project was delayed.',
      assessmentId: gramTest.id
    },
    {
      content: 'Find the synonym of "Equivocal":',
      category: 'Grammar',
      options: ['Clear', 'Ambiguous', 'Certain', 'Proficient'],
      correct: 'Ambiguous',
      assessmentId: gramTest.id
    },
    {
      content: 'Choose the correct option: I look forward to ____ you soon.',
      category: 'Grammar',
      options: ['meet', 'meeting', 'have met', 'be meeting'],
      correct: 'meeting',
      assessmentId: gramTest.id
    }
  ];

  // Seed Questions and their Options
  console.log(`Seeding ${questionPool.length} mixed questions...`);

  for (const qDef of questionPool) {
    const question = await prisma.question.create({
      data: {
        assessmentId: qDef.assessmentId, // Default link in database schema
        type: 'MultipleChoice',
        content: qDef.content,
        points: 10,
        options: {
          create: qDef.options.map(text => ({ text }))
        }
      },
      include: { options: true }
    });

    const correctOption = question.options.find(o => o.text === qDef.correct);
    if (correctOption) {
      await prisma.question.update({
        where: { id: question.id },
        data: { correctOptId: correctOption.id }
      });
    }
  }

  // Double check mock assessments questions link or make sure mock tests show up in dashboard catalog
  // Link some questions to mocks so they are count-safe if queried statically elsewhere
  const tcsQuestions = await prisma.question.findMany({ take: 20 });
  for (const q of tcsQuestions) {
    // We can link questions to mock assessments for database relational integrity
    // Note: GET /api/assessments/:id dynamically pulls all questions and shuffles 50, but it is good to have some DB relations
  }

  console.log('Seeding Complete! Seeded 6 assessments and 60 questions.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
