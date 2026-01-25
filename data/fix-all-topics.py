import json
import re
import os

topics = [
    'two-pointers',
    'binary-search',
    'dynamic-programming',
    'graphs',
    'trees',
    'arrays',
    'strings',
    'linked-lists',
    'stack-queue'
]

base_path = '/Users/akshay/DSA Only/data/topics'

for topic in topics:
    file_path = os.path.join(base_path, f'{topic}.json')
    
    try:
        # Read the file
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        if not data['questions']:
            print(f"⚠️  {topic}.json - No questions found")
            continue
        
        updated_count = 0
        # Update all question IDs
        for question in data['questions']:
            old_id = question['id']
            
            # Extract number from various formats (q1, topic-1, etc.)
            if old_id.startswith(topic + '-'):
                # Already in correct format
                continue
            elif old_id.startswith('q'):
                # Format: q1, q2, etc.
                match = re.match(r'q(\d+)', old_id)
                if match:
                    number = match.group(1)
                    question['id'] = f'{topic}-{number}'
                    updated_count += 1
            elif '-' in old_id:
                # Format: some-prefix-1
                number = old_id.split('-')[-1]
                if number.isdigit():
                    question['id'] = f'{topic}-{number}'
                    updated_count += 1
        
        if updated_count > 0:
            # Write back to file
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"✓ {topic}.json - Updated {updated_count} questions")
        else:
            print(f"✓ {topic}.json - Already in correct format ({len(data['questions'])} questions)")
            
    except Exception as e:
        print(f"✗ Error updating {topic}.json: {str(e)}")

print("\n✅ All topic files processed!")
