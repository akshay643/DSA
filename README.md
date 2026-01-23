# DSA Practice Platform

A comprehensive single-page application for practicing Data Structures and Algorithms with pattern-based learning.

## Features

### 🎯 Core Features
- **Pattern-Based Organization**: Questions organized by coding patterns (Two Pointers, Sliding Window, Dynamic Programming, etc.)
- **Topic-Based Organization**: Also organized by data structure types (Arrays, Trees, Graphs, etc.)
- **Difficulty Levels**: Easy, Medium, and Hard questions marked with company tags
- **Progress Tracking**: Automatic progress saving with completion tracking
- **Timer**: Track time spent on each question
- **Notes System**: Add personal notes and approaches for each question
- **Multi-Language Support**: JavaScript, Python, and Java starter code

### 🎨 UI Features
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Collapsible Sections**: Organized sidebar with expandable categories
- **Search & Filter**: Search by title/tags, filter by difficulty and companies
- **Responsive Design**: Clean, modern interface built with Tailwind CSS
- **Hints System**: Progressive hint revelation to help when stuck

### 💾 Data Management
- **Local Storage**: All progress stored in browser's localStorage
- **Export/Import**: Export your progress as JSON and import it later
- **Clear Data**: Option to reset all progress
- **Persistent State**: Code, notes, completion status, and time tracked per question

### 📊 Progress Insights
- **Completion Counter**: Track solved vs total questions
- **Category Progress**: See completion status for each pattern/topic
- **Time Tracking**: Monitor time spent on each problem
- **Attempt Counter**: Track number of attempts per question

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main application page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Top navigation with settings
│   ├── Sidebar.tsx         # Category and question navigation
│   ├── QuestionCard.tsx    # Individual question display
│   └── FilterBar.tsx       # Search and filter controls
├── context/
│   └── ThemeContext.tsx    # Theme management
├── hooks/
│   ├── useLocalStorage.ts  # Local storage hook
│   └── useTimer.ts         # Timer functionality
├── types/
│   └── index.ts            # TypeScript interfaces
├── data/
│   └── questions.json      # Question database
└── package.json
```

## Adding New Questions

Edit `/data/questions.json` to add new questions. Each question should follow this structure:

```json
{
  "id": "unique-id",
  "title": "Question Title",
  "category": "pattern-id",
  "difficulty": "easy|medium|hard",
  "companies": ["Company1", "Company2"],
  "introduction": "Brief introduction",
  "problemStatement": "Detailed problem description",
  "examples": [
    {
      "input": "example input",
      "output": "example output",
      "explanation": "why this is the answer"
    }
  ],
  "hints": ["Hint 1", "Hint 2"],
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(1)",
  "tags": ["tag1", "tag2"],
  "starterCode": {
    "javascript": "function solve() {\n  // code\n}",
    "python": "def solve():\n    # code\n    pass",
    "java": "public void solve() {\n    // code\n}"
  }
}
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks + Local Storage
- **Theme**: Context API

## Features in Detail

### Question Organization
- Questions are grouped by patterns (Two Pointers, Sliding Window, etc.)
- Each category shows completion progress
- Expandable/collapsible sections for easy navigation

### Code Editor
- Multi-language support with syntax preservation
- Auto-save functionality
- Language-specific starter code
- Tab indentation support

### Progress System
- Completion tracking per question
- Time tracking with start/stop timer
- Attempt counter
- Personal notes for each question

### Data Persistence
- All data stored in browser's localStorage
- Survives page refreshes
- Can be exported as JSON
- Can be cleared manually

### Theme System
- Dark mode (default)
- Light mode
- Persistent preference
- Smooth transitions

## Best Practices for Use

1. **Start Timer**: Begin timer when you start working on a problem
2. **Use Hints Wisely**: Reveal hints progressively only when stuck
3. **Take Notes**: Document your approach and learnings
4. **Mark Complete**: Mark questions complete only after fully solving
5. **Export Regularly**: Export your progress periodically as backup
6. **Review Complexity**: Study time/space complexity after solving

## Browser Storage

The app uses localStorage with these keys:
- `dsa-progress`: Question progress (code, notes, completion, time)
- `dsa-settings`: User preferences (theme, language, font size)

## Contributing

To add more questions or categories:
1. Update `/data/questions.json`
2. Follow the existing JSON schema
3. Test locally before deploying

## License

This is an open-source educational project.
