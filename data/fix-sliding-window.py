import json
import re

# Read the file
with open('/Users/akshay/DSA Only/data/topics/sliding-window.json', 'r') as f:
    data = json.load(f)

# Update all question IDs
for question in data['questions']:
    old_id = question['id']
    # Extract number from qX format
    match = re.match(r'q(\d+)', old_id)
    if match:
        number = match.group(1)
        question['id'] = f'sliding-window-{number}'
        print(f"Updated: {old_id} -> {question['id']}")

# Write back to file
with open('/Users/akshay/DSA Only/data/topics/sliding-window.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"\nTotal questions updated: {len(data['questions'])}")
