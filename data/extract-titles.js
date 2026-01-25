const fs = require('fs');
const path = require('path');

// Topic files to process
const topicFiles = [
  'two-pointers.json',
  'sliding-window.json',
  'binary-search.json',
  'dynamic-programming.json',
  'graphs.json',
  'trees.json',
  'arrays.json',
  'strings.json',
  'linked-lists.json',
  'stack-queue.json',
  'backtracking.json'
];

const topicsDir = path.join(__dirname, 'topics');
const outputFile = path.join(__dirname, 'question-titles.json');

const result = {
  totalQuestions: 0,
  topics: []
};

console.log('📚 Extracting question titles from all topics...\n');

topicFiles.forEach(fileName => {
  const filePath = path.join(topicsDir, fileName);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const topicData = {
      topicId: data.category.id,
      topicName: data.category.name,
      description: data.category.description,
      questionCount: data.questions.length,
      questions: data.questions.map(q => ({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty,
        companies: q.companies || []
      }))
    };
    
    result.topics.push(topicData);
    result.totalQuestions += data.questions.length;
    
    console.log(`✅ ${data.category.name}: ${data.questions.length} questions`);
    data.questions.forEach((q, idx) => {
      console.log(`   ${idx + 1}. ${q.title} (${q.difficulty})`);
    });
    console.log('');
    
  } catch (error) {
    console.log(`⚠️  ${fileName}: No questions yet or error reading file`);
    console.log('');
  }
});

// Write the result to JSON file
fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));

console.log('═══════════════════════════════════════════════════');
console.log(`📊 Total Questions: ${result.totalQuestions}`);
console.log(`📁 Output saved to: question-titles.json`);
console.log('═══════════════════════════════════════════════════');
