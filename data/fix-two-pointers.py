import json
import re

# Read the file
with open('/Users/akshay/DSA Only/data/topics/two-pointers.json', 'r') as f:
    data = json.load(f)

# Update all question IDs
updated_count = 0
for question in data['questions']:
    old_id = question['id']
    # Extract number from qX format
    match = re.match(r'q(\d+)', old_id)
    if match:
        number = match.group(1)
        question['id'] = f'two-pointers-{number}'
        print(f"Updated: {old_id} -> {question['id']}")
        updated_count += 1

# Write back to file
with open('/Users/akshay/DSA Only/data/topics/two-pointers.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nTotal questions updated: {updated_count} out of {len(data['questions'])}")
