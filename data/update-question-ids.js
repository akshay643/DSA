const fs = require('fs');
const path = require('path');

// Topic files to update
const topics = [
  'two-pointers',
  'sliding-window',
  'binary-search',
  'dynamic-programming',
  'graphs',
  'trees',
  'arrays',
  'strings',
  'linked-lists',
  'stack-queue'
];

// Update question IDs in each topic file
topics.forEach(topic => {
  const filePath = path.join(__dirname, 'topics', `${topic}.json`);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Update each question ID to include category prefix
    data.questions = data.questions.map(question => {
      // Extract the number from the old ID
      const oldId = question.id;
      
      // Remove any existing category prefix and 'q' prefix
      let cleanId;
      if (oldId.startsWith(topic + '-')) {
        // Already has correct prefix, skip
        return question;
      } else if (oldId.includes('-')) {
        // Has a different prefix, extract number
        cleanId = oldId.split('-').pop();
      } else {
        // Just q1, q2, etc.
        cleanId = oldId.replace(/^q/, '');
      }
      
      // Create new ID with category prefix (e.g., two-pointers-1, sliding-window-1)
      const newId = `${topic}-${cleanId}`;
      
      return {
        ...question,
        id: newId
      };
    });
    
    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✓ Updated ${topic}.json - ${data.questions.length} questions`);
  } catch (error) {
    console.error(`✗ Error updating ${topic}.json:`, error.message);
  }
});

console.log('\nAll question IDs updated successfully!');
console.log('Question IDs now follow format: <category>-<number>');
console.log('Example: two-pointers-1, sliding-window-1, etc.');
