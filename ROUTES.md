# Routes Documentation

This app now has shareable routes for both **questions** and **interview guides**!

## Question Routes

Each question now has its own shareable URL! You can access any question directly using the following URL pattern:

### URL Structure

```
/questions/[category]/[questionId]
```

### Examples

- **Number of Islands (Graphs)**: `/questions/graphs/graphs-1`
- **Clone Graph**: `/questions/graphs/graphs-2`
- **Two Sum (Arrays)**: `/questions/arrays/arrays-1`
- **Valid Palindrome (Strings)**: `/questions/strings/strings-1`

## Interview Routes

Interview preparation guides also have dedicated routes:

### URL Structure

```
/interviews/[interviewId]
```

### Examples

- **React Interview Guide**: `/interviews/react`
- **Future guides**: `/interviews/javascript`, `/interviews/system-design` (coming soon)

## Features

### Individual Question Pages
- ✅ Complete question details with split-view editor
- ✅ Problem statement and examples
- ✅ Hints and complexity analysis
- ✅ Code editor with run/test functionality
- ✅ Timer and notes
- ✅ Direct links to LeetCode and GeeksforGeeks
- ✅ Share button to copy the URL
- ✅ Track completion status
- ✅ Back navigation to main page

### Interview Guide Pages
- ✅ Complete interview preparation content
- ✅ Code examples and syntax highlighting
- ✅ Interview tips and best practices
- ✅ Diagrams and visual explanations
- ✅ Share button to copy the URL
- ✅ Table of contents navigation
- ✅ Back navigation to main page

### Sharing Questions
1. **From Question List**: Click any question in the list → Opens at `/questions/{category}/{id}`
2. **From Question Page**: Click the "Share Link" button - URL is copied to clipboard
3. **Share the URL**: Send the copied URL to anyone - they can access the question directly

### Sharing Interview Guides
1. **From Home Page**: Click any interview topic → Opens at `/interviews/{interviewId}`
2. **From Interview Page**: Click the "Share" button - URL is copied to clipboard
3. **Share the URL**: Send to team members or friends to share knowledge

## Navigation

- Questions and interviews can be opened by clicking from the home page
- Each route has a **"Back to Home"** button to return to the main list
- Browser back/forward buttons work naturally
- All your progress is preserved (completion status, notes, code)

## How to Use

### Open a Question Directly
Simply visit: `https://your-domain.com/questions/[category]/[questionId]`

Example: `https://your-domain.com/questions/graphs/graphs-1`

### Open an Interview Guide Directly
Simply visit: `https://your-domain.com/interviews/[interviewId]`

Example: `https://your-domain.com/interviews/react`

### Share Content
1. Navigate to any question or interview guide
2. Click the "Share" or "Share Link" button
3. The URL is copied to your clipboard
4. Share it with anyone!

### Question IDs Reference

Question IDs follow this pattern:
- Format: `{category}-{number}`
- Examples:
  - `graphs-1` → Number of Islands
  - `arrays-3` → Container With Most Water
  - `trees-5` → Binary Tree Maximum Path Sum

All question IDs can be found in the respective topic JSON files in `/data/topics/`.
