import json
import re
import os

# List of files that need updating
topics = [
    'two-pointers',
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
            print(f"⚠️  {topic}.json - No questions found (empty array)")
            continue
        
        updated_count = 0
        # Update all question IDs
        for question in data['questions']:
            old_id = question['id']
            
            # Check if already in correct format
            if old_id.startswith(topic + '-'):
                continue
            
            # Extract number from qX format
            match = re.match(r'q(\d+)', old_id)
            if match:
                number = match.group(1)
                new_id = f'{topic}-{number}'
                question['id'] = new_id
                print(f"  {old_id} -> {new_id}")
                updated_count += 1
        
        if updated_count > 0:
            # Write back to file
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"✓ {topic}.json - Updated {updated_count} questions\n")
        else:
            print(f"✓ {topic}.json - Already in correct format ({len(data['questions'])} questions)\n")
            
    except Exception as e:
        print(f"✗ Error updating {topic}.json: {str(e)}\n")

print("✅ Script complete! Save your files in the editor first if they show unsaved changes.")
